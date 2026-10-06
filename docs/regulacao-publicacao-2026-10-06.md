# Regulação: publicação e verificação em 06/10/2026

A API do Vigia foi publicada na VPS em `/root/vigiasaude`, com backup anterior, atualização das credenciais da integração e recriação exclusiva do serviço `vigia-api`. O healthcheck confirmou banco conectado. O frontend publicado está em https://vigiasaude-brown.vercel.app; os rewrites encaminham as chamadas para a API da VPS.

O bot foi publicado em https://taxinha-bot.vercel.app. A assinatura da Meta está ativa para `whatsapp_business_account/messages`, incluindo respostas e estados de entrega. A chave do aplicativo foi corrigida e verificada pela Meta. O workflow persistente de callbacks foi registrado no Inngest.

## Evidências

- 90 testes do backend Vigia e 25 testes do bot passaram; as compilações e a checagem de tipos passaram.
- PostgreSQL real, em schema descartável: 20 solicitações concorrentes para uma vaga, reconfirmação, cancelamento duplicado, reposição e redução de capacidade. O contador permaneceu dentro do limite.
- Prisma real: o bloqueio transacional usado por importação e inclusão manual foi executado sem alteração de dados. Locks que retornam `void` usam `$executeRaw`.
- PDF de mamografia: 49 registros comparados com extração independente, sem diferença na sequência e nos campos examinados. Fixtures versionadas são sintéticas.
- Recuperação de ordem: 372 linhas de 24 PDFs, incluindo nove inclusões manuais posteriores. Nenhuma mensagem foi enviada e nenhuma reserva foi liberada durante a recuperação.
- Teste real: agenda futura de teste, capacidade 1, contato autorizado, envio aceito inicialmente pela Meta e posteriormente recusado com erro **131042 — Business eligibility payment issue**. O bot persistiu o evento e o Vigia recebeu a falha. A ocupação permaneceu 1/1; falha técnica não gerou ausência.
- Repetição do mesmo evento real de falha: HTTP 200, um único callback concluído, sem segundo efeito.

## Pendência para aceite

A conta WhatsApp utilizada estava sem forma de pagamento vinculada. A regularização é realizada pelo responsável diretamente na Meta. Depois dela, repetir somente o envio controlado, usando a retentativa manual de falha definitiva, e comprovar entrega, confirmação, desistência e reposição. Não considerar aceitação do provedor como entrega.

O lembrete fora da janela de 24 horas permanece bloqueado enquanto `lembrete_consulta` não estiver aprovado e explicitamente habilitado. Não usar a lista real de mamografia para testes.

## Operação

Capacidade é obrigatória por unidade responsável, procedimento e data. Reservas pendentes, incertas, convocadas e confirmadas ocupam a vaga. Reenvios e lembretes reutilizam a reserva. Resultado incerto exige conciliação; o botão de retentativa é disponível somente para falha definitiva. Reinício de teste e simulação estão bloqueados em produção.

Verificar `slots_agenda.ocupadas`, `reservas_agenda`, `regulacao_outbox`, `ciclos_confirmacao.delivery_status`, `saude_callbacks` e `saude_provider_events`. Uma falha visível não autoriza liberar reserva ou penalizar o paciente automaticamente.

Na VPS: `MESSAGING_GATEWAY=chatbot`, `CHATBOT_URL`, `CHATBOT_API_KEY`, `CHATBOT_TENANT_ID`, `VIGIA_PUBLIC_URL` e `VIGIA_WEBHOOK_SECRET`. No bot: segredo real do aplicativo Meta, token de verificação privado, URL permitida do callback e segredo compartilhado. Valores privados não fazem parte deste documento.

## Migrações e reversão

A migração aditiva do Vigia `20261006144000_regulacao_confiavel` foi aplicada e registrada em `_prisma_migrations`. A migração aditiva do bot `20261006150000_saude_confiavel` foi aplicada em transação; o banco do bot não tinha histórico `_prisma_migrations`. Antes de adotar `prisma migrate deploy` no bot, estabelecer uma baseline compatível com o schema existente. Não executar cegamente migrações históricas.

Os backups de banco anteriores à migração foram criptografados com DPAPI para o usuário Windows. Backups anteriores ao deploy da API estão em `/root/vigia-deploy-backups/`. Uma reversão do executável precisa preservar as proteções aditivas de capacidade e a fila persistente; não remover tabelas ou liberar vagas por consequência de uma reversão.
