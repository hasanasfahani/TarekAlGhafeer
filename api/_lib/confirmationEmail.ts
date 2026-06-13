const appDownloadUrl = "https://fitnetinfluencers.onelink.me/sLYI/hasanasfahani";
const whatsappHelpUrl =
  "https://wa.me/9647513855361";

type EmailCoach = {
  name: string;
  firstName: string;
  arabicFirstName: string;
  instagramUrl: string;
  instagramHandle: string;
  domain: string;
};

type ConfirmationEmailInput = {
  to: string;
  customerName?: string | null;
  entryCode?: string | null;
  origin?: string;
  coach: EmailCoach;
  challengeName?: string | null;
};

function getPublicOrigin(origin?: string) {
  return (origin || process.env.PUBLIC_SITE_URL || "https://tarek-alghafeer.fitnetapp.com").replace(
    /\/$/,
    "",
  );
}

function getImageUrl(origin: string, filename: string) {
  return `${origin}/email-assets/${filename}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildConfirmationEmail({
  customerName,
  entryCode,
  origin,
  coach,
}: ConfirmationEmailInput) {
  const publicOrigin = getPublicOrigin(origin);
  const safeName = customerName ? escapeHtml(customerName) : "";
  const safeCode = entryCode ? escapeHtml(entryCode) : "";
  const emailSubject = `تأكيد الاشتراك في تحدي كوتش ${coach.arabicFirstName} على تطبيق Fitnet`;

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;background:#050605;font-family:Arial,Tahoma,sans-serif;color:#ffffff;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      تم تأكيد اشتراكك في تحدي كوتش ${coach.arabicFirstName}. حمّل التطبيق وسجّل كمتدرّب.
    </div>
    <div style="max-width:640px;margin:0 auto;padding:24px 14px;background:#050605;">
      <div style="padding:0 4px 14px;text-align:left;" dir="ltr">
        <a href="${coach.instagramUrl}" style="display:inline-block;padding:8px 12px;border:1px solid rgba(255,255,255,0.10);border-radius:999px;background:rgba(0,0,0,0.25);color:rgba(255,255,255,0.78);font-size:13px;font-weight:900;text-decoration:none;">Instagram ${coach.instagramHandle}</a>
        <span style="display:inline-block;margin-left:10px;padding:8px 12px;border:1px solid rgba(11,216,120,0.28);border-radius:999px;background:rgba(11,216,120,0.10);color:#0bd878;font-size:12px;font-weight:900;">تم تثبيت مكانك</span>
      </div>

      <div style="border:1px solid rgba(11,216,120,0.22);background:#111512;border-radius:24px;overflow:hidden;box-shadow:0 28px 90px rgba(0,0,0,0.36);">
        <div style="padding:26px 20px;background:linear-gradient(135deg,#062414,#101412);">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td width="72" valign="top" style="padding:0 0 0 14px;">
                <div style="width:64px;height:64px;border-radius:18px;background:#0bd878;color:#001409;text-align:center;line-height:64px;font-size:36px;font-weight:900;box-shadow:0 0 34px rgba(11,216,120,0.35);">✓</div>
              </td>
              <td valign="top" style="text-align:right;">
                <p style="margin:0;color:#0bd878;font-size:14px;font-weight:900;">تم الدفع بنجاح</p>
                <h1 style="margin:8px 0 0;color:#ffffff;font-size:30px;line-height:1.35;font-weight:900;">حياك في تحدي كوتش ${coach.arabicFirstName} على Fitnet</h1>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:rgba(255,255,255,0.74);font-size:18px;line-height:1.8;font-weight:700;">
            ${safeName ? `${safeName}، ` : ""}مكانك صار محجوز… الحين باقي بس تدخل التطبيق وتجهّز للتحدي. التحدي يبدأ في 1 يوليو.
          </p>
        </div>

        <div style="padding:18px;">
          ${instructionCard({
            number: "1",
            title: "حمّل تطبيق Fitnet",
            body: "نزّل التطبيق من المتجر المناسب لجهازك.",
            inner: storeBadges(),
          })}
          ${instructionCard({
            number: "2",
            title: "سجّل كمتدرّب",
            body: "افتح التطبيق وسجّل حساب جديد كـ متدرّب.",
            imageUrl: getImageUrl(publicOrigin, "register-trainee.webp"),
            imageAlt: "شاشة التسجيل كمتدرّب في تطبيق Fitnet",
          })}
          ${instructionCard({
            number: "3",
            title: `ادخل تحدي كوتش ${coach.arabicFirstName}`,
            body: `من داخل التطبيق، اختر تحدي كوتش ${coach.arabicFirstName}.`,
            imageUrl: getImageUrl(publicOrigin, "select-challenge.webp"),
            imageAlt: "شاشة اختيار تحدي كوتش طارق في تطبيق Fitnet",
          })}
          ${safeCode ? instructionCard({
            number: "4",
            title: "أدخل كود التحدي",
            body: "اكتب الكود التالي داخل نافذة الانضمام للتحدي.",
            inner: codeBlock(safeCode),
            imageUrl: getImageUrl(publicOrigin, "enter-code.webp"),
            imageAlt: "شاشة إدخال كود التحدي في تطبيق Fitnet",
          }) : ""}

          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.10);border-radius:22px;padding:20px;text-align:center;">
            <p style="margin:0 0 14px;color:rgba(255,255,255,0.70);font-size:15px;line-height:1.8;font-weight:700;">إذا احتجت مساعدة، تواصل معنا على واتساب.</p>
            <a href="${whatsappHelpUrl}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;border-radius:999px;padding:13px 18px;font-size:15px;font-weight:900;box-shadow:0 0 30px rgba(37,211,102,0.22);">واتساب | تواصل معنا</a>
            <p style="margin:22px 0 12px;color:#0bd878;font-size:20px;line-height:1.8;font-weight:900;">جاهز؟ خلّنا نبدأ التحدي!</p>
            <img src="${getImageUrl(publicOrigin, "lets-do-this.gif")}" alt="Let's do this" style="display:block;width:100%;max-width:420px;margin:0 auto;border-radius:18px;border:1px solid rgba(255,255,255,0.12);" />
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  const text = `تم الدفع بنجاح

حياك في تحدي كوتش ${coach.arabicFirstName} على Fitnet
${safeName ? `${safeName}، ` : ""}مكانك صار محجوز… الحين باقي بس تدخل التطبيق وتجهّز للتحدي. التحدي يبدأ في 1 يوليو.

1. حمّل تطبيق Fitnet:
${appDownloadUrl}

2. سجّل كمتدرّب
افتح التطبيق وسجّل حساب جديد كـ متدرّب.

3. ادخل تحدي كوتش ${coach.arabicFirstName}
من داخل التطبيق، اختر تحدي كوتش ${coach.arabicFirstName}.

${safeCode ? `4. أدخل كود التحدي:\n${safeCode}` : ""}

إذا احتجت مساعدة، تواصل معنا على واتساب:
${whatsappHelpUrl}

جاهز؟ خلّنا نبدأ التحدي!`;

  return { subject: emailSubject, html, text };
}

function instructionCard({
  number,
  title,
  body,
  inner = "",
  imageUrl,
  imageAlt,
}: {
  number: string;
  title: string;
  body: string;
  inner?: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return `<div style="border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.04);border-radius:22px;overflow:hidden;margin-bottom:16px;">
    <div style="padding:18px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td width="48" valign="top" style="padding-left:12px;"><div style="width:42px;height:42px;border-radius:999px;background:#0bd878;color:#001409;text-align:center;line-height:42px;font-size:15px;font-weight:900;">${number}</div></td>
          <td valign="top" style="text-align:right;"><h2 style="margin:0;color:#ffffff;font-size:24px;line-height:1.35;font-weight:900;">${title}</h2><p style="margin:8px 0 0;color:rgba(255,255,255,0.62);font-size:16px;line-height:1.7;font-weight:700;">${body}</p></td>
        </tr>
      </table>
      ${inner}
    </div>
    ${
      imageUrl
        ? `<div style="border-top:1px solid rgba(255,255,255,0.10);background:rgba(0,0,0,0.32);padding:12px;text-align:center;"><img src="${imageUrl}" alt="${imageAlt || ""}" style="display:block;width:100%;max-width:280px;margin:0 auto;border-radius:14px;border:1px solid rgba(255,255,255,0.10);" /></div>`
        : ""
    }
  </div>`;
}

function storeBadges() {
  return `<div style="margin-top:14px;text-align:center;">
    <a href="${appDownloadUrl}" style="display:inline-block;margin:5px;text-decoration:none;width:150px;max-width:45%;height:45px;vertical-align:middle;"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" style="display:block;width:auto;max-width:100%;height:45px;margin:0 auto;" /></a>
    <a href="${appDownloadUrl}" style="display:inline-block;margin:5px;text-decoration:none;width:150px;max-width:45%;height:45px;vertical-align:middle;"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style="display:block;width:auto;max-width:100%;height:45px;margin:0 auto;" /></a>
  </div>`;
}

function codeBlock(entryCode: string) {
  return `<div style="margin-top:14px;border:1px solid rgba(11,216,120,0.35);background:rgba(11,216,120,0.10);border-radius:18px;padding:15px;text-align:center;">
    <p style="margin:0 0 6px;color:#0bd878;font-size:12px;font-weight:900;">كود الانضمام</p>
    <div dir="ltr" style="color:#ffffff;font-size:30px;letter-spacing:5px;font-weight:900;">${entryCode}</div>
  </div>`;
}

export async function sendResendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Fitnet <noreply@fitnetapp.com>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Could not send confirmation email.");
  }

  return data;
}
