import { NextRequest } from "next/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { aiResponseSchema } from "@/lib/presentation-schema";
import { VIBE_PPT_SYSTEM_PROMPT } from "@/lib/ai-system-prompt";
import { isLoopbackHost, validateProviderEndpoint } from "@/lib/provider-security";

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
  locale: z.enum(["zh", "en"]).default("zh"),
  config: z.object({
    baseUrl: z.string().url(),
    model: z.string().min(1).max(200),
    apiKey: z.string().max(1000).optional(),
    temperature: z.number().min(0).max(1.5).default(0.6),
  }),
});

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
    redirect: "error",
    cache: "no-store",
  });
}

const requestBuckets = new Map<string, { startedAt: number; count: number }>();
let activeRequests = 0;

function requestAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

function allowRequest(request: NextRequest) {
  const now = Date.now();
  const key = requestAddress(request);
  const bucket = requestBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
  } else {
    bucket.count += 1;
    if (bucket.count > 20) return false;
  }
  return activeRequests < 4;
}

export async function POST(request: NextRequest) {
  if (!allowRequest(request)) return Response.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  activeRequests += 1;
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 2_000_000) return Response.json({ error: "演示内容过大，请减少上下文后重试" }, { status: 413 });
    const rawBody = await request.text();
    if (rawBody.length > 2_000_000) return Response.json({ error: "演示内容过大，请减少上下文后重试" }, { status: 413 });
    const input = requestSchema.parse(JSON.parse(rawBody));
    const apiKey = input.config.apiKey || "";
    const requestedUrl = new URL(input.config.baseUrl);
    if (!apiKey && !isLoopbackHost(requestedUrl.hostname)) {
      return Response.json({ error: "请先配置模型 API Key" }, { status: 400 });
    }
    const endpoint = await validateProviderEndpoint(input.config.baseUrl);

    if (!apiKey && !isLoopbackHost(new URL(endpoint).hostname)) {
      return Response.json({ error: "请先配置模型 API Key" }, { status: 400 });
    }

    const localeInstruction = input.locale === "en"
      ? "The editor interface is in English. Unless the user asks for another language, write slide copy, speaker notes, assistantMessage, and summary in English."
      : "当前编辑器界面使用中文。除非用户明确要求其他语言，请使用中文生成页面文案、演讲者备注、assistantMessage 和 summary。";
    const messages = [
      { role: "system", content: `${VIBE_PPT_SYSTEM_PROMPT}\n\n${localeInstruction}` },
      { role: "system", content: `以下是当前演示和选择上下文：\n${input.context}` },
      ...input.messages.slice(-12),
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
    const message = error instanceof z.ZodError
      ? "请求或模型响应格式无效"
      : error instanceof Error ? error.message : "AI 请求失败";
    const status = /请求过于频繁|Key|HTTPS|内网|本机|地址|用户名|模型地址/.test(message) ? 400 : 422;
    const detail = error instanceof z.ZodError ? error.issues.slice(0, 5).map((issue) => ({ path: issue.path, message: issue.message })) : undefined;
    return Response.json({ error: message, ...(detail ? { detail } : {}) }, { status });
  } finally {
    activeRequests = Math.max(0, activeRequests - 1);
  }
}
