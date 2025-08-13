import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  createClassInputSchema,
  createQuizInputSchema,
  createQuestionInputSchema,
  enrollStudentInputSchema,
  assignQuizInputSchema,
  startQuizInputSchema,
  submitAnswerInputSchema,
  submitQuizInputSchema,
  gradeSubmissionInputSchema,
  generateQuizInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { createClass } from './handlers/create_class';
import { getTeacherClasses, getStudentClasses } from './handlers/get_classes';
import { enrollStudent } from './handlers/enroll_student';
import { generateQuizFromContent } from './handlers/generate_quiz';
import { createQuiz } from './handlers/create_quiz';
import {
  createQuestion,
  getQuizQuestions,
  updateQuestion,
  deleteQuestion
} from './handlers/manage_questions';
import {
  getTeacherQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} from './handlers/manage_quizzes';
import {
  assignQuizToClass,
  getClassQuizAssignments,
  getStudentQuizAssignments
} from './handlers/assign_quiz';
import {
  startQuiz,
  submitAnswer,
  submitQuiz,
  getQuizSubmission,
  getStudentAnswers
} from './handlers/take_quiz';
import {
  gradeSubmission,
  autoGradeObjectiveQuestions,
  getSubmissionsForGrading
} from './handlers/grade_quiz';
import {
  getQuizResults,
  getStudentScores,
  getClassPerformance,
  getQuizStatistics
} from './handlers/track_scores';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  // Class management
  createClass: publicProcedure
    .input(createClassInputSchema)
    .mutation(({ input }) => createClass(input)),

  getTeacherClasses: publicProcedure
    .input(z.object({ teacherId: z.number() }))
    .query(({ input }) => getTeacherClasses(input.teacherId)),

  getStudentClasses: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(({ input }) => getStudentClasses(input.studentId)),

  enrollStudent: publicProcedure
    .input(enrollStudentInputSchema)
    .mutation(({ input }) => enrollStudent(input)),

  // Quiz generation and creation
  generateQuizFromContent: publicProcedure
    .input(generateQuizInputSchema)
    .mutation(({ input }) => generateQuizFromContent(input)),

  createQuiz: publicProcedure
    .input(createQuizInputSchema)
    .mutation(({ input }) => createQuiz(input)),

  getTeacherQuizzes: publicProcedure
    .input(z.object({ teacherId: z.number() }))
    .query(({ input }) => getTeacherQuizzes(input.teacherId)),

  getQuizById: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(({ input }) => getQuizById(input.quizId)),

  updateQuiz: publicProcedure
    .input(z.object({
      quizId: z.number(),
      updates: z.object({
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional()
      })
    }))
    .mutation(({ input }) => updateQuiz(input.quizId, input.updates)),

  deleteQuiz: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .mutation(({ input }) => deleteQuiz(input.quizId)),

  // Question management
  createQuestion: publicProcedure
    .input(createQuestionInputSchema)
    .mutation(({ input }) => createQuestion(input)),

  getQuizQuestions: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(({ input }) => getQuizQuestions(input.quizId)),

  updateQuestion: publicProcedure
    .input(z.object({
      questionId: z.number(),
      updates: createQuestionInputSchema.partial()
    }))
    .mutation(({ input }) => updateQuestion(input.questionId, input.updates)),

  deleteQuestion: publicProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(({ input }) => deleteQuestion(input.questionId)),

  // Quiz assignment
  assignQuizToClass: publicProcedure
    .input(assignQuizInputSchema)
    .mutation(({ input }) => assignQuizToClass(input)),

  getClassQuizAssignments: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(({ input }) => getClassQuizAssignments(input.classId)),

  getStudentQuizAssignments: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(({ input }) => getStudentQuizAssignments(input.studentId)),

  // Quiz taking
  startQuiz: publicProcedure
    .input(startQuizInputSchema)
    .mutation(({ input }) => startQuiz(input)),

  submitAnswer: publicProcedure
    .input(submitAnswerInputSchema)
    .mutation(({ input }) => submitAnswer(input)),

  submitQuiz: publicProcedure
    .input(submitQuizInputSchema)
    .mutation(({ input }) => submitQuiz(input)),

  getQuizSubmission: publicProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(({ input }) => getQuizSubmission(input.submissionId)),

  getStudentAnswers: publicProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(({ input }) => getStudentAnswers(input.submissionId)),

  // Quiz grading
  gradeSubmission: publicProcedure
    .input(gradeSubmissionInputSchema)
    .mutation(({ input }) => gradeSubmission(input)),

  autoGradeObjectiveQuestions: publicProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(({ input }) => autoGradeObjectiveQuestions(input.submissionId)),

  getSubmissionsForGrading: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(({ input }) => getSubmissionsForGrading(input.quizId)),

  // Score tracking and statistics
  getQuizResults: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(({ input }) => getQuizResults(input.quizId)),

  getStudentScores: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(({ input }) => getStudentScores(input.studentId)),

  getClassPerformance: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(({ input }) => getClassPerformance(input.classId)),

  getQuizStatistics: publicProcedure
    .input(z.object({ quizId: z.number() }))
    .query(({ input }) => getQuizStatistics(input.quizId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();