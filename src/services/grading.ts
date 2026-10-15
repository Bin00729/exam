import {
  ActiveExamSession,
  CategoryScoreSummary,
  ExamPackage,
  ExamSubmissionResult,
  QuestionGradingResult,
  SecurityIncident
} from '../types/exam';

export function gradeExamSession(
  exam: ExamPackage,
  session: ActiveExamSession,
  syncStatus: 'synced' | 'queued_offline' = 'synced'
): ExamSubmissionResult {
  const responses = session.responses;
  let earnedScore = 0;
  let maxPossibleScore = 0;

  const questionResults: QuestionGradingResult[] = [];
  const categoryScoreMap: { [catId: string]: { earned: number; max: number } } = {};

  // Initialize category map
  exam.categories.forEach((cat) => {
    categoryScoreMap[cat.categoryId] = { earned: 0, max: 0 };
  });

  exam.questions.forEach((q) => {
    maxPossibleScore += q.points;
    if (!categoryScoreMap[q.categoryId]) {
      categoryScoreMap[q.categoryId] = { earned: 0, max: 0 };
    }
    categoryScoreMap[q.categoryId].max += q.points;

    const candResp = responses[q.questionId];
    const rawAnswer = candResp ? candResp.answer : '';
    let isCorrect = false;
    let isPartial = false;
    let awarded = 0;

    if (q.type === 'multiple_choice') {
      const correctOpt = String(q.correctAnswer).trim();
      const userOpt = String(rawAnswer).trim();
      if (userOpt && userOpt === correctOpt) {
        isCorrect = true;
        awarded = q.points;
      }
    } else if (q.type === 'multi_select') {
      const correctList: string[] = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((s) => String(s).trim())
        : [String(q.correctAnswer).trim()];

      const userList: string[] = Array.isArray(rawAnswer)
        ? rawAnswer.map((s) => String(s).trim())
        : rawAnswer
        ? [String(rawAnswer).trim()]
        : [];

      // Check how many correct options were chosen and whether incorrect ones were avoided
      const correctChosen = userList.filter((opt) => correctList.includes(opt));
      const incorrectChosen = userList.filter((opt) => !correctList.includes(opt));

      if (correctChosen.length === correctList.length && incorrectChosen.length === 0) {
        isCorrect = true;
        awarded = q.points;
      } else if (correctChosen.length > 0 && incorrectChosen.length === 0) {
        // Partial credit for partial correct choices without wrong answers
        isPartial = true;
        awarded = Math.round((correctChosen.length / correctList.length) * q.points * 10) / 10;
      } else {
        isCorrect = false;
        awarded = 0;
      }
    } else if (q.type === 'short_answer') {
      const userText = String(rawAnswer || '').trim().toLowerCase();
      const acceptedAnswers: string[] = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((a) => String(a).trim().toLowerCase())
        : [String(q.correctAnswer).trim().toLowerCase()];

      if (userText) {
        // Direct match or contains primary keyword
        const matched = acceptedAnswers.some((ans) => {
          if (userText === ans) return true;
          // check if answer contains keyword if answer is sufficiently long
          if (ans.length > 3 && userText.includes(ans)) return true;
          return false;
        });

        if (matched) {
          isCorrect = true;
          awarded = q.points;
        }
      }
    }

    earnedScore += awarded;
    categoryScoreMap[q.categoryId].earned += awarded;

    questionResults.push({
      questionId: q.questionId,
      prompt: q.prompt,
      type: q.type,
      categoryId: q.categoryId,
      maxPoints: q.points,
      awardedPoints: awarded,
      candidateAnswer: rawAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      isPartial,
      explanation: q.explanation,
      options: q.options
    });
  });

  // Category Score summaries
  const categoryScores: CategoryScoreSummary[] = exam.categories.map((cat) => {
    const stats = categoryScoreMap[cat.categoryId] || { earned: 0, max: 0 };
    const pct = stats.max > 0 ? Math.round((stats.earned / stats.max) * 100) : 0;
    return {
      categoryId: cat.categoryId,
      name: cat.name,
      weightPercentage: cat.weightPercentage,
      earnedPoints: stats.earned,
      maxPoints: stats.max,
      percentage: pct
    };
  });

  const scorePercentage = maxPossibleScore > 0 ? Math.round((earnedScore / maxPossibleScore) * 100) : 0;
  const isPassed = scorePercentage >= exam.passingScore;

  // Calculate Trust Score based on proctoring incidents
  const trustScore = calculateTrustScore(session.incidents);

  const durationUsedSeconds = Math.max(
    0,
    Math.round((Date.now() - session.startedAt) / 1000)
  );

  return {
    submissionId: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    examId: exam.examId,
    examTitle: exam.title,
    candidate: session.candidate,
    submittedAt: Date.now(),
    durationUsedSeconds,
    totalScore: Math.round(earnedScore * 10) / 10,
    maxScore: maxPossibleScore,
    scorePercentage,
    passingScore: exam.passingScore,
    isPassed,
    categoryScores,
    questionResults,
    incidents: session.incidents || [],
    strikes: session.strikes || 0,
    trustScore,
    syncStatus
  };
}

export function calculateTrustScore(incidents: SecurityIncident[]): number {
  let score = 100;
  if (!incidents || incidents.length === 0) return 100;

  incidents.forEach((inc) => {
    switch (inc.type) {
      case 'fullscreen_exit':
        score -= 15;
        break;
      case 'tab_switch':
        score -= 10;
        break;
      case 'window_blur':
        score -= 8;
        break;
      case 'copy_paste_attempt':
        score -= 10;
        break;
      case 'devtools_opened':
        score -= 25;
        break;
      case 'face_lost':
        score -= 5;
        break;
      default:
        score -= 5;
    }
  });

  return Math.max(0, score);
}
