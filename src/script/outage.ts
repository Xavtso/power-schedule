// pnpm add playwright cheerio
// pnpm exec playwright install chromium

import { chromium } from "playwright";
import * as cheerio from "cheerio";

function uaDateToIso(dateUA: string) {
  const m = dateUA.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return dateUA.trim();
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

function extractOutageIntervals(text: string) {
  const re = /з\s+(\d{2}:\d{2})\s+до\s+(\d{2}:\d{2})/g;
  const outages: Array<{ start: string; end: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) outages.push({ start: m[1], end: m[2] });
  return outages;
}

function parsePowerOffFromRenderedHtml(renderedHtml: string) {
  const $ = cheerio.load(renderedHtml);

  const ps = $(".power-off__text p")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean);

  if (ps.length === 0) {
    // важливо: це дає тобі швидкий сигнал що селектор/сторінка змінились
    throw new Error("Rendered HTML все ще не містить .power-off__text p");
  }

  let scheduleDate = "";
  let infoAsOf: string | undefined;

  const groups: Array<{
    group: string;
    outages: Array<{ start: string; end: string }>;
    raw: string;
  }> = [];

  for (const line of ps) {
    const dateMatch = line.match(/Графік погодинних відключень на\s+(\d{2}\.\d{2}\.\d{4})/i);
    if (dateMatch) {
      scheduleDate = uaDateToIso(dateMatch[1]);
      continue;
    }

    const asOfMatch = line.match(/Інформація станом на\s+(.+)$/i);
    if (asOfMatch) {
      infoAsOf = asOfMatch[1].trim();
      continue;
    }

    const groupMatch = line.match(/^Група\s+(\d+\.\d+)\.\s*(.+)$/i);
    if (groupMatch) {
      const group = groupMatch[1];
      const rest = groupMatch[2];
      groups.push({ group, outages: extractOutageIntervals(rest), raw: line });
    }
  }

  if (!scheduleDate) {
    throw new Error("Не знайшов дату графіка у відрендереному контенті.");
  }

  const imageUrl =
    $(".power-off__current img").attr("src") ||
    $(".power-off__current a[href*='api.loe.lviv.ua/media/']").attr("href") ||
    undefined;

  return {
    scheduleDate,
    infoAsOf,
    groups,
    source: { url: "https://poweron.loe.lviv.ua/", imageUrl },
    rawLines: ps, // корисно для дебагу
  };
}

async function fetchRenderedHtml(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
    locale: "uk-UA",
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // чекаємо поки JS вставить блок
  await page.waitForSelector(".power-off__text", { timeout: 20_000 });

  // інколи ще треба дочекатися наповнення
  await page.waitForFunction(() => {
    const el = document.querySelector(".power-off__text");
    return el && el.querySelectorAll("p").length > 0;
  }, { timeout: 20_000 });

  const html = await page.content();
  await browser.close();
  return html;
}

async function main() {
  const url = "https://poweron.loe.lviv.ua/";
  const renderedHtml = await fetchRenderedHtml(url);
  const data = parsePowerOffFromRenderedHtml(renderedHtml);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});