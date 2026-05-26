# Especificações do Projeto e Fluxos do Sistema - Vigia Saúde

Este documento consolida todas as especificações técnicas, modelos de dados, fluxos de negócio e funcionalidades do sistema **Vigia Saúde**. Ele serve como uma referência viva para desenvolvedores e gestores entenderem a arquitetura do projeto e o andamento das implementações.

---

## 1. Visão Geral do Sistema

O **Vigia Saúde** é um sistema integrado de gestão em saúde pública, projetado para monitorar e controlar a aquisição, distribuição e dispensação de medicamentos municipais. Ele combina compras centralizadas (baseadas em Atas de Registro de Preços) e operações descentralizadas em unidades de saúde locais (farmácias públicas) usando uma arquitetura **multi-tenant**.

### Perfis de Acesso e Papéis

O sistema opera com duas funções principais (`Role`) e cinco perfis de especialização (`Perfil`):

1. **COMPRADOR (Gestão Central)**
   * **Secretário de Saúde (`SECRETARIO_SAUDE`)**: Acesso total ao Hub Master de aprovação de novos perfis, relatórios gerais, auditoria e controle de fornecedores.
   * **Gestor de Estoque (`GESTOR_ESTOQUE`)**: Planejamento de compras, monitoramento de saldos e controle de estoque centralizado.
2. **UNIDADES DE SAÚDE (Operação Descentralizada - Tenant)**
   * **Farmácia (`FARMACIA`)**: Controle de estoque local, recebimento de lotes e dispensação de medicamentos para cidadãos.
   * **Médico (`MEDICO`)**: Consulta à base CATMAT e verificação de medicamentos disponíveis para prescrição.
   * **Entregador (`ENTREGADOR`)**: Rotas e confirmação de entrega física de lotes de medicamentos com assinatura digital.
3. **FORNECEDOR (Parceiros de Fornecimento)**
   * Visualização de pedidos de compras direcionados à sua empresa e aceite/recusa de fornecimento de insumos.

---

## 2. Arquitetura Técnica

O projeto é dividido em uma estrutura moderna de SPA no frontend e uma API RESTful no backend:

* **Frontend**: React (v19), TypeScript, Vite, Tailwind CSS (v4), Lucide React (Ícones), React Router (v7) para controle de rotas dinâmicas.
* **Backend**: Node.js, Express, TypeScript, Prisma ORM.
* **Banco de Dados**: PostgreSQL com duas camadas lógicas:
  1. **Public Schema (Global)**: Dados compartilhados como usuários, atas globais, fornecedores, pedidos centrais e log de auditoria.
  2. **Schemas Dinâmicos (Tenants)**: Cada farmácia municipal opera em um esquema isolado no mesmo banco de dados (ex: `tenant_farmacia_1`), gerenciado dinamicamente via factory do Prisma Client.

---

## 3. Especificações do Banco de Dados (Modelos)

### Camada Global (Public Schema)

* **`usuarios` (`User`)**: Guarda dados cadastrais, perfil de acesso, vínculo a fornecedor/unidade, status da conta e configurações de segurança.
* **`fornecedores` (`Fornecedor`)**: Cadastro completo de empresas habilitadas para fornecimento (CNPJ, razão social, whatsapp, taxa de aceitação).
* **`catmat_medicamentos` (`CatmatMedicamento`)**: Base nacional de catalogação de medicamentos integrados ao CATMAT.
* **`atas` (`Ata`)**: Contratos de atas de registro de preços vigentes, valor teto e controle de consumo central.
* **`medicamentos_ata` (`MedicamentoAta`)**: Insumos contratados em cada ata, com preço unitário de registro, quantidade inicial e saldo atual.
* **`ata_consumos` (`AtaConsumo`)**: Histórico de deduções de saldos das atas motivadas por pedidos de compra.
* **`pedidos_compra` (`PedidoCompra`)**: Ordens de fornecimento enviadas a fornecedores vinculadas a atas específicas.
* **`pedido_itens` (`PedidoCompraItem`)**: Medicamentos e quantidades solicitados em cada ordem de fornecimento.
* **`auditorias` (`Auditoria`)**: Logs detalhados de ações críticas (criação, edição e exclusão) guardando estados antes/depois da alteração.

