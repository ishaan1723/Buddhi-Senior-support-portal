import { env } from "../config/env.js";
import type { SendMessageResult } from "./sms.service.js";

export async function sendWhatsapp(to: string, message: string): Promise<SendMessageResult> {
  if (env.WHATSAPP_PROVIDER === "meta" && env.WHATSAPP_BUSINESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID) {
    const response = await fetch(`https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.WHATSAPP_BUSINESS_TOKEN}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/^\+/, ""),
        type: "text",
        text: { preview_url: false, body: message }
      })
    });
    if (!response.ok) throw new Error(`WhatsApp failed with ${response.status}`);
    const body = (await response.json()) as { messages?: Array<{ id: string }> };
    return { provider: "meta-whatsapp", providerMessageId: body.messages?.[0]?.id };
  }

  console.log(`[mock whatsapp] ${to}: ${message}`);
  return { provider: "mock-whatsapp", providerMessageId: `mock-wa-${Date.now()}` };
}
