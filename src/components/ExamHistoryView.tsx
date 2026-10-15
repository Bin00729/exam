import React, { useState } from 'react';
import {
  History,
  Award,
  Trash2,
  Search,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { ExamSubmissionResult } from '../types/exam';

interface ExamHistoryViewProps {
  submissions: ExamSubmissionResult[];
  onSelectSubmission: (submission: ExamSubmissionResult) => void;
  onClearHistory?: () => void;
  onManualSync?: () => void;
  isOnline: boolean;
  isSyncing?: boolean;
}

export const ExamHistoryView: React.FC<ExamHistoryViewProps> = ({
  submissions,
  onSelectSubmission,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.examTitle.toLowerCase().includes(term) ||
      s.candidate.fullName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 bg-white text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <History className="w-6 h-6 text-red-600" />
            My Past Exam Results
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your scores and answer sheets across English, Maths, Biology, and Physics
          </p>
        </div>

        {submissions.length > 0 && onClearHistory && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {submissions.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search completed exams by subject or candidate name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
          />
        </div>
      )}

      {/* Empty State or List */}
      {submissions.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Past Exams Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Choose a subject from the Exams tab (English, Mathematics, Biology, or Physics) to take your first test. Your scores will be preserved here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          No records match &quot;{searchTerm}&quot;
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filtered.map((item) => (
            <div
              key={item.submissionId}
              onClick={() => onSelectSubmission(item)}
              className="p-5 rounded-xl bg-white border border-slate-200 hover:border-red-400 shadow-xs hover:shadow-sm transition cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl flex-shrink-0 ${
                    item.isPassed
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isPassed ? 'PASS' : 'FAIL'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition">
                      {item.examTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Candidate: <strong>{item.candidate.fullName}</strong></span>
                    <span>•</span>
                    <span>{new Date(item.submittedAt).toLocaleDateString()} at {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Score & View Button */}
              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-slate-900">
                    {item.scorePercentage}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.totalScore} / {item.maxScore} pts
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-red-600 text-slate-600 group-hover:text-white transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
