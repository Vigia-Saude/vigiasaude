# Integração Vigia-Saúde ↔ ChatBot Vinhedo

Contrato de integração do **Módulo de Confirmação Automatizada de Agendamentos**.
Este documento é a **fonte da verdade** para conectar os dois sistemas: o
Vigia-Saúde já está implementado deste contrato (gateway `ChatBotGateway` +
endpoint de callback). O **ChatBot Vinhedo** precisa expor o endpoint de envio e
chamar o callback conforme descrito abaixo.

> Comunicação **API-to-API**. O Vigia orquestra a lógica de saúde e decide
> QUANDO/PARA QUEM enviar; o ChatBot dispara o WhatsApp (Meta Cloud API) e
> devolve as respostas. **Nenhum dado clínico** (CPF, CNS, diagnóstico) trafega —
> só telefone, nome, procedimento e data (LGPD).

---

## Visão geral do fluxo

```
1. Vigia decide disparar  ──POST /api/saude/enviar-mensagem──▶  ChatBot
   (confirmação/convocação/coleta de motivo)                    envia WhatsApp
                                                                (template + botões)
2. Paciente clica um botão no WhatsApp
3. ChatBot  ──POST /api/regulacao/confirmacao/callback──▶  Vigia
   (resposta SIM/NÃO + motivo, correlacionado por callbackId)  avança a máquina
                                                               de estados
```

O **`callbackId`** (UUID) é o elo entre as duas pontas: o Vigia gera um por
disparo, envia ao ChatBot, e o ChatBot devolve o **mesmo** `callbackId` quando o
paciente responde.

---

## 1) Vigia → ChatBot — enviar mensagem

**O ChatBot deve expor este endpoint.**

```
POST {CHATBOT_URL}/api/saude/enviar-mensagem
Headers:
  X-API-Key:     <chave do município no ChatBot>
  X-Tenant-Id:   <id do município no ChatBot>
  Content-Type:  application/json
```

### Corpo (o que o Vigia envia)

```jsonc
{
  "tipo": "CONFIRMACAO",                // CONFIRMACAO | COLETA_MOTIVO | CONVOCACAO
  "telefone": "5567999999999",          // só dígitos, com DDI/DDD
  "nomePaciente": "João Silva",
  "procedimento": "Mamografia",         // ausente em COLETA_MOTIVO
  "dataAgendada": "02/09/2026",         // dd/mm/aaaa; ausente em COLETA_MOTIVO
  "templateName": "confirmacao_agendamento",
  "callbackUrl": "https://vigia.municipio.gov.br/api/regulacao/confirmacao/callback",
  "callbackId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
}
```

### Resposta esperada (o que o ChatBot devolve ao Vigia)

`200 OK`
```json
{ "messageId": "wamid.HBgM...", "status": "SENT" }
```
- `messageId`: id da mensagem na Meta (o Vigia aceita também `wamid` ou `id`).
- `status`: string livre (`SENT`, `QUEUED`, …). Em erro, responda `4xx/5xx` com
  `{ "erro": "mensagem" }` — o Vigia registra a falha em `MessageLog`.

### Os 3 tipos de mensagem

| `tipo` | Quando | Template (config. no Vigia) | Botões (Quick Reply) |
|---|---|---|---|
| `CONFIRMACAO` | Confirmação inicial **e** reconfirmação | `confirmacao_agendamento` / `reconfirmacao_agendamento` | **Sim, confirmo** / **Não poderei ir** |
| `CONVOCACAO` | Vaga abriu → convoca o próximo | `convocacao_vaga` | **Sim, confirmo** / **Não poderei ir** |
| `COLETA_MOTIVO` | Depois de um "Não", pergunta o motivo | `coleta_motivo_recusa` | **Melhora dos sintomas** / **Sem transporte** / **Outro motivo** |

