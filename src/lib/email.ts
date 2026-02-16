import { Resend } from "resend";

let _resend: Resend;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendTwoFactorCode(email: string, code: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[2FA] Code for ${email}: ${code}`);
    return;
  }

  await getResend().emails.send({
    from: "RedSwan Digital Real Estate <onboarding@resend.dev>",
    to: email,
    subject: "Your RedSwan Digital Real Estate verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 8px;">Verification Code</h2>
        <p style="color: #666; margin: 0 0 24px;">Enter this code to verify your identity:</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${code}
        </div>
        <p style="color: #666; margin: 24px 0 0; font-size: 14px;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
}
