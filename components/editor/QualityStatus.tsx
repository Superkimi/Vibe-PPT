"use client";

import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { useEditor } from "./EditorContext";
import { useEditorI18n } from "./EditorI18n";

export function QualityStatus() {
  const { qualityReport } = useEditor();
  const { t } = useEditorI18n();
  const [expanded, setExpanded] = useState(false);
  const hasIssues = qualityReport.issues.length > 0;
  const Icon = qualityReport.errors > 0 ? XCircle : qualityReport.warnings > 0 ? Warning : CheckCircle;

  return (
    <div className={`quality-status ${hasIssues ? "has-issues" : "is-clean"}`}>
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <Icon size={14} weight="fill" />
        <span>{t("quality")}</span>
        {hasIssues ? (
          <small>{t("qualityIssues", { count: qualityReport.issues.length })}</small>
        ) : (
          <small>{t("qualityNoIssues")}</small>
        )}
      </button>
      {expanded && hasIssues && (
        <div className="quality-popover" role="status">
          <div className="quality-counts">
            {qualityReport.errors > 0 && <span>{t("qualityErrors", { count: qualityReport.errors })}</span>}
            {qualityReport.warnings > 0 && <span>{t("qualityWarnings", { count: qualityReport.warnings })}</span>}
          </div>
          <ul>
            {qualityReport.issues.slice(0, 8).map((item, index) => (
              <li key={`${item.slideId}-${item.elementId || "slide"}-${item.kind}-${index}`}>
                <b>{item.slideTitle || item.slideId}</b>
                <span>{item.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
