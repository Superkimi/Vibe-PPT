"use client";

import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { Minus, Plus } from "@phosphor-icons/react";
import { useEditor } from "./EditorContext";
import { ElementContent } from "./SlideRenderer";
import { useEditorI18n } from "./EditorI18n";

export function CanvasWorkspace() {
  const { document, selectedSlide, selectedElementId, selectElement, updateElement } = useEditor();
  const { t } = useEditorI18n();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.68);
  const [zoom, setZoom] = useState(1);
  const [editingId, setEditingId] = useState<string>();

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const widthScale = (viewport.clientWidth - 96) / document.size.width;
      const heightScale = (viewport.clientHeight - 96) / document.size.height;
      setFitScale(Math.min(widthScale, heightScale, 1));
    };
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    update();
    return () => observer.disconnect();
  }, [document.size.height, document.size.width]);

  const scale = fitScale * zoom;

  return (
    <main className="canvas-workspace" ref={viewportRef} onPointerDown={() => selectElement(undefined)}>
      <div
        className="canvas-stage-wrap"
        style={{
          width: document.size.width * scale,
          height: document.size.height * scale,
        }}
      >
        <div
          className="canvas-stage"
          style={{
            width: document.size.width,
            height: document.size.height,
            background: selectedSlide.background,
            transform: `scale(${scale})`,
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {selectedSlide.elements.map((element) => {
            const selected = element.id === selectedElementId;
            return (
              <Rnd
                key={element.id}
                className={`canvas-element ${selected ? "is-selected" : ""} ${element.locked ? "is-locked" : ""}`}
                position={{ x: element.x, y: element.y }}
                size={{ width: element.w, height: element.h }}
                scale={scale}
                bounds="parent"
                disableDragging={element.locked || editingId === element.id}
                enableResizing={!element.locked && editingId !== element.id}
                lockAspectRatio={element.type === "image"}
                onPointerDown={(event: React.PointerEvent) => {
                  event.stopPropagation();
                  selectElement(element.id);
                }}
                onDragStop={(_, data) => updateElement(element.id, { x: Math.round(data.x), y: Math.round(data.y) })}
                onResizeStop={(_, __, ref, ___, position) =>
                  updateElement(element.id, {
                    x: Math.round(position.x),
                    y: Math.round(position.y),
                    w: Math.round(ref.offsetWidth),
                    h: Math.round(ref.offsetHeight),
                  })
                }
                onDoubleClick={() => element.type === "text" && setEditingId(element.id)}
              >
                {element.type === "text" && editingId === element.id ? (
                  <div
                    className="slide-text canvas-text-editor"
                    contentEditable
                    suppressContentEditableWarning
                    autoFocus
                    style={{
                      fontFamily: element.fontFamily,
                      fontSize: element.fontSize,
                      fontWeight: element.fontWeight,
                      lineHeight: element.lineHeight,
                      letterSpacing: element.letterSpacing,
                      color: element.color,
                      textAlign: element.align,
                    }}
                    onBlur={(event) => {
                      updateElement(element.id, { text: event.currentTarget.textContent || "" });
                      setEditingId(undefined);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.currentTarget.blur();
                      }
                    }}
                  >
                    {element.text}
                  </div>
                ) : (
                  <ElementContent element={element} />
                )}
              </Rnd>
            );
          })}
        </div>
      </div>
      <div className="zoom-control" aria-label={t("canvasZoom")}>
        <button type="button" onClick={() => setZoom((value) => Math.max(0.5, value / 1.15))} aria-label={t("zoomOut")}>
          <Minus size={14} />
        </button>
        <button type="button" className="zoom-value" onClick={() => setZoom(1)}>
          {Math.round(scale * 100)}%
        </button>
        <button type="button" onClick={() => setZoom((value) => Math.min(3, value * 1.15))} aria-label={t("zoomIn")}>
          <Plus size={14} />
        </button>
      </div>
    </main>
  );
}
