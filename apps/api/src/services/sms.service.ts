import { env } from "../config/env.js";

export type SendMessageResult = {
  provider: string;
  providerMessageId?: string;
};

export async function sendSms(to: string, message: string): Promise<SendMessageResult> {
  if (env.MSG91_AUTH_KEY && env.MSG91_TEMPLATE_ID) {
    const response = await fetch("https://control.msg91.com/api/v5/flow", {
      method: "POST",
      headers: {
        authkey: env.MSG91_AUTH_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        template_id: env.MSG91_TEMPLATE_ID,
        sender: env.MSG91_SENDER_ID,
        mobiles: to.replace(/^\+/, ""),
        VAR1: message
      })
    });
    if (!response.ok) throw new Error(`MSG91 failed with ${response.status}`);
    const body = (await response.json()) as { request_id?: string };
    return { provider: "msg91", providerMessageId: body.request_id };
  }

  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_PHONE) {
    const basic = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          authorization: `Basic ${basic}`,
          "content-type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ From: env.TWILIO_FROM_PHONE, To: to, Body: message })
      }
    );
    if (!response.ok) throw new Error(`Twilio failed with ${response.status}`);
    const body = (await response.json()) as { sid?: string };
    return { provider: "twilio", providerMessageId: body.sid };
  }

  console.log(`[mock sms] ${to}: ${message}`);
  return { provider: "mock", providerMessageId: `mock-${Date.now()}` };
}
