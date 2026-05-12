import { puduRequest } from "./puduClient.js";

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const input = event.body ? JSON.parse(event.body) : {};

    const sn = input.sn || process.env.PUDU_SN;
    const shop_id = input.shop_id || Number(process.env.PUDU_SHOP_ID);
    const map_name = input.map_name || process.env.PUDU_MAP_NAME;

    const point = input.point;
    const point_type = input.point_type || "table";

    if (!sn) throw new Error("Missing sn");
    if (!shop_id) throw new Error("Missing shop_id");
    if (!map_name) throw new Error("Missing map_name");
    if (!point) throw new Error("Missing point");

    // IMPORTANTE: construimos el payload en orden fijo (para que JSON.stringify sea estable)
    const payload = {};
    payload.sn = sn;
    payload.shop_id = shop_id;
    payload.map_name = map_name;
    payload.point = point;
    payload.point_type = point_type;
    payload.call_device_name = input.call_device_name || "Terminal-GrupoAfin";
    payload.call_mode = input.call_mode || "CALL"; // CRÍTICO KettyBot
    payload.mode_data = input.mode_data || {};
    payload.do_not_queue = Boolean(input.do_not_queue ?? false);
    payload.robot_group_ids = input.robot_group_ids || [];
    payload.filter_category_ids = input.filter_category_ids || [];
    payload.priority = Number(input.priority ?? 1);

    const result = await puduRequest({
      method: "POST",
      path: "/open-platform-service/v1/custom_call",
      body: payload,
    });

    return {
      statusCode: result.ok ? 200 : result.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: Date.now(),
        request: payload,
        ...result,
      }),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, message: e.message }),
    };
  }
}