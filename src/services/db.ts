import { ActiveExamSession, ExamPackage, ExamSubmissionResult } from '../types/exam';

const DB_NAME = 'ExamShield_DB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Store for Exams
      if (!db.objectStoreNames.contains('exams')) {
        db.createObjectStore('exams', { keyPath: 'examId' });
      }

      // 2. Store for Active Exam Session
      if (!db.objectStoreNames.contains('active_session')) {
        db.createObjectStore('active_session', { keyPath: 'key' });
      }

      // 3. Store for Completed Submissions & Reports
      if (!db.objectStoreNames.contains('submissions')) {
        const subStore = db.createObjectStore('submissions', { keyPath: 'submissionId' });
        subStore.createIndex('examId', 'examId', { unique: false });
        subStore.createIndex('submittedAt', 'submittedAt', { unique: false });
      }

      // 4. Store for Offline Sync Queue
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'submissionId' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ---------------- EXAM OPERATIONS ----------------

export async function saveExamToDB(exam: ExamPackage): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('exams', 'readwrite');
    const store = tx.objectStore('exams');
    const req = store.put(exam);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getExamFromDB(examId: string): Promise<ExamPackage | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('exams', 'readonly');
    const store = tx.objectStore('exams');
    const req = store.get(examId);
    req.onsuccess = () => resolve(req.result as ExamPackage | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllExamsFromDB(): Promise<ExamPackage[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('exams', 'readonly');
    const store = tx.objectStore('exams');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as ExamPackage[]);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteExamFromDB(examId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('exams', 'readwrite');
    const store = tx.objectStore('exams');
    const req = store.delete(examId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------- ACTIVE SESSION OPERATIONS ----------------

export async function saveActiveSessionToDB(session: ActiveExamSession): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_session', 'readwrite');
    const store = tx.objectStore('active_session');
    const req = store.put({ key: 'current_session', ...session });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getActiveSessionFromDB(): Promise<ActiveExamSession | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_session', 'readonly');
    const store = tx.objectStore('active_session');
    const req = store.get('current_session');
    req.onsuccess = () => {
      if (!req.result) {
        resolve(null);
      } else {
        const { key, ...session } = req.result;
        resolve(session as ActiveExamSession);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearActiveSessionFromDB(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('active_session', 'readwrite');
    const store = tx.objectStore('active_session');
    const req = store.delete('current_session');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---------------- SUBMISSION & SYNC QUEUE OPERATIONS ----------------

export async function saveSubmissionToDB(submission: ExamSubmissionResult): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('submissions', 'readwrite');
    const store = tx.objectStore('submissions');
    const req = store.put(submission);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSubmissionsFromDB(): Promise<ExamSubmissionResult[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('submissions', 'readonly');
    const store = tx.objectStore('submissions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as ExamSubmissionResult[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getSubmissionFromDB(submissionId: string): Promise<ExamSubmissionResult | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('submissions', 'readonly');
    const store = tx.objectStore('submissions');
    const req = store.get(submissionId);
    req.onsuccess = () => resolve(req.result as ExamSubmissionResult | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function queueSubmissionForSync(submission: ExamSubmissionResult): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.put(submission);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSyncQueueFromDB(): Promise<ExamSubmissionResult[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as ExamSubmissionResult[]);
    req.onerror = () => reject(req.error);
  });
}

export async function removeFromSyncQueue(submissionId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sync_queue', 'submissions'], 'readwrite');
    const syncStore = tx.objectStore('sync_queue');
    const subStore = tx.objectStore('submissions');

    syncStore.delete(submissionId);

    // Also update syncStatus in submissions table
    const getReq = subStore.get(submissionId);
    getReq.onsuccess = () => {
      if (getReq.result) {
        const item = getReq.result as ExamSubmissionResult;
        item.syncStatus = 'synced';
        subStore.put(item);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
