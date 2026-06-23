const sgMail = require('@sendgrid/mail')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userEmail, userName } = req.body
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY not configured' })
  }

  sgMail.setApiKey(SENDGRID_API_KEY)

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contraseña cambiada - ADS Veris</title></head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#09111f 0%,#1a3a52 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:800;color:#f5f9fe;letter-spacing:0.02em;">
              ADS <span style="color:#c9a84c;">Veris</span>
            </p>
            <p style="margin:8px 0 0 0;font-size:12px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">Plataforma de servicios digitales</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:44px 40px;">
            <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#c9a84c;text-transform:uppercase;letter-spacing:0.1em;">Seguridad de cuenta</p>
            <h1 style="margin:0 0 20px 0;font-size:22px;font-weight:800;color:#09111f;">Contraseña actualizada ✅</h1>
            <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">
              Hola <strong>${userName}</strong>,
            </p>
            <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">
              Has cambiado con éxito tu contraseña de <strong>ADS Veris</strong>. ¡Felicidades! 🎉
            </p>
            <p style="margin:0 0 28px 0;font-size:15px;color:#374151;line-height:1.7;">
              Si <strong>no realizaste este cambio</strong>, por favor contacta con nuestro equipo de soporte inmediatamente.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#c19a54,#e0c589);border-radius:8px;">
                  <a href="https://pymex-web.vercel.app/profile" style="display:inline-block;padding:14px 28px;color:#09111f;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.02em;">
                    Ir a mi cuenta →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#09111f;">ADS <span style="color:#c9a84c;">Veris</span></p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 ADS Veris. Todos los derechos reservados.</p>
            <p style="margin:6px 0 0 0;font-size:12px;color:#9ca3af;">support@adsveris.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await sgMail.send({
      to: userEmail,
      from: 'noreply@adsveris.com',
      subject: 'Has cambiado tu contraseña - ADS Veris',
      html,
    })
    return res.status(200).json({ success: true, message: 'Email enviado' })
  } catch (error) {
    console.error('SendGrid error:', error)
    return res.status(500).json({ error: 'Error enviando email' })
  }
}
