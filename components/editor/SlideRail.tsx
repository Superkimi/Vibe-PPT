"use client";

import { Copy, DotsSixVertical, Plus, Trash } from "@phosphor-icons/react";
import { useEditor } from "./EditorContext";
import { useEditorI18n } from "./EditorI18n";
import { SlideRenderer } from "./SlideRenderer";

export function SlideRail() {
  const {
    document,
    selectedSlideId,
    selectSlide,
    addSlide,
    duplicateCurrentSlide,
    deleteCurrentSlide,
    reorderSlides,
  } = useEditor();
  const { t } = useEditorI18n();

  return (
    <aside className="slide-rail" aria-label={t("slideDirectory")}>
      <div className="rail-heading">
        <div>
          <span>{t("slides")}</span>
          <strong>{document.slides.length}</strong>
        </div>
        <button type="button" onClick={addSlide} title={t("newSlide")} aria-label={t("newSlide")}>
          <Plus size={17} weight="bold" />
        </button>
      </div>
      <div className="slide-list">
        {document.slides.map((slide, index) => {
          const active = slide.id === selectedSlideId;
          return (
            <button
              type="button"
              className={`slide-thumbnail-row ${active ? "is-active" : ""}`}
              key={slide.id}
              onClick={() => selectSlide(slide.id)}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/slide-index", String(index))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const from = Number(event.dataTransfer.getData("text/slide-index"));
                if (Number.isInteger(from)) reorderSlides(from, index);
              }}
            >
              <span className="slide-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="thumbnail-frame">
                <span className="thumbnail-scale">
                  <SlideRenderer document={document} slide={slide} />
                </span>
              </span>
              <span className="thumbnail-title">{slide.title}</span>
              <DotsSixVertical className="drag-handle" size={15} />
            </button>
          );
        })}
      </div>
      <div className="rail-actions">
        <button type="button" onClick={duplicateCurrentSlide}>
          <Copy size={16} /> {t("duplicate")}
        </button>
        <button type="button" onClick={deleteCurrentSlide} disabled={document.slides.length === 1}>
          <Trash size={16} /> {t("delete")}
        </button>
      </div>
    </aside>
  );
}
