import { ExamPackage } from '../types/exam';

export const SAMPLE_EXAMS: ExamPackage[] = [
  // 1. ENGLISH EXAMINATION
  {
    examId: 'english-exam-grade',
    title: 'English Language Examination',
    description: 'Covers English grammar, vocabulary, sentence structure, comprehension, and idiomatic expressions.',
    durationMinutes: 20,
    passingScore: 60,
    categories: [
      { categoryId: 'cat_grammar', name: 'Grammar & Syntax', weightPercentage: 40 },
      { categoryId: 'cat_vocab', name: 'Vocabulary & Diction', weightPercentage: 35 },
      { categoryId: 'cat_reading', name: 'Comprehension & Usage', weightPercentage: 25 }
    ],
    questions: [
      {
        questionId: 'eng_q1',
        categoryId: 'cat_vocab',
        type: 'multiple_choice',
        prompt: 'Which word is the closest SYNONYM for "meticulous"?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Careless' },
          { optionId: 'opt_b', text: 'Thorough and precise' },
          { optionId: 'opt_c', text: 'Hasty' },
          { optionId: 'opt_d', text: 'Indifferent' }
        ],
        correctAnswer: 'opt_b',
        explanation: '"Meticulous" means showing great attention to detail; very careful and precise.'
      },
      {
        questionId: 'eng_q2',
        categoryId: 'cat_grammar',
        type: 'multiple_choice',
        prompt: 'Choose the correct form to complete the sentence: "Neither the teacher nor the students ______ present in the auditorium yesterday."',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'was' },
          { optionId: 'opt_b', text: 'were' },
          { optionId: 'opt_c', text: 'is' },
          { optionId: 'opt_d', text: 'are' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'When subjects are connected by "neither... nor", the verb agrees with the closer subject ("students", which is plural), hence "were".'
      },
      {
        questionId: 'eng_q3',
        categoryId: 'cat_grammar',
        type: 'multiple_choice',
        prompt: 'Which of the following sentences is written in the PASSIVE VOICE?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'The architect designed the new university library.' },
          { optionId: 'opt_b', text: 'The new university library was designed by the architect.' },
          { optionId: 'opt_c', text: 'The students visited the new library yesterday.' },
          { optionId: 'opt_d', text: 'Everyone praised the wonderful structure.' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'In option B, the subject ("library") receives the action ("was designed"), which is the definition of passive voice.'
      },
      {
        questionId: 'eng_q4',
        categoryId: 'cat_reading',
        type: 'multiple_choice',
        prompt: 'What does the idiom "burn the midnight oil" mean?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'To waste valuable resources' },
          { optionId: 'opt_b', text: 'To work or study late into the night' },
          { optionId: 'opt_c', text: 'To create an accidental fire' },
          { optionId: 'opt_d', text: 'To cook a late meal' }
        ],
        correctAnswer: 'opt_b',
        explanation: '"Burn the midnight oil" originates from the days of oil lamps and refers to studying or working late into the night.'
      },
      {
        questionId: 'eng_q5',
        categoryId: 'cat_vocab',
        type: 'multiple_choice',
        prompt: 'What is the ANTONYM of "benevolent"?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Malevolent' },
          { optionId: 'opt_b', text: 'Generous' },
          { optionId: 'opt_c', text: 'Affectionate' },
          { optionId: 'opt_d', text: 'Charitable' }
        ],
        correctAnswer: 'opt_a',
        explanation: '"Benevolent" means well-meaning and kindly; its direct opposite is "malevolent" (wishing harm to others).'
      }
    ]
  },

  // 2. MATHEMATICS EXAMINATION
  {
    examId: 'maths-exam-grade',
    title: 'Mathematics Examination',
    description: 'Covers algebra, arithmetic operations, geometry, linear equations, and functional values.',
    durationMinutes: 25,
    passingScore: 60,
    categories: [
      { categoryId: 'cat_algebra', name: 'Algebra & Equations', weightPercentage: 40 },
      { categoryId: 'cat_geometry', name: 'Geometry & Measurement', weightPercentage: 35 },
      { categoryId: 'cat_arithmetic', name: 'Arithmetic & Operations', weightPercentage: 25 }
    ],
    questions: [
      {
        questionId: 'math_q1',
        categoryId: 'cat_algebra',
        type: 'multiple_choice',
        prompt: 'Solve for x: 3x - 7 = 14',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'x = 5' },
          { optionId: 'opt_b', text: 'x = 7' },
          { optionId: 'opt_c', text: 'x = 21' },
          { optionId: 'opt_d', text: 'x = 8' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.'
      },
      {
        questionId: 'math_q2',
        categoryId: 'cat_geometry',
        type: 'multiple_choice',
        prompt: 'What is the length of the hypotenuse of a right-angled triangle with perpendicular legs of length 6 cm and 8 cm?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: '10 cm' },
          { optionId: 'opt_b', text: '14 cm' },
          { optionId: 'opt_c', text: '12 cm' },
          { optionId: 'opt_d', text: '48 cm' }
        ],
        correctAnswer: 'opt_a',
        explanation: 'By the Pythagorean theorem: c² = a² + b² = 6² + 8² = 36 + 64 = 100. Thus, c = √100 = 10 cm.'
      },
      {
        questionId: 'math_q3',
        categoryId: 'cat_algebra',
        type: 'multiple_choice',
        prompt: 'If f(x) = 2x² - 3x + 5, what is the value of f(3)?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: '14' },
          { optionId: 'opt_b', text: '20' },
          { optionId: 'opt_c', text: '12' },
          { optionId: 'opt_d', text: '23' }
        ],
        correctAnswer: 'opt_a',
        explanation: 'Substitute x = 3: f(3) = 2(3)² - 3(3) + 5 = 2(9) - 9 + 5 = 18 - 9 + 5 = 14.'
      },
      {
        questionId: 'math_q4',
        categoryId: 'cat_geometry',
        type: 'multiple_choice',
        prompt: 'What is the sum of the interior angles of a triangle?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: '90°' },
          { optionId: 'opt_b', text: '180°' },
          { optionId: 'opt_c', text: '270°' },
          { optionId: 'opt_d', text: '360°' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'The sum of all three interior angles in any Euclidean triangle is always 180 degrees.'
      },
      {
        questionId: 'math_q5',
        categoryId: 'cat_arithmetic',
        type: 'multiple_choice',
        prompt: 'What is 15% of 240?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: '24' },
          { optionId: 'opt_b', text: '32' },
          { optionId: 'opt_c', text: '36' },
          { optionId: 'opt_d', text: '40' }
        ],
        correctAnswer: 'opt_c',
        explanation: '15% of 240 = 0.15 × 240 = 36 (or 10% is 24 + 5% is 12 = 36).'
      }
    ]
  },

  // 3. BIOLOGY EXAMINATION
  {
    examId: 'biology-exam-grade',
    title: 'Biology Examination',
    description: 'Covers cell biology, human anatomy, genetics, physiology, and plant life processes.',
    durationMinutes: 20,
    passingScore: 60,
    categories: [
      { categoryId: 'cat_cell', name: 'Cell Biology & Organelles', weightPercentage: 40 },
      { categoryId: 'cat_anatomy', name: 'Human Physiology', weightPercentage: 35 },
      { categoryId: 'cat_genetics', name: 'Genetics & Ecology', weightPercentage: 25 }
    ],
    questions: [
      {
        questionId: 'bio_q1',
        categoryId: 'cat_cell',
        type: 'multiple_choice',
        prompt: 'Which cellular organelle is commonly referred to as the "powerhouse of the cell" due to ATP generation?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Nucleus' },
          { optionId: 'opt_b', text: 'Mitochondria' },
          { optionId: 'opt_c', text: 'Endoplasmic Reticulum' },
          { optionId: 'opt_d', text: 'Golgi Apparatus' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'Mitochondria generate most of the cell\'s supply of adenosine triphosphate (ATP) through cellular respiration.'
      },
      {
        questionId: 'bio_q2',
        categoryId: 'cat_cell',
        type: 'multiple_choice',
        prompt: 'What is the primary green pigment in plant leaves responsible for absorbing sunlight during photosynthesis?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Chlorophyll' },
          { optionId: 'opt_b', text: 'Carotene' },
          { optionId: 'opt_c', text: 'Hemoglobin' },
          { optionId: 'opt_d', text: 'Xanthophyll' }
        ],
        correctAnswer: 'opt_a',
        explanation: 'Chlorophyll absorbs red and blue wavelengths of sunlight to drive the light reactions of photosynthesis.'
      },
      {
        questionId: 'bio_q3',
        categoryId: 'cat_anatomy',
        type: 'multiple_choice',
        prompt: 'Which blood vessels carry oxygenated blood away from the heart to the rest of the body?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Veins' },
          { optionId: 'opt_b', text: 'Arteries' },
          { optionId: 'opt_c', text: 'Capillaries' },
          { optionId: 'opt_d', text: 'Lymphatics' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'Arteries carry oxygen-rich blood away from the heart under high pressure (with the exception of pulmonary arteries).'
      },
      {
        questionId: 'bio_q4',
        categoryId: 'cat_genetics',
        type: 'multiple_choice',
        prompt: 'Which macromolecule contains the genetic instructions used in the growth, development, and functioning of all known living organisms?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'DNA (Deoxyribonucleic Acid)' },
          { optionId: 'opt_b', text: 'Lipids' },
          { optionId: 'opt_c', text: 'Cellulose' },
          { optionId: 'opt_d', text: 'Glycogen' }
        ],
        correctAnswer: 'opt_a',
        explanation: 'DNA holds hereditary biological instructions across generations in double-helix molecular chains.'
      },
      {
        questionId: 'bio_q5',
        categoryId: 'cat_anatomy',
        type: 'multiple_choice',
        prompt: 'What is the basic structural and functional unit of the human nervous system?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Nephron' },
          { optionId: 'opt_b', text: 'Neuron' },
          { optionId: 'opt_c', text: 'Alveolus' },
          { optionId: 'opt_d', text: 'Erythrocyte' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'Neurons (nerve cells) transmit electrical and chemical signals throughout the central and peripheral nervous systems.'
      }
    ]
  },

  // 4. PHYSICS EXAMINATION
  {
    examId: 'physics-exam-grade',
    title: 'Physics Examination',
    description: 'Covers Newton\'s laws, kinematics, optics, thermodynamics, units, and electricity.',
    durationMinutes: 20,
    passingScore: 60,
    categories: [
      { categoryId: 'cat_mechanics', name: 'Mechanics & Motion', weightPercentage: 40 },
      { categoryId: 'cat_waves', name: 'Optics & Waves', weightPercentage: 35 },
      { categoryId: 'cat_electricity', name: 'Electricity & Energy', weightPercentage: 25 }
    ],
    questions: [
      {
        questionId: 'phy_q1',
        categoryId: 'cat_mechanics',
        type: 'multiple_choice',
        prompt: 'What mathematical equation defines Newton\'s Second Law of Motion?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'F = m · a (Force = mass × acceleration)' },
          { optionId: 'opt_b', text: 'E = m · c²' },
          { optionId: 'opt_c', text: 'P = V · I' },
          { optionId: 'opt_d', text: 'W = F / d' }
        ],
        correctAnswer: 'opt_a',
        explanation: 'Newton\'s Second Law states that the acceleration of an object is directly proportional to the net force and inversely proportional to its mass: F = ma.'
      },
      {
        questionId: 'phy_q2',
        categoryId: 'cat_electricity',
        type: 'multiple_choice',
        prompt: 'What is the SI standard unit of electrical resistance?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Volt' },
          { optionId: 'opt_b', text: 'Ampere' },
          { optionId: 'opt_c', text: 'Ohm (Ω)' },
          { optionId: 'opt_d', text: 'Watt' }
        ],
        correctAnswer: 'opt_c',
        explanation: 'The Ohm (symbol Ω) is the SI derived unit of electrical resistance, defined by Ohm\'s Law: R = V / I.'
      },
      {
        questionId: 'phy_q3',
        categoryId: 'cat_mechanics',
        type: 'multiple_choice',
        prompt: 'A car accelerates uniformly from rest (0 m/s) to 20 m/s in 4 seconds. What is its acceleration?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: '4 m/s²' },
          { optionId: 'opt_b', text: '5 m/s²' },
          { optionId: 'opt_c', text: '80 m/s²' },
          { optionId: 'opt_d', text: '10 m/s²' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'Acceleration a = (v - u) / t = (20 - 0) / 4 = 5 m/s².'
      },
      {
        questionId: 'phy_q4',
        categoryId: 'cat_waves',
        type: 'multiple_choice',
        prompt: 'What physical wave phenomenon causes a straight drinking straw to appear bent or broken when placed in a glass of water?',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Reflection' },
          { optionId: 'opt_b', text: 'Refraction' },
          { optionId: 'opt_c', text: 'Diffraction' },
          { optionId: 'opt_d', text: 'Polarization' }
        ],
        correctAnswer: 'opt_b',
        explanation: 'Refraction is the bending of light as it passes from one transparent medium (air) into another of different optical density (water).'
      },
      {
        questionId: 'phy_q5',
        categoryId: 'cat_electricity',
        type: 'multiple_choice',
        prompt: 'According to the Law of Conservation of Energy, energy can neither be created nor destroyed; it can only be:',
        points: 10,
        options: [
          { optionId: 'opt_a', text: 'Transformed from one form to another' },
          { optionId: 'opt_b', text: 'Multiplied indefinitely' },
          { optionId: 'opt_c', text: 'Vanished into empty space' },
          { optionId: 'opt_d', text: 'Stored with 100% loss' }
        ],
        correctAnswer: 'opt_a',
        explanation: 'The First Law of Thermodynamics / Conservation of Energy states total energy remains constant, transitioning between forms (kinetic, thermal, potential, etc.).'
      }
    ]
  }
];
