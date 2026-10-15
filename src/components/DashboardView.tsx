import React, { useState } from 'react';
import {
  Clock,
  Award,
  Play,
  BookOpen,
  Calculator,
  Dna,
  Atom,
  CheckCircle2,
  User,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ActiveExamSession, CandidateInfo, ExamPackage } from '../types/exam';

interface DashboardViewProps {
  exams: ExamPackage[];
  activeSession: ActiveExamSession | null;
  onResumeSession: () => void;
  onDiscardSession: () => void;
  onStartExamDirect: (exam: ExamPackage, candidate: CandidateInfo) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  exams,
  activeSession,
  onResumeSession,
  onDiscardSession,
  onStartExamDirect,
}) => {
  const [selectedExamForModal, setSelectedExamForModal] = useState<ExamPackage | null>(null);
  const [candidateName, setCandidateName] = useState('Student');

  const getSubjectIcon = (examId: string) => {
    if (examId.includes('english')) {
      return <BookOpen className="w-8 h-8 text-blue-600" />;
    }
    if (examId.includes('math')) {
      return <Calculator className="w-8 h-8 text-emerald-600" />;
    }
    if (examId.includes('bio')) {
      return <Dna className="w-8 h-8 text-rose-600" />;
    }
    if (examId.includes('physics')) {
      return <Atom className="w-8 h-8 text-purple-600" />;
    }
    return <BookOpen className="w-8 h-8 text-red-600" />;
  };

  const getSubjectColorStyles = (examId: string) => {
    if (examId.includes('english')) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        accent: 'text-blue-600',
      };
    }
    if (examId.includes('math')) {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        accent: 'text-emerald-600',
      };
    }
    if (examId.includes('bio')) {
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-700',
        button: 'bg-rose-600 hover:bg-rose-700 text-white',
        accent: 'text-rose-600',
      };
    }
    if (examId.includes('physics')) {
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        accent: 'text-purple-600',
      };
    }
    return {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-700',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      accent: 'text-red-600',
    };
  };

  const handleOpenStartModal = (exam: ExamPackage) => {
    setSelectedExamForModal(exam);
  };

  const handleConfirmStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForModal) return;

    const cand: CandidateInfo = {
      candidateId: `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: candidateName.trim() || 'Student',
      email: 'student@school.edu',
    };

    onStartExamDirect(selectedExamForModal, cand);
    setSelectedExamForModal(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10 bg-white">
      {/* ACTIVE SESSION RECOVERY CARD IF INTERRUPTED */}
      {activeSession && (
        <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Incomplete Exam Saved
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {exams.find((e) => e.examId === activeSession.examId)?.title || 'Exam in Progress'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Candidate: <strong>{activeSession.candidate.fullName}</strong> •{' '}
                {Math.ceil(activeSession.remainingSeconds / 60)} minutes left
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onDiscardSession}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition cursor-pointer"
            >
              Start Over
            </button>
            <button
              onClick={onResumeSession}
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* HERO BANNER WITH PROMINENT LOGO & WHITE BACKGROUND */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Simple, Fast & Easy Online Testing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Bahir Dar Academy Examination Portal
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to the official online examination platform for <strong className="text-slate-900">Bahir Dar Academy</strong>. Choose your subject to start: <strong className="text-slate-900">English</strong>, <strong className="text-slate-900">Mathematics</strong>, <strong className="text-slate-900">Biology</strong>, or <strong className="text-slate-900">Physics</strong>. Answer the questions and receive your score card instantly.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-1 justify-center md:justify-start">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Instant Score &amp; Results
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Works Offline
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              bahirdaracademy.github.io
            </span>
          </div>
        </div>

        {/* Large Prominent Logo Display */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <img
            src="/logo.svg"
            alt="Bahir Dar Academy Logo"
            className="h-28 sm:h-36 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
          <span className="mt-3 text-xs font-extrabold tracking-wider text-slate-900 uppercase">
            Bahir Dar Academy
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            bahirdaracademy.github.io
          </span>
        </div>
      </div>

      {/* 4 SUBJECTS GRID */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Available Subject Exams
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any subject below to launch your exam</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exams.map((exam) => {
            const styles = getSubjectColorStyles(exam.examId);
            const icon = getSubjectIcon(exam.examId);

            return (
              <div
                key={exam.examId}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Subject Icon and Questions Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${styles.bg} border ${styles.border}`}>
                      {icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                      {exam.questions.length} Questions
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition leading-snug">
                      {exam.title.replace(' Examination', '')}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Metadata: Duration & Pass Mark */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pass: {exam.passingScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleOpenStartModal(exam)}
                  className={`mt-6 w-full py-2.5 rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${styles.button}`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start {exam.title.replace(' Examination', '')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIMPLE 1-STEP START MODAL (NO COMPLEXITY) */}
      {selectedExamForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                {getSubjectIcon(selectedExamForModal.examId)}
              </div>
              <div>
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  Ready to Begin
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedExamForModal.title}
                </h3>
              </div>
            </div>

            <form onSubmit={handleConfirmStart} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter candidate name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Duration: {selectedExamForModal.durationMinutes} mins • Total: {selectedExamForModal.questions.length} questions
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedExamForModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <span>Start Examination</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
