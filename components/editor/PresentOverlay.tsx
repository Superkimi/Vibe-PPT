"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import type { PresentationDocument } from "@/lib/presentation-schema";
import { SlideRenderer } from "./SlideRenderer";

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
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" || event.key === " ") setIndex((value) => Math.min(document.slides.length - 1, value + 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [document.slides.length, onClose]);

  const slide = document.slides[index];
  return (
    <div className="present-overlay">
      <div className="present-stage">
        <SlideRenderer document={document} slide={slide} className={`transition-${slide.transition}`} />
      </div>
      <div className="present-controls">
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} aria-label="上一页">
          <ArrowLeft size={18} />
        </button>
        <span>{index + 1} / {document.slides.length}</span>
        <button type="button" onClick={() => setIndex((value) => Math.min(document.slides.length - 1, value + 1))} disabled={index === document.slides.length - 1} aria-label="下一页">
          <ArrowRight size={18} />
        </button>
      </div>
      <button type="button" className="present-close" onClick={onClose} aria-label="退出演示">
        <X size={20} />
      </button>
    </div>
  );
}