> Os **nomes dos templates** são configuráveis no Vigia (tela "Configurações da
> Confirmação") e chegam no campo `templateName`. Os templates em si são
> **criados e aprovados no ChatBot/Meta**. Use `templateName` para escolher qual
> disparar; os parâmetros do template são `nomePaciente`, `procedimento`,
> `dataAgendada` (nessa ordem, quando aplicável).

---

## 2) ChatBot → Vigia — callback da resposta

**Este endpoint já existe no Vigia.** Quando o paciente clica um botão, o ChatBot
chama:

```
POST {VIGIA_PUBLIC_URL}/api/regulacao/confirmacao/callback
Headers:
  X-Webhook-Secret: <segredo compartilhado>     // ver "Segurança"
  Content-Type:     application/json
```

### Corpo (o que o ChatBot envia)

```jsonc
{
  "callbackId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed", // OBRIGATÓRIO (o mesmo do envio)
  "resposta": "NAO",                    // "SIM" | "NAO"  (OBRIGATÓRIO)
  "motivoRecusa": "SEM_TRANSPORTE",     // opcional; só quando resposta = NAO
  "motivoTextoLivre": "vou viajar",     // opcional; quando motivoRecusa = OUTRO
  "timestamp": "2026-08-29T14:30:00Z",  // opcional (ISO-8601)
  "wamid": "wamid.HBgM..."              // opcional (id da msg na Meta)
}
```

### Mapeamento botão → callback

| Botão clicado (WhatsApp) | Enviar no callback |
|---|---|
| **Sim, confirmo** (em CONFIRMACAO/CONVOCACAO) | `{ "resposta": "SIM" }` |
| **Não poderei ir** (em CONFIRMACAO/CONVOCACAO) | `{ "resposta": "NAO" }` |
| **Melhora dos sintomas** (em COLETA_MOTIVO) | `{ "resposta": "NAO", "motivoRecusa": "MELHORA_SINTOMAS" }` |
| **Sem transporte** (em COLETA_MOTIVO) | `{ "resposta": "NAO", "motivoRecusa": "SEM_TRANSPORTE" }` |
| **Outro motivo** → texto livre | `{ "resposta": "NAO", "motivoRecusa": "OUTRO", "motivoTextoLivre": "<texto>" }` |

> **Simplificação recomendada:** o Vigia aceita o motivo **junto** com o "NÃO"
> (não precisa de duas idas). Se o seu fluxo já tem os botões de motivo na mesma
> mensagem, mande `resposta: "NAO"` + `motivoRecusa` de uma vez. O disparo
> `COLETA_MOTIVO` existe para quando você quer perguntar o motivo numa segunda
> mensagem.

### Valores de `motivoRecusa` (enum — use exatamente estes)

```
MELHORA_SINTOMAS · SEM_TRANSPORTE · COMPROMISSO_TRABALHO ·
PROBLEMAS_FAMILIARES · JA_CONSULTOU_PARTICULAR · OUTRO
```

### Respostas do Vigia ao callback

| HTTP | Quando | Corpo |
|---|---|---|
| `200` | Processado | `{ "ok": true, "mensagem": "...", "statusPaciente": "RECONFIRMADO", "proximoConvocado": "<id|null>" }` |
| `409` | `callbackId` inexistente **ou** ciclo já resolvido (idempotência) | `{ "ok": false, "mensagem": "..." }` |
| `400` | Payload inválido (falta `callbackId`, `resposta` inválida, …) | `{ "erro": "...", "detalhes": [...] }` |
| `401` | `X-Webhook-Secret` ausente/errado (quando o segredo está configurado) | `{ "erro": "Assinatura do webhook inválida." }` |

> **Idempotente:** reenviar o callback do mesmo `callbackId` já resolvido devolve
> `409 ok:false` — seguro para retry.

---

## 3) O que o Vigia faz com a resposta (referência)

- **SIM** e ainda há etapas → dispara a **reconfirmação** (novo `CONFIRMACAO`,
  novo `callbackId`).
- **SIM** na última etapa → paciente **CONFIRMADO/RECONFIRMADO**, score sobe.
- **NÃO** → paciente **RECUSOU**, registra o motivo, score cai e o Vigia
  **convoca automaticamente o próximo** da fila (novo `CONVOCACAO`).
- **Sem resposta** dentro do timeout → o Vigia reenvia (até o limite) e, esgotado,
  marca **NÃO_RESPONDEU** e convoca o próximo. (Isso é interno do Vigia; o
  ChatBot não precisa fazer nada.)

---

## 4) Segurança

- **TLS obrigatório** nas duas direções.
- **`X-API-Key` + `X-Tenant-Id`** (Vigia → ChatBot): cada município tem seu par.
  No Vigia ficam em `CHATBOT_API_KEY` / `CHATBOT_TENANT_ID` (num próximo passo,
  criptografados por município no banco).
- **`X-Webhook-Secret`** (ChatBot → Vigia): **hoje é um segredo compartilhado
  simples** — o ChatBot manda o valor de `VIGIA_WEBHOOK_SECRET` e o Vigia compara.
  A verificação **HMAC-SHA256** do corpo (como na seção 5 do doc original) é um
  endurecimento planejado; quando entrar, o header passa a levar o HMAC do body.
- **Dados mínimos**: só telefone, nome, procedimento e data. Nada clínico.

---

## 5) Configuração (lado Vigia)

Variáveis de ambiente do Vigia:

```
MESSAGING_GATEWAY=chatbot          # troca o mock pelo ChatBotGateway real
CHATBOT_URL=https://chatbot...     # base do ChatBot
CHATBOT_API_KEY=...                # X-API-Key
CHATBOT_TENANT_ID=...              # X-Tenant-Id (id do município no ChatBot)
VIGIA_PUBLIC_URL=https://vigia...  # vira o callbackUrl enviado ao ChatBot
VIGIA_WEBHOOK_SECRET=...           # exigido no header X-Webhook-Secret do callback
```

Com `MESSAGING_GATEWAY=mock` (padrão de dev) nada disso é usado — o Vigia loga no
console e em `MessageLog`, sem WhatsApp real.

---

## 6) Exemplo ponta-a-ponta (recusa → convoca próximo)

```
1. Vigia → ChatBot
   POST /api/saude/enviar-mensagem
   { "tipo":"CONFIRMACAO", "telefone":"5567999990001", "nomePaciente":"Tereza",
     "procedimento":"Mamografia", "dataAgendada":"02/09/2026",
     "templateName":"confirmacao_agendamento",
     "callbackUrl":"https://vigia.../api/regulacao/confirmacao/callback",
     "callbackId":"11111111-1111-1111-1111-111111111111" }
   ← 200 { "messageId":"wamid.AAA", "status":"SENT" }

2. Paciente clica "Não poderei ir" → depois "Sem transporte"

3. ChatBot → Vigia
   POST /api/regulacao/confirmacao/callback
   Header X-Webhook-Secret: <segredo>
   { "callbackId":"11111111-1111-1111-1111-111111111111",
     "resposta":"NAO", "motivoRecusa":"SEM_TRANSPORTE", "wamid":"wamid.BBB" }
   ← 200 { "ok":true, "mensagem":"Recusa registrada; próximo da fila convocado (se elegível).",
          "statusPaciente":"RECUSOU", "proximoConvocado":"<uuid do próximo>" }

4. Vigia dispara CONVOCACAO para o próximo automaticamente (novo callbackId),
   repetindo o ciclo.
```

---

## 7) Checklist para o ChatBot Vinhedo

- [ ] Expor `POST /api/saude/enviar-mensagem` validando `X-API-Key` + `X-Tenant-Id`.
- [ ] Mapear `tipo` + `templateName` para o template aprovado na Meta e disparar
      com os botões Quick Reply corretos.
- [ ] Guardar o vínculo `callbackId` ↔ conversa/wamid.
- [ ] No clique do paciente, `POST {callbackUrl}` com `callbackId` + `resposta`
      (+ `motivoRecusa`), incluindo `X-Webhook-Secret`.
- [ ] Tratar `409` como "já resolvido" (não reprocessar) e reenviar em falhas de rede.
