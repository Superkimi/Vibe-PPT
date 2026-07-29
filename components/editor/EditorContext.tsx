"use client";

import { createContext, useContext } from "react";
import type { PresentationDocument, Slide, SlideElement } from "@/lib/presentation-schema";

export interface EditorContextValue {
  document: PresentationDocument;
  selectedSlideId: string;
  selectedElementId?: string;
  selectedSlide: Slide;
  selectedElement?: SlideElement;
  canUndo: boolean;
  canRedo: boolean;
  commit: (updater: (current: PresentationDocument) => PresentationDocument) => void;
  setDocumentFromAi: (document: PresentationDocument, summary: string) => void;
  selectSlide: (slideId: string) => void;
  selectElement: (elementId?: string) => void;
  undo: () => void;
  redo: () => void;
  addSlide: () => void;
  duplicateCurrentSlide: () => void;
  deleteCurrentSlide: () => void;
  updateSlide: (patch: Partial<Pick<Slide, "title" | "background" | "transition" | "notes">>) => void;
  updateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  addElement: (element: SlideElement) => void;
  deleteSelectedElement: () => void;
  reorderSlides: (from: number, to: number) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export const EditorProvider = EditorContext.Provider;

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used inside EditorProvider");
  return context;
}
