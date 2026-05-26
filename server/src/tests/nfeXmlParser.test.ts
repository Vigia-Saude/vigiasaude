import { describe, expect, it } from 'vitest';
import { NfeXmlParseError, parseNfeXml } from '../utils/nfeXmlParser';

const validXml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260512345678000190550010000012341000012345" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <serie>1</serie>
        <nNF>1234</nNF>
        <dhEmi>2026-05-26T10:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>Fornecedor Teste LTDA</xNome>
      </emit>
      <det nItem="1">
        <prod>
          <cProd>BR0270027</cProd>
          <xProd>Dipirona 500mg</xProd>
          <qCom>100.0000</qCom>
          <vUnCom>0.5500</vUnCom>
          <rastro>
            <nLote>LOT-2026-A</nLote>
            <qLote>100.0000</qLote>
            <dFab>2026-01-01</dFab>
            <dVal>2027-01-01</dVal>
          </rastro>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vNF>55.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <chNFe>35260512345678000190550010000012341000012345</chNFe>
    </infProt>
  </protNFe>
</nfeProc>`;

describe('parseNfeXml', () => {
  it('extrai os dados necessários para registrar uma NF-e no CD', () => {
    const parsed = parseNfeXml(validXml);

    expect(parsed).toMatchObject({
      numeroNf: '1234',
      numeroNF: '1234',
      serie: '1',
      chaveAcesso: '35260512345678000190550010000012341000012345',
      fornecedorCnpj: '12345678000190',
      dataEmissao: '2026-05-26T10:30:00-03:00',
      valorTotal: 55,
    });
    expect(parsed.itens).toEqual([
      {
        medicamentoCatmatId: 'BR0270027',
        lote: 'LOT-2026-A',
        validade: '2027-01-01',
        quantidade_esperada: 100,
        catmatCodigo: 'BR0270027',
        medicamentoNome: 'Dipirona 500mg',
        numeroLote: 'LOT-2026-A',
        dataValidade: '2027-01-01',
        quantidadeEsperada: 100,
        precoUnitario: 0.55,
      },
    ]);
  });

  it('usa o atributo Id de infNFe quando chNFe não existe', () => {
    const parsed = parseNfeXml(validXml.replace(/\s*<protNFe>[\s\S]*<\/protNFe>/, ''));

    expect(parsed.chaveAcesso).toBe('35260512345678000190550010000012341000012345');
  });

  it('falha com mensagem clara quando a rastreabilidade está ausente', () => {
    const xmlSemRastro = validXml.replace(/\s*<rastro>[\s\S]*?<\/rastro>/, '');

    expect(() => parseNfeXml(xmlSemRastro)).toThrow(NfeXmlParseError);

    try {
      parseNfeXml(xmlSemRastro);
    } catch (error) {
      expect(error).toBeInstanceOf(NfeXmlParseError);
      expect((error as NfeXmlParseError).issues).toContain('Item 1 (BR0270027): tag <prod><rastro> ausente; lote e validade são obrigatórios.');
    }
  });

  it('falha para XML corrompido', () => {
    expect(() => parseNfeXml('<nfeProc><NFe></nfeProc>')).toThrow(/corrompido/);
  });

  it('falha para XML fora do padrão SEFAZ', () => {
    expect(() => parseNfeXml('<root><foo>bar</foo></root>')).toThrow(/infNFe/);
  });
});