### Camada de Unidade (Tenant Schema - Referência de Tipo)

* **`medicamentos` (`Medicamento`)**: Catálogo local de medicamentos ativos em cada farmácia.
* **`lotes` (`Lote`)**: Controle de validade, quantidade e número de lote de medicamentos armazenados.
* **`pacientes` (`Paciente`)**: Base de dados de cidadãos atendidos (contendo CPF e Cartão SUS).
* **`prescricoes` (`Prescricao`)**: Receitas médicas cadastradas para pacientes, vinculando CRM e validade.
* **`dispensacoes` (`Dispensacao`)**: Registro de entrega de medicamentos ao cidadão.
* **`dispensacao_itens` (`DispensacaoItem`)**: Detalhe de quais medicamentos e lotes específicos foram entregues ao paciente.

---

## 4. Funcionalidades e Fluxos do Sistema

### 4.1 Autenticação e Gestão de Usuários
* **Auto-cadastro**: Profissionais de saúde solicitam acesso especificando dados cadastrais, perfil de preferência e unidade de saúde. A conta entra como `PENDENTE`.
* **Central de Aprovação (Hub Master)**: Usuários com o perfil `SECRETARIO_SAUDE` analisam a fila de pendentes, aprovam atribuindo unidade de saúde padrão e permissões complementares, ou recusam justificando o motivo.

#### **[100% FINALIZADO]** Edição de Perfis Ativos
Permite que o administrador altere as credenciais, o perfil base, a unidade de saúde padrão e as permissões extras de qualquer usuário que já esteja com o perfil ativo no sistema.
* **Arquivos principais**:
  * Frontend: [Solicitacoes/index.tsx](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/src/pages/Solicitacoes/index.tsx) (Componente `ModalEdicaoUsuario`).
  * Backend: [AuthController.ts](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/server/src/controllers/AuthController.ts) (Método `editarUsuario`) e rotas em [authRoutes.ts](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/server/src/routes/authRoutes.ts).

#### **[100% FINALIZADO]** Desativação com Motivo Obrigatório
Garante que a desativação de qualquer usuário ativo exija um motivo/justificativa de no mínimo 5 caracteres.
* Ao desativar, o usuário muda de status para `DESATIVADO` no banco.
* O motivo é gravado no campo `motivoRecusa` (`motivo_recusa` na tabela PostgreSQL).
* O motivo de desativação é renderizado com layout Premium diretamente sob o nome do usuário desativado na listagem.
* **Arquivos principais**:
  * Frontend: [Solicitacoes/index.tsx](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/src/pages/Solicitacoes/index.tsx) (Componente `ModalDesativarUsuario`).
  * Backend: [AuthController.ts](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/server/src/controllers/AuthController.ts) (Método `desativarUsuario`).

---

### 4.2 Notificações em Tempo Real (Header)

#### **[100% FINALIZADO]** Central Sino de Solicitações Pendentes
Desenvolvimento do sistema de monitoramento de novas solicitações de cadastro para o perfil `SECRETARIO_SAUDE`:
* **Badge vermelha**: Um indicador luminoso vermelho exibe a contagem de novas solicitações pendentes no cabeçalho.
* **Polling automático**: O frontend realiza buscas periódicas silenciosas a cada 30 segundos para atualizar os dados de notificações pendentes.
* **Dropdown interativo**: Clicar no sino abre um menu suspenso listando as solicitações mais recentes, exibindo o nome e a hora solicitada.
* **Redirecionamento automático**: Clicar na notificação redireciona o usuário para a rota `/solicitacoes?id={usuarioId}`. A página captura o parâmetro ID, localiza a solicitação correspondente e abre imediatamente o modal de aprovação/detalhes em tela.
* **Arquivos principais**:
  * Frontend: [Header.tsx](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/src/components/Layout/Header.tsx) (Controle de estado, layout do sino e dropdown) e [Solicitacoes/index.tsx](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/src/pages/Solicitacoes/index.tsx) (Lógica de captura de query params e abertura automática).

