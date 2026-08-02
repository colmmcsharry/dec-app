const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_SOURCES = new Set(["about", "onboarding", "home", "welcome"]);

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

async function kitRequest(apiKey, path, options = {}) {
  const response = await fetch(`https://api.kit.com/v4${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": apiKey,
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  return { ok: response.ok, status: response.status, data };
}

async function findSubscriberByEmail(apiKey, email) {
  const encoded = encodeURIComponent(email);
  const result = await kitRequest(
    apiKey,
    `/subscribers?email_address=${encoded}`,
    { method: "GET" },
  );
  if (!result.ok || !result.data?.subscribers?.length) return null;
  return result.data.subscribers[0];
}

function resolveSource(raw) {
  const source = String(raw ?? "").trim().toLowerCase();
  return VALID_SOURCES.has(source) ? source : "unknown";
}

function tagEnvForSource(source) {
  switch (source) {
    case "about":
      return "KIT_TAG_ABOUT";
    case "onboarding":
      return "KIT_TAG_ONBOARDING";
    case "home":
      return "KIT_TAG_HOME";
    case "welcome":
      return "KIT_TAG_WELCOME";
    default:
      return null;
  }
}

async function upsertSubscriber(apiKey, email, fields) {
  let upsert = await kitRequest(apiKey, "/subscribers", {
    method: "POST",
    body: JSON.stringify({
      email_address: email,
      state: "active",
      fields,
    }),
  });

  if (!upsert.ok) {
    console.warn(
      "[kit-subscribe] upsert with fields failed; retrying without fields",
      upsert.status,
      upsert.data,
    );
    upsert = await kitRequest(apiKey, "/subscribers", {
      method: "POST",
      body: JSON.stringify({
        email_address: email,
        state: "active",
      }),
    });
  }

  return upsert;
}

async function addTagIfConfigured(apiKey, email, tagEnvName) {
  if (!tagEnvName) return;
  const tagId = Netlify.env.get(tagEnvName);
  if (!tagId) {
    console.warn(`[kit-subscribe] no ${tagEnvName} set`);
    return;
  }

  const tagAdd = await kitRequest(apiKey, `/tags/${tagId}/subscribers`, {
    method: "POST",
    body: JSON.stringify({ email_address: email }),
  });
  if (!tagAdd.ok && tagAdd.status !== 409) {
    console.warn("[kit-subscribe] tag add failed", tagAdd.status, tagAdd.data);
  }
}

/** Marks a converter for thank-you automation without changing signup_source. */
async function markPremium(apiKey, email) {
  const upsert = await upsertSubscriber(apiKey, email, {
    started_premium: "yes",
  });
  if (!upsert.ok) {
    console.error("[kit-subscribe] mark_premium failed", upsert.status, upsert.data);
    return jsonResponse(502, { error: "Could not update your email preferences." });
  }

  await addTagIfConfigured(apiKey, email, "KIT_TAG_WELCOME");
  return jsonResponse(200, { ok: true, status: "marked_premium" });
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const apiKey = Netlify.env.get("KIT_API_KEY");
  const formId = Netlify.env.get("KIT_FORM_ID");

  if (!apiKey || !formId) {
    return jsonResponse(503, {
      error: "Email signup is not configured yet.",
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." });
  }

  const email = String(payload.email ?? "")
    .trim()
    .toLowerCase();
  const rawAction = String(payload.action ?? "subscribe").trim().toLowerCase();
  const action =
    rawAction === "unsubscribe" || rawAction === "mark_premium"
      ? rawAction
      : "subscribe";
  const source = resolveSource(payload.source);

  if (!EMAIL_RE.test(email)) {
    return jsonResponse(400, { error: "Please enter a valid email address." });
  }

  if (action === "unsubscribe") {
    const existing = await findSubscriberByEmail(apiKey, email);
    if (!existing?.id) {
      return jsonResponse(200, { ok: true, status: "not_found" });
    }

    const update = await kitRequest(apiKey, `/subscribers/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({ email_address: email, state: "cancelled" }),
    });

    if (!update.ok) {
      console.error("[kit-subscribe] unsubscribe failed", update.status, update.data);
      return jsonResponse(502, { error: "Could not update subscription." });
    }

    return jsonResponse(200, { ok: true, status: "unsubscribed" });
  }

  if (action === "mark_premium") {
    return markPremium(apiKey, email);
  }

  // Fresh opt-in. Keep signup_source as first-touch; mark converters when source is welcome.
  const fields = { signup_source: source };
  if (source === "welcome") {
    fields.started_premium = "yes";
  }

  const upsert = await upsertSubscriber(apiKey, email, fields);
  if (!upsert.ok) {
    console.error("[kit-subscribe] upsert failed", upsert.status, upsert.data);
    return jsonResponse(502, { error: "Could not save your email. Try again." });
  }

  const formAdd = await kitRequest(apiKey, `/forms/${formId}/subscribers`, {
    method: "POST",
    body: JSON.stringify({ email_address: email }),
  });

  if (!formAdd.ok && formAdd.status !== 409) {
    console.error("[kit-subscribe] form add failed", formAdd.status, formAdd.data);
    return jsonResponse(502, {
      error: "Saved your email, but list signup failed. Try again.",
    });
  }

  await addTagIfConfigured(apiKey, email, tagEnvForSource(source));

  return jsonResponse(200, { ok: true, status: "subscribed", source });
}
