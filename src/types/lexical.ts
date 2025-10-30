export interface WordForm {
  form: string;
  meaning: string;
}

export interface WordForms {
  noun?: WordForm[];
  verb?: WordForm[];
  adjective?: WordForm[];
  adverb?: WordForm[];
}

export interface Phase1Inference {
  contextualGuessVI?: string;
}

export interface Phase2Annotation {
  phonetic?: string;
  sentiment?: "positive" | "negative" | "neutral";
  definitionEN: string;
  translationVI: string;
  relatedCollocates?: string[] | string;
  wordForms?: WordForms;
  register?: "formal" | "informal" | "neutral";
  connotation?: string;
  usageNotes?: string;
  contrastingCollocates?: string[];
}

export interface Phase3Production {
  taskType: "SENTENCE_CREATION" | "PARAPHRASE" | "TRANSLATE_VI_EN" | string;
  content: string;
}

export interface LexicalItem {
  id: string;
  targetLexeme: string;
  sourceContext: string;
  phase1Inference?: Phase1Inference;
  phase2Annotation: Phase2Annotation;
  phase3Production?: Phase3Production;
}

// Legacy interface for backward compatibility
export interface LegacyLexicalItem {
  id: number;
  targetLexeme: string;
  sourceContext: string;
  phase1Inference?: {
    contextualGuessVI?: string;
  };
  phase2Annotation: {
    phonetic?: string;
    sentiment?: "positive" | "negative" | "neutral";
    definitionEN: string;
    translationVI: string;
    relatedCollocates?: string[];
    wordForms?: any;
  };
  phase3Production?: {
    taskType: string;
    content: string;
  };
}

// Type guard functions
export function isLegacyLexicalItem(item: any): item is LegacyLexicalItem {
  return typeof item?.id === 'number';
}

export function isNewLexicalItem(item: any): item is LexicalItem {
  return typeof item?.id === 'string';
}

// Migration function type
export type LexicalItemMigration = (legacyItem: LegacyLexicalItem) => LexicalItem;