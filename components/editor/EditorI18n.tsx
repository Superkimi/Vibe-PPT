"use client";

import { createContext, useContext, useMemo } from "react";
import {
  translate,
  type EditorLocale,
  type EditorTranslate,
  type EditorTranslationKey,
} from "@/lib/editor-i18n";

interface EditorI18nValue {
  locale: EditorLocale;
  setLocale: (locale: EditorLocale) => void;
  t: EditorTranslate;
}

const EditorI18nContext = createContext<EditorI18nValue | null>(null);

export function EditorI18nProvider({
  locale,
  setLocale,
  children,
}: {
  locale: EditorLocale;
  setLocale: (locale: EditorLocale) => void;
  children: React.ReactNode;
}) {
  const value = useMemo<EditorI18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key: EditorTranslationKey, values?: Record<string, string | number>) => translate(locale, key, values),
    }),
    [locale, setLocale],
  );

  return <EditorI18nContext.Provider value={value}>{children}</EditorI18nContext.Provider>;
}

export function useEditorI18n() {
  const value = useContext(EditorI18nContext);
  if (!value) throw new Error("useEditorI18n must be used inside EditorI18nProvider");
  return value;
}
