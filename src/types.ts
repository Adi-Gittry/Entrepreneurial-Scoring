export interface Dimension {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name
}

export interface Statement {
  id: string;
  dimensionId: string;
  text: string;
}

export interface AssessmentResponse {
  [statementId: string]: number; // 1 to 5 Likert score
}

export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number; // 0 - 100
  actualSum: number;
  maxPossibleSum: number;
}

export interface ImprovementMilestone {
  day30: string[];
  day60: string[];
  day90: string[];
}

export interface AssessmentResult {
  id: string;
  userName: string;
  organization: string;
  date: string;
  responses: AssessmentResponse;
  dimensionScores: DimensionScore[];
  overallScore: number; // 0 - 100
  category: string;
  categoryDescription: string;
  strengths: { dimensionId: string; name: string; score: number }[];
  developments: { dimensionId: string; name: string; score: number }[];
  aiInterpretation: string;
  careerRecommendations: string[];
  improvementPlan: ImprovementMilestone;
}

export interface SavedAssessment {
  id: string;
  userName: string;
  organization: string;
  date: string;
  overallScore: number;
  category: string;
  result: AssessmentResult;
}
