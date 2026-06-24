const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const action = payload.action === "unsubscribe" ? "unsubscribe" : "subscribe";
  const source = payload.source === "about" ? "about" : "onboarding";

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

  const subscriberBody = {
    email_address: email,
    state: "active",
  };

  const upsert = await kitRequest(apiKey, "/subscribers", {
    method: "POST",
    body: JSON.stringify(subscriberBody),
  });

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

  const tagId =
    source === "about"
      ? Netlify.env.get("KIT_TAG_ABOUT")
      : Netlify.env.get("KIT_TAG_ONBOARDING");

  if (tagId) {
    const tagAdd = await kitRequest(apiKey, `/tags/${tagId}/subscribers`, {
      method: "POST",
      body: JSON.stringify({ email_address: email }),
    });
    if (!tagAdd.ok && tagAdd.status !== 409) {
      console.warn("[kit-subscribe] tag add failed", tagAdd.status, tagAdd.data);
    }
  }

  return jsonResponse(200, { ok: true, status: "subscribed" });
}