---

### 4.3 Gestão de Layouts e Visualizações

#### **[100% FINALIZADO]** Padronização de 3 Cards Resumo (Hub Master)
Substituição dos layouts e cards antigos para um design visual simétrico de 3 colunas, com estilo premium e de fácil identificação:
* **Card 1: Usuários Ativos** (Cor verde/emerald, ícone `UserCheck` ao lado do título).
* **Card 2: Usuários Aguardando** (Cor laranja, ícone `Clock` ao lado do título).
* **Card 3: Usuários Desativados** (Cor vermelha, ícone `UserX` ao lado do título).
* **Atalho de clique**: Cada card funciona como gatilho de navegação. Clicar em qualquer um deles altera instantaneamente a aba correspondente da tabela principal.
* **Ícones nas tabelas**: Adicionados ícones de status (`UserCheck`, `Clock` e `UserX`) diretamente ao lado do nome do usuário em cada linha da tabela de listagem.
* **Correção Flexbox (`shrink-0`)**: Aplicado ajuste de dimensionamento nos contêineres de iniciais/avatares para garantir que eles nunca fiquem espremidos ou em formato oval quando o texto de motivo ou nome ocupar múltiplas linhas.
* **Arquivos principais**:
  * Frontend: [Solicitacoes/index.tsx](file:///c:/Users/giancarlolino/Desktop/APP/VigiaSaude/vigiasaude/src/pages/Solicitacoes/index.tsx) (Componente `HubDashboard`).

---

### 4.4 Gestão de Fornecedores e ATAs (ARP)
* **Cadastro de Fornecedores**: Gerenciamento de empresas de fornecimento contendo métricas dinâmicas como "Taxa de Aceitação".
* **Cadastro de Atas**: Registro do número do certame, vigência, fornecedor registrado, anexo em PDF e a lista de medicamentos homologados com as cotas de quantidade iniciais.
* **Consumo de Saldo**: O sistema calcula dinamicamente o saldo atual de cada medicamento na ATA subtraindo as quantidades já requisitadas em pedidos aprovados.

---

### 4.5 Pedidos de Compra (PdCs) e Comparativo
* **Geração de Pedido**: Compradores centralizados criam ordens de fornecimento vinculadas a uma ATA e selecionam os medicamentos. O sistema valida se a quantidade pretendida está dentro do saldo disponível na ATA.
* **Comparação de Orçamentos**: Permite comparar preços registrados na ATA com bancos públicos como a tabela CMED e o BPS (Banco de Preços em Saúde), assegurando compras eficientes.
* **Fluxo de Status**: `PENDENTE` (enviado ao fornecedor) -> `ACEITO`/`REJEITADO` (resposta do fornecedor) -> `APROVADO` -> `EM_TRANSITO` (com rastreamento de lote) -> `ENTREGUE` (recebido na farmácia local).

---

### 4.6 Dispensação Municipal (Módulo Tenant)
* **Atendimento Local**: A farmácia local busca o paciente pelo CPF ou Cartão SUS, confere se há receita válida anexada pelo médico e realiza a baixa do medicamento informando o lote.
* **Controle de Lotes**: Garante o rastreamento individual do medicamento desde a entrega do fornecedor até o consumo final pelo cidadão, controlando datas de validade para evitar perdas.

---

## 5. Práticas de Trabalho e Atualização

Este arquivo deve ser atualizado continuamente conforme novas implementações sejam 100% finalizadas. Toda nova funcionalidade entregue precisa:
1. Ser incluída em sua respectiva seção ou em uma nova seção.
2. Ser rotulada com a marcação `[100% FINALIZADO]` com a data da entrega.
3. Descrever os impactos no banco de dados e listar os arquivos modificados.
