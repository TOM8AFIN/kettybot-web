import { puduRequest } from "./puduClient.js";

export async function handler(event) {
  try {
    const sn = event.queryStringParameters?.sn || process.env.PUDU_SN;
    if (!sn) throw new Error("Missing sn. Provide ?sn=... or set PUDU_SN");

    // Igual a tu Python: need_element=true y sn
    const result = await puduRequest({
      method: "GET",
      path: `/map-service/v1/open/current?sn=${encodeURIComponent(sn)}&need_element=true`,
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