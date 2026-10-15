export type QuestionType = 'multiple_choice' | 'multi_select' | 'short_answer';

export interface QuestionOption {
  optionId: string;
  text: string;
}

export interface Question {
  questionId: string;
  categoryId: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options?: QuestionOption[];
  correctAnswer: string | string[]; // Single optionId for multiple_choice, array of optionIds for multi_select, string / keywords for short_answer
  explanation: string;
}

export interface ExamCategory {
  categoryId: string;
  name: string;
  weightPercentage: number;
}

export interface ExamPackage {
  examId: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  categories: ExamCategory[];
  questions: Question[];
}

export interface CandidateInfo {
  candidateId: string;
  fullName: string;
  email: string;
  organization?: string;
  photoUrl?: string; // Captured webcam selfie at check-in
}

export type CandidateAnswer = string | string[];

export interface CandidateResponseMap {
  [questionId: string]: {
    answer: CandidateAnswer;
    isFlagged: boolean;
    lastUpdated: number; // timestamp
  };
}

export type ProctoringViolationType =
  | 'fullscreen_exit'
  | 'tab_switch'
  | 'window_blur'
  | 'copy_paste_attempt'
  | 'devtools_opened'
  | 'face_lost'
  | 'multiple_faces';

export interface SecurityIncident {
  id: string;
  type: ProctoringViolationType;
  timestamp: number;
  durationAwaySeconds?: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActiveExamSession {
  examId: string;
  candidate: CandidateInfo;
  startedAt: number;
  expiresAt: number;
  remainingSeconds: number;
  responses: CandidateResponseMap;
  incidents: SecurityIncident[];
  strikes: number;
  isLocked: boolean;
  lockReason?: string;
  isSubmitted: boolean;
  submissionStatus?: 'pending_sync' | 'synced' | 'local_only';
}

export interface QuestionGradingResult {
  questionId: string;
  prompt: string;
  type: QuestionType;
  categoryId: string;
  maxPoints: number;
  awardedPoints: number;
  candidateAnswer: CandidateAnswer;
  correctAnswer: string | string[];
  isCorrect: boolean;
  isPartial?: boolean;
  explanation: string;
  options?: QuestionOption[];
}

export interface CategoryScoreSummary {
  categoryId: string;
  name: string;
  weightPercentage: number;
  earnedPoints: number;
  maxPoints: number;
  percentage: number;
}

export interface ExamSubmissionResult {
  submissionId: string;
  examId: string;
  examTitle: string;
  candidate: CandidateInfo;
  submittedAt: number;
  durationUsedSeconds: number;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  passingScore: number;
  isPassed: boolean;
  categoryScores: CategoryScoreSummary[];
  questionResults: QuestionGradingResult[];
  incidents: SecurityIncident[];
  strikes: number;
  trustScore: number; // 0 - 100% security trust rating based on incidents
  syncStatus: 'synced' | 'queued_offline';
  clientIp?: string;
}
