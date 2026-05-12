/**
 * Calcula o percentual de divergência entre o novo preço e o preço atual.
 * 
 * Fórmula: ((novoPreco - precoAtual) / precoAtual) * 100
 * 
 * @param novoPreco O novo preço proposto
 * @param precoAtual O preço atual pactuado na Ata
 * @returns O percentual de divergência ou 0 se o preço atual for zero ou nulo.
 */
export const calcularDivergenciaPercentual = (novoPreco: number | null | undefined, precoAtual: number | null | undefined): number => {
  if (!precoAtual || precoAtual <= 0) {
    return 0;
  }

  const precoNovo = novoPreco || 0;
  
  return ((precoNovo - precoAtual) / precoAtual) * 100;
};
