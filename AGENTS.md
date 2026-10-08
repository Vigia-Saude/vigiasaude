# Desenvolvimento e publicação do Vigia

Trabalhe neste repositório, normalmente na branch developer. O Chat é outro repositório em ../ChatBot; altere-o somente quando a tarefa exigir. Leia também docs/fluxo-desenvolvimento-publicacao.md.

O ambiente local usa exclusivamente o banco DEV da VPS, por túnel privado. Abra o atalho "Gerenciador Vigia e Chat" na Área de Trabalho e clique em "Iniciar desenvolvimento local". Os arquivos server/.env e .env.local já contêm configuração DEV e são ignorados pelo Git. Não imprima valores, copie credenciais de produção ou substitua essas configurações por arquivos antigos. Se o túnel estiver desconectado, o banco local ficará indisponível; não use produção como fallback.

Mudanças de estrutura precisam de migrações SQL versionadas em server/prisma/migrations. Não edite uma migração já aplicada. Uma alteração feita somente pelo painel do banco não é transportada para produção. Não inclua dados de teste nas migrações. Nunca execute reset, seed ou db push contra produção. Antes de executar ferramentas de banco, confira APP_ENV=development e a identidade do banco DEV sem revelar credenciais.

Ao terminar, teste, confira git status e faça commit apenas dos arquivos da tarefa. Não inclua PDFs, pacientes, .env, tokens ou diretórios gerados. Não descarte modificações que pertencem ao usuário.

O gerenciador local usa Codex autenticado para revisar o commit; a IA que escreve código não publica diretamente. No painel: selecionar Vigia, Analisar, resolver dúvidas, Publicar DEV e testar. Produção somente pelo botão explícito, com o mesmo commit verificado no DEV. Push de código não é autorização para publicar produção. A configuração Vercel desabilita publicação automática por Git. Não contorne bloqueios nem altere o executor para forçar uma aprovação.

O WhatsApp DEV ainda está bloqueado até a configuração do número de teste. Não use números ou tokens reais de produção para testar. Preserve a fila e os pacientes reais em produção.
