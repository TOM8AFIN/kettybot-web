import { puduRequest } from "./puduClient.js";

export async function handler(event) {
  try {
    const sn = event.queryStringParameters?.sn || process.env.PUDU_SN;
    if (!sn) throw new Error("Missing sn. Provide ?sn=... or set PUDU_SN");

    const result = await puduRequest({
      method: "GET",
      path: `/open-platform-service/v2/status/get_by_sn?sn=${encodeURIComponent(sn)}`,
    });

    // Parse timestamp (si viene string)
    let parsedTs = null;
    if (result.ok) {
      const d = result.data?.data || result.data;
      const tsRaw = d?.timestamp;
      if (tsRaw !== undefined && tsRaw !== null) {
        const n = Number(tsRaw);
        parsedTs = Number.isFinite(n) ? n : null;
      }
    }

    return {
      statusCode: result.ok ? 200 : result.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: Date.now(),
        parsedStatusTimestamp: parsedTs,
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