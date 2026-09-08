"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import type { PresentationDocument } from "@/lib/presentation-schema";
import { SlideRenderer } from "./SlideRenderer";
import { useEditorI18n } from "./EditorI18n";

export function safePresentationIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export function PresentOverlay({
  document,
  initialIndex,
  onClose,
}: {
  document: PresentationDocument;
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const { t } = useEditorI18n();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" || event.key === " ") setIndex((value) => Math.min(document.slides.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [document.slides.length, onClose]);

  const safeIndex = safePresentationIndex(index, document.slides.length);
  const slide = document.slides[safeIndex] || document.slides[0];
  if (!slide) return null;
  return (
    <div className="present-overlay">
      <div
        className="present-stage"
        style={{
          "--slide-ratio": document.size.width / document.size.height,
          "--slide-width": `${document.size.width}px`,
          "--slide-height": `${document.size.height}px`,
        } as CSSProperties}
      >
        <SlideRenderer document={document} slide={slide} className={`transition-${slide.transition}`} />
      </div>
      <div className="present-controls">
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} aria-label={t("previousSlide")}>
          <ArrowLeft size={18} />
        </button>
        <span>{safeIndex + 1} / {document.slides.length}</span>
        <button type="button" onClick={() => setIndex((value) => Math.min(document.slides.length - 1, value + 1))} disabled={safeIndex === document.slides.length - 1} aria-label={t("nextSlide")}>
          <ArrowRight size={18} />
        </button>
      </div>
      <button type="button" className="present-close" onClick={onClose} aria-label={t("exitPresentation")}>
        <X size={20} />
      </button>
    </div>
  );
}
