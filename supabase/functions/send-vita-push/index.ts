import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, message: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const mode = payload.mode ?? "scheduled";
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!vapidPublicKey || !vapidPrivateKey || !serviceRoleKey || !supabaseUrl) {
      return json({ ok: false, message: "Faltan secrets de Edge Function." }, 500);
    }

    if (mode === "test") {
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data?.user) {
        return json({ ok: false, message: "JWT no válido." }, 401);
      }

      const result = await sendToUser(data.user.id, {
        title: payload.title ?? "VITA",
        body: payload.body ?? "Notificación de prueba.",
        target: payload.target ?? "hoy",
        tag: "vita-test",
      });

      return json({ ok: true, ...result });
    }

    if (mode === "scheduled") {
      if (token !== serviceRoleKey) {
        return json({ ok: false, message: "Token de cron no válido." }, 401);
      }

      await admin.rpc("create_vita_due_notifications");

      const { data: events, error } = await admin
        .from("notification_events")
        .select("id, owner_id, title, body, target, priority, event_type")
        .is("sent_at", null)
        .is("dismissed_at", null)
        .lte("due_at", new Date().toISOString())
        .limit(100);

      if (error) throw error;

      let sent = 0;
      let failed = 0;

      for (const event of events ?? []) {
        const result = await sendToUser(event.owner_id, {
          title: event.title,
          body: event.body,
          target: event.target,
          tag: event.id,
          priority: event.priority,
          eventType: event.event_type,
        });

        if (result.sent > 0) {
          sent += result.sent;
          await admin
            .from("notification_events")
            .update({ sent_at: new Date().toISOString() })
            .eq("id", event.id);
        } else {
          failed += 1;
        }
      }

      return json({ ok: true, events: events?.length ?? 0, sent, failed });
    }

    return json({ ok: false, message: "Modo no reconocido." }, 400);
  } catch (error) {
    console.error(error);
    return json({ ok: false, message: error.message ?? "Error interno." }, 500);
  }
});

async function sendToUser(ownerId: string, payload: Record<string, unknown>) {
  const { data: subscriptions, error } = await admin
    .from("web_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("owner_id", ownerId)
    .eq("enabled", true);

  if (error) throw error;

  let sent = 0;
  let disabled = 0;

  for (const sub of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );

      sent += 1;
      await admin
        .from("web_push_subscriptions")
        .update({ last_success_at: new Date().toISOString(), last_error: null })
        .eq("id", sub.id);
    } catch (error) {
      const statusCode = error?.statusCode ?? 0;

      if (statusCode === 404 || statusCode === 410) {
        disabled += 1;
        await admin
          .from("web_push_subscriptions")
          .update({ enabled: false, last_error: String(error?.message ?? error) })
          .eq("id", sub.id);
      } else {
        await admin
          .from("web_push_subscriptions")
          .update({ last_error: String(error?.message ?? error) })
          .eq("id", sub.id);
      }
    }
  }

  return { sent, disabled };
}

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
