"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { MagicWand, SlidersHorizontal } from "@phosphor-icons/react";
import { createStarterDocument } from "@/lib/starter-document";
import { duplicateSlide, normalizeDocument } from "@/lib/document-operations";
import type { PresentationDocument, Slide, SlideElement } from "@/lib/presentation-schema";
import { AiPanel, type ModelConfig } from "./AiPanel";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { EditorProvider, type EditorContextValue } from "./EditorContext";
import { InspectorPanel } from "./InspectorPanel";
import { DEFAULT_MODEL_CONFIG, ModelSettings } from "./ModelSettings";
import { PresentOverlay } from "./PresentOverlay";
import { SlideRail } from "./SlideRail";
import { TopToolbar } from "./TopToolbar";

const STORAGE_KEY = "vibe-ppt-document";
const MODEL_STORAGE_KEY = "vibe-ppt-model-config";
const INITIAL_DOCUMENT = createStarterDocument();

export function PresentationStudio() {
  const [document, setDocument] = useState<PresentationDocument>(INITIAL_DOCUMENT);
  const [selectedSlideId, setSelectedSlideId] = useState(INITIAL_DOCUMENT.slides[0].id);
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [activePanel, setActivePanel] = useState<"design" | "ai">("ai");
  const [presenting, setPresenting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [saveState, setSaveState] = useState("已保存");
  const pastRef = useRef<PresentationDocument[]>([]);
  const futureRef = useRef<PresentationDocument[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const next = normalizeDocument(JSON.parse(saved));
        // Loading persisted state is the external-system synchronization this effect owns.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDocument(next);
        setSelectedSlideId(next.slides[0].id);
      }
      const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      if (savedModel) setModelConfig({ ...DEFAULT_MODEL_CONFIG, ...JSON.parse(savedModel) });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    setSaveState("保存中");
    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
      setSaveState("已保存");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [document]);

  const commit = useCallback((updater: (current: PresentationDocument) => PresentationDocument) => {
    setDocument((current) => {
      const next = updater(structuredClone(current));
      if (next === current) return current;
      pastRef.current.push(current);
      if (pastRef.current.length > 100) pastRef.current.shift();
      futureRef.current = [];
      setHistoryState({ canUndo: true, canRedo: false });
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);

  const undo = useCallback(() => {
    setDocument((current) => {
      const previous = pastRef.current.pop();
      if (!previous) return current;
      futureRef.current.push(current);
      setHistoryState({ canUndo: pastRef.current.length > 0, canRedo: true });
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setDocument((current) => {
      const next = futureRef.current.pop();
      if (!next) return current;
      pastRef.current.push(current);
      setHistoryState({ canUndo: true, canRedo: futureRef.current.length > 0 });
      return next;
    });
  }, []);

  const updateDocumentTitle = useCallback((title: string) => {
    setDocument((current) => ({
      ...current,
      title,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const selectedSlide = document.slides.find((slide) => slide.id === selectedSlideId) || document.slides[0];
  const selectedElement = selectedSlide.elements.find((element) => element.id === selectedElementId);

  const updateSlide = useCallback(
    (patch: Partial<Pick<Slide, "title" | "background" | "transition" | "notes">>) =>
      commit((current) => ({
        ...current,
        slides: current.slides.map((slide) => (slide.id === selectedSlideId ? { ...slide, ...patch } : slide)),
      })),
    [commit, selectedSlideId],
  );

  const updateElement = useCallback(
    (elementId: string, patch: Partial<SlideElement>) =>
      commit((current) => ({
        ...current,
        slides: current.slides.map((slide) =>
          slide.id === selectedSlideId
            ? {
                ...slide,
                elements: slide.elements.map((element) =>
                  element.id === elementId ? ({ ...element, ...patch } as SlideElement) : element,
                ),
              }
            : slide,
        ),
      })),
    [commit, selectedSlideId],
  );

  const addElement = useCallback(
    (element: SlideElement) => {
      commit((current) => ({
        ...current,
        slides: current.slides.map((slide) =>
          slide.id === selectedSlideId ? { ...slide, elements: [...slide.elements, element] } : slide,
        ),
      }));
      setSelectedElementId(element.id);
    },
    [commit, selectedSlideId],
  );

  const addSlide = useCallback(() => {
    const slide: Slide = {
      id: nanoid(),
      title: `第 ${document.slides.length + 1} 页`,
      background: document.theme.background,
      transition: "fade",
      notes: "",
      elements: [
        {
          id: nanoid(),
          type: "text",
          name: "标题",
          x: 92,
          y: 86,
          w: 900,
          h: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
          text: "这一页的核心观点",
          fontFamily: document.theme.headingFamily,
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: -1.8,
          color: document.theme.text,
          align: "left",
          valign: "top",
        },
      ],
    };
    commit((current) => {
      const index = current.slides.findIndex((item) => item.id === selectedSlideId);
      const slides = [...current.slides];
      slides.splice(index + 1, 0, slide);
      return { ...current, slides };
    });
    setSelectedSlideId(slide.id);
    setSelectedElementId(undefined);
  }, [commit, document.slides.length, document.theme, selectedSlideId]);

  const duplicateCurrentSlide = useCallback(() => {
    const duplicate = duplicateSlide(selectedSlide);
    commit((current) => {
      const index = current.slides.findIndex((slide) => slide.id === selectedSlideId);
      const slides = [...current.slides];
      slides.splice(index + 1, 0, duplicate);
      return { ...current, slides };
    });
    setSelectedSlideId(duplicate.id);
    setSelectedElementId(undefined);
  }, [commit, selectedSlide, selectedSlideId]);

  const deleteCurrentSlide = useCallback(() => {
    if (document.slides.length === 1) return;
    const index = document.slides.findIndex((slide) => slide.id === selectedSlideId);
    const fallback = document.slides[Math.max(0, index - 1)]?.id || document.slides[0].id;
    commit((current) => ({ ...current, slides: current.slides.filter((slide) => slide.id !== selectedSlideId) }));
    setSelectedSlideId(fallback);
    setSelectedElementId(undefined);
  }, [commit, document.slides, selectedSlideId]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElementId) return;
    commit((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.id === selectedSlideId
          ? { ...slide, elements: slide.elements.filter((element) => element.id !== selectedElementId) }
          : slide,
      ),
    }));
    setSelectedElementId(undefined);
  }, [commit, selectedElementId, selectedSlideId]);

  const reorderSlides = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0) return;
      commit((current) => {
        const slides = [...current.slides];
        const [moved] = slides.splice(from, 1);
        slides.splice(to, 0, moved);
        return { ...current, slides };
      });
    },
    [commit],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (!typing && (event.key === "Backspace" || event.key === "Delete") && selectedElementId) {
        event.preventDefault();
        deleteSelectedElement();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelectedElement, redo, selectedElementId, undo]);

  const context = useMemo<EditorContextValue>(
    () => ({
      document,
      selectedSlideId,
      selectedElementId,
      selectedSlide,
      selectedElement,
      canUndo: historyState.canUndo,
      canRedo: historyState.canRedo,
      commit,
      setDocumentFromAi: (next) => {
        const normalized = normalizeDocument(next);
        commit(() => normalized);
        setSelectedSlideId(
          normalized.slides.some((slide) => slide.id === selectedSlideId)
            ? selectedSlideId
            : normalized.slides[0].id,
        );
        setSelectedElementId(undefined);
      },
      selectSlide: (slideId) => {
        setSelectedSlideId(slideId);
        setSelectedElementId(undefined);
      },
      selectElement: setSelectedElementId,
      undo,
      redo,
      updateDocumentTitle,
      addSlide,
      duplicateCurrentSlide,
      deleteCurrentSlide,
      updateSlide,
      updateElement,
      addElement,
      deleteSelectedElement,
      reorderSlides,
    }),
    [
      addElement,
      addSlide,
      commit,
      deleteCurrentSlide,
      deleteSelectedElement,
      document,
      duplicateCurrentSlide,
      historyState,
      redo,
      reorderSlides,
      selectedElement,
      selectedElementId,
      selectedSlide,
      selectedSlideId,
      undo,
      updateDocumentTitle,
      updateElement,
      updateSlide,
    ],
  );

  return (
    <EditorProvider value={context}>
      <div className="studio-shell">
        <TopToolbar onPresent={() => setPresenting(true)} />
        <div className="studio-body">
          <SlideRail />
          <CanvasWorkspace />
          <aside className="right-panel">
            <div className="panel-tabs">
              <button type="button" className={activePanel === "design" ? "is-active" : ""} onClick={() => setActivePanel("design")}>
                <SlidersHorizontal size={16} /> 设计
              </button>
              <button type="button" className={activePanel === "ai" ? "is-active" : ""} onClick={() => setActivePanel("ai")}>
                <MagicWand size={16} /> AI
              </button>
            </div>
            {activePanel === "design" ? (
              <InspectorPanel />
            ) : (
              <AiPanel config={modelConfig} onOpenSettings={() => setSettingsOpen(true)} />
            )}
          </aside>
        </div>
        <div className="autosave-state">{saveState}</div>
      </div>
      {settingsOpen && (
        <ModelSettings
          open
          config={modelConfig}
          onClose={() => setSettingsOpen(false)}
          onSave={(config) => {
            setModelConfig(config);
            localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(config));
          }}
        />
      )}
      {presenting && (
        <PresentOverlay
          document={document}
          initialIndex={document.slides.findIndex((slide) => slide.id === selectedSlideId)}
          onClose={() => setPresenting(false)}
        />
      )}
    </EditorProvider>
  );
}
