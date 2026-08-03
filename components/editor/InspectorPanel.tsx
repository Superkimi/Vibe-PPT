"use client";

import { Lock, LockOpen, Trash } from "@phosphor-icons/react";
import type { ChartElement, ShapeElement, TextElement } from "@/lib/presentation-schema";
import { useEditor } from "./EditorContext";
import { useEditorI18n } from "./EditorI18n";

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "field-wide" : ""}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const ELEMENT_TYPE_KEYS = {
  text: "elementText",
  shape: "elementShape",
  image: "elementImage",
  chart: "elementChart",
} as const;

export function InspectorPanel() {
  const {
    document,
    selectedSlide,
    selectedElement,
    updateSlide,
    updateElement,
    deleteSelectedElement,
    commit,
  } = useEditor();
  const { t } = useEditorI18n();

  if (!selectedElement) {
    return (
      <div className="inspector-content">
        <section className="inspector-section">
          <h3>{t("page")}</h3>
          <Field label={t("pageName")} wide>
            <input value={selectedSlide.title} onChange={(event) => updateSlide({ title: event.target.value })} />
          </Field>
          <Field label={t("background")}>
            <input type="color" value={selectedSlide.background} onChange={(event) => updateSlide({ background: event.target.value })} />
          </Field>
          <Field label={t("transition")}>
            <select value={selectedSlide.transition} onChange={(event) => updateSlide({ transition: event.target.value as typeof selectedSlide.transition })}>
              <option value="none">{t("transitionNone")}</option>
              <option value="fade">{t("transitionFade")}</option>
              <option value="slide">{t("transitionSlide")}</option>
              <option value="zoom">{t("transitionZoom")}</option>
            </select>
          </Field>
        </section>
        <section className="inspector-section">
          <h3>{t("speakerNotes")}</h3>
          <textarea
            className="notes-input"
            value={selectedSlide.notes}
            onChange={(event) => updateSlide({ notes: event.target.value })}
            placeholder={t("speakerNotesPlaceholder")}
          />
        </section>
        <section className="inspector-section">
          <h3>{t("theme")}</h3>
          <div className="theme-swatches">
            {["#6650a4", "#1f6d5c", "#af4c36", "#2457a7", "#26232b"].map((accent) => (
              <button
                type="button"
                key={accent}
                className={document.theme.accent === accent ? "is-active" : ""}
                style={{ background: accent }}
                aria-label={t("themeColor", { color: accent })}
                onClick={() =>
                  commit((current) => ({ ...current, theme: { ...current.theme, accent }, updatedAt: new Date().toISOString() }))
                }
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const update = (patch: Partial<typeof selectedElement>) => updateElement(selectedElement.id, patch);

  return (
    <div className="inspector-content">
      <section className="inspector-section element-heading">
        <div>
          <span>{t(ELEMENT_TYPE_KEYS[selectedElement.type])}</span>
          <h3>{selectedElement.name || t("unnamedElement")}</h3>
        </div>
        <button type="button" onClick={() => update({ locked: !selectedElement.locked })} aria-label={selectedElement.locked ? t("unlockElement") : t("lockElement")}>
          {selectedElement.locked ? <Lock size={17} /> : <LockOpen size={17} />}
        </button>
      </section>
      <section className="inspector-section">
        <h3>{t("positionAndSize")}</h3>
        <div className="field-grid">
          {(["x", "y", "w", "h"] as const).map((key) => (
            <Field label={key.toUpperCase()} key={key}>
              <input
                type="number"
                value={Math.round(selectedElement[key])}
                onChange={(event) => update({ [key]: Number(event.target.value) })}
              />
            </Field>
          ))}
          <Field label={t("rotation")}>
            <input type="number" value={selectedElement.rotation} onChange={(event) => update({ rotation: Number(event.target.value) })} />
          </Field>
          <Field label={t("opacity")}>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={selectedElement.opacity}
              onChange={(event) => update({ opacity: Number(event.target.value) })}
            />
          </Field>
        </div>
      </section>

      {selectedElement.type === "text" && <TextInspector element={selectedElement} update={updateElement} />}
      {selectedElement.type === "shape" && <ShapeInspector element={selectedElement} update={updateElement} />}
      {selectedElement.type === "chart" && <ChartInspector element={selectedElement} update={updateElement} />}
      {selectedElement.type === "image" && (
        <section className="inspector-section">
          <h3>{t("imageSection")}</h3>
          <Field label={t("address")} wide>
            <input value={selectedElement.src} onChange={(event) => updateElement(selectedElement.id, { src: event.target.value })} />
          </Field>
          <Field label={t("altText")} wide>
            <input value={selectedElement.alt} onChange={(event) => updateElement(selectedElement.id, { alt: event.target.value })} />
          </Field>
          <div className="field-grid">
            <Field label={t("fit")}>
              <select
                value={selectedElement.fit}
                onChange={(event) => updateElement(selectedElement.id, { fit: event.target.value as typeof selectedElement.fit })}
              >
                <option value="cover">{t("fitCover")}</option>
                <option value="contain">{t("fitContain")}</option>
                <option value="fill">{t("fitFill")}</option>
              </select>
            </Field>
            <Field label={t("radius")}>
              <input
                type="number"
                min="0"
                value={selectedElement.radius}
                onChange={(event) => updateElement(selectedElement.id, { radius: Number(event.target.value) })}
              />
            </Field>
          </div>
        </section>
      )}

      <button className="danger-action" type="button" onClick={deleteSelectedElement}>
        <Trash size={16} /> {t("deleteElement")}
      </button>
    </div>
  );
}

function TextInspector({ element, update }: { element: TextElement; update: (id: string, patch: Partial<TextElement>) => void }) {
  const { t } = useEditorI18n();
  return (
    <section className="inspector-section">
      <h3>{t("textSection")}</h3>
      <Field label={t("content")} wide>
        <textarea value={element.text} onChange={(event) => update(element.id, { text: event.target.value })} />
      </Field>
      <div className="field-grid">
        <Field label={t("fontSize")}>
          <input type="number" min="8" value={element.fontSize} onChange={(event) => update(element.id, { fontSize: Number(event.target.value) })} />
        </Field>
        <Field label={t("fontWeight")}>
          <select value={element.fontWeight} onChange={(event) => update(element.id, { fontWeight: Number(event.target.value) })}>
            <option value="400">{t("regular")}</option>
            <option value="500">{t("medium")}</option>
            <option value="600">{t("semibold")}</option>
            <option value="700">{t("bold")}</option>
            <option value="800">{t("extrabold")}</option>
          </select>
        </Field>
        <Field label={t("color")}>
          <input type="color" value={element.color} onChange={(event) => update(element.id, { color: event.target.value })} />
        </Field>
        <Field label={t("align")}>
          <select value={element.align} onChange={(event) => update(element.id, { align: event.target.value as TextElement["align"] })}>
            <option value="left">{t("alignLeft")}</option>
            <option value="center">{t("alignCenter")}</option>
            <option value="right">{t("alignRight")}</option>
          </select>
        </Field>
        <Field label={t("vertical")}>
          <select value={element.valign} onChange={(event) => update(element.id, { valign: event.target.value as TextElement["valign"] })}>
            <option value="top">{t("top")}</option>
            <option value="middle">{t("middle")}</option>
            <option value="bottom">{t("bottom")}</option>
          </select>
        </Field>
        <Field label={t("lineHeight")}>
          <input type="number" min="0.7" max="3" step="0.05" value={element.lineHeight} onChange={(event) => update(element.id, { lineHeight: Number(event.target.value) })} />
        </Field>
        <Field label={t("letterSpacing")}>
          <input type="number" min="-10" max="40" step="0.1" value={element.letterSpacing} onChange={(event) => update(element.id, { letterSpacing: Number(event.target.value) })} />
        </Field>
      </div>
    </section>
  );
}

function ShapeInspector({ element, update }: { element: ShapeElement; update: (id: string, patch: Partial<ShapeElement>) => void }) {
  const { t } = useEditorI18n();
  return (
    <section className="inspector-section">
      <h3>{t("shapeSection")}</h3>
      <div className="field-grid">
        <Field label={t("type")}>
          <select value={element.shape} onChange={(event) => update(element.id, { shape: event.target.value as ShapeElement["shape"] })}>
            <option value="rectangle">{t("rectangle")}</option>
            <option value="ellipse">{t("ellipse")}</option>
            <option value="line">{t("line")}</option>
          </select>
        </Field>
        <Field label={t("fill")}>
          <input type="color" value={element.fill} onChange={(event) => update(element.id, { fill: event.target.value })} />
        </Field>
        <Field label={t("radius")}>
          <input type="number" min="0" value={element.radius} onChange={(event) => update(element.id, { radius: Number(event.target.value) })} />
        </Field>
        <Field label={t("stroke")}>
          <input type="number" min="0" value={element.strokeWidth} onChange={(event) => update(element.id, { strokeWidth: Number(event.target.value) })} />
        </Field>
        <Field label={t("strokeColor")}>
          <input type="color" value={element.stroke.startsWith("#") ? element.stroke : "#000000"} onChange={(event) => update(element.id, { stroke: event.target.value })} />
        </Field>
      </div>
    </section>
  );
}

function ChartInspector({ element, update }: { element: ChartElement; update: (id: string, patch: Partial<ChartElement>) => void }) {
  const { t } = useEditorI18n();
  return (
    <section className="inspector-section">
      <h3>{t("chartSection")}</h3>
      <Field label={t("type")} wide>
        <select value={element.chart} onChange={(event) => update(element.id, { chart: event.target.value as ChartElement["chart"] })}>
          <option value="bar">{t("barChart")}</option>
          <option value="line">{t("lineChart")}</option>
          <option value="pie">{t("pieChart")}</option>
        </select>
      </Field>
      <label className="check-row">
        <input type="checkbox" checked={element.showLegend} onChange={(event) => update(element.id, { showLegend: event.target.checked })} />
        <span>{t("showLegend")}</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={element.showValues} onChange={(event) => update(element.id, { showValues: event.target.checked })} />
        <span>{t("showValues")}</span>
      </label>
      <p className="field-hint">{t("chartHint")}</p>
    </section>
  );
}
