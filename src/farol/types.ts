export type MultiplaQuestion = {
  kind: "multipla";
  prompt: string;
  options: string[];
  /** índice da opção correta em `options` */
  answer: number;
  explanation: string;
};

export type CenarioQuestion = {
  kind: "cenario";
  /** fala do cliente */
  customer: string;
  /** contexto opcional da situação */
  context?: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type OrdenarQuestion = {
  kind: "ordenar";
  prompt: string;
  /** passos na ordem CORRETA (serão embaralhados na tela) */
  steps: string[];
  explanation: string;
};

export type CompletarQuestion = {
  kind: "completar";
  prompt: string;
  /** frase com lacunas marcadas por "___" */
  sentence: string;
  /** palavras corretas, na ordem das lacunas */
  answer: string[];
  /** palavras distratoras (além das corretas) */
  distractors: string[];
  explanation: string;
};

export type VerdadeiroFalsoQuestion = {
  kind: "vf";
  statement: string;
  answer: boolean;
  explanation: string;
};

export type Question =
  | MultiplaQuestion
  | CenarioQuestion
  | OrdenarQuestion
  | CompletarQuestion
  | VerdadeiroFalsoQuestion;

export type LessonKind = "licao" | "desafio";

export type Lesson = {
  id: string;
  title: string;
  /** dica curta do Faroldo, mostrada antes de praticar (ensina a ideia da lição) */
  tip?: string;
  kind: LessonKind;
  questions: Question[];
};

export type Unit = {
  id: string;
  number: number;
  title: string;
  description: string;
  /** assunto da unidade: técnica de venda ou conhecimento de produto */
  tema?: "vendas" | "produto";
  /** cor principal (hex) */
  color: string;
  /** cor da borda/sombra (hex) */
  shade: string;
  lessons: Lesson[];
};

/** Linha de treino: um conjunto de unidades com um tema (ex.: Venda Consultiva) */
export type Linha = {
  id: string;
  title: string;
  description: string;
  /** de onde vem o conteúdo (mostrado em "Sobre o conteúdo") */
  fontes: string[];
  units: Unit[];
};
