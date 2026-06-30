/**
 * Serviço de envio de e-mail para recuperação de senha.
 * Em modo dev (sem RESEND_API_KEY), loga o código no console.
 * Em produção, usa o Resend SDK.
 */

interface EmailOptions {
  to: string;
  nome: string;
  codigo: string;
}

/**
 * Envia o código de recuperação por e-mail.
 * Se RESEND_API_KEY não estiver configurada, loga no console (dev mode).
 */
export async function enviarCodigoRecuperacao({ to, nome, codigo }: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  // Dev mode: log no console
  if (!apiKey) {
    console.log('═══════════════════════════════════════════════');
    console.log('📧 [DEV MODE] Código de recuperação de senha');
    console.log(`   Para: ${to}`);
    console.log(`   Nome: ${nome}`);
    console.log(`   Código: ${codigo}`);
    console.log('═══════════════════════════════════════════════');
    return true;
  }

  // Produção: enviar via Resend API (fetch nativo)
  try {
    const htmlBody = gerarTemplateHTML(nome, codigo);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Vigia Saúde <noreply@vigiasaude.com.br>',
        to: [to],
        subject: `${codigo} — Código de recuperação de senha | Vigia Saúde`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[EmailService] Erro ao enviar e-mail via Resend:', errorData);
      return false;
    }

    console.log(`[EmailService] Código de recuperação enviado para ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Falha ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Gera o template HTML bonito para o e-mail de recuperação.
 */
function gerarTemplateHTML(nome: string, codigo: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                🛡️ Vigia Saúde
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Sistema de Gestão Farmacêutica
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">
                Recuperação de Senha
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Olá, <strong style="color:#111827;">${nome}</strong>! Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:
              </p>
              
              <!-- Code Box -->
              <div style="background-color:#f0f9ff;border:2px dashed #3b82f6;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
                  Seu código de verificação
                </p>
                <p style="margin:0;color:#1e40af;font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">
                  ${codigo}
                </p>
              </div>
              
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;">
                ⏰ Este código expira em <strong>15 minutos</strong>.
              </p>
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">
                🔒 Se você não solicitou esta recuperação, ignore este e-mail. Sua senha permanecerá inalterada.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} Vigia Saúde — Este é um e-mail automático.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
