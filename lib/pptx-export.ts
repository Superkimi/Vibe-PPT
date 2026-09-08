import type {
  ChartElement,
  ImageElement,
  PresentationDocument,
  ShapeElement,
  TextElement,
} from "./presentation-schema";


function hex(value: string) {
  const match = value.match(/^#([0-9a-f]{6})$/i);
  return match ? match[1].toUpperCase() : "000000";
}

function fontForText(text: string, requested: string, fallback: string) {
  if (/[\u3400-\u9fff]/.test(text)) return "Hiragino Sans GB";
  return requested.startsWith("var(") ? fallback : requested;
}

function toDataUri(buffer: ArrayBuffer, mime: string) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

async function resolveImageData(element: ImageElement) {
  if (element.src.startsWith("data:")) return element.src;
  const response = await fetch(element.src);
  if (!response.ok) throw new Error(`无法读取图片：${element.alt || element.src}`);
  return toDataUri(await response.arrayBuffer(), response.headers.get("content-type") || "image/png");
}

export async function exportPresentationToPptx(document: PresentationDocument) {
  const pptxModule = await import("pptxgenjs");
  const PptxGenJS = pptxModule.default;
  const pptx = new PptxGenJS();
  const inchWidth = 13.333;
  const inchHeight = inchWidth * (document.size.height / document.size.width);
  const layoutName = "VIBE_CUSTOM";
  pptx.defineLayout({ name: layoutName, width: inchWidth, height: inchHeight });
  pptx.layout = layoutName;
  pptx.author = "Vibe PPT";
  pptx.subject = document.title;
  pptx.title = document.title;
  pptx.company = "aihubhub";
  const hasCjk = document.slides.some((slide) => slide.elements.some((element) => element.type === "text" && /[\u3400-\u9fff]/.test(element.text)));
  pptx.theme = {
    headFontFace: hasCjk ? "Hiragino Sans GB" : document.theme.headingFamily.startsWith("var(") ? "Aptos Display" : document.theme.headingFamily,
    bodyFontFace: hasCjk ? "Hiragino Sans GB" : document.theme.fontFamily.startsWith("var(") ? "Aptos" : document.theme.fontFamily,
  };

  const sx = inchWidth / document.size.width;
  const sy = inchHeight / document.size.height;

  for (const sourceSlide of document.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: hex(sourceSlide.background) };
    slide.addNotes(sourceSlide.notes || "");

    for (const element of sourceSlide.elements) {
      const box = {
        x: element.x * sx,
        y: element.y * sy,
        w: element.w * sx,
        h: element.h * sy,
        rotate: element.rotation,
        transparency: Math.round((1 - element.opacity) * 100),
      };

      if (element.type === "text") {
        const text = element as TextElement;
        slide.addText(text.text, {
          ...box,
          fontFace: fontForText(text.text, text.fontFamily, document.theme.fontFamily.startsWith("var(") ? "Aptos" : document.theme.fontFamily),
          fontSize: Math.max(6, text.fontSize * 0.75),
          bold: text.fontWeight >= 650,
          color: hex(text.color),
          align: text.align,
          valign: text.valign === "middle" ? "middle" : text.valign === "bottom" ? "bottom" : "top",
          margin: 0,
          breakLine: false,
          fit: "shrink",
          lineSpacingMultiple: text.lineHeight,
          charSpacing: text.letterSpacing,
        });
        continue;
      }

      if (element.type === "shape") {
        const shape = element as ShapeElement;
        const shapeType =
          shape.shape === "ellipse"
            ? pptx.ShapeType.ellipse
            : shape.shape === "line"
              ? pptx.ShapeType.line
              : shape.radius > 0
                ? pptx.ShapeType.roundRect
                : pptx.ShapeType.rect;
        slide.addShape(shapeType, {
          ...box,
          fill: shape.shape === "line" ? { color: hex(shape.stroke), transparency: 100 } : { color: hex(shape.fill) },
          line: { color: hex(shape.stroke === "transparent" ? shape.fill : shape.stroke), width: shape.strokeWidth },
        });
        continue;
      }

      if (element.type === "image") {
        const data = await resolveImageData(element as ImageElement);
        slide.addImage({
          ...box,
          data,
          ...(element.fit === "fill" ? {} : { sizing: { type: element.fit, w: box.w, h: box.h } }),
          rounding: element.radius > 0,
        });
        continue;
      }

      const chart = element as ChartElement;
      const type =
        chart.chart === "pie"
          ? pptx.ChartType.pie
          : chart.chart === "line"
            ? pptx.ChartType.line
            : pptx.ChartType.bar;
      slide.addChart(
        type,
        chart.series.map((series) => ({
          name: series.name,
          labels: chart.labels,
          values: series.values,
        })),
        {
          ...box,
          catAxisLabelColor: hex(document.theme.muted),
          valAxisLabelColor: hex(document.theme.muted),
          showLegend: chart.showLegend,
          showValue: chart.showValues,
          showTitle: false,
          chartColors: chart.series.map((series) => hex(series.color)),
        },
      );
    }
  }

  await pptx.writeFile({ fileName: `${document.title || "vibe-ppt"}.pptx` });
}
