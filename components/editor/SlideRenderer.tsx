"use client";

import type { CSSProperties } from "react";
import type { PresentationDocument, Slide, SlideElement } from "@/lib/presentation-schema";
import { ChartVisual } from "./ChartVisual";

function baseStyle(element: SlideElement): CSSProperties {
  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    transform: `rotate(${element.rotation}deg)`,
    opacity: element.opacity,
    pointerEvents: "none",
  };
}

export function ElementContent({ element }: { element: SlideElement }) {
  if (element.type === "text") {
    return (
      <div
        className="slide-text"
        style={{
          fontFamily: element.fontFamily,
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing,
          color: element.color,
          textAlign: element.align,
          justifyContent:
            element.valign === "middle" ? "center" : element.valign === "bottom" ? "flex-end" : "flex-start",
        }}
      >
        {element.text}
      </div>
    );
  }
  if (element.type === "shape") {
    return (
      <div
        className={`slide-shape shape-${element.shape}`}
        style={{
          background: element.shape === "line" ? "transparent" : element.fill,
          borderColor: element.shape === "line" ? element.fill : element.stroke,
          borderWidth: element.shape === "line" ? Math.max(element.strokeWidth, 2) : element.strokeWidth,
          borderRadius: element.shape === "ellipse" ? "50%" : element.radius,
        }}
      />
    );
  }
  if (element.type === "image") {
    // The slide model accepts user-provided/data URLs and must preserve exact sizing.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="slide-image" src={element.src} alt={element.alt} style={{ objectFit: element.fit, borderRadius: element.radius }} />;
  }
  return <ChartVisual element={element} />;
}

export function SlideRenderer({
  document,
  slide,
  className = "",
}: {
  document: PresentationDocument;
  slide: Slide;
  className?: string;
}) {
  return (
    <div
      className={`slide-renderer ${className}`}
      style={{ width: document.size.width, height: document.size.height, background: slide.background }}
    >
      {slide.elements.map((element) => (
        <div key={element.id} data-element-id={element.id} style={baseStyle(element)}>
          <ElementContent element={element} />
        </div>
      ))}
    </div>
  );
}
