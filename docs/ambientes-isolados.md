# Ambientes Vigia e Chat

Implantação de 07/10/2026: produção e desenvolvimento possuem bancos, usuários, JWTs, chaves, arquivos, filas e serviços separados. Não foram contratados projetos adicionais do Supabase.

| Sistema | Produção | Desenvolvimento |
|---|---|---|
| Vigia | https://vigiasaude-brown.vercel.app | https://vigiasaude-git-developer-tiscinovacoes-projects.vercel.app |
| API Vigia | https://api.13.140.41.170.sslip.io | https://api-dev.13.140.41.170.sslip.io |
| Painel Chat | https://taxinha-dashboard.vercel.app | https://chat-dev.13.140.41.170.sslip.io |
| Bot | https://taxinha-bot.vercel.app | https://bot-dev.13.140.41.170.sslip.io |
| Banco Vigia | Supabase oxanubfolkoulklrhrpr | PostgreSQL privado vigia_dev na VPS |
| Chat: banco/Auth/Storage/Realtime | Supabase kxtiqahjxpmirqsksopt | Supabase oficial self-hosted na VPS |

Os links taxinha-dashboard-git-developer-vinhedo-virtual.vercel.app e taxinha-bot-git-developer-vinhedo-virtual.vercel.app encaminham ao DEV na VPS. O banco fica somente na rede Docker interna. Não abrir PostgreSQL publicamente.

O antigo endereço vigia-saude-git-developer-giancarlo-projects.vercel.app pertence a outra configuração e não deve ser usado. A API de produção rejeita chamadas de navegador de developer/localhost, inclusive desse endereço antigo.

## Acesso

As senhas DEV ficam em C:\Users\gianc\.codex\vigia-chat-development-access.private. Vigia: perfil master/Secretário com CPF no arquivo privado; Chat: usuário adm, administrador. A senha de teste está no arquivo privado. São contas próprias do DEV. Um regulador técnico separado permite verificar a regulação sem conceder essas permissões à produção. O regulador tem o botão Painel WhatsApp, com destino correspondente ao ambiente. O painel mantém sua própria autenticação.

DEV fica em /opt/vigia-chat-development, com marcador de identidade, permissões privadas, composição vigia-chat-development, redes vigia_chat_dev_private e vigia_chat_dev_ingress e volumes próprios. Supabase está fixado na distribuição oficial self-hosted/v0.8.2. Studio e administração Inngest ficam em loopback. Caddy compartilha somente ingresso HTTP, sem acesso direto ao PostgreSQL DEV.

Produção mantém /root/vigiasaude e seus volumes. Evolution e o sistema da igreja não foram alterados. DEV possui limites de memória/CPU e rotação de logs. Verificar recursos antes de builds simultâneos na VPS compartilhada.

## Desenvolvimento e publicação

1. Trabalhar no código de developer e testar exclusivamente no DEV, com dados fictícios.
2. APP_ENV=development identifica o ambiente. NODE_ENV=production identifica compilação otimizada. Preview recusa APP_ENV=production.
3. Revisar migrações e testar login, API /health, capacidade, ordem, callbacks e entrega conforme a alteração.
4. Publicar API/Chat na VPS DEV. Vercel sozinho não atualiza esses containers.
5. Após validação, integrar código na main e publicar com APP_ENV=production e as credenciais atuais. Nunca copiar registros DEV sobre produção.

Nesta máquina, os utilitários ficam no diretório pai ops/. prepare-development-bundles.cjs prepara arquivos sem .env, pacientes, uploads ou node_modules. cloud-development.cjs update atualiza apenas DEV e guarda imagens anteriores. check, check-vigia e verify validam serviços e dados próprios de teste. Se o cliente expirar durante um build, consultar status antes de repetir: o build da VPS pode continuar.

main e developer foram atualizadas nos dois repositórios. Os seis deployments Git correspondentes passaram com estado READY. Na configuração inicial, houve bloqueio de autoria Git e foi usada implantação manual autenticada, sem falsificar autoria; o envio com as identidades configuradas nos repositórios passou. deploy-vercel.cjs vigia|bot|panel preview|production continua disponível como publicação manual. Sempre verificar deployment READY e aliases após push.

