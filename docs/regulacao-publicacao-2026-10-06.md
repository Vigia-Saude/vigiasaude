# Regulação: publicação e verificação em 06/10/2026

A API do Vigia foi publicada na VPS em `/root/vigiasaude`, com backup anterior, atualização das credenciais da integração e recriação exclusiva do serviço `vigia-api`. O healthcheck confirmou banco conectado. O frontend publicado está em https://vigiasaude-brown.vercel.app; os rewrites encaminham as chamadas para a API da VPS.

O bot foi publicado em https://taxinha-bot.vercel.app. A assinatura da Meta está ativa para `whatsapp_business_account/messages`, incluindo respostas e estados de entrega. A chave do aplicativo foi corrigida e verificada pela Meta. O workflow persistente de callbacks foi registrado no Inngest.

## Evidências

- 97 testes do backend Vigia e 27 testes do bot passaram; as compilações e a checagem de tipos passaram.
- PostgreSQL real, em schema descartável: 20 solicitações concorrentes para uma vaga, reconfirmação, cancelamento duplicado, reposição e redução de capacidade. O contador permaneceu dentro do limite.
- Prisma real: o bloqueio transacional usado por importação e inclusão manual foi executado sem alteração de dados. Locks que retornam `void` usam `$executeRaw`.
- PDF de mamografia: 49 registros comparados com extração independente, sem diferença na sequência e nos campos examinados. Fixtures versionadas são sintéticas.
- Recuperação de ordem: 372 linhas de 24 PDFs, incluindo nove inclusões manuais posteriores. Nenhuma mensagem foi enviada e nenhuma reserva foi liberada durante a recuperação.
- Teste real: agenda futura de teste, capacidade 1, contato autorizado, envio aceito inicialmente pela Meta e posteriormente recusado com erro **131042 — Business eligibility payment issue**. O bot persistiu o evento e o Vigia recebeu a falha. A ocupação permaneceu 1/1; falha técnica não gerou ausência.
- Repetição do mesmo evento real de falha: HTTP 200, um único callback concluído, sem segundo efeito.
- Depois de o responsável vincular o cartão à conta WhatsApp, a retentativa técnica foi entregue pela Meta às 12:55:43 de Cuiabá. O callback chegou à API da VPS e o Vigia passou a mostrar `DELIVERED`, sem erro, mantendo ocupação 1/1 e a próxima entrada aguardando. Tentativas técnicas anteriores foram substituídas, preservando a reserva.
- A resposta real do contato de teste chegou pelo webhook e foi aceita pelo Vigia: entrada `CONFIRMADO`, próxima entrada `AGUARDANDO`, ocupação 1/1. O callback persistente concluiu o processamento.
- Um lembrete foi antecipado manualmente para o teste de desistência, após a confirmação. Isso explica as duas mensagens consecutivas observadas pelo responsável; não foi execução automática do cron. A Meta confirmou leitura do lembrete. A apresentação da confirmação foi restaurada com data, horário e local; o texto do lembrete deixou de afirmar “hoje” e utiliza a data informada.

## Pendência para aceite

A conta WhatsApp utilizada estava sem forma de pagamento vinculada. O responsável concluiu o vínculo diretamente na Meta, e a entrega e confirmação controladas foram comprovadas pelo webhook. Ainda é necessário concluir, com respostas reais do contato de teste, a desistência e reposição. Não considerar aceitação do provedor como entrega.

O lembrete fora da janela de 24 horas permanece bloqueado enquanto `lembrete_consulta` não estiver aprovado e explicitamente habilitado. Não usar a lista real de mamografia para testes.

## Operação

CNS e nascimento são opcionais ao inserir manualmente um paciente na fila. A migração `20261006174000_nascimento_pendente` tornou `pacientes.data_nascimento` anulável; campos desconhecidos permanecem `null`. Dados informados continuam sendo validados. As pendências aparecem na fila com o botão **Completar cadastro**, que preenche o mesmo paciente sem criar entrada, reserva ou envio nem alterar a posição. A convocação mantém as exigências de identificação e nascimento. Datas desconhecidas são exibidas como “Não informado” nas telas de pacientes.

Esta atualização foi publicada na API da VPS com backup `/root/vigia-deploy-backups/1791308247434/before.tgz` e no frontend `dpl_BZ83vXk6rxTcigK6unxeCyXgRXZr`, com alias público `vigiasaude-brown.vercel.app`. O teste transacional com PostgreSQL/Prisma real salvou identificação e nascimento nulos sem reserva/envio, depois reverteu todos os dados sintéticos. Na interface publicada, os dois campos foram verificados com `required=false` e validade aceita em branco. Healthcheck retornou 200 e a nova rota protegida retornou 401 sem autenticação.

Capacidade é obrigatória por unidade responsável, procedimento e data. Reservas pendentes, incertas, convocadas e confirmadas ocupam a vaga. Reenvios e lembretes reutilizam a reserva. Resultado incerto exige conciliação; o botão de retentativa é disponível somente para falha definitiva. Reinício de teste e simulação estão bloqueados em produção.

Verificar `slots_agenda.ocupadas`, `reservas_agenda`, `regulacao_outbox`, `ciclos_confirmacao.delivery_status`, `saude_callbacks` e `saude_provider_events`. Uma falha visível não autoriza liberar reserva ou penalizar o paciente automaticamente.

Na VPS: `MESSAGING_GATEWAY=chatbot`, `CHATBOT_URL`, `CHATBOT_API_KEY`, `CHATBOT_TENANT_ID`, `VIGIA_PUBLIC_URL` e `VIGIA_WEBHOOK_SECRET`. No bot: segredo real do aplicativo Meta, token de verificação privado, URL permitida do callback e segredo compartilhado. Valores privados não fazem parte deste documento.

## Migrações e reversão

A migração aditiva do Vigia `20261006144000_regulacao_confiavel` foi aplicada e registrada em `_prisma_migrations`. A migração aditiva do bot `20261006150000_saude_confiavel` foi aplicada em transação; o banco do bot não tinha histórico `_prisma_migrations`. Antes de adotar `prisma migrate deploy` no bot, estabelecer uma baseline compatível com o schema existente. Não executar cegamente migrações históricas.

Os backups de banco anteriores à migração foram criptografados com DPAPI para o usuário Windows. Backups anteriores ao deploy da API estão em `/root/vigia-deploy-backups/`. Uma reversão do executável precisa preservar as proteções aditivas de capacidade e a fila persistente; não remover tabelas ou liberar vagas por consequência de uma reversão.
