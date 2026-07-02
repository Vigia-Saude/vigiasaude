# Dispensação Fracionada com QR Code

Este documento detalha o fluxo de dispensação fracionada de medicamentos implementado no sistema **Vigia Saúde**.

## Fluxo de Processo

O diagrama a seguir descreve a tomada de decisão e as ações realizadas tanto no Frontend quanto no Backend durante o processo de dispensação.

```mermaid
flowchart TD
    A["📦 Entrada: 10 caixas x 10 comp\nLote XYZ | Val: 12/2026"] --> B["Estoque: 100 unidades\n10 caixas fechadas\nNenhum saquinho"]
    
    B --> C["👤 Paciente precisa de 3 comp"]
    C --> D{"Existe saquinho\nativo?"}
    
    D -->|Não| E["Abre 1 caixa\n9 caixas fechadas"]
    E --> F["Retira 3 comp\nSobram 7"]
    F --> G["🔒 Cria Saquinho\nQR-001: 7 comp"]
    G --> H["🖨️ Imprime Etiqueta\nQR + Lote + Val + Qty"]
    
    D -->|Sim| I["📱 Bipa QR do\nsaquinho"]
    I --> J{"QR válido?"}
    J -->|Não| K["❌ Erro: QR inválido"]
    J -->|Sim| L{"Qty suficiente\nno saquinho?"}
    
    L -->|Sim| M["Dispensa do saquinho\nAtualiza qty"]
    M --> N["🔄 Gera novo QR\n🖨️ Imprime nova etiqueta"]
    
    L -->|Não| O["Usa tudo do saquinho\nSaquinho → ESGOTADO"]
    O --> P["Abre nova caixa\nCompleta a quantidade"]
    P --> Q["Sobrou? Cria novo\nsaquinho com resto"]
    Q --> N
```

## Estrutura do Banco de Dados (Tenant Schema)

Para suportar este fluxo, a estrutura de dados de cada unidade (tenant) foi estendida:

1. **`medicamentos`**: Adicionada a coluna `quantidade_por_embalagem` (fator de conversão, ex: 10 comprimidos por caixa).
2. **`lotes`**: Adicionadas as colunas `quantidade_caixas_fechadas` (quantidade de caixas intactas) e `quantidade_por_caixa` (capacidade da caixa). A `quantidade_atual` representa a quantidade física total (caixas fechadas * quantidade_por_caixa + avulsos).
3. **`dispensacao_itens`**: Adicionada chave estrangeira opcional `embalagem_fracionada_id`.
4. **`embalagens_fracionadas`**: Nova tabela para gerenciar saquinhos ativos, associando-os a um lote, medicamento e armazenando um código QR único e a quantidade atualizada de itens avulsos.
5. **`movimentacoes_fracionadas`**: Tabela de log de auditoria para rastrear todas as criações, dispensações e atualizações de saquinhos fracionados.
