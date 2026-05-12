import crypto from "crypto";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function canonicalizePathWithSortedQuery(pathWithMaybeQuery) {
  const [p, q] = pathWithMaybeQuery.split("?");
  const pathOnly = p || "/";

  if (!q) return pathOnly;

  // Igual a tu Python: "&".join(sorted(query.split("&")))
  const parts = q.split("&").filter(Boolean).sort();
  return `${pathOnly}?${parts.join("&")}`;
}

function contentMd5LikePython(bodyStr) {
  // Replica EXACTO tu Python:
  // md5_hex = md5(body_json).hexdigest()
  // ContentMD5 = base64(md5_hex.encode())
  const md5hex = crypto.createHash("md5").update(bodyStr, "utf8").digest("hex");
  return Buffer.from(md5hex, "utf8").toString("base64");
}

function buildStringToSign({ xDate, method, accept, contentType, contentMd5, signedPath }) {
  return [
    `x-date: ${xDate}`,
    method.toUpperCase(),
    accept,
    contentType,
    contentMd5 || "",
    signedPath,
  ].join("\n");
}

function buildHmacAuthHeader({ stringToSign }) {
  const appKey = mustEnv("PUDU_APP_KEY");
  const appSecret = mustEnv("PUDU_APP_SECRET");

  const sig = crypto
    .createHmac("sha1", appSecret)
    .update(stringToSign, "utf8")
    .digest("base64");

  return `hmac id="${appKey}", algorithm="hmac-sha1", headers="x-date", signature="${sig}"`;
}

export async function puduRequest({ method, path, body = null }) {
  const baseUrl = mustEnv("PUDU_BASE_URL"); // ej: https://.../pudu-entry
  const base = new URL(baseUrl);

  const basePath = (base.pathname || "").replace(/\/$/, ""); // "/pudu-entry"
  const endpointPath = path.startsWith("/") ? path : `/${path}`;

  // Canoniza query como Python (sorted)
  const endpointCanonical = canonicalizePathWithSortedQuery(endpointPath);

  // Este es el path EXACTO que verá el server y el que se firma:
  const signedPath = `${basePath}${endpointCanonical}`;

  // URL final real:
  const url = `${base.origin}${signedPath}`;

  const accept = "application/json";
  const contentType = "application/json";
  const xDate = new Date().toUTCString();

  let bodyStr = null;
  let contentMd5 = "";

  if (method.toUpperCase() === "POST") {
    bodyStr = JSON.stringify(body ?? {});
    contentMd5 = contentMd5LikePython(bodyStr);
  }

  const stringToSign = buildStringToSign({
    xDate,
    method,
    accept,
    contentType,
    contentMd5,
    signedPath,
  });

  const authorization = buildHmacAuthHeader({ stringToSign });

  const headers = {
    Accept: accept,
    "Content-Type": contentType,
    "x-date": xDate,
    Authorization: authorization,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, error: json };
  }

  return { ok: true, status: res.status, data: json };
}