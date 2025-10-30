// Types for the self-learning functionality

export interface SelectedWord {
  word: string;
  element: HTMLElement;
  position: number;
  paragraphIndex: number;
  start?: number; // Character position in full text
  end?: number; // Character position in full text
}

export interface HighlightedRange {
  id: string;
  targetLexeme: string; // Required for export
  sourceContext: string; // Required for export - the sentence containing the highlighted item
  type: 'word' | 'collocation';
  displayText: string; // What shows in the Vocabulary Panel
  componentRanges: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  // Export specification fields (mostly empty for now)
  isNonContiguous: boolean;
  selectedWordPositions: Array<{
    position: number;
    paragraphIndex: number;
  }>;
  originalContext: string;
  phase1Inference: {
    contextualGuessVI: string;
  };
  phase2Annotation: {
    phonetic: string;
    sentiment: string;
    definitionEN: string;
    translationVI: string;
    relatedCollocates: string[] | string;
    wordForms: {
      noun?: Array<{ form: string; meaning: string }>;
      verb?: Array<{ form: string; meaning: string }>;
      adjective?: Array<{ form: string; meaning: string }>;
      adverb?: Array<{ form: string; meaning: string }>;
    };
    register: "formal" | "informal" | "neutral" | "";
    connotation: string | null;
    usageNotes: string | null;
    contrastingCollocates: string[];
  };
  phase3Production: {
    taskType: string;
    content: string;
  };
}

export interface SelfLearningViewProps {
  title?: string;
  paragraphs: string[];
  book: string;
  test: string;
  passage: string;
}