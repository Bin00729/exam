import React, { useState } from 'react';
import {
  Upload,
  FileCode,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Copy,
  Download,
  Check
} from 'lucide-react';
import { validateExamJSON, ValidationResult } from '../services/schemaValidator';
import { ExamPackage } from '../types/exam';

interface JSONImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (exam: ExamPackage) => void;
}

const TEMPLATE_EXAMPLE = {
  examId: 'custom-cert-2026',
  title: 'Cloud Infrastructure & DevOps Security Exam',
  description: 'A comprehensive evaluation of container security, kubernetes networking, and automated CI/CD guardrails.',
  durationMinutes: 45,
  passingScore: 70,
  categories: [
    { categoryId: 'cat_cloud_sec', name: 'Cloud Security', weightPercentage: 60 },
    { categoryId: 'cat_devops', name: 'CI/CD Pipelines', weightPercentage: 40 }
  ],
  questions: [
    {
      questionId: 'q1',
      categoryId: 'cat_cloud_sec',
      type: 'multiple_choice',
      prompt: 'Which Kubernetes object is used to restrict communication between pod namespaces by default?',
      points: 5,
      options: [
        { optionId: 'opt_netpol', text: 'NetworkPolicy with default-deny ingress' },
        { optionId: 'opt_ingress', text: 'Ingress controller host mapping' },
        { optionId: 'opt_service', text: 'ClusterIP headless service' },
        { optionId: 'opt_configmap', text: 'ConfigMap immutable annotation' }
      ],
      correctAnswer: 'opt_netpol',
      explanation: 'NetworkPolicies are application-centric constructs allowing you to specify how a pod is allowed to communicate with various network entities.'
    },
    {
      questionId: 'q2',
      categoryId: 'cat_devops',
      type: 'multi_select',
      prompt: 'Select ALL practices that enhance container image security in a production pipeline:',
      points: 10,
      options: [
        { optionId: 'opt_distroless', text: 'Use minimal or distroless base images' },
        { optionId: 'opt_nonroot', text: 'Run container processes as a non-root UID' },
        { optionId: 'opt_trivy', text: 'Scan for CVE vulnerabilities during build' },
        { optionId: 'opt_priv', text: 'Grant privileged flag to docker containers' }
      ],
      correctAnswer: ['opt_distroless', 'opt_nonroot', 'opt_trivy'],
      explanation: 'Using minimal images, running as non-root, and vulnerability scanning are key container hardening guidelines. Privileged containers defeat namespace isolation.'
    },
    {
      questionId: 'q3',
      categoryId: 'cat_cloud_sec',
      type: 'short_answer',
      prompt: 'What security model assumes no implicit trust granted to assets or users based solely on physical or network location?',
      points: 5,
      correctAnswer: 'Zero Trust',
      explanation: 'Zero Trust architecture requires strict identity verification and continuous authorization for every user and device.'
    }
  ]
};

