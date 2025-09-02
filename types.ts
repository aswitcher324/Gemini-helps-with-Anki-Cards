export interface OptionAnalysis {
  option: string;
  verdict: '✅' | '❌';
  reason: string;
}

export interface KeyConcept {
  title: string;
  points: string[];
}

export interface AnalysisTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export type DepthLevel = 'simple' | 'standard' | 'deep';

export interface FlashcardData {
  questionStem: string;
  correctOption: string;
  definition: string;
  optionsAnalysis: OptionAnalysis[];
  analysisTables?: AnalysisTable[];
  keyConcepts?: KeyConcept[];
  crucialFact?: string;
  mnemonics?: string[];
  reference?: string;
  ankiNotes?: KeyConcept[];
}

export interface RelatedQuestion {
  question: string;
  answer: string;
}
