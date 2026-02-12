import type { OutageGroup } from "@/app/types/outage";
import nodemailer from "nodemailer";
import { readFile } from "fs/promises";
import path from "path";

let transporter: nodemailer.Transporter | null = null;
let templateCache: string | null = null;

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
  prevScheduleDate?: string;
  nextScheduleDate?: string;
}) {
  const { groupId, recipients, before, after, prevScheduleDate, nextScheduleDate } =
    params;
  const isNextDayUpdate =
    Boolean(prevScheduleDate) &&
    Boolean(nextScheduleDate) &&
    prevScheduleDate !== nextScheduleDate &&
    Boolean(after);

  const subject = isNextDayUpdate
    ? `З'явився графік на завтра для групи ${groupId}`
    : `Зміни в графіку для групи ${groupId}`;
  const beforeText = before
    ? before.outages.map((o) => `${o.start}–${o.end}`).join(", ")
    : "—";
  const afterText = after
    ? after.outages.map((o) => `${o.start}–${o.end}`).join(", ")
    : "—";
  const siteUrl = "https://power-schedule.vercel.app/";

  const nextDayLabel = isNextDayUpdate && nextScheduleDate
    ? formatScheduleLabel(nextScheduleDate)
    : "";

  const text = isNextDayUpdate
    ? [
        `Група: ${groupId}`,
        `З'явилися графіки для завтрашнього дня (${nextDayLabel}).`,
        `Відключення: ${afterText}`,
        `Переглянути графік: ${siteUrl}`,
      ].join("\n")
    : [
        `Група: ${groupId}`,
        `Було: ${beforeText}`,
        `Стало: ${afterText}`,
        `Переглянути графік: ${siteUrl}`,
      ].join("\n");

  const html = renderTemplate(await loadTemplate(), {
    containerBg: isNextDayUpdate ? "#0f172a" : "#f8fafc",
    cardBg: isNextDayUpdate ? "#0b1220" : "#ffffff",
    cardBorder: isNextDayUpdate ? "#1f2937" : "#e5e7eb",
    textPrimary: isNextDayUpdate ? "#e2e8f0" : "#0f172a",
    textMuted: isNextDayUpdate ? "#94a3b8" : "#64748b",
    kicker: isNextDayUpdate ? "Новий графік" : "Оновлення графіка",
    title: `Група ${groupId}`,
    subtitle: isNextDayUpdate
      ? `З'явилися графіки для завтрашнього дня (${nextDayLabel})`
      : "",
    bodyHtml: isNextDayUpdate
      ? `
        <div style="display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:0.24em; padding:4px 10px; border-radius:999px; background:#fee2e2; color:#991b1b;">Відключення</div>
        <div style="margin-top:10px; font-size:16px; color:${isNextDayUpdate ? "#e2e8f0" : "#111827"};">${afterText}</div>
      `
      : `
        <div style="display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:0.2em; padding:4px 8px; border-radius:999px; background:#fee2e2; color:#991b1b;">Було</div>
        <div style="margin-top:8px; font-size:15px; color:#111827;">${beforeText}</div>
        <div style="height:14px;"></div>
        <div style="display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:0.2em; padding:4px 8px; border-radius:999px; background:#dcfce7; color:#166534;">Стало</div>
        <div style="margin-top:8px; font-size:15px; color:#111827;">${afterText}</div>
      `,
    ctaHtml: `
      <a href="${siteUrl}" style="display:inline-block; text-decoration:none; font-size:11px; text-transform:uppercase; letter-spacing:0.2em; padding:8px 12px; border-radius:999px; ${
        isNextDayUpdate
          ? "background:#22c55e; color:#052e16;"
          : "border:1px solid #0f172a; color:#0f172a;"
      }">
        Переглянути графік
      </a>
    `,
    footerText: "Цей лист відправлено автоматично.",
  });

  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.GMAIL_USER,
    to: recipients.join(","),
    subject,
    text,
    html,
  });
}

function formatScheduleLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = date.toLocaleString("uk-UA", { weekday: "long" });
  const monthRaw = date.toLocaleString("uk-UA", { month: "short" });
  const month = capitalize(monthRaw.replace(".", ""));
  const day = date.getDate();
  const year = date.getFullYear();
  return `${capitalize(weekday)} ${day}. ${month} ${year}`;
}

function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function loadTemplate() {
  if (templateCache) return templateCache;
  const templatePath = path.join(
    process.cwd(),
    "src/app/notifications/templates/email.html",
  );
  templateCache = await readFile(templatePath, "utf-8");
  return templateCache;
}

function renderTemplate(template: string, vars: Record<string, string>) {
  let output = template;
  for (const [key, value] of Object.entries(vars)) {
    const safeValue = value ?? "";
    output = output.replaceAll(`{{${key}}}`, safeValue);
    output = output.replaceAll(`__${key}__`, safeValue);
  }
  return output;
}
