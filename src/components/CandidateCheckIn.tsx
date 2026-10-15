import React, { useState } from 'react';
import {
  ShieldAlert,
  User,
  Mail,
  Hash,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CandidateInfo, ExamPackage } from '../types/exam';
import { WebcamProctor } from './WebcamProctor';

interface CandidateCheckInProps {
  exam: ExamPackage;
  onCheckInComplete: (candidate: CandidateInfo) => void;
  onCancel: () => void;
}

export const CandidateCheckIn: React.FC<CandidateCheckInProps> = ({
  exam,
  onCheckInComplete,
  onCancel,
}) => {
  const [fullName, setFullName] = useState('Alex Vance');
  const [candidateId, setCandidateId] = useState(`CAN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [email, setEmail] = useState('alex.vance@example.edu');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [acceptedHonorCode, setAcceptedHonorCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !candidateId.trim() || !email.trim()) {
      setErrorMessage('Please fill in all candidate details before starting.');
      return;
    }
    if (!acceptedHonorCode) {
      setErrorMessage('You must acknowledge and accept the Anti-Cheating Protocol & Honor Code.');
      return;
    }

    onCheckInComplete({
      fullName: fullName.trim(),
      candidateId: candidateId.trim(),
      email: email.trim(),
      photoUrl: photoUrl || undefined
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-indigo-950 border border-indigo-700/80 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
                Identity Verification & Anti-Cheat Protocol
              </span>
              <h1 className="text-xl font-bold text-white mt-0.5">{exam.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Duration: <strong className="text-slate-200">{exam.durationMinutes} Minutes</strong> | Passing Score:{' '}
                <strong className="text-slate-200">{exam.passingScore}%</strong> | Total Questions:{' '}
                <strong className="text-slate-200">{exam.questions.length}</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Candidate Identification */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Step 1: Candidate Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Candidate Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate / Student ID</label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="e.g. CAN-88492"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="candidate@school.edu"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Camera & System Readiness Verification */}
          <div className="border-t border-slate-800 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Step 2: Security & Hardware Readiness Check
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <WebcamProctor
                  isCheckInMode={true}
                  onSnapshotTaken={(photo) => setPhotoUrl(photo)}
                />
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Maximize2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">Enforced Fullscreen Kiosk Mode</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The browser will be locked to fullscreen upon launch. Exiting fullscreen will issue an immediate violation strike.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <Database className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">IndexedDB Offline Auto-Save Active</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Responses and timer state continuously persist to local browser storage every 5 seconds. Internet disconnection will not interrupt your exam.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">Continuous Proctor Telemetry</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tab switches, window blurs, screenshot attempts, and clipboard paste actions are recorded in the audit trail.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Honor Code Agreement */}
          <div className="border-t border-slate-800 pt-6">
            <label className="flex items-start gap-3 p-4 rounded bg-indigo-950/30 border border-indigo-900/60 cursor-pointer hover:bg-indigo-950/40 transition">
              <input
                type="checkbox"
                checked={acceptedHonorCode}
                onChange={(e) => setAcceptedHonorCode(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Examination Integrity Commitment:</strong> I hereby certify that I am the registered candidate and will complete this examination independently without unauthorized assistance, external materials, browser tabs, or screen recording. I understand that my session will be continuously proctored and violations will be reported to the academic supervisor.
              </span>
            </label>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded transition cursor-pointer"
            >
              Cancel & Return
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Lock Fullscreen & Begin Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
