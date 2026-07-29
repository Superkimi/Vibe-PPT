import { NextRequest } from "next/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { aiResponseSchema } from "@/lib/presentation-schema";
import { VIBE_PPT_SYSTEM_PROMPT } from "@/lib/ai-system-prompt";

export const runtime = "nodejs";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(20000),
      }),
    )
    .min(1)
    .max(40),
  context: z.string().min(1).max(1_500_000),
  config: z.object({
    baseUrl: z.string().url(),
    model: z.string().min(1).max(200),
    apiKey: z.string().max(1000).optional(),
    temperature: z.number().min(0).max(1.5).default(0.6),
  }),
});

function isPrivateIpv4(hostname: string) {
  return (
    /^10\./.test(hostname) ||
    /^127\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

function validateEndpoint(baseUrl: string) {
  const url = new URL(baseUrl);
  const local = url.hostname === "localhost" || url.hostname === "::1" || isPrivateIpv4(url.hostname);
  if (local && process.env.NODE_ENV === "production") throw new Error("生产环境不允许访问内网模型地址");
  if (url.protocol !== "https:" && !(local && process.env.NODE_ENV !== "production")) {
    throw new Error("模型地址必须使用 HTTPS");
  }
  return url.toString().replace(/\/$/, "");
}

function parseModelJson(content: string) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return aiResponseSchema.parse(JSON.parse(cleaned));
}

async function callProvider(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
) {
  return fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 2_000_000) return Response.json({ error: "演示内容过大，请减少上下文后重试" }, { status: 413 });
    const input = requestSchema.parse(await request.json());
    const endpoint = validateEndpoint(input.config.baseUrl || process.env.VIBE_PPT_BASE_URL || "https://api.openai.com/v1");
    const apiKey = input.config.apiKey || process.env.VIBE_PPT_API_KEY || "";

    if (!apiKey && !endpoint.includes("localhost")) {
      return Response.json({ error: "请先配置模型 API Key" }, { status: 400 });
    }

    const messages = [
      { role: "system", content: VIBE_PPT_SYSTEM_PROMPT },
      ...input.messages.slice(-12),
      { role: "user", content: `以下是当前演示和选择上下文：\n${input.context}` },
    ];

    const baseBody = {
      model: input.config.model,
      messages,
      temperature: input.config.temperature,
    };
    const schema = zodToJsonSchema(aiResponseSchema, "VibePptAiResponse");
    let response = await callProvider(endpoint, apiKey, {
      ...baseBody,
      response_format: {
        type: "json_schema",
        json_schema: { name: "vibe_ppt_response", strict: true, schema: schema.definitions?.VibePptAiResponse },
      },
    });

    if (!response.ok && [400, 404, 422].includes(response.status)) {
      response = await callProvider(endpoint, apiKey, {
        ...baseBody,
        response_format: { type: "json_object" },
      });
    }

    if (!response.ok) {
      const detail = await response.text();
      return Response.json(
        { error: `模型请求失败（${response.status}）`, detail: detail.slice(0, 800) },
        { status: 502 },
      );
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return Response.json({ error: "模型没有返回可解析的内容" }, { status: 502 });
    }
    return Response.json(parseModelJson(content));
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 请求失败";
    return Response.json({ error: message }, { status: 422 });
  }
}
