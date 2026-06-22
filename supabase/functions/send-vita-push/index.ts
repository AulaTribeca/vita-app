import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  try {
    const payload = await req.json().catch(() => ({}));
    const mode = payload.mode ?? "test";
    assertSecrets();

    if (mode === "test") {
      const user = await getUser(req);
      if (!user?.id) return json({ ok: false, message: "JWT no válido." }, 401);
      const result = await sendToUser(user.id, {
        title: payload.title ?? "VITA",
        body: payload.body ?? "Prueba push real.",
        target: payload.target ?? "home",
        tag: "vita-test"
      });
      return json({ ok: true, ...result });
    }

    if (mode === "scheduled") {
      const auth = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
      if (CRON_SECRET && auth !== CRON_SECRET && auth !== SERVICE_ROLE) {
        return json({ ok: false, message: "Token de cron no válido." }, 401);
      }
      if (!CRON_SECRET && auth !== SERVICE_ROLE) {
        return json({ ok: false, message: "Token de cron no válido." }, 401);
      }
      const result = await sendDueCards();
      return json({ ok: true, ...result });
    }

    return json({ ok: false, message: "Modo no reconocido." }, 400);
  } catch (error) {
    return json({ ok: false, message: error?.message ?? String(error) }, 500);
  }
});

function assertSecrets() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SERVICE_ROLE) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!VAPID_PUBLIC_KEY) missing.push("VAPID_PUBLIC_KEY");
  if (!VAPID_PRIVATE_KEY) missing.push("VAPID_PRIVATE_KEY");
  if (missing.length) throw new Error(`Faltan secrets: ${missing.join(", ")}`);
}

async function getUser(req) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: ANON_KEY || SERVICE_ROLE,
      Authorization: authHeader
    }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function api(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`REST ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return await res.json();
}

async function sendToUser(ownerId, notification) {
  const subscriptions = await api(`vita_push_subscriptions?select=*&owner_id=eq.${encodeURIComponent(ownerId)}&enabled=eq.true`);
  return await sendToSubscriptions(subscriptions, notification);
}

async function sendDueCards() {
  const now = new Date().toISOString();
  const cards = await api(`vita_cards?select=*&status=eq.open&notify_at=lte.${encodeURIComponent(now)}&notified_at=is.null&limit=100`);
  let sent = 0;
  let failed = 0;

  for (const card of cards) {
    const result = await sendToUser(card.owner_id, {
      title: "VITA",
      body: card.title ?? "Tienes algo pendiente.",
      target: "home",
      tag: `vita-card-${card.id}`
    });
    sent += result.sent;
    failed += result.failed;
    await api(`vita_cards?id=eq.${encodeURIComponent(card.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ notified_at: now, last_notification_result: result })
    });
  }
  return { processed: cards.length, sent, failed };
}

async function sendToSubscriptions(subscriptions, notification) {
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify(notification)
      );
      sent += 1;
      await api(`vita_push_subscriptions?id=eq.${encodeURIComponent(sub.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ last_success_at: new Date().toISOString(), last_error: null })
      });
    } catch (error) {
      failed += 1;
      await api(`vita_push_subscriptions?id=eq.${encodeURIComponent(sub.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ last_error: error?.message ?? String(error) })
      }).catch(() => null);
    }
  }

  return { subscriptions: subscriptions?.length ?? 0, sent, failed };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}
