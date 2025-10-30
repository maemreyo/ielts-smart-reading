"use client";

import { useCallback } from "react";
import { HighlightedRange } from "../types";

export function useExportFunctions(highlightedRanges: HighlightedRange[]) {
  // Export functions for the specification requirements
  const exportAsText = useCallback(() => {
    const text = highlightedRanges.map(item => item.targetLexeme).join('\n');
    return text;
  }, [highlightedRanges]);

  const exportAsCSV = useCallback(() => {
    const headers = ['targetLexeme', 'sourceContext'];
    const rows = highlightedRanges.map(item => [
      `"${item.targetLexeme}"`,
      `"${item.sourceContext}"`
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }, [highlightedRanges]);

  const exportAsJSON = useCallback(() => {
    console.log('📤 Exporting highlights as JSON:', highlightedRanges);

    const exportData = highlightedRanges.map(item => {
      const exportItem = {
        id: item.id,
        targetLexeme: item.targetLexeme,
        sourceContext: item.sourceContext,
        phase1Inference: item.phase1Inference,
        phase2Annotation: {
          ...item.phase2Annotation,
          // Ensure all new fields are present with proper defaults
          register: item.phase2Annotation.register || "",
          connotation: item.phase2Annotation.connotation ?? null,
          usageNotes: item.phase2Annotation.usageNotes ?? null,
          contrastingCollocates: item.phase2Annotation.contrastingCollocates || [],
          // Ensure wordForms has the proper structure
          wordForms: {
            noun: item.phase2Annotation.wordForms?.noun || [],
            verb: item.phase2Annotation.wordForms?.verb || [],
            adjective: item.phase2Annotation.wordForms?.adjective || [],
            adverb: item.phase2Annotation.wordForms?.adverb || []
          }
        },
        phase3Production: item.phase3Production
      };
      console.log('📦 Export item:', exportItem);
      return exportItem;
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    console.log('📄 Final JSON string:', jsonString);

    return jsonString;
  }, [highlightedRanges]);

  const copyToClipboard = useCallback((format: 'simple' | 'json') => {
    if (format === 'simple') {
      const text = highlightedRanges.map(item => item.targetLexeme).join(', ');
      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(exportAsJSON());
    }
  }, [highlightedRanges, exportAsJSON]);

  const downloadFile = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    exportAsText,
    exportAsCSV,
    exportAsJSON,
    copyToClipboard,
    downloadFile
  };
}