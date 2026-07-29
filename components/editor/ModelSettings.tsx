"use client";

import { useState } from "react";
import { Check, Eye, EyeSlash, X } from "@phosphor-icons/react";
import type { ModelConfig } from "./AiPanel";

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
}: {
  open: boolean;
  config: ModelConfig;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
}) {
  const [draft, setDraft] = useState(config);
  const [showKey, setShowKey] = useState(false);
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onPointerDown={onClose}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="model-settings-title" onPointerDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>AI PROVIDER</span>
            <h2 id="model-settings-title">模型连接</h2>
            <p>支持 OpenAI 兼容的 Chat Completions 接口。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭">
            <X size={19} />
          </button>
        </header>
        <div className="settings-fields">
          <label>
            <span>API 地址</span>
            <input
              value={draft.baseUrl}
              onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })}
              placeholder="https://api.openai.com/v1"
            />
            <small>生产环境仅允许 HTTPS，开发环境可连接本机 Ollama 或 LM Studio。</small>
          </label>
          <label>
            <span>模型 ID</span>
            <input
              value={draft.model}
              onChange={(event) => setDraft({ ...draft, model: event.target.value })}
              placeholder="gpt-5.2"
            />
          </label>
          <label>
            <span>API Key</span>
            <div className="key-input">
              <input
                type={showKey ? "text" : "password"}
                value={draft.apiKey}
                onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })}
                placeholder="sk-..."
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowKey((value) => !value)} aria-label={showKey ? "隐藏 API Key" : "显示 API Key"}>
                {showKey ? <EyeSlash size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <small>Key 仅保存在当前浏览器，不会写入项目文件或服务端日志。</small>
          </label>
          <label>
            <span>创意强度 {draft.temperature.toFixed(1)}</span>
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.1"
              value={draft.temperature}
              onChange={(event) => setDraft({ ...draft, temperature: Number(event.target.value) })}
            />
          </label>
        </div>
        <footer>
          <button type="button" className="button-secondary" onClick={onClose}>取消</button>
          <button
            type="button"
            className="button-primary"
            disabled={!draft.baseUrl || !draft.model}
            onClick={() => {
              onSave({ ...draft, baseUrl: draft.baseUrl.replace(/\/$/, "") });
              onClose();
            }}
          >
            <Check size={16} weight="bold" /> 保存连接
          </button>
        </footer>
      </section>
    </div>
  );
}
