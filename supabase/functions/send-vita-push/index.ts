import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("ANON_KEY") ?? SERVICE_ROLE;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);
  try {
    const missing = [];
    if (!SUPABASE_URL) missing.push("URL");
    if (!SERVICE_ROLE) missing.push("SERVICE_ROLE_KEY");
    if (!VAPID_PUBLIC_KEY) missing.push("VAPID_PUBLIC_KEY");
    if (!VAPID_PRIVATE_KEY) missing.push("VAPID_PRIVATE_KEY");
    if (missing.length) throw new Error(`Faltan secrets: ${missing.join(", ")}`);

    const payload = await req.json().catch(() => ({}));
    const currentUser = await getUser(req);
    if (!currentUser?.id) return json({ ok: false, message: "JWT no válido." }, 401);

    const subs = await api(`vita_push_subscriptions?select=*&owner_id=eq.${encodeURIComponent(currentUser.id)}&enabled=eq.true`);
    let sent = 0;
    let failed = 0;
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({
          title: payload.title ?? "VITA",
          body: payload.body ?? "Prueba push real.",
          target: payload.target ?? "today",
          tag: payload.tag ?? "vita-test"
        }));
        sent += 1;
      } catch (_error) {
        failed += 1;
      }
    }
    return json({ ok: true, subscriptions: subs?.length ?? 0, sent, failed });
  } catch (error) {
    return json({ ok: false, message: error?.message ?? String(error) }, 500);
  }
});

async function getUser(req: Request) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY || SERVICE_ROLE, Authorization: req.headers.get("Authorization") ?? "" } });
  if (!res.ok) return null;
  return await res.json();
}
async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", ...((options.headers as Record<string, string>) ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return await res.json();
}
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: corsHeaders }); }
