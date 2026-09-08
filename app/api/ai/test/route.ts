import { NextRequest } from "next/server";
import { z } from "zod";
import { isLoopbackHost, validateProviderEndpoint } from "@/lib/provider-security";

export const runtime = "nodejs";

const schema = z.object({
  config: z.object({
    baseUrl: z.string().url(),
    model: z.string().min(1).max(200),
    apiKey: z.string().max(1000).optional(),
  }),
});

const testBuckets = new Map<string, { startedAt: number; count: number }>();

function allowTest(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  const bucket = testBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    testBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= 10;
}

export async function POST(request: NextRequest) {
  if (!allowTest(request)) return Response.json({ error: "连接测试过于频繁，请稍后再试" }, { status: 429 });
  try {
    const rawBody = await request.text();
    if (rawBody.length > 100_000) return Response.json({ error: "连接测试请求过大" }, { status: 413 });
    const input = schema.parse(JSON.parse(rawBody));
    const endpoint = await validateProviderEndpoint(input.config.baseUrl);
    const key = input.config.apiKey || "";
    if (!key && !isLoopbackHost(new URL(endpoint).hostname)) {
      return Response.json({ error: "请先配置模型 API Key" }, { status: 400 });
    }
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model: input.config.model,
        messages: [{ role: "user", content: "Reply with the single word OK." }],
        temperature: 0,
        max_tokens: 4,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: `模型连接失败（${response.status}）` }, { status: 502 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "模型连接失败" }, { status: 422 });
  }
}
