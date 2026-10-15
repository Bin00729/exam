import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  User,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  ActiveExamSession,
  CandidateInfo,
  CandidateResponseMap,
  ExamPackage,
  Question,
  SecurityIncident
} from '../types/exam';
import { saveActiveSessionToDB } from '../services/db';

interface ExamViewProps {
  exam: ExamPackage;
  candidate: CandidateInfo;
  initialSession?: ActiveExamSession | null;
  isOnline: boolean;
  onSubmitExam: (finalResponses: CandidateResponseMap, incidents: SecurityIncident[], strikes: number) => void;
  onExitWithoutSubmit?: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  exam,
  candidate,
  initialSession,
  isOnline,
  onSubmitExam,
  onExitWithoutSubmit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<CandidateResponseMap>(
    initialSession?.responses || {}
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Timer
  const totalSeconds = initialSession?.remainingSeconds !== undefined
    ? initialSession.remainingSeconds
    : exam.durationMinutes * 60;

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const responsesRef = useRef(responses);
  responsesRef.current = responses;
  const remainingSecondsRef = useRef(remainingSeconds);
  remainingSecondsRef.current = remainingSeconds;

  // Gentle background auto-save to IndexedDB (zero complexity for the user)
  const persistSession = useCallback(async () => {
    try {
      const sessionData: ActiveExamSession = {
        examId: exam.examId,
        candidate,
        startedAt: initialSession?.startedAt || Date.now(),
        expiresAt: Date.now() + remainingSecondsRef.current * 1000,
        remainingSeconds: remainingSecondsRef.current,
        responses: responsesRef.current,
        incidents: [],
        strikes: 0,
        isLocked: false,
        isSubmitted: false
      };
      await saveActiveSessionToDB(sessionData);
    } catch (e) {
      // quiet fallback
    }
  }, [exam.examId, candidate, initialSession?.startedAt]);

  // Periodic autosave every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      persistSession();
    }, 5000);
    return () => clearInterval(timer);
  }, [persistSession]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time is up
          onSubmitExam(responsesRef.current, [], 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmitExam]);

  const currentQuestion: Question = exam.questions[currentQuestionIndex];
  const currentAnswer = responses[currentQuestion?.questionId]?.answer;

  const handleSelectOption = (optionId: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.questionId]: {
        answer: optionId,
        isFlagged: false,
        lastUpdated: Date.now()
      }
    }));
  };

  const handleClearAnswer = () => {
    setResponses((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.questionId];
      return copy;
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalQuestions = exam.questions.length;
  const answeredCount = Object.values(responses).filter((r) => String(r.answer || '').trim() !== '').length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* CLEAN HEADER BAR WITH PROMINENT LOGO */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Subject */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Bahir Dar Academy</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono">bahirdaracademy.github.io</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {exam.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.fullName}
                </span>
                <span>•</span>
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Timer & Finish Button */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-bold ${
                remainingSeconds <= 180
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
              title="Time Remaining"
            >
              <Clock className="w-4 h-4 text-red-600" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish Exam</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="max-w-6xl mx-auto mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* MAIN EXAM BODY */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        {/* CENTER: QUESTION CONTAINER */}
        <main className="flex-1 space-y-6">
          {currentQuestion && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Index & Points */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-xs border border-red-200">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                  {currentQuestion.points} Points
                </span>
              </div>

              {/* Question Prompt */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.prompt}
                </h2>
                <p className="text-xs text-slate-500">
                  Select the best answer from the options below:
                </p>
              </div>

              {/* Options Cards */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = currentAnswer === option.optionId;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <div
                      key={option.optionId}
                      onClick={() => handleSelectOption(option.optionId)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-sm cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-red-50/70 border-red-500 text-slate-900 ring-2 ring-red-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="flex-1 font-medium text-sm leading-snug">
                        {option.text}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  onClick={handleClearAnswer}
                  disabled={!currentAnswer}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Selection</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <span>Submit Exam</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: CLEAN QUESTION PALETTE */}
        <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Questions Overview
            </h3>
            <span className="text-xs font-bold text-red-600 font-mono">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          {/* Numbered Grid */}
          <div className="grid grid-cols-5 gap-2">
            {exam.questions.map((q, qIndex) => {
              const resp = responses[q.questionId];
              const isAnswered = resp && String(resp.answer || '').trim() !== '';
              const isCurrent = qIndex === currentQuestionIndex;

              return (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentQuestionIndex(qIndex)}
                  className={`h-9 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center cursor-pointer ${
                    isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  } ${isCurrent ? 'ring-2 ring-red-600 ring-offset-1 font-black' : ''}`}
                >
                  {qIndex + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
              <span>Unanswered ({unansweredCount})</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Submit Answers
            </button>
          </div>
        </aside>
      </div>

      {/* CONFIRMATION SUBMISSION MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-100">
              <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Ready to Submit?
                </h3>
                <p className="text-xs text-slate-500">
                  You have completed {answeredCount} of {totalQuestions} questions.
                </p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-4 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  You have <strong>{unansweredCount} unanswered question(s)</strong>. Unanswered questions will receive 0 points.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Keep Answering
              </button>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  onSubmitExam(responsesRef.current, [], 0);
                }}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-xs text-white shadow-sm transition cursor-pointer"
              >
                Yes, Submit My Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
