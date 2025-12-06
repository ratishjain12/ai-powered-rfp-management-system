import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRFPEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from = process.env.RESEND_FROM_EMAIL ||
    "RFP System <rfp@updates.ratishfolio.com>",
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}) {
  try {
    const emailData: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text?: string;
      reply_to?: string;
    } = {
      from,
      to,
      subject,
      html,
    };

    if (text) {
      emailData.text = text;
    }

    if (replyTo) {
      emailData.reply_to = replyTo;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    return data;
  } catch (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send email");
  }
}

export function verifyResendWebhookSignature(signature: string): boolean {
  const expectedSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!expectedSecret) {
    console.warn("RESEND_WEBHOOK_SECRET not set, skipping verification");
    return true;
  }
  return signature === expectedSecret;
}
