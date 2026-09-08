"use client";

import { createContext, useContext } from "react";
import type { PresentationDocument, Slide, SlideElement } from "@/lib/presentation-schema";
import type { LayoutId } from "@/lib/layout-types";
import type { PresentationQualityReport } from "@/lib/presentation-quality";

export interface EditorContextValue {
  document: PresentationDocument;
  selectedSlideId: string;
  selectedElementId?: string;
  selectedSlide: Slide;
  selectedElement?: SlideElement;
  canUndo: boolean;
  canRedo: boolean;
  qualityReport: PresentationQualityReport;
  commit: (updater: (current: PresentationDocument) => PresentationDocument) => void;
  setDocumentFromAi: (document: PresentationDocument, summary: string) => void;
  selectSlide: (slideId: string) => void;
  selectElement: (elementId?: string) => void;
  undo: () => void;
  redo: () => void;
  updateDocumentTitle: (title: string) => void;
  addSlide: () => void;
  duplicateCurrentSlide: () => void;
  deleteCurrentSlide: () => void;
  updateSlide: (patch: Partial<Pick<Slide, "title" | "background" | "transition" | "notes">>) => void;
  updateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  addElement: (element: SlideElement) => void;
  deleteSelectedElement: () => void;
  reorderSlides: (from: number, to: number) => void;
  applyLayout: (layout: LayoutId) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export const EditorProvider = EditorContext.Provider;

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used inside EditorProvider");
  return context;
}
