"use client";

import React, { useMemo, useState } from "react";

export type CodePanelTab = "english" | "json" | "raw";

export interface CodePanelProps {
  title?: string;
  english?: React.ReactNode;
  json?: unknown;
  raw?: string;
  defaultTab?: CodePanelTab;
  className?: string;
}

const tabLabel: Record<CodePanelTab, string> = {
  english: "English",
  json: "JSON",
  raw: "Raw"
};

const CodePanel: React.FC<CodePanelProps> = ({
  title,
  english,
  json,
  raw,
  defaultTab = "english",
  className = ""
}) => {
  const [tab, setTab] = useState<CodePanelTab>(defaultTab);
  const jsonString = useMemo(() => {
    if (json === undefined) return "";
    try {
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return "(unable to serialize json)";
    }
  }, [json]);

  const rawString = raw ?? jsonString;

  const copy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore copy failures
    }
  };

  const renderBody = () => {
    if (tab === "english") return <div className="leading-relaxed text-sm text-muted">{english ?? "No summary yet."}</div>;
    if (tab === "json")
      return (
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-black/30 p-4 rounded-md border border-border">
          {jsonString || "{}"}
        </pre>
      );
    return (
      <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-black/30 p-4 rounded-md border border-border">
        {rawString || ""}
      </pre>
    );
  };

  return (
    <div className={`wrbt-card p-4 ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-sm font-semibold text-text">{title ?? "Detail"}</div>
        <div className="flex items-center gap-2">
          {(jsonString || rawString) && (
            <button
              type="button"
              onClick={() => copy(tab === "raw" ? rawString : jsonString)}
              className="text-xs px-3 py-1 rounded-full border border-border text-muted hover:text-text hover:border-accent transition"
            >
              Copy
            </button>
          )}
          <div className="flex rounded-full border border-border overflow-hidden">
            {(Object.keys(tabLabel) as CodePanelTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-3 py-1 text-xs ${
                  tab === key ? "bg-accent text-black" : "text-muted hover:text-text"
                }`}
              >
                {tabLabel[key]}
              </button>
            ))}
          </div>
        </div>
      </div>
      {renderBody()}
    </div>
  );
};

export default CodePanel;
