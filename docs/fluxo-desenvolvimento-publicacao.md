# Como trabalhar com os ambientes

1. Abra "Gerenciador Vigia e Chat" na Área de Trabalho; selecione Vigia e clique em "Iniciar desenvolvimento local". O painel conecta os túneis DEV e abre os serviços. Use http://127.0.0.1:3000 e a API http://127.0.0.1:3101.
2. Abra este repositório no editor de sua escolha. Peça à IA para ler AGENTS.md. O código é local e os dados são do banco DEV da VPS. Credenciais ficam nos arquivos de ambiente ignorados pelo Git; o túnel do gerenciador precisa estar ligado.
3. Altere e teste. Se mudar estrutura do banco, crie uma nova migração Prisma versionada e aplique somente em DEV. Se alterou a estrutura manualmente, transforme a alteração em migração antes da publicação. Registros usados para teste permanecem no DEV.
4. Faça commit dos arquivos da tarefa. A análise do gerenciador lê o commit, não alterações sem commit. Se editar novamente, faça outro commit e analise novamente.
5. No gerenciador, selecione só o sistema alterado e clique em Analisar. Responda às perguntas no campo do painel e analise novamente, se solicitado. A aprovação da análise permite testar DEV; não equivale a publicação em produção.
6. Clique em Publicar DEV. Aguarde status "verified" e teste. O gerenciador confere testes, migrações, estrutura do banco, build e identidade da versão. Falha ou resultado incerto impede avançar.
7. Quando decidir entregar a mudança aos usuários, clique em Publicar produção. O gerenciador usa o mesmo commit, verifica histórico de migrações, cria backup e aplica estrutura; não copia registros de teste. Migrações incompatíveis ficam bloqueadas para uma tarefa específica de revisão.

Vigia e Chat têm publicações independentes. Alterações de contrato entre os dois podem exigir publicar ambos. Uma publicação de ambos não é transação atômica entre Vercel e VPS: se uma etapa falhar, confira o histórico antes de continuar.

Se a internet não alcançar a VPS, teste outra rede com VPN desligada; não altere para o banco de produção. O transporte SSH usa HTTPS autenticado e chave privada, mas não resolve uma rede que bloqueia o próprio IP da VPS. Após queda durante uma publicação, use "Recuperar resultado"; não repita disparos ou publicações às cegas.

O gerenciador deste computador está em C:/Users/gianc/OneDrive/Documentos/ChatGPT/Vigia e Bot/release-manager. Chaves, logs privados e histórico ficam em C:/Users/gianc/.codex/vigia-chat-release-manager. Não versione nem compartilhe esse diretório. Para outro computador é necessária instalação/configuração própria; apenas clonar o código não instala credenciais.
