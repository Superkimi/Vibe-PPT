import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function makeRequest(config: { baseUrl: string; model: string; apiKey?: string }, locale: "zh" | "en" = "zh") {
  return new NextRequest("http://localhost/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "让标题更明确" }],
      context: "{\"selectedSlideId\":\"slide-1\"}",
      locale,
      config: { temperature: 0.5, ...config },
    }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AI route", () => {
  it("requires a key for public model endpoints", async () => {
    const response = await POST(makeRequest({
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4.1-mini",
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "请先配置模型 API Key" });
  });

  it("validates and returns schema-safe model operations", async () => {
    const result = {
      assistantMessage: "标题已经更聚焦。",
      summary: "更新当前页标题",
      operations: [
        {
          op: "patch_slide",
          slideId: "slide-1",
          patch: { title: "更明确的标题" },
        },
      ],
    };
    const providerFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify(result) } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(makeRequest({
      baseUrl: "https://models.example.com/v1",
      model: "example-model",
      apiKey: "test-key",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(result);
    expect(providerFetch).toHaveBeenCalledOnce();
    const [, options] = providerFetch.mock.calls[0];
    const requestBody = JSON.parse(String(options.body));
    expect(requestBody.response_format.type).toBe("json_schema");
    expect(requestBody.messages[0].role).toBe("system");
    expect(requestBody.messages.at(-1)).toMatchObject({ role: "user", content: "让标题更明确" });
  });

  it("passes the editor language to the model instruction", async () => {
    const providerFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          assistantMessage: "The title is clearer.",
          summary: "Updated the title",
          operations: [{ op: "patch_slide", slideId: "slide-1", patch: { title: "A clearer title" } }],
        }) } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", providerFetch);

    const response = await POST(makeRequest({
      baseUrl: "https://models.example.com/v1",
      model: "example-model",
      apiKey: "test-key",
    }, "en"));

    expect(response.status).toBe(200);
    const [, options] = providerFetch.mock.calls[0];
    const requestBody = JSON.parse(String(options.body));
    expect(requestBody.messages[0].content).toContain("write slide copy");
  });
});
