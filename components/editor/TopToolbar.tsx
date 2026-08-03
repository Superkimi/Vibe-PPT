"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  ChartBar,
  DownloadSimple,
  FileArrowUp,
  Globe,
  ImageSquare,
  Play,
  Rectangle,
  TextT,
} from "@phosphor-icons/react";
import { nanoid } from "nanoid";
import { downloadJson } from "@/lib/download";
import { normalizeDocument } from "@/lib/document-operations";
import { exportPresentationToPptx } from "@/lib/pptx-export";
import type { SlideElement } from "@/lib/presentation-schema";
import { useEditor } from "./EditorContext";
import { useEditorI18n } from "./EditorI18n";

export function TopToolbar({ onPresent }: { onPresent: () => void }) {
  const {
    document,
    canUndo,
    canRedo,
    undo,
    redo,
    addElement,
    updateDocumentTitle,
    setDocumentFromAi,
  } = useEditor();
  const { locale, setLocale, t } = useEditorI18n();
  const documentFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");

  async function optimizeImage(file: File) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error(t("imageReadFailed"));
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return {
      src: canvas.toDataURL("image/webp", 0.88),
      ratio: canvas.width / canvas.height,
    };
  }

  function insert(type: SlideElement["type"]) {
    const common = {
      id: nanoid(),
      x: 220,
      y: 180,
      w: 520,
      h: 140,
      rotation: 0,
      opacity: 1,
      locked: false,
    };
    if (type === "text") {
      addElement({
        ...common,
        type,
        name: t("text"),
        text: t("doubleClickEdit"),
        fontFamily: "var(--font-sans)",
        fontSize: 44,
        fontWeight: 650,
        lineHeight: 1.15,
        letterSpacing: -1,
        color: document.theme.text,
        align: "left",
        valign: "top",
      });
    } else if (type === "shape") {
      addElement({
        ...common,
        type,
        name: t("shape"),
        shape: "rectangle",
        fill: document.theme.accent,
        stroke: "transparent",
        strokeWidth: 0,
        radius: 18,
        w: 280,
        h: 160,
      });
    } else if (type === "image") {
      addElement({
        ...common,
        type,
        name: t("image"),
        src: "https://picsum.photos/seed/vibe-ppt/1000/700",
        alt: t("sampleImage"),
        fit: "cover",
        radius: 20,
        w: 480,
        h: 320,
      });
    } else {
      addElement({
        ...common,
        type: "chart",
        name: t("chart"),
        chart: "bar",
        labels: [t("january"), t("february"), t("march"), t("april")],
        series: [{ name: t("sampleData"), values: [28, 44, 39, 62], color: document.theme.accent }],
        showLegend: false,
        showValues: false,
        w: 640,
        h: 340,
      });
    }
  }

  return (
    <header className="top-toolbar">
      <div className="brand-lockup">
        <Link href="/" aria-label={t("home")}><span>V</span></Link>
        <input
          value={document.title}
          aria-label={t("presentationTitle")}
          onChange={(event) => updateDocumentTitle(event.target.value)}
          onBlur={(event) => {
            if (!event.target.value.trim()) {
              updateDocumentTitle(t("untitledPresentation"));
            }
          }}
        />
      </div>
      <div className="toolbar-group">
        <button type="button" onClick={undo} disabled={!canUndo} title={t("undo")} aria-label={t("undo")}>
          <ArrowCounterClockwise size={18} />
        </button>
        <button type="button" onClick={redo} disabled={!canRedo} title={t("redo")} aria-label={t("redo")}>
          <ArrowClockwise size={18} />
        </button>
        <span className="toolbar-divider" />
        <button type="button" onClick={() => insert("text")}><TextT size={18} />{t("text")}</button>
        <button type="button" onClick={() => insert("shape")}><Rectangle size={18} />{t("shape")}</button>
        <input
          ref={imageFileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              const { src, ratio } = await optimizeImage(file);
              const width = 480;
              addElement({
                id: nanoid(),
                type: "image",
                name: file.name,
                x: 220,
                y: 160,
                w: width,
                h: Math.min(420, Math.max(220, width / ratio)),
                rotation: 0,
                opacity: 1,
                locked: false,
                src,
                alt: file.name.replace(/\.[^.]+$/, ""),
                fit: "cover",
                radius: 20,
              });
              setNotice("");
            } catch {
              setNotice(t("imageReadFailed"));
            } finally {
              event.target.value = "";
            }
          }}
        />
        <button type="button" onClick={() => imageFileRef.current?.click()}><ImageSquare size={18} />{t("image")}</button>
        <button type="button" onClick={() => insert("chart")}><ChartBar size={18} />{t("chart")}</button>
      </div>
      <div className="toolbar-actions">
        <input
          ref={documentFileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              const next = normalizeDocument(JSON.parse(await file.text()));
              setDocumentFromAi(next, t("importedJson"));
              setNotice("");
            } catch {
              setNotice(t("invalidDocument"));
            }
            event.target.value = "";
          }}
        />
        <button type="button" className="icon-text-button" onClick={() => documentFileRef.current?.click()}>
          <FileArrowUp size={17} /> {t("import")}
        </button>
        <button type="button" className="icon-text-button" onClick={() => downloadJson(`${document.title}.vibe.json`, document)}>
          <DownloadSimple size={17} /> {t("json")}
        </button>
        <button
          type="button"
          className="icon-text-button"
          onClick={() => {
            void exportPresentationToPptx(document).catch(() => setNotice(t("pptxExportFailed")));
          }}
        >
          <DownloadSimple size={17} /> {t("pptx")}
        </button>
        <button type="button" className="present-button" onClick={onPresent}>
          <Play size={16} weight="fill" /> {t("present")}
        </button>
        <button
          type="button"
          className="language-toggle"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          title={t("switchLanguage")}
          aria-label={t("switchLanguage")}
        >
          <Globe size={17} /> {locale === "zh" ? t("switchLanguageShort") : t("switchLanguageShort")}
        </button>
      </div>
      {notice && (
        <button type="button" className="toolbar-notice" onClick={() => setNotice("")}>
          {notice}<span>×</span>
        </button>
      )}
    </header>
  );
}
