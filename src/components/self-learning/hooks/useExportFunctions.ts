"use client";

import { useCallback } from "react";
import { HighlightedRange } from "../types";

export function useExportFunctions(highlightedRanges: HighlightedRange[]) {
  // Smart batch creation function
  const createBatches = useCallback((batchSize: number = 25) => {
    const batches = [];

    for (let i = 0; i < highlightedRanges.length; i += batchSize) {
      const batch = highlightedRanges.slice(i, i + batchSize);
      batches.push({
        index: Math.floor(i / batchSize),
        items: batch,
        filename: `batch-${String(Math.floor(i / batchSize) + 1).padStart(2, '0')}-of-${String(Math.ceil(highlightedRanges.length / batchSize)).padStart(2, '0')}.json`,
        displayInfo: {
          batchNumber: Math.floor(i / batchSize) + 1,
          totalBatches: Math.ceil(highlightedRanges.length / batchSize),
          itemCount: batch.length
        }
      });
    }

    return batches;
  }, [highlightedRanges]);

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

  // Export as batches
  const exportAsBatches = useCallback((batchSize: number = 25, includeOriginal: boolean = true) => {
    const batches = createBatches(batchSize);

    const files = [];

    // Add main file if requested
    if (includeOriginal) {
      const mainData = {
        logTitle: "Self-Learning Vocabulary Data",
        sourceId: "Self-learning",
        totalItems: highlightedRanges.length,
        lexicalItems: highlightedRanges.map(item => ({
          id: item.id,
          targetLexeme: item.targetLexeme,
          sourceContext: item.sourceContext,
          phase1Inference: item.phase1Inference,
          phase2Annotation: {
            ...item.phase2Annotation,
            register: item.phase2Annotation.register || "",
            connotation: item.phase2Annotation.connotation ?? null,
            usageNotes: item.phase2Annotation.usageNotes ?? null,
            contrastingCollocates: item.phase2Annotation.contrastingCollocates || [],
            wordForms: {
              noun: item.phase2Annotation.wordForms?.noun || [],
              verb: item.phase2Annotation.wordForms?.verb || [],
              adjective: item.phase2Annotation.wordForms?.adjective || [],
              adverb: item.phase2Annotation.wordForms?.adverb || []
            }
          },
          phase3Production: item.phase3Production
        }))
      };

      files.push({
        filename: "master-vocabulary.json",
        content: JSON.stringify(mainData, null, 2),
        info: "Master file with all vocabulary items"
      });
    }

    // Add batch files
    batches.forEach(batch => {
      const batchData = {
        batchInfo: {
          filename: batch.filename,
          batchNumber: batch.displayInfo.batchNumber,
          totalBatches: batch.displayInfo.totalBatches,
          itemCount: batch.displayInfo.itemCount,
          createdFromMaster: includeOriginal ? "master-vocabulary.json" : "self-learning"
        },
        items: batch.items.map(item => ({
          id: item.id,
          targetLexeme: item.targetLexeme,
          sourceContext: item.sourceContext,
          phase1Inference: item.phase1Inference,
          phase2Annotation: {
            ...item.phase2Annotation,
            register: item.phase2Annotation.register || "",
            connotation: item.phase2Annotation.connotation ?? null,
            usageNotes: item.phase2Annotation.usageNotes ?? null,
            contrastingCollocates: item.phase2Annotation.contrastingCollocates || [],
            wordForms: {
              noun: item.phase2Annotation.wordForms?.noun || [],
              verb: item.phase2Annotation.wordForms?.verb || [],
              adjective: item.phase2Annotation.wordForms?.adjective || [],
              adverb: item.phase2Annotation.wordForms?.adverb || []
            }
          },
          phase3Production: item.phase3Production
        }))
      };

      files.push({
        filename: batch.filename,
        content: JSON.stringify(batchData, null, 2),
        info: `Batch ${batch.displayInfo.batchNumber} of ${batch.displayInfo.totalBatches} (${batch.displayInfo.itemCount} items)`
      });
    });

    return {
      files,
      summary: {
        totalItems: highlightedRanges.length,
        batchSize,
        batchCount: batches.length,
        includeOriginal
      }
    };
  }, [highlightedRanges, createBatches]);

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
    exportAsBatches,
    createBatches,
    copyToClipboard,
    downloadFile
  };
}