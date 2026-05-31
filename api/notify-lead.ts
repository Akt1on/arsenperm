type LeadNotification = {
  name?: string | null;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  service?: string | null;
};

// In-memory rate limiting (per serverless instance, 5 req/min per IP)
const ipTimestamps = new Map<string, number[]>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (ipTimestamps.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  if (times.length >= RATE_LIMIT) return true;
  times.push(now);
  ipTimestamps.set(ip, times);
  return false;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, reason: "method_not_allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, reason: "rate_limited" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(200).json({ ok: false, reason: "not_configured" });

  const body = parseBody(req.body) as LeadNotification;
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (phone.length < 5 || phone.length > 40) {
    return res.status(400).json({ ok: false, reason: "invalid_phone" });
  }

  const name = clean(body.name, 80);
  const message = clean(body.message, 800);
  const source = clean(body.source, 120);
  const service = clean(body.service, 120);

  // Format Moscow time
  const now = new Date();
  const msk = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(now);

  const lines = [
    "🆕 <b>Новая заявка — Пермь Асфальт 59</b>",
    "",
    `👤 Имя: <b>${escapeHtml(name) || "—"}</b>`,
    `📞 Телефон: <b>${escapeHtml(phone)}</b>`,
    service ? `🔧 Услуга: ${escapeHtml(service)}` : null,
    message ? `📝 Сообщение:\n${escapeHtml(message)}` : null,
    source ? `🌐 Источник: ${escapeHtml(source)}` : null,
    `🕐 Время: ${msk} МСК`,
  ].filter(Boolean).join("\n");

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.status(200).json({ ok: tg.ok });
  } catch {
    return res.status(200).json({ ok: false });
  }
}

function parseBody(body: unknown): unknown {
  if (typeof body !== "string") return body ?? {};
  try { return JSON.parse(body); } catch { return {}; }
}
function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
