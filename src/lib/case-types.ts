export type SourceRef = {
  url: string;
  title?: string;
  accessed?: string;
};

export type WorkedCase = {
  id: string;
  partner: string;
  partnerType: "vc_portfolio" | "accelerator_community";
  country: string;
  oneLiner: string;
  /** 10-point spine */
  publicThesis: string;
  operatingModel: string;
  relevantSegment: string;
  decisionMakerVsOperator: string;
  claudeSpecificNeed: string;
  proposedProgramme: string;
  evidenceSupporting: string[];
  counterarguments: string[];
  successMetric: string;
  killCriteria: string;
  unknownsBeforeSpeaking: string[];
  sources: SourceRef[];
};

export type WorkedCaseBundle = {
  meta: {
    version: string;
    title: string;
    generatedAt: string;
    disclaimer: string;
  };
  cases: WorkedCase[];
};
