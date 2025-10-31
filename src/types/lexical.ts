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

// New object types for enhanced lexical structure
export interface CollocateObject {
  form: string;
  meaning: string;
}

export interface UsageNoteObject {
  noteEN: string;
  noteVI: string;
}

export interface ConnotationObject {
  noteEN?: string;
  noteVI?: string;
  connotationEN?: string;
  connotationVI?: string;
}

export interface Phase1Inference {
  contextualGuessVI?: string;
}

export interface Phase2Annotation {
  phonetic?: string;
  sentiment?: "positive" | "negative" | "neutral";
  definitionEN: string;
  translationVI: string;
  relatedCollocates?: CollocateObject[] | string[] | string; // Support both old and new formats
  wordForms?: WordForms;
  register?: "formal" | "informal" | "neutral" | "";
  connotation?: ConnotationObject[] | string; // Support both old string and new array formats
  usageNotes?: UsageNoteObject[] | string; // Support both old and new formats
  contrastingCollocates?: CollocateObject[] | string[]; // Support both old and new formats
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

// Type guard functions for new object structures
export function isCollocateArray(collocates: any): collocates is CollocateObject[] {
  return Array.isArray(collocates) && (collocates.length === 0 || (typeof collocates[0] === 'object' && 'form' in collocates[0]));
}

export function isUsageNoteArray(notes: any): notes is UsageNoteObject[] {
  return Array.isArray(notes) && (notes.length === 0 || (typeof notes[0] === 'object' && 'noteEN' in notes[0]));
}

export function isConnotationArray(connotations: any): connotations is ConnotationObject[] {
  return Array.isArray(connotations) && (connotations.length === 0 || (typeof connotations[0] === 'object' && ('noteEN' in connotations[0] || 'connotationEN' in connotations[0])));
}

// Migration function type
export type LexicalItemMigration = (legacyItem: LegacyLexicalItem) => LexicalItem;