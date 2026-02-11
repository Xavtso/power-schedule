import type { OutageGroup } from "@/app/types/outage";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD.");
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function notifySubscribers(params: {
  groupId: string;
  recipients: string[];
  before?: OutageGroup;
  after?: OutageGroup;
}) {
  const { groupId, recipients, before, after } = params;
  const subject = `Зміни в графіку для групи ${groupId}`;
  const beforeText = before
    ? before.outages.map((o) => `${o.start}–${o.end}`).join(", ")
    : "—";
  const afterText = after
    ? after.outages.map((o) => `${o.start}–${o.end}`).join(", ")
    : "—";

  const text = [
    `Група: ${groupId}`,
    `Було: ${beforeText}`,
    `Стало: ${afterText}`,
  ].join("\n");

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f8fafc; padding:16px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
      <div style="padding:18px 20px; border-bottom:1px solid #e5e7eb;">
        <div style="font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#64748b;">Оновлення графіка</div>
        <div style="font-size:20px; font-weight:700; color:#0f172a; margin-top:6px;">Група ${groupId}</div>
      </div>
      <div style="padding:18px 20px;">
        <div style="display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:0.2em; padding:4px 8px; border-radius:999px; background:#fee2e2; color:#991b1b;">Було</div>
        <div style="margin-top:8px; font-size:15px; color:#111827;">${beforeText}</div>
        <div style="height:14px;"></div>
        <div style="display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:0.2em; padding:4px 8px; border-radius:999px; background:#dcfce7; color:#166534;">Стало</div>
        <div style="margin-top:8px; font-size:15px; color:#111827;">${afterText}</div>
      </div>
      <div style="padding:14px 20px; border-top:1px solid #e5e7eb; font-size:12px; color:#94a3b8;">
        Цей лист відправлено автоматично.
      </div>
    </div>
  </div>
  `;

  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.GMAIL_USER,
    to: recipients.join(","),
    subject,
    text,
    html,
  });
}
