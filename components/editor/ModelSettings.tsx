"use client";

import { useState } from "react";
import { Check, Eye, EyeSlash, X } from "@phosphor-icons/react";
import type { ModelConfig } from "./AiPanel";
import { useEditorI18n } from "./EditorI18n";

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  baseUrl: "https://api.openai.com/v1",
  model: "",
  apiKey: "",
  temperature: 0.6,
};

export function ModelSettings({
  open,
  config,
  onClose,
  onSave,
  onTestConnection,
}: {
  open: boolean;
  config: ModelConfig;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
  onTestConnection: (config: ModelConfig) => Promise<string | undefined>;
}) {
  const [draft, setDraft] = useState(config);
  const [showKey, setShowKey] = useState(false);
  const [testState, setTestState] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const { t } = useEditorI18n();
  const changeDraft = (patch: Partial<ModelConfig>) => {
    setDraft({ ...draft, ...patch });
    setTestState("idle");
    setTestMessage("");
  };
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onPointerDown={onClose}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="model-settings-title" onPointerDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>AI PROVIDER</span>
            <h2 id="model-settings-title">{t("modelSettingsTitle")}</h2>
            <p>{t("modelSettingsDescription")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("close")}>
            <X size={19} />
          </button>
        </header>
        <div className="settings-fields">
          <label>
            <span>{t("apiAddress")}</span>
            <input
              value={draft.baseUrl}
              onChange={(event) => changeDraft({ baseUrl: event.target.value })}
              placeholder="https://api.openai.com/v1"
            />
            <small>{t("apiAddressHint")}</small>
          </label>
          <label>
            <span>{t("modelId")}</span>
            <input
              value={draft.model}
              onChange={(event) => changeDraft({ model: event.target.value })}
              placeholder="gpt-5.2"
            />
          </label>
          <label>
            <span>{t("apiKey")}</span>
            <div className="key-input">
              <input
                type={showKey ? "text" : "password"}
                value={draft.apiKey}
                onChange={(event) => changeDraft({ apiKey: event.target.value })}
                placeholder={t("apiKeyPlaceholder")}
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowKey((value) => !value)} aria-label={showKey ? t("hideApiKey") : t("showApiKey")}>
                {showKey ? <EyeSlash size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <small>{t("apiKeyHint")}</small>
          </label>
          <label>
            <span>{t("creativity", { value: draft.temperature.toFixed(1) })}</span>
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.1"
              value={draft.temperature}
              onChange={(event) => changeDraft({ temperature: Number(event.target.value) })}
            />
          </label>
        </div>
        <div className={`connection-test is-${testState}`} role="status">
          {testMessage && <span>{testMessage}</span>}
          <button
            type="button"
            className="button-secondary"
            disabled={!draft.baseUrl || !draft.model || testState === "testing"}
            onClick={async () => {
              setTestState("testing");
              setTestMessage(t("testingConnection"));
              let error: string | undefined;
              try {
                error = await onTestConnection({ ...draft, baseUrl: draft.baseUrl.replace(/\/$/, "") });
              } catch {
                error = t("connectionFailed");
              }
              setTestState(error ? "error" : "success");
              setTestMessage(error || t("connectionSuccess"));
            }}
          >
            {testState === "testing" ? t("testingConnection") : t("testConnection")}
          </button>
        </div>
        <footer>
          <button type="button" className="button-secondary" onClick={onClose}>{t("cancel")}</button>
          <button
            type="button"
            className="button-primary"
            disabled={!draft.baseUrl || !draft.model}
            onClick={() => {
              onSave({ ...draft, baseUrl: draft.baseUrl.replace(/\/$/, "") });
              onClose();
            }}
          >
            <Check size={16} weight="bold" /> {t("saveConnection")}
          </button>
        </footer>
      </section>
    </div>
  );
}
