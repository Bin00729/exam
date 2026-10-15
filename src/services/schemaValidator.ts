import { ExamPackage, Question, ExamCategory } from '../types/exam';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedExam?: ExamPackage;
}

export function validateExamJSON(rawJson: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rawJson || typeof rawJson !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid JSON: root must be an object with exam properties.'],
      warnings: []
    };
  }

  const obj = rawJson as Record<string, any>;

  // Validate examId
  if (!obj.examId || typeof obj.examId !== 'string' || obj.examId.trim() === '') {
    errors.push('Missing or invalid "examId" (must be a non-empty string).');
  }

  // Validate title
  if (!obj.title || typeof obj.title !== 'string' || obj.title.trim() === '') {
    errors.push('Missing or invalid "title" (must be a non-empty string).');
  }

  // Validate description
  const description = typeof obj.description === 'string' ? obj.description : '';

  // Validate durationMinutes
  const durationMinutes = Number(obj.durationMinutes);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    errors.push('"durationMinutes" must be a positive number greater than 0.');
  }

  // Validate passingScore
  const passingScore = Number(obj.passingScore);
  if (isNaN(passingScore) || passingScore < 0 || passingScore > 100) {
    errors.push('"passingScore" must be a number between 0 and 100.');
  }

  // Validate categories
  if (!Array.isArray(obj.categories) || obj.categories.length === 0) {
    errors.push('"categories" must be a non-empty array of category objects.');
  }

  const validCategoryIds = new Set<string>();
  const sanitizedCategories: ExamCategory[] = [];

  if (Array.isArray(obj.categories)) {
    let totalWeight = 0;
    obj.categories.forEach((cat: any, index: number) => {
      if (!cat || typeof cat !== 'object') {
        errors.push(`Category at index ${index} is not an object.`);
        return;
      }
      if (!cat.categoryId || typeof cat.categoryId !== 'string') {
        errors.push(`Category at index ${index} is missing a string "categoryId".`);
        return;
      }
      if (!cat.name || typeof cat.name !== 'string') {
        errors.push(`Category "${cat.categoryId}" is missing a string "name".`);
      }
      const weight = Number(cat.weightPercentage);
      if (isNaN(weight) || weight < 0) {
        errors.push(`Category "${cat.categoryId}" has invalid weightPercentage (must be >= 0).`);
      } else {
        totalWeight += weight;
      }

      validCategoryIds.add(cat.categoryId);
      sanitizedCategories.push({
        categoryId: String(cat.categoryId).trim(),
        name: String(cat.name || cat.categoryId).trim(),
        weightPercentage: isNaN(weight) ? 0 : weight
      });
    });

    if (totalWeight > 0 && Math.abs(totalWeight - 100) > 1) {
      warnings.push(`Category weights sum to ${totalWeight}%, but ideally should equal 100%.`);
    }
  }

  // Validate questions
  if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
    errors.push('"questions" must be a non-empty array of question objects.');
  }

  const questionIds = new Set<string>();
  const sanitizedQuestions: Question[] = [];

  if (Array.isArray(obj.questions)) {
    obj.questions.forEach((q: any, index: number) => {
      const qNum = index + 1;
      if (!q || typeof q !== 'object') {
        errors.push(`Question #${qNum} is not an object.`);
        return;
      }

      const qId = q.questionId ? String(q.questionId).trim() : `q_${qNum}`;
      if (questionIds.has(qId)) {
        errors.push(`Duplicate questionId "${qId}" found at question #${qNum}.`);
      }
      questionIds.add(qId);

      // Validate categoryId linkage
      if (!q.categoryId || typeof q.categoryId !== 'string') {
        errors.push(`Question #${qNum} ("${qId}") is missing "categoryId".`);
      } else if (validCategoryIds.size > 0 && !validCategoryIds.has(q.categoryId)) {
        errors.push(`Question #${qNum} ("${qId}") references unknown categoryId "${q.categoryId}".`);
      }

      // Validate question type
      const validTypes = ['multiple_choice', 'multi_select', 'short_answer'];
      if (!q.type || !validTypes.includes(q.type)) {
        errors.push(`Question #${qNum} ("${qId}") has invalid type "${q.type}". Must be one of: ${validTypes.join(', ')}.`);
      }

      // Validate prompt
      if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.trim() === '') {
        errors.push(`Question #${qNum} ("${qId}") is missing a prompt text.`);
      }

      // Validate points
      const points = Number(q.points);
      if (isNaN(points) || points <= 0) {
        errors.push(`Question #${qNum} ("${qId}") must have positive numeric "points".`);
      }

      // Validate options for choice-based questions
      const isChoiceType = q.type === 'multiple_choice' || q.type === 'multi_select';
      const sanitizedOptions: { optionId: string; text: string }[] = [];
      const optionIds = new Set<string>();

      if (isChoiceType) {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question #${qNum} ("${qId}") must have at least 2 options for "${q.type}".`);
        } else {
          q.options.forEach((opt: any, optIndex: number) => {
            if (!opt || typeof opt !== 'object') {
              errors.push(`Question #${qNum} option at index ${optIndex} is invalid.`);
              return;
            }
            const optId = opt.optionId ? String(opt.optionId).trim() : `opt_${optIndex}`;
            if (optionIds.has(optId)) {
              errors.push(`Question #${qNum} has duplicate optionId "${optId}".`);
            }
            optionIds.add(optId);

            sanitizedOptions.push({
              optionId: optId,
              text: String(opt.text || `Option ${optIndex + 1}`).trim()
            });
          });
        }
      }

      // Validate correctAnswer
      if (q.type === 'multiple_choice') {
        if (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) {
          errors.push(`Question #${qNum} ("${qId}") must have a string "correctAnswer" pointing to an optionId.`);
        } else if (optionIds.size > 0 && !optionIds.has(q.correctAnswer.trim())) {
          errors.push(`Question #${qNum} "correctAnswer" ("${q.correctAnswer}") does not match any provided option IDs.`);
        }
      } else if (q.type === 'multi_select') {
        if (!Array.isArray(q.correctAnswer) && typeof q.correctAnswer !== 'string') {
          errors.push(`Question #${qNum} ("${qId}") "correctAnswer" must be an array of option IDs.`);
        } else {
          const ansArray = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
          for (const ans of ansArray) {
            if (optionIds.size > 0 && !optionIds.has(String(ans).trim())) {
              errors.push(`Question #${qNum} correctAnswer optionId "${ans}" does not match any options.`);
            }
          }
        }
      } else if (q.type === 'short_answer') {
        if (!q.correctAnswer || (typeof q.correctAnswer !== 'string' && !Array.isArray(q.correctAnswer))) {
          errors.push(`Question #${qNum} ("${qId}") must have a non-empty string or array of keywords as "correctAnswer".`);
        }
      }

      sanitizedQuestions.push({
        questionId: qId,
        categoryId: String(q.categoryId || ''),
        type: q.type,
        prompt: String(q.prompt || '').trim(),
        points: isNaN(points) ? 1 : points,
        options: isChoiceType ? sanitizedOptions : undefined,
        correctAnswer: q.correctAnswer,
        explanation: typeof q.explanation === 'string' ? q.explanation.trim() : 'No explanation provided.'
      });
    });
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings
    };
  }

  const sanitizedExam: ExamPackage = {
    examId: String(obj.examId).trim(),
    title: String(obj.title).trim(),
    description,
    durationMinutes: Math.max(1, Math.round(durationMinutes)),
    passingScore: Math.max(0, Math.min(100, Math.round(passingScore))),
    categories: sanitizedCategories,
    questions: sanitizedQuestions
  };

  return {
    isValid: true,
    errors: [],
    warnings,
    sanitizedExam
  };
}
