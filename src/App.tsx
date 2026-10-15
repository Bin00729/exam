import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveExamSession,
  CandidateInfo,
  CandidateResponseMap,
  ExamPackage,
  ExamSubmissionResult,
  SecurityIncident
} from './types/exam';
import { SAMPLE_EXAMS } from './data/sampleExams';
import {
  clearActiveSessionFromDB,
  getActiveSessionFromDB,
  getAllExamsFromDB,
  getAllSubmissionsFromDB,
  getSyncQueueFromDB,
  removeFromSyncQueue,
  saveActiveSessionToDB,
  saveExamToDB,
  saveSubmissionToDB,
  queueSubmissionForSync
} from './services/db';
import { gradeExamSession } from './services/grading';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExamView } from './components/ExamView';
import { ExamResultsView } from './components/ExamResultsView';
import { ExamHistoryView } from './components/ExamHistoryView';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'exam' | 'results' | 'history'>('dashboard');
  const [exams, setExams] = useState<ExamPackage[]>(SAMPLE_EXAMS);
  const [selectedExam, setSelectedExam] = useState<ExamPackage | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>(null);
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmissionResult | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmissionResult[]>([]);
  const [syncQueue, setSyncQueue] = useState<ExamSubmissionResult[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize offline queue when online
  const handleAutoSync = useCallback(async () => {
    try {
      const queued = await getSyncQueueFromDB();
      if (queued.length === 0) return;

      setIsSyncing(true);
      for (const item of queued) {
        try {
          if (navigator.onLine) {
            await fetch('/api/exam/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            }).catch(() => {});
          }
          await removeFromSyncQueue(item.submissionId);
        } catch (e) {
          console.warn('Sync failed for item:', item.submissionId, e);
        }
      }

      const updatedQueue = await getSyncQueueFromDB();
      setSyncQueue(updatedQueue);

      const updatedSubmissions = await getAllSubmissionsFromDB();
      setSubmissions(updatedSubmissions);
      showToast('All offline exam results synchronized!');
    } catch (err) {
      console.warn('Auto sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const isOnline = useOnlineStatus(handleAutoSync);

  // Initialize Data on mount - ensure 4 subjects are available
  useEffect(() => {
    async function initData() {
      try {
        // Save the 4 core subjects (English, Maths, Biology, Physics)
        for (const sample of SAMPLE_EXAMS) {
          await saveExamToDB(sample);
        }
        setExams(SAMPLE_EXAMS);

        // Check for active session
        const ongoingSession = await getActiveSessionFromDB();
        if (ongoingSession && !ongoingSession.isSubmitted) {
          setActiveSession(ongoingSession);
        }

        // Load historical submissions
        const allSubs = await getAllSubmissionsFromDB();
        setSubmissions(allSubs.sort((a, b) => b.submittedAt - a.submittedAt));

        // Load sync queue
        const queued = await getSyncQueueFromDB();
        setSyncQueue(queued);
      } catch (err) {
        console.warn('Error initializing data:', err);
      }
    }

    initData();
  }, []);

  // Direct, simple 1-click start for any exam
  const handleStartExamDirect = async (exam: ExamPackage, cand: CandidateInfo) => {
    setSelectedExam(exam);
    setCandidate(cand);

    const initialSession: ActiveExamSession = {
      examId: exam.examId,
      candidate: cand,
      startedAt: Date.now(),
      expiresAt: Date.now() + exam.durationMinutes * 60 * 1000,
      remainingSeconds: exam.durationMinutes * 60,
      responses: {},
      incidents: [],
      strikes: 0,
      isLocked: false,
      isSubmitted: false
    };

    await saveActiveSessionToDB(initialSession);
    setActiveSession(initialSession);
    setCurrentView('exam');
  };

  // Resume interrupted session
  const handleResumeSession = () => {
    if (!activeSession) return;
    const examFound = exams.find((e) => e.examId === activeSession.examId) || SAMPLE_EXAMS[0];
    setSelectedExam(examFound);
    setCandidate(activeSession.candidate);
    setCurrentView('exam');
  };

  // Discard interrupted session
  const handleDiscardSession = async () => {
    await clearActiveSessionFromDB();
    setActiveSession(null);
    showToast('Saved exam session cleared.');
  };

  // Submit Exam
  const handleSubmitExam = async (
    finalResponses: CandidateResponseMap,
    incidents: SecurityIncident[],
    strikes: number
  ) => {
    if (!selectedExam || !candidate) return;

    const currentSessionData: ActiveExamSession = {
      examId: selectedExam.examId,
      candidate,
      startedAt: activeSession?.startedAt || Date.now(),
      expiresAt: Date.now(),
      remainingSeconds: 0,
      responses: finalResponses,
      incidents,
      strikes,
      isLocked: false,
      isSubmitted: true
    };

    const syncStatus = isOnline ? 'synced' : 'queued_offline';
    const gradedResult = gradeExamSession(selectedExam, currentSessionData, syncStatus);

    // Save submission to IndexedDB
    await saveSubmissionToDB(gradedResult);

    if (!isOnline) {
      await queueSubmissionForSync(gradedResult);
      const q = await getSyncQueueFromDB();
      setSyncQueue(q);
      showToast('Saved locally. Will sync when back online.');
    } else {
      showToast('Exam submitted successfully!');
    }

    // Clear active session
    await clearActiveSessionFromDB();
    setActiveSession(null);

    // Update submissions list
    const updatedSubmissions = await getAllSubmissionsFromDB();
    setSubmissions(updatedSubmissions.sort((a, b) => b.submittedAt - a.submittedAt));

    setCurrentSubmission(gradedResult);
    setCurrentView('results');
  };

  // Clear Submission History
  const handleClearHistory = async () => {
    if (confirm('Clear all your completed exam records?')) {
      const db = await (await import('./services/db')).getDB();
      const tx = db.transaction('submissions', 'readwrite');
      tx.objectStore('submissions').clear();
      setSubmissions([]);
      showToast('Exam history cleared.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Primary Navigation Bar (hidden during active exam view) */}
      {currentView !== 'exam' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          isOnline={isOnline}
          pendingSyncCount={syncQueue.length}
          isSyncing={isSyncing}
          onManualSync={handleAutoSync}
          submissionsCount={submissions.length}
        />
      )}

      {/* Main Views */}
      <div className="flex-1 flex flex-col bg-white">
        {currentView === 'dashboard' && (
          <DashboardView
            exams={exams}
            activeSession={activeSession}
            onResumeSession={handleResumeSession}
            onDiscardSession={handleDiscardSession}
            onStartExamDirect={handleStartExamDirect}
          />
        )}

        {currentView === 'exam' && selectedExam && candidate && (
          <ExamView
            exam={selectedExam}
            candidate={candidate}
            initialSession={activeSession}
            isOnline={isOnline}
            onSubmitExam={handleSubmitExam}
            onExitWithoutSubmit={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'results' && currentSubmission && (
          <ExamResultsView
            submission={currentSubmission}
            isOnline={isOnline}
            onRetakeExam={() => {
              const examFound = exams.find((e) => e.examId === currentSubmission.examId) || SAMPLE_EXAMS[0];
              handleStartExamDirect(examFound, currentSubmission.candidate);
            }}
            onReturnHome={() => setCurrentView('dashboard')}
            onManualSync={handleAutoSync}
            isSyncing={isSyncing}
          />
        )}

        {currentView === 'history' && (
          <ExamHistoryView
            submissions={submissions}
            onSelectSubmission={(sub) => {
              setCurrentSubmission(sub);
              setCurrentView('results');
            }}
            onClearHistory={handleClearHistory}
            onManualSync={handleAutoSync}
            isOnline={isOnline}
            isSyncing={isSyncing}
          />
        )}
      </div>
    </div>
  );
}