export const JSONImportModal: React.FC<JSONImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = validateExamJSON(parsed);
        setValidationResult(res);
        if (res.isValid && res.sanitizedExam) {
          setPasteContent(JSON.stringify(parsed, null, 2));
        }
      } catch (err: any) {
        setValidationResult({
          isValid: false,
          errors: [`JSON Syntax Error: ${err.message}`],
          warnings: []
        });
      }
    };
    reader.readAsText(file);
  };

  const handleValidatePaste = () => {
    try {
      const parsed = JSON.parse(pasteContent);
      const res = validateExamJSON(parsed);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        errors: [`Invalid JSON Syntax: ${err.message}`],
        warnings: []
      });
    }
  };

  const handleConfirmImport = () => {
    if (validationResult?.isValid && validationResult.sanitizedExam) {
      onImportSuccess(validationResult.sanitizedExam);
      onClose();
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(TEMPLATE_EXAMPLE, null, 2));
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(TEMPLATE_EXAMPLE, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'examshield_template.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadSampleDirectly = () => {
    const res = validateExamJSON(TEMPLATE_EXAMPLE);
    setValidationResult(res);
    setPasteContent(JSON.stringify(TEMPLATE_EXAMPLE, null, 2));
    setActiveTab('paste');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/80 border border-indigo-700/60 rounded text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Import Exam Package</h2>
              <p className="text-xs text-slate-400">Upload or paste an examination specification in standardized JSON format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/30 gap-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            File Upload (.json)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Raw JSON
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'template'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Schema & Template
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'upload' && (
            <div>
              <label
                htmlFor="exam-json-input"
                className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-lg cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition p-6 text-center group"
              >
                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-indigo-950/80 border border-slate-700 group-hover:border-indigo-700/60 mb-3 transition">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {fileName ? (
                    <span className="text-indigo-400 font-semibold">{fileName}</span>
                  ) : (
                    'Click to browse or drop an exam JSON package here'
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accepts standard .json files containing questions, categories, & scoring</p>
                <input
                  id="exam-json-input"
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Want to test without a file?</span>
                <button
                  onClick={handleLoadSampleDirectly}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
                >
                  Load Cloud DevOps Sample Exam
                </button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Paste Exam JSON Schema</label>
                <button
                  onClick={handleLoadSampleDirectly}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Fill Sample JSON
                </button>
              </div>
              <textarea
                value={pasteContent}
                onChange={(e) => {
                  setPasteContent(e.target.value);
                  setValidationResult(null);
                }}
                placeholder='{\n  "examId": "my-exam-1",\n  "title": "Exam Title",\n  "durationMinutes": 45,\n  "passingScore": 70,\n  "categories": [...],\n  "questions": [...]\n}'
                rows={10}
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleValidatePaste}
                  disabled={!pasteContent.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  Validate Structure
                </button>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                ExamShield adheres to a strictly defined JSON specification. You can copy or download the reference structure below and populate it with your institution's questions:
              </p>
              <div className="relative">
                <pre className="max-h-60 overflow-y-auto font-mono text-[11px] bg-slate-950 border border-slate-800 rounded p-3 text-slate-300 leading-snug">
                  {JSON.stringify(TEMPLATE_EXAMPLE, null, 2)}
                </pre>
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    onClick={handleCopyTemplate}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTemplate ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Download .json file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <button
                onClick={handleLoadSampleDirectly}
                className="w-full py-2 bg-indigo-950/80 border border-indigo-700/80 rounded text-xs font-semibold text-indigo-300 hover:bg-indigo-900 transition cursor-pointer"
              >
                Use this Template to Test Now
              </button>
            </div>
          )}

          {/* Validation Feedback Area */}
          {validationResult && (
            <div
              className={`p-3.5 rounded border text-xs ${
                validationResult.isValid
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Valid Exam Package Ready for Import</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Validation Failed ({validationResult.errors.length} issue(s))</span>
                  </>
                )}
              </div>

              {validationResult.isValid && validationResult.sanitizedExam && (
                <div className="mt-2 text-slate-300 space-y-1">
                  <div><strong>Title:</strong> {validationResult.sanitizedExam.title}</div>
                  <div><strong>Exam ID:</strong> {validationResult.sanitizedExam.examId}</div>
                  <div>
                    <strong>Summary:</strong> {validationResult.sanitizedExam.questions.length} questions across{' '}
                    {validationResult.sanitizedExam.categories.length} categories | Duration: {validationResult.sanitizedExam.durationMinutes} mins | Pass Mark: {validationResult.sanitizedExam.passingScore}%
                  </div>
                </div>
              )}

              {!validationResult.isValid && (
                <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-rose-300">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-amber-300 text-[11px]">
                  <p className="font-semibold">Warnings:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {validationResult.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!validationResult?.isValid}
            className="px-4 py-2 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Import & Save to IndexedDB
          </button>
        </div>
      </div>
    </div>
  );
};
