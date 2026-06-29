import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { BetaEmail } from "@/emails/BetaEmail";
import { COPY, type EmailKind } from "@/emails/strings";

type Locale = "fr" | "en";

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return cachedTransporter;
}

export async function sendBetaEmail(opts: {
  to: string;
  kind: EmailKind;
  locale?: Locale;
  recipientHandle?: string;
}) {
  const locale: Locale = opts.locale ?? "fr";
  const subject = COPY[opts.kind][locale].subject;
  const html = await render(
    BetaEmail({ kind: opts.kind, locale, recipientHandle: opts.recipientHandle }),
  );
  const text = await render(
    BetaEmail({ kind: opts.kind, locale, recipientHandle: opts.recipientHandle }),
    { plainText: true },
  );

  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: opts.to,
    subject,
    html,
    text,
  });
}