Não existe endpoint SSH público. O utilitário autorizado usa build privado temporário, valida a chave do servidor e apaga a implantação ao terminar. Senhas não entram no repositório/site. Snapshots locais/Vercel usam Windows DPAPI no diretório privado do operador.

## Uso local

O frontend Vigia local aponta à API DEV. O Chat, sem DATABASE_URL local configurado, encaminha seus endereços locais ao DEV na VPS. Para rodar o backend integralmente no PC, provisionar banco/Supabase local ou conexão privada autorizada. Não copiar .env de produção para conseguir rodar localmente.

Preview/Development da Vercel contêm somente identificação e destinos DEV. Credenciais de banco, Meta, Evolution, Inngest Cloud e integrações de produção foram restringidas a Production. Os .env locais antigos foram retirados do carregamento automático e guardados em backups privados criptografados. O frontend DEV na Vercel conserva a proteção existente: entrar na conta Vercel autorizada antes do login do Vigia.

## Migrações

Vigia conserva seu histórico. As cinco migrações locais foram registradas no DEV após comparação sem diferenças. O histórico existente em produção não foi reiniciado.

Chat usa packages/db/prisma/migrations-current, via prisma.config.ts. O baseline 20261007000000_baseline foi marcado em produção após comparação exata da estrutura. Essa operação somente registrou histórico: não recriou tabelas ou alterou pacientes/conversas. Os SQLs antigos permanecem em prisma/migrations como histórico sem execução repetida. Não editar o baseline aplicado.

Para alterações futuras, gerar/revisar SQL contra DEV, adicionar migração posterior no diretório configurado, executar migrate deploy no DEV e testar antes de aplicar a mesma migração aditiva em produção. Incluir gatilhos, reservas, RLS e funções no SQL: Prisma não descreve todas essas regras. Comandos protegidos recusam reset, db push, migrate dev, seed e restaurações destrutivas em produção.

## Recuperação

Cada publicação da API guarda imagem anterior, fonte e configuração privadas em /root/vigiasaude/releases/environment-isolation-<data-hora>. O rollout confere banco conectado e ambiente production; falha recupera a imagem anterior. rollback.json e previous-image.json identificam a imagem exata. O override ativo é /root/vigiasaude/compose.environment.json.

Antes de limpar, conferir marcador do diretório, APP_ENV e nomes de bancos/volumes. Não usar docker system prune --volumes ou apagar por prefixos imprecisos. Não reiniciar a VPS para alterar apenas DEV. A configuração Caddy em uso foi preservada antes das rotas de teste.

## WhatsApp: última etapa

DEV_WHATSAPP_ENABLED=false; sem token Meta oficial ou configuração WhatsApp no tenant fictício. Evolution também fica bloqueada. Para habilitar testes, configurar outro número, credenciais/webhook próprios e lista explícita de contatos autorizados. Os três IDs oficiais de remetente são recusados no DEV. Testes automatizados/importações não disparam mensagens. A entrega e a resposta WhatsApp DEV serão comprovadas somente na última etapa, após o operador fornecer o número novo.

## Verificação

Passaram 98 testes da API e verificações das políticas de ambiente. A integração real da API DEV aprovou um PDF sintético de 49 pacientes em 10 páginas, preservação de ordem após edição/recarga, marcar todos no servidor, aprovação repetida sem duplicação e cadastro sem CNS/nascimento. Os dados de teste foram removidos, sem disparos. Na VPS, vinte pedidos concorrentes para uma vaga, cancelamento duplicado, reposição, reconfirmação e redução de capacidade foram validados. Chat DEV passou em login, isolamento de tenants, bloqueio anônimo, Realtime, upload autenticado, download público e recusa de upload anônimo. WhatsApp permaneceu bloqueado.

A revisão automática recusou a abertura visual do Chat DEV no navegador; verificações de servidor continuaram, conferência visual permanece pendente. Disponibilidade de API e aceitação da Meta não comprovam entrega ao paciente.
