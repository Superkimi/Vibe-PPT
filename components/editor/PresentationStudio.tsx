"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { MagicWand, SlidersHorizontal } from "@phosphor-icons/react";
import { createStarterDocument } from "@/lib/starter-document";
import { createTemplateDocument, type TemplateId } from "@/lib/template-library";
import { duplicateSlide, normalizeDocument } from "@/lib/document-operations";
import { loadPersistedDocumentCandidates, savePersistedDocument } from "@/lib/document-persistence";
import { slideElementSchema, type PresentationDocument, type Slide, type SlideElement } from "@/lib/presentation-schema";
import { applyLayoutToSlide } from "@/lib/layout-templates";
import type { LayoutId } from "@/lib/layout-types";
import {
  inspectDocument,
  mergeQualityReports,
  scanRenderedSlides,
} from "@/lib/presentation-quality";
import { AiPanel, type ModelConfig } from "./AiPanel";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { EditorProvider, type EditorContextValue } from "./EditorContext";
import { InspectorPanel } from "./InspectorPanel";
import { DEFAULT_MODEL_CONFIG, ModelSettings } from "./ModelSettings";
import { PresentOverlay } from "./PresentOverlay";
import { QualityStatus } from "./QualityStatus";
import { SlideRail } from "./SlideRail";
import { TopToolbar } from "./TopToolbar";
import { TemplatePicker } from "./TemplatePicker";
import { EditorI18nProvider, useEditorI18n } from "./EditorI18n";
import type { EditorLocale } from "@/lib/editor-i18n";
import { BASE_PATH } from "@/lib/base-path";
import { downloadJson } from "@/lib/download";
import { APP_VERSION } from "@/lib/version";

const MODEL_STORAGE_KEY = "vibe-ppt-model-config";
const LOCALE_STORAGE_KEY = "vibe-ppt-locale";
const INITIAL_DOCUMENT = createStarterDocument();

export function PresentationStudio() {
  const [locale, setLocale] = useState<EditorLocale>("zh");

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    // Loading the persisted language is the external-system synchronization this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedLocale === "en" || savedLocale === "zh") setLocale(savedLocale);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  }, [locale]);

  return (
    <EditorI18nProvider locale={locale} setLocale={setLocale}>
      <StudioWorkspace />
    </EditorI18nProvider>
  );
}

