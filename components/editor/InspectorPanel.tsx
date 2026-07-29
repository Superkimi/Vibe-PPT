"use client";

import { Lock, LockOpen, Trash } from "@phosphor-icons/react";
import type { ChartElement, ShapeElement, TextElement } from "@/lib/presentation-schema";
import { useEditor } from "./EditorContext";

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

  if (!selectedElement) {
    return (
      <div className="inspector-content">
        <section className="inspector-section">
          <h3>页面</h3>
          <Field label="页面名称" wide>
            <input value={selectedSlide.title} onChange={(event) => updateSlide({ title: event.target.value })} />
          </Field>
          <Field label="背景">
            <input type="color" value={selectedSlide.background} onChange={(event) => updateSlide({ background: event.target.value })} />
          </Field>
          <Field label="转场">
            <select value={selectedSlide.transition} onChange={(event) => updateSlide({ transition: event.target.value as typeof selectedSlide.transition })}>
              <option value="none">无</option>
              <option value="fade">淡入</option>
              <option value="slide">滑动</option>
              <option value="zoom">缩放</option>
            </select>
          </Field>
        </section>
        <section className="inspector-section">
          <h3>演讲者备注</h3>
          <textarea
            className="notes-input"
            value={selectedSlide.notes}
            onChange={(event) => updateSlide({ notes: event.target.value })}
            placeholder="写下这一页的讲述要点"
          />
        </section>
        <section className="inspector-section">
          <h3>主题</h3>
          <div className="theme-swatches">
            {["#6650a4", "#1f6d5c", "#af4c36", "#2457a7", "#26232b"].map((accent) => (
              <button
                type="button"
                key={accent}
                className={document.theme.accent === accent ? "is-active" : ""}
                style={{ background: accent }}
                aria-label={`主题色 ${accent}`}
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
          <span>{selectedElement.type}</span>
          <h3>{selectedElement.name || "未命名元素"}</h3>
        </div>
        <button type="button" onClick={() => update({ locked: !selectedElement.locked })} aria-label={selectedElement.locked ? "解锁元素" : "锁定元素"}>
          {selectedElement.locked ? <Lock size={17} /> : <LockOpen size={17} />}
        </button>
      </section>
      <section className="inspector-section">
        <h3>位置与尺寸</h3>
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
          <Field label="旋转">
            <input type="number" value={selectedElement.rotation} onChange={(event) => update({ rotation: Number(event.target.value) })} />
          </Field>
          <Field label="透明度">
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
          <h3>图片</h3>
          <Field label="地址" wide>
            <input value={selectedElement.src} onChange={(event) => updateElement(selectedElement.id, { src: event.target.value })} />
          </Field>
          <Field label="替代文本" wide>
            <input value={selectedElement.alt} onChange={(event) => updateElement(selectedElement.id, { alt: event.target.value })} />
          </Field>
        </section>
      )}

      <button className="danger-action" type="button" onClick={deleteSelectedElement}>
        <Trash size={16} /> 删除元素
      </button>
    </div>
  );
}

function TextInspector({ element, update }: { element: TextElement; update: (id: string, patch: Partial<TextElement>) => void }) {
  return (
    <section className="inspector-section">
      <h3>文字</h3>
      <Field label="内容" wide>
        <textarea value={element.text} onChange={(event) => update(element.id, { text: event.target.value })} />
      </Field>
      <div className="field-grid">
        <Field label="字号">
          <input type="number" min="8" value={element.fontSize} onChange={(event) => update(element.id, { fontSize: Number(event.target.value) })} />
        </Field>
        <Field label="字重">
          <select value={element.fontWeight} onChange={(event) => update(element.id, { fontWeight: Number(event.target.value) })}>
            <option value="400">常规</option>
            <option value="500">中等</option>
            <option value="600">半粗</option>
            <option value="700">粗体</option>
            <option value="800">特粗</option>
          </select>
        </Field>
        <Field label="颜色">
          <input type="color" value={element.color} onChange={(event) => update(element.id, { color: event.target.value })} />
        </Field>
        <Field label="对齐">
          <select value={element.align} onChange={(event) => update(element.id, { align: event.target.value as TextElement["align"] })}>
            <option value="left">左对齐</option>
            <option value="center">居中</option>
            <option value="right">右对齐</option>
          </select>
        </Field>
      </div>
    </section>
  );
}

function ShapeInspector({ element, update }: { element: ShapeElement; update: (id: string, patch: Partial<ShapeElement>) => void }) {
  return (
    <section className="inspector-section">
      <h3>形状</h3>
      <div className="field-grid">
        <Field label="类型">
          <select value={element.shape} onChange={(event) => update(element.id, { shape: event.target.value as ShapeElement["shape"] })}>
            <option value="rectangle">矩形</option>
            <option value="ellipse">椭圆</option>
            <option value="line">线条</option>
          </select>
        </Field>
        <Field label="填充">
          <input type="color" value={element.fill} onChange={(event) => update(element.id, { fill: event.target.value })} />
        </Field>
        <Field label="圆角">
          <input type="number" min="0" value={element.radius} onChange={(event) => update(element.id, { radius: Number(event.target.value) })} />
        </Field>
        <Field label="描边">
          <input type="number" min="0" value={element.strokeWidth} onChange={(event) => update(element.id, { strokeWidth: Number(event.target.value) })} />
        </Field>
      </div>
    </section>
  );
}

function ChartInspector({ element, update }: { element: ChartElement; update: (id: string, patch: Partial<ChartElement>) => void }) {
  return (
    <section className="inspector-section">
      <h3>图表</h3>
      <Field label="类型" wide>
        <select value={element.chart} onChange={(event) => update(element.id, { chart: event.target.value as ChartElement["chart"] })}>
          <option value="bar">柱状图</option>
          <option value="line">折线图</option>
          <option value="pie">饼图</option>
        </select>
      </Field>
      <p className="field-hint">可在 AI 对话中直接描述数据和希望强调的结论。</p>
    </section>
  );
}
