"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, X } from "@phosphor-icons/react";
import {
  PRESENTATION_TEMPLATES,
  type TemplateCategory,
  type TemplateId,
  type TemplateLocale,
} from "@/lib/template-library";

const CATEGORIES: Array<{ id: TemplateCategory | "all"; zh: string; en: string }> = [
  { id: "all", zh: "全部", en: "All" },
  { id: "business", zh: "商业", en: "Business" },
  { id: "technology", zh: "科技", en: "Technology" },
  { id: "research", zh: "研究", en: "Research" },
  { id: "brand", zh: "品牌", en: "Brand" },
  { id: "data", zh: "数据", en: "Data" },
  { id: "finance", zh: "金融", en: "Finance" },
  { id: "creative", zh: "创意", en: "Creative" },
];

function Preview({ template }: { template: (typeof PRESENTATION_TEMPLATES)[number] }) {
  const { palette, decoration } = template;
  return (
    <div className={`template-preview template-preview-${decoration}`} style={{ background: palette.background }}>
      <span className="template-preview-rule" style={{ background: palette.accent }} />
      <span className="template-preview-kicker" style={{ color: palette.accent }} />
      <span className="template-preview-title" style={{ background: palette.text }} />
      <span className="template-preview-title template-preview-title-short" style={{ background: palette.text }} />
      <span className="template-preview-copy" style={{ background: palette.muted }} />
      <span className="template-preview-copy template-preview-copy-short" style={{ background: palette.muted }} />
      <span className="template-preview-card template-preview-card-a" style={{ background: palette.surface, borderColor: palette.line }} />
      <span className="template-preview-card template-preview-card-b" style={{ background: palette.accent2 }} />
      <span className="template-preview-dot" style={{ background: palette.accent3 }} />
    </div>
  );
}

export function TemplatePicker({
  open,
  locale,
  onClose,
  onSelect,
}: {
  open: boolean;
  locale: TemplateLocale;
  onClose: () => void;
  onSelect: (templateId: TemplateId) => void;
}) {
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const templates = useMemo(
    () => PRESENTATION_TEMPLATES.filter((template) => category === "all" || template.category === category),
    [category],
  );

  if (!open) return null;

  return (
    <div className="dialog-backdrop template-picker-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="template-picker" role="dialog" aria-modal="true" aria-labelledby="template-picker-title">
        <header className="template-picker-header">
          <div>
            <span className="template-picker-kicker">VIBE PPT / TEMPLATE LIBRARY</span>
            <h2 id="template-picker-title">{locale === "en" ? "Start with a visual system" : "先选一套视觉系统"}</h2>
            <p>
              {locale === "en"
                ? "Each template creates a five-slide, editable starting deck. You can replace the copy, data, and images, then undo the whole choice."
                : "每个模板会创建一份五页、可继续编辑的起始演示。文字、数据和图片都可以替换，整次选择也支持撤销。"}
            </p>
          </div>
          <button type="button" className="template-picker-close" onClick={onClose} aria-label={locale === "en" ? "Close" : "关闭"}>
            <X size={19} />
          </button>
        </header>
        <div className="template-picker-toolbar">
          <div className="template-category-list" role="tablist" aria-label={locale === "en" ? "Template categories" : "模板分类"}>
            {CATEGORIES.map((item) => (
              <button
                type="button"
                role="tab"
                aria-selected={category === item.id}
                className={category === item.id ? "is-active" : ""}
                key={item.id}
                onClick={() => setCategory(item.id)}
              >
                {locale === "en" ? item.en : item.zh}
              </button>
            ))}
          </div>
          <span className="template-count">{templates.length} {locale === "en" ? "styles" : "套风格"}</span>
        </div>
        <div className="template-grid">
          {templates.map((template) => (
            <article className="template-card" key={template.id}>
              <Preview template={template} />
              <div className="template-card-copy">
                <div className="template-card-title-row">
                  <div>
                    <span className="template-card-category">{locale === "en" ? template.categoryEn : CATEGORIES.find((item) => item.id === template.category)?.zh}</span>
                    <h3>{locale === "en" ? template.nameEn : template.name}</h3>
                  </div>
                  <span className="template-card-check" aria-hidden="true"><Check size={13} /></span>
                </div>
                <p>{locale === "en" ? template.descriptionEn : template.description}</p>
                <span className="template-card-audience">{locale === "en" ? template.audienceEn : template.audience}</span>
                <button type="button" className="template-use-button" onClick={() => onSelect(template.id)}>
                  {locale === "en" ? "Use this template" : "使用这套模板"} <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <footer className="template-picker-footer">
          <span>{locale === "en" ? "Inspired by role-based editorial, data, and launch systems." : "参考编辑式、数据式和发布式页面系统，保留 Vibe PPT 的可编辑文档结构。"}</span>
          <button type="button" onClick={onClose}>{locale === "en" ? "Keep blank canvas" : "继续使用空白画布"}</button>
        </footer>
      </section>
    </div>
  );
}
