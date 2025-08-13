import { z } from 'zod';

// Enums for different question types and user roles
export const questionTypeEnum = z.enum(['multiple_choice', 'true_false', 'fill_in_blank', 'open']);
export const userRoleEnum = z.enum(['teacher', 'student']);
export const quizStatusEnum = z.enum(['draft', 'published', 'archived']);
export const submissionStatusEnum = z.enum(['in_progress', 'submitted', 'graded']);

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleEnum,
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Class schema
export const classSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  teacher_id: z.number(),
  class_code: z.string(), // Unique code for students to join
  created_at: z.coerce.date()
});

export type Class = z.infer<typeof classSchema>;

// Quiz schema
export const quizSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  teacher_id: z.number(),
  status: quizStatusEnum,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Quiz = z.infer<typeof quizSchema>;

// Question schema
export const questionSchema = z.object({
  id: z.number(),
  quiz_id: z.number(),
  type: questionTypeEnum,
  question_text: z.string(),
  options: z.array(z.string()).nullable(), // For multiple choice questions
  correct_answer: z.string().nullable(), // Correct answer or answers
  points: z.number(),
  order: z.number().int(), // Question order in quiz
  created_at: z.coerce.date()
});

export type Question = z.infer<typeof questionSchema>;

// Class enrollment schema
export const classEnrollmentSchema = z.object({
  id: z.number(),
  class_id: z.number(),
  student_id: z.number(),
  enrolled_at: z.coerce.date()
});

export type ClassEnrollment = z.infer<typeof classEnrollmentSchema>;

// Quiz assignment schema
export const quizAssignmentSchema = z.object({
  id: z.number(),
  quiz_id: z.number(),
  class_id: z.number(),
  assigned_at: z.coerce.date(),
  due_date: z.coerce.date().nullable()
});

export type QuizAssignment = z.infer<typeof quizAssignmentSchema>;

// Student quiz submission schema
export const quizSubmissionSchema = z.object({
  id: z.number(),
  quiz_id: z.number(),
  student_id: z.number(),
  status: submissionStatusEnum,
  score: z.number().nullable(),
  max_score: z.number(),
  started_at: z.coerce.date(),
  submitted_at: z.coerce.date().nullable(),
  graded_at: z.coerce.date().nullable()
});

export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;

// Student answer schema
export const studentAnswerSchema = z.object({
  id: z.number(),
  submission_id: z.number(),
  question_id: z.number(),
  answer: z.string(),
  is_correct: z.boolean().nullable(), // Null until graded
  points_earned: z.number().nullable(),
  created_at: z.coerce.date()
});

export type StudentAnswer = z.infer<typeof studentAnswerSchema>;

// Input schemas for creating/updating entities

export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role: userRoleEnum
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createClassInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  teacher_id: z.number()
});

export type CreateClassInput = z.infer<typeof createClassInputSchema>;

export const createQuizInputSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  teacher_id: z.number(),
  status: quizStatusEnum.optional()
});

export type CreateQuizInput = z.infer<typeof createQuizInputSchema>;

export const createQuestionInputSchema = z.object({
  quiz_id: z.number(),
  type: questionTypeEnum,
  question_text: z.string(),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
  points: z.number().positive(),
  order: z.number().int()
});

export type CreateQuestionInput = z.infer<typeof createQuestionInputSchema>;

export const enrollStudentInputSchema = z.object({
  class_code: z.string(),
  student_id: z.number()
});

export type EnrollStudentInput = z.infer<typeof enrollStudentInputSchema>;

export const assignQuizInputSchema = z.object({
  quiz_id: z.number(),
  class_id: z.number(),
  due_date: z.coerce.date().optional()
});

export type AssignQuizInput = z.infer<typeof assignQuizInputSchema>;

export const startQuizInputSchema = z.object({
  quiz_id: z.number(),
  student_id: z.number()
});

export type StartQuizInput = z.infer<typeof startQuizInputSchema>;

export const submitAnswerInputSchema = z.object({
  submission_id: z.number(),
  question_id: z.number(),
  answer: z.string()
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerInputSchema>;

export const submitQuizInputSchema = z.object({
  submission_id: z.number()
});

export type SubmitQuizInput = z.infer<typeof submitQuizInputSchema>;

export const gradeSubmissionInputSchema = z.object({
  submission_id: z.number(),
  answers: z.array(z.object({
    question_id: z.number(),
    is_correct: z.boolean(),
    points_earned: z.number()
  }))
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionInputSchema>;

// AI quiz generation input schema
export const generateQuizInputSchema = z.object({
  content: z.string(), // Text content to generate quiz from
  teacher_id: z.number(),
  title: z.string(),
  question_types: z.array(questionTypeEnum).optional(),
  num_questions: z.number().int().positive().optional()
});

export type GenerateQuizInput = z.infer<typeof generateQuizInputSchema>;