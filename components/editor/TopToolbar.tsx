"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  ChartBar,
  DownloadSimple,
  FileArrowUp,
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

export function TopToolbar({ onPresent }: { onPresent: () => void }) {
  const {
    document,
    canUndo,
    canRedo,
    undo,
    redo,
    addElement,
    commit,
    setDocumentFromAi,
  } = useEditor();
  const documentFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  async function optimizeImage(file: File) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("无法读取这张图片");
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
        name: "文本",
        text: "双击编辑文字",
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
        name: "形状",
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
        name: "图片",
        src: "https://picsum.photos/seed/vibe-ppt/1000/700",
        alt: "演示图片",
        fit: "cover",
        radius: 20,
        w: 480,
        h: 320,
      });
    } else {
      addElement({
        ...common,
        type: "chart",
        name: "图表",
        chart: "bar",
        labels: ["一月", "二月", "三月", "四月"],
        series: [{ name: "示例数据", values: [28, 44, 39, 62], color: document.theme.accent }],
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
        <Link href="/" aria-label="返回 Vibe PPT 首页"><span>V</span></Link>
        <input
          value={document.title}
          aria-label="演示标题"
          onChange={(event) =>
            commit((current) => ({ ...current, title: event.target.value }))
          }
        />
      </div>
      <div className="toolbar-group">
        <button type="button" onClick={undo} disabled={!canUndo} title="撤销">
          <ArrowCounterClockwise size={18} />
        </button>
        <button type="button" onClick={redo} disabled={!canRedo} title="重做">
          <ArrowClockwise size={18} />
        </button>
        <span className="toolbar-divider" />
        <button type="button" onClick={() => insert("text")}><TextT size={18} />文字</button>
        <button type="button" onClick={() => insert("shape")}><Rectangle size={18} />形状</button>
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
            } finally {
              event.target.value = "";
            }
          }}
        />
        <button type="button" onClick={() => imageFileRef.current?.click()}><ImageSquare size={18} />图片</button>
        <button type="button" onClick={() => insert("chart")}><ChartBar size={18} />图表</button>
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
            const next = normalizeDocument(JSON.parse(await file.text()));
            setDocumentFromAi(next, "导入 JSON 文档");
            event.target.value = "";
          }}
        />
        <button type="button" className="icon-text-button" onClick={() => documentFileRef.current?.click()}>
          <FileArrowUp size={17} /> 导入
        </button>
        <button type="button" className="icon-text-button" onClick={() => downloadJson(`${document.title}.vibe.json`, document)}>
          <DownloadSimple size={17} /> JSON
        </button>
        <button type="button" className="icon-text-button" onClick={() => void exportPresentationToPptx(document)}>
          <DownloadSimple size={17} /> PPTX
        </button>
        <button type="button" className="present-button" onClick={onPresent}>
          <Play size={16} weight="fill" /> 演示
        </button>
      </div>
    </header>
  );
}
