"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp,
  CheckCircle,
  GearSix,
  MagicWand,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { buildAiContext } from "@/lib/ai-system-prompt";
import { aiResponseSchema, type AiResponse } from "@/lib/presentation-schema";
import { applyOperations } from "@/lib/document-operations";
import { BASE_PATH } from "@/lib/base-path";
import { useEditor } from "./EditorContext";

export interface ModelConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  summary?: string;
  error?: boolean;
}

const starterPrompts = [
  "把这份演示改成 8 页的产品发布稿",
  "重写当前页，让结论更清楚",
  "增加一页数据对比，用柱状图表达",
  "统一排版、颜色和页面节奏",
];

export function AiPanel({
  config,
  onOpenSettings,
}: {
  config: ModelConfig;
  onOpenSettings: () => void;
}) {
  const { document, selectedSlideId, selectedElementId, setDocumentFromAi } = useEditor();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "告诉我这份演示要说服谁、讲什么、希望听众做什么。我会直接在画布上完成修改。",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const configured = Boolean(config.model && (config.apiKey || config.baseUrl.includes("localhost")));
  const recent = useMemo(
    () => messages.filter((message) => message.id !== "welcome").slice(-12),
    [messages],
  );

  async function send(content = draft) {
    const prompt = content.trim();
    if (!prompt || running) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: prompt };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setRunning(true);

    try {
      const response = await fetch(`${BASE_PATH}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...recent, userMessage].map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
          context: buildAiContext(document, selectedSlideId, selectedElementId),
          config,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI 请求失败");
      const result: AiResponse = aiResponseSchema.parse(payload);
      const nextDocument = applyOperations(document, result.operations);
      setDocumentFromAi(nextDocument, result.summary);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.assistantMessage,
          summary: result.summary,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error instanceof Error ? error.message : "这次修改没有完成，请重试。",
          error: true,
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div>
          <Sparkle size={18} weight="fill" />
          <span>Vibe AI</span>
        </div>
        <button type="button" onClick={onOpenSettings} title="模型设置" aria-label="模型设置">
          <GearSix size={18} />
        </button>
      </div>
      <div className="model-strip">
        <span>{config.model || "尚未配置模型"}</span>
        <i>{configured ? "已连接" : "需要设置"}</i>
      </div>
      <div className="chat-thread" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`chat-message is-${message.role} ${message.error ? "is-error" : ""}`}>
            {message.role === "assistant" && (
              <span className="message-avatar">
                {message.error ? <WarningCircle size={15} /> : <MagicWand size={15} />}
              </span>
            )}
            <div>
              <p>{message.content}</p>
              {message.summary && (
                <small>
                  <CheckCircle size={13} weight="fill" />
                  {message.summary}
                </small>
              )}
            </div>
          </article>
        ))}
        {running && (
          <article className="chat-message is-assistant">
            <span className="message-avatar"><MagicWand size={15} /></span>
            <div className="thinking-line">
              <i />
              <i />
              <i />
              <span>正在整理叙事并校验页面 schema</span>
            </div>
          </article>
        )}
      </div>
      {messages.length === 1 && (
        <div className="prompt-chips">
          {starterPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => void send(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}
      <form
        className="ai-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={configured ? "描述你想创建或修改的内容" : "先配置模型和 API Key"}
          disabled={!configured || running}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <div>
          <span>已包含当前页和选中元素</span>
          <button type="submit" disabled={!configured || running || !draft.trim()} aria-label="发送">
            <ArrowUp size={17} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}