function StudioWorkspace() {
  const { locale, t } = useEditorI18n();
  const [document, setDocument] = useState<PresentationDocument>(INITIAL_DOCUMENT);
  const [selectedSlideId, setSelectedSlideId] = useState(INITIAL_DOCUMENT.slides[0].id);
  const [selectedElementId, setSelectedElementId] = useState<string>();
  const [activePanel, setActivePanel] = useState<"design" | "ai">("ai");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [documentRevision, setDocumentRevision] = useState(0);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [renderedIssues, setRenderedIssues] = useState<ReturnType<typeof scanRenderedSlides>>([]);
  const [saveState, setSaveState] = useState(t("saved"));
  const [hydrated, setHydrated] = useState(false);
  const pastRef = useRef<PresentationDocument[]>([]);
  const futureRef = useRef<PresentationDocument[]>([]);
  const hydratedRef = useRef(false);
  const hasSavedDocumentRef = useRef(false);
  const starterLocaleRef = useRef<EditorLocale>("zh");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const savedCandidates = await loadPersistedDocumentCandidates();
        if (!cancelled) {
          for (const saved of savedCandidates) {
            try {
              const next = normalizeDocument(saved);
              hasSavedDocumentRef.current = true;
              setDocument(next);
              setSelectedSlideId(next.slides[0].id);
              break;
            } catch {
              // Try the backup copy before falling back to the starter document.
            }
          }
        }
      } catch {
        // A storage failure should not remove the user's last recoverable copy.
      }
      try {
        const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        if (savedModel && !cancelled) {
          const parsed = JSON.parse(savedModel) as Partial<ModelConfig>;
          const sanitizedModel = {
            baseUrl: parsed.baseUrl || DEFAULT_MODEL_CONFIG.baseUrl,
            model: parsed.model || "",
            temperature: typeof parsed.temperature === "number" ? parsed.temperature : DEFAULT_MODEL_CONFIG.temperature,
          };
          setModelConfig({
            ...DEFAULT_MODEL_CONFIG,
            ...sanitizedModel,
            apiKey: "",
          });
          if (Object.prototype.hasOwnProperty.call(parsed, "apiKey")) {
            localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(sanitizedModel));
          }
        }
      } catch {
        // Model settings are optional and can be re-entered from the settings dialog.
      } finally {
        if (!cancelled) {
          if (!hasSavedDocumentRef.current) setTemplatePickerOpen(true);
          hydratedRef.current = true;
          setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || hasSavedDocumentRef.current) return;
    if (document.id !== INITIAL_DOCUMENT.id || document.updatedAt !== INITIAL_DOCUMENT.updatedAt || starterLocaleRef.current === locale) return;
    starterLocaleRef.current = locale;
    const localizedStarter = createStarterDocument(locale);
    setDocument(localizedStarter);
    setSelectedSlideId(localizedStarter.slides[0].id);
  }, [document, locale]);

  useEffect(() => {
    if (!hydratedRef.current || !hydrated) return;
    setSaveState(t("saving"));
    const timer = window.setTimeout(() => {
      void savePersistedDocument(document)
        .then(() => setSaveState(t("saved")))
        .catch(() => setSaveState(t("saveFailed")));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [document, hydrated, t]);

  const commit = useCallback((updater: (current: PresentationDocument) => PresentationDocument) => {
    setDocument((current) => {
      const next = updater(structuredClone(current));
      if (JSON.stringify(next) === JSON.stringify(current)) return current;
      pastRef.current.push(current);
      if (pastRef.current.length > 100) pastRef.current.shift();
      futureRef.current = [];
      setHistoryState({ canUndo: true, canRedo: false });
      setDocumentRevision((revision) => revision + 1);
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);

  const undo = useCallback(() => {
    setDocument((current) => {
      const previous = pastRef.current.pop();
      if (!previous) return current;
      futureRef.current.push(current);
      setHistoryState({ canUndo: pastRef.current.length > 0, canRedo: true });
      setDocumentRevision((revision) => revision + 1);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setDocument((current) => {
      const next = futureRef.current.pop();
      if (!next) return current;
      pastRef.current.push(current);
      setHistoryState({ canUndo: true, canRedo: futureRef.current.length > 0 });
      setDocumentRevision((revision) => revision + 1);
      return next;
    });
  }, []);

  const updateDocumentTitle = useCallback((title: string) => {
    setDocument((current) => ({
      ...current,
      title,
      updatedAt: new Date().toISOString(),
    }));
    setDocumentRevision((revision) => revision + 1);
  }, []);

  const selectedSlide = document.slides.find((slide) => slide.id === selectedSlideId) || document.slides[0];
  const selectedElement = selectedSlide.elements.find((element) => element.id === selectedElementId);

  // Selection reconciliation intentionally synchronizes state after document mutations.
  useEffect(() => {
    if (!document.slides.some((slide) => slide.id === selectedSlideId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSlideId(document.slides[0].id);
      setSelectedElementId(undefined);
      return;
    }
    if (selectedElementId && !selectedSlide.elements.some((element) => element.id === selectedElementId)) {
      setSelectedElementId(undefined);
    }
  }, [document, selectedElementId, selectedSlide.elements, selectedSlideId]);
  const qualityReport = useMemo(
    () => mergeQualityReports(inspectDocument(document, locale), renderedIssues),
    [document, locale, renderedIssues],
  );

  useEffect(() => {
    let timer: number | undefined;
    const imageHandlers: Array<[HTMLImageElement, () => void, () => void]> = [];
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        setRenderedIssues(scanRenderedSlides(undefined, locale));
        for (const image of Array.from(window.document.querySelectorAll<HTMLImageElement>(".slide-renderer img.slide-image"))) {
          const refresh = () => setRenderedIssues(scanRenderedSlides(undefined, locale));
          image.addEventListener("load", refresh);
          image.addEventListener("error", refresh);
          imageHandlers.push([image, refresh, refresh]);
        }
      }, 50);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
      for (const [image, onLoad, onError] of imageHandlers) {
        image.removeEventListener("load", onLoad);
        image.removeEventListener("error", onError);
      }
    };
  }, [document, locale, selectedSlideId]);

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
                  element.id === elementId
                    ? element.locked && !Object.prototype.hasOwnProperty.call(patch, "locked")
                      ? element
                      : slideElementSchema.safeParse({ ...element, ...patch }).success
                        ? (slideElementSchema.parse({ ...element, ...patch }) as SlideElement)
                        : element
                    : element,
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
      title: t("pageTitle", { count: document.slides.length + 1 }),
      layout: "bullets",
      background: document.theme.background,
      transition: "fade",
      notes: "",
      elements: [
        {
          id: nanoid(),
          type: "text",
          name: t("text"),
          x: 92,
          y: 86,
          w: 900,
          h: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
          text: t("slideHeadline"),
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
  }, [commit, document.slides.length, document.theme, selectedSlideId, t]);

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
    if (selectedElement?.locked) return;
    commit((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.id === selectedSlideId
          ? { ...slide, elements: slide.elements.filter((element) => element.id !== selectedElementId) }
          : slide,
      ),
    }));
    setSelectedElementId(undefined);
  }, [commit, selectedElement, selectedElementId, selectedSlideId]);

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

  const applyLayout = useCallback(
    (layout: LayoutId) =>
      commit((current) => ({
        ...current,
        slides: current.slides.map((slide) =>
          slide.id === selectedSlideId ? applyLayoutToSlide(slide, layout, current.size) : slide,
        ),
      })),
    [commit, selectedSlideId],
  );

  const applyTemplate = useCallback(
    (templateId: TemplateId) => {
      const next = normalizeDocument(createTemplateDocument(templateId, locale));
      commit(() => next);
      setSelectedSlideId(next.slides[0].id);
      setSelectedElementId(undefined);
      setTemplatePickerOpen(false);
      setActivePanel("ai");
    },
    [commit, locale],
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
      documentRevision,
      canUndo: historyState.canUndo,
      canRedo: historyState.canRedo,
      qualityReport,
      commit,
      setDocumentFromAi: (next, _summary, baseRevision) => {
        if (baseRevision !== undefined && baseRevision !== documentRevision) return false;
        const normalized = normalizeDocument(next);
        commit(() => normalized);
        setSelectedSlideId(
          normalized.slides.some((slide) => slide.id === selectedSlideId)
            ? selectedSlideId
            : normalized.slides[0].id,
        );
        setSelectedElementId(undefined);
        return true;
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
      applyLayout,
    }),
    [
      addElement,
      addSlide,
      commit,
      deleteCurrentSlide,
      deleteSelectedElement,
      document,
      documentRevision,
      duplicateCurrentSlide,
      historyState,
      qualityReport,
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
      applyLayout,
    ],
  );

  if (!hydrated) {
    return <div className="studio-loading" role="status">{t("loadingDocument")}</div>;
  }

  return (
    <EditorProvider value={context}>
      <div className="studio-shell" data-app-version={APP_VERSION}>
        <TopToolbar onPresent={() => setPresenting(true)} onOpenTemplates={() => setTemplatePickerOpen(true)} />
        <div className="studio-body">
          <SlideRail />
          <CanvasWorkspace />
          <aside className="right-panel">
            <div className="panel-tabs">
              <button type="button" className={activePanel === "design" ? "is-active" : ""} onClick={() => setActivePanel("design")}>
                <SlidersHorizontal size={16} /> {t("design")}
              </button>
              <button type="button" className={activePanel === "ai" ? "is-active" : ""} onClick={() => setActivePanel("ai")}>
                <MagicWand size={16} /> {t("ai")}
              </button>
            </div>
            <div className={`panel-view ${activePanel === "design" ? "" : "is-hidden"}`} aria-hidden={activePanel !== "design"}>
              <InspectorPanel />
            </div>
            <div className={`panel-view ${activePanel === "ai" ? "" : "is-hidden"}`} aria-hidden={activePanel !== "ai"}>
              <AiPanel config={modelConfig} onOpenSettings={() => setSettingsOpen(true)} />
            </div>
          </aside>
        </div>
        <div className="autosave-state">
          {saveState}
          {saveState === t("saveFailed") && (
            <button type="button" onClick={() => downloadJson(`${document.title}.vibe.json`, document)}>
              {t("downloadBackup")}
            </button>
          )}
        </div>
        <QualityStatus />
      </div>
      {settingsOpen && (
        <ModelSettings
          open
          config={modelConfig}
          onClose={() => setSettingsOpen(false)}
          onSave={(config) => {
            setModelConfig(config);
            localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify({
              baseUrl: config.baseUrl,
              model: config.model,
              temperature: config.temperature,
            }));
          }}
          onTestConnection={async (config) => {
            try {
              const hostname = new URL(config.baseUrl).hostname.toLowerCase();
              const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
              if (!config.apiKey && !local) return t("apiKeyRequired");
            } catch {
              return t("connectionFailed");
            }
            try {
              const response = await fetch(`${BASE_PATH}/api/ai/test`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config }),
              });
              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                return payload.error || t("connectionFailed");
              }
              return undefined;
            } catch {
              return t("connectionFailed");
            }
          }}
        />
      )}
      <TemplatePicker
        open={templatePickerOpen}
        locale={locale}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={applyTemplate}
      />
      {presenting && (
        <PresentOverlay
          document={document}
            initialIndex={Math.max(0, document.slides.findIndex((slide) => slide.id === selectedSlideId))}
          onClose={() => setPresenting(false)}
        />
      )}
    </EditorProvider>
  );
}
