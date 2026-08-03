"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useEditorI18n } from "./EditorI18n";

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

const starterPromptKeys = ["promptDeck", "promptRewrite", "promptChart", "promptPolish"] as const;

export function AiPanel({
  config,
  onOpenSettings,
}: {
  config: ModelConfig;
  onOpenSettings: () => void;
}) {
  const { document, selectedSlideId, selectedElementId, setDocumentFromAi } = useEditor();
  const { locale, t } = useEditorI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("aiWelcome"),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const configured = Boolean(config.model && (config.apiKey || config.baseUrl.includes("localhost")));
  useEffect(() => {
    setMessages((current) =>
      current.length === 1 && current[0].id === "welcome"
        ? [{ ...current[0], content: t("aiWelcome") }]
        : current,
    );
  }, [t]);
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
          context: buildAiContext(document, selectedSlideId, selectedElementId, locale),
          locale,
          config,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("aiRequestFailed"));
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
          content: error instanceof Error ? error.message : t("aiRetry"),
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
        <button type="button" onClick={onOpenSettings} title={t("modelSettings")} aria-label={t("modelSettings")}>
          <GearSix size={18} />
        </button>
      </div>
      <div className="model-strip">
        <span>{config.model || t("modelNotConfigured")}</span>
        <i>{configured ? t("connected") : t("needsSetup")}</i>
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
              <span>{t("thinking")}</span>
            </div>
          </article>
        )}
      </div>
      {messages.length === 1 && (
        <div className="prompt-chips">
          {starterPromptKeys.map((promptKey) => (
            <button type="button" key={promptKey} onClick={() => void send(t(promptKey))}>
              {t(promptKey)}
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
          placeholder={configured ? t("aiComposerPlaceholder") : t("configureModelFirst")}
          disabled={!configured || running}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <div>
          <span>{t("currentContext")}</span>
          <button type="submit" disabled={!configured || running || !draft.trim()} aria-label={t("send")}>
            <ArrowUp size={17} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}
