import React from 'react';
import {
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Printer,
  RotateCcw,
  ArrowRight,
  User,
  Check
} from 'lucide-react';
import { ExamSubmissionResult } from '../types/exam';

interface ExamResultsViewProps {
  submission: ExamSubmissionResult;
  isOnline: boolean;
  onRetakeExam: () => void;
  onReturnHome: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export const ExamResultsView: React.FC<ExamResultsViewProps> = ({
  submission,
  onRetakeExam,
  onReturnHome,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  const correctQuestions = submission.questionResults.filter((q) => q.isCorrect).length;
  const totalQuestions = submission.questionResults.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white text-slate-900">
      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="hidden print:block p-6 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-extrabold">Bahir Dar Academy Official Score Card</h1>
              <p className="text-sm text-slate-600">ባህር ዳር አካዳሚ • bahirdaracademy.github.io</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div>Submission ID: {submission.submissionId}</div>
            <div>Date: {new Date(submission.submittedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* TOP ACTION BAR (No Print) */}
      <div className="no-print flex items-center justify-between gap-3">
        <button
          onClick={onReturnHome}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>Back to Subjects</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Score Sheet</span>
          </button>

          <button
            onClick={onRetakeExam}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>
        </div>
      </div>

      {/* RESULT HERO CARD WITH LOGO & PASS/FAIL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${
            submission.isPassed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    submission.isPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border border-rose-300'
                  }`}
                >
                  {submission.isPassed ? 'PASSED ✓' : 'NEEDS PRACTICE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Pass Mark: {submission.passingScore}%
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5">
                {submission.examTitle}
              </h1>

              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {submission.candidate.fullName}
                </span>
                <span>•</span>
                <span>ID: {submission.candidate.candidateId}</span>
              </p>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-7 py-5 text-center flex-shrink-0 shadow-xs">
            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900">
              {submission.scorePercentage}%
            </div>
            <div className="text-xs font-bold text-slate-600 mt-1">
              {submission.totalScore} / {submission.maxScore} Points
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ({correctQuestions} of {totalQuestions} Correct)
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px] font-medium">Time Taken</span>
            <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>{formatDuration(submission.durationUsedSeconds)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px] font-medium">Accuracy</span>
            <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{correctQuestions} / {totalQuestions} Questions</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-slate-500 block text-[11px] font-medium">Completed On</span>
            <div className="font-bold text-slate-800 mt-0.5">
              {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION REVIEW SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Check className="w-5 h-5 text-red-600" />
            Review Your Answers &amp; Explanations
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {totalQuestions} Questions
          </span>
        </div>

        <div className="space-y-4">
          {submission.questionResults.map((q, index) => {
            const chosenOptionText = q.options?.find((o) => o.optionId === q.candidateAnswer)?.text || q.candidateAnswer || 'Not answered';
            const correctOptionText = q.options?.find((o) => o.optionId === q.correctAnswer)?.text || String(q.correctAnswer);

            return (
              <div
                key={q.questionId}
                className={`p-5 rounded-xl border text-sm transition ${
                  q.isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {q.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Question {index + 1}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            q.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {q.isCorrect ? 'Correct (+10 pts)' : 'Incorrect (0 pts)'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm sm:text-base">
                        {q.prompt}
                      </p>
                    </div>

                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500 font-bold block mb-1">Your Answer:</span>
                        <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {String(chosenOptionText)}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="text-emerald-700 font-bold block mb-1">Correct Answer:</span>
                        <span className="font-semibold text-emerald-800">
                          {String(correctOptionText)}
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-bold">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onReturnHome}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Take Another Subject
          </button>

          <button
            onClick={onRetakeExam}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake This Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
