import { puduRequest } from "./puduClient.js";

export async function handler() {
  try {
    // Igual a tu Python: POST con body dummy para calcular ContentMD5
    const result = await puduRequest({
      method: "POST",
      path: "/data-open-platform-service/v1/api/healthCheck",
      body: { b: "2", a: "1", c: "3" },
    });

    return {
      statusCode: result.ok ? 200 : result.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: Date.now(),
        ...result,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, message: e.message }),
    };
  }
}