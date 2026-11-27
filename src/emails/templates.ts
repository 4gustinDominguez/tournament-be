const BRAND_GREEN = "#1A9351";
const BRAND_GREEN_DARK = "#15803d";
const NIGHT_900 = "#0B1F16";
const NIGHT_800 = "#112a1e";
const NIGHT_100 = "#e8f5e9";
const WHITE = "#ffffff";

interface BaseTemplateProps {
	previewText: string;
	content: string;
	locale?: string;
}

function baseTemplate({ previewText, content, locale = "es" }: BaseTemplateProps): string {
	const isEn = locale === "en";

	return `
<!DOCTYPE html>
<html lang="${isEn ? "en" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GTM</title>
</head>
<body style="margin:0;padding:0;background-color:${NIGHT_900};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${NIGHT_900};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:linear-gradient(135deg,${BRAND_GREEN},${BRAND_GREEN_DARK});border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:${WHITE};font-size:18px;font-weight:bold;line-height:40px;">⚽</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;font-weight:900;color:${WHITE};letter-spacing:-0.5px;">GTM</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Preview text -->
          <tr>
            <td style="font-size:1px;line-height:1px;color:${NIGHT_900};display:none;">${previewText}</td>
          </tr>
          <!-- Content card -->
          <tr>
            <td style="background-color:${NIGHT_800};border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
                © ${new Date().getFullYear()} ${
									isEn ? "GTM — Tournament Management" : "GTM — Gestión de Torneos"
								}
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

export interface EmailContent {
	subject: string;
	html: string;
}

interface EmailTemplateProps {
	name: string;
	actionUrl?: string;
	actionLabel?: string;
	locale?: string;
}

export function welcomeEmail({
	name,
	actionUrl,
	actionLabel,
	locale = "es",
}: EmailTemplateProps): EmailContent {
	const isEn = locale === "en";
	const greeting = isEn ? `Welcome, ${name}!` : `¡Bienvenido, ${name}!`;
	const body = isEn
		? "Your account has been created successfully. You can now sign in and start managing your tournaments."
		: "Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y empezar a gestionar tus torneos.";
	const footer = isEn
		? "If you didn't create this account, you can safely ignore this email."
		: "Si no creaste esta cuenta, puedes ignorar este mensaje.";
	const label = actionLabel ?? (isEn ? "Sign in" : "Iniciar sesión");

	return {
		subject: isEn ? "Welcome to GTM" : "Bienvenido a GTM",
		html: baseTemplate({
			previewText: isEn ? "Welcome to GTM!" : "¡Bienvenido a GTM!",
			locale,
			content: `
			<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${WHITE};">${greeting}</h1>
			<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${NIGHT_100};">${body}</p>
			${
				actionUrl
					? `
			<table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
				<tr>
					<td style="background-color:${BRAND_GREEN};border-radius:8px;">
						<a href="${actionUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:${WHITE};text-decoration:none;">${label}</a>
					</td>
				</tr>
			</table>`
					: ""
			}
			<p style="margin:0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.5);">${footer}</p>
		`,
		}),
	};
}

export function passwordChangedEmail({ name, locale = "es" }: EmailTemplateProps): EmailContent {
	const isEn = locale === "en";
	const title = isEn ? "Password changed" : "Contraseña cambiada";
	const body = isEn
		? `Hi ${name}, your password has been changed successfully. If you didn't make this change, contact us immediately.`
		: `Hola ${name}, tu contraseña ha sido cambiada correctamente. Si no realizaste este cambio, contacta con nosotros inmediatamente.`;

	return {
		subject: title,
		html: baseTemplate({
			previewText: title,
			locale,
			content: `
			<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${WHITE};">${title}</h1>
			<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${NIGHT_100};">${body}</p>
		`,
		}),
	};
}

export function resetPasswordEmail({
	name,
	actionUrl,
	actionLabel,
	locale = "es",
}: EmailTemplateProps): EmailContent {
	const isEn = locale === "en";
	const title = isEn ? "Reset your password" : "Restablece tu contraseña";
	const body = isEn
		? `Hi ${name}, we received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.`
		: `Hola ${name}, recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para establecer una nueva. Este enlace expira en 1 hora.`;
	const fallback = isEn
		? "If you didn't request this, you can safely ignore this email."
		: "Si no solicitaste esto, puedes ignorar este mensaje.";
	const label = actionLabel ?? (isEn ? "Reset password" : "Restablecer contraseña");

	return {
		subject: title,
		html: baseTemplate({
			previewText: title,
			locale,
			content: `
			<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${WHITE};">${title}</h1>
			<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${NIGHT_100};">${body}</p>
			<table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
				<tr>
					<td style="background-color:${BRAND_GREEN};border-radius:8px;">
						<a href="${actionUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:${WHITE};text-decoration:none;">${label}</a>
					</td>
				</tr>
			</table>
			<p style="margin:0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.5);">${fallback}</p>
		`,
		}),
	};
}

export function verifyEmail({
	name,
	actionUrl,
	actionLabel,
	locale = "es",
}: EmailTemplateProps): EmailContent {
	const isEn = locale === "en";
	const title = isEn ? "Verify your email" : "Verifica tu correo electrónico";
	const body = isEn
		? `Hi ${name}, please verify your email address by clicking the button below.`
		: `Hola ${name}, por favor verifica tu correo electrónico haciendo clic en el botón de abajo.`;
	const label = actionLabel ?? (isEn ? "Verify email" : "Verificar correo");

	return {
		subject: title,
		html: baseTemplate({
			previewText: title,
			locale,
			content: `
			<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${WHITE};">${title}</h1>
			<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${NIGHT_100};">${body}</p>
			<table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
				<tr>
					<td style="background-color:${BRAND_GREEN};border-radius:8px;">
						<a href="${actionUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:${WHITE};text-decoration:none;">${label}</a>
					</td>
				</tr>
			</table>
		`,
		}),
	};
}
