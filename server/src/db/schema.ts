import { serial, text, pgTable, timestamp, integer, pgEnum, jsonb, numeric, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum definitions
export const userRoleEnum = pgEnum('user_role', ['teacher', 'student']);
export const questionTypeEnum = pgEnum('question_type', ['multiple_choice', 'true_false', 'fill_in_blank', 'open']);
export const quizStatusEnum = pgEnum('quiz_status', ['draft', 'published', 'archived']);
export const submissionStatusEnum = pgEnum('submission_status', ['in_progress', 'submitted', 'graded']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Classes table
export const classesTable = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  teacher_id: integer('teacher_id').notNull(),
  class_code: text('class_code').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Quizzes table
export const quizzesTable = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  teacher_id: integer('teacher_id').notNull(),
  status: quizStatusEnum('status').notNull().default('draft'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Questions table
export const questionsTable = pgTable('questions', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').notNull(),
  type: questionTypeEnum('type').notNull(),
  question_text: text('question_text').notNull(),
  options: jsonb('options'), // Array of strings for multiple choice options
  correct_answer: text('correct_answer'),
  points: numeric('points', { precision: 10, scale: 2 }).notNull(),
  order: integer('order').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Class enrollments table
export const classEnrollmentsTable = pgTable('class_enrollments', {
  id: serial('id').primaryKey(),
  class_id: integer('class_id').notNull(),
  student_id: integer('student_id').notNull(),
  enrolled_at: timestamp('enrolled_at').defaultNow().notNull(),
});

// Quiz assignments table
export const quizAssignmentsTable = pgTable('quiz_assignments', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').notNull(),
  class_id: integer('class_id').notNull(),
  assigned_at: timestamp('assigned_at').defaultNow().notNull(),
  due_date: timestamp('due_date'),
});

// Quiz submissions table
export const quizSubmissionsTable = pgTable('quiz_submissions', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').notNull(),
  student_id: integer('student_id').notNull(),
  status: submissionStatusEnum('status').notNull().default('in_progress'),
  score: numeric('score', { precision: 10, scale: 2 }),
  max_score: numeric('max_score', { precision: 10, scale: 2 }).notNull(),
  started_at: timestamp('started_at').defaultNow().notNull(),
  submitted_at: timestamp('submitted_at'),
  graded_at: timestamp('graded_at'),
});

// Student answers table
export const studentAnswersTable = pgTable('student_answers', {
  id: serial('id').primaryKey(),
  submission_id: integer('submission_id').notNull(),
  question_id: integer('question_id').notNull(),
  answer: text('answer').notNull(),
  is_correct: boolean('is_correct'),
  points_earned: numeric('points_earned', { precision: 10, scale: 2 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  teacherClasses: many(classesTable),
  teacherQuizzes: many(quizzesTable),
  enrollments: many(classEnrollmentsTable),
  submissions: many(quizSubmissionsTable),
}));

export const classesRelations = relations(classesTable, ({ one, many }) => ({
  teacher: one(usersTable, {
    fields: [classesTable.teacher_id],
    references: [usersTable.id],
  }),
  enrollments: many(classEnrollmentsTable),
  quizAssignments: many(quizAssignmentsTable),
}));

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
  teacher: one(usersTable, {
    fields: [quizzesTable.teacher_id],
    references: [usersTable.id],
  }),
  questions: many(questionsTable),
  assignments: many(quizAssignmentsTable),
  submissions: many(quizSubmissionsTable),
}));

export const questionsRelations = relations(questionsTable, ({ one, many }) => ({
  quiz: one(quizzesTable, {
    fields: [questionsTable.quiz_id],
    references: [quizzesTable.id],
  }),
  answers: many(studentAnswersTable),
}));

export const classEnrollmentsRelations = relations(classEnrollmentsTable, ({ one }) => ({
  class: one(classesTable, {
    fields: [classEnrollmentsTable.class_id],
    references: [classesTable.id],
  }),
  student: one(usersTable, {
    fields: [classEnrollmentsTable.student_id],
    references: [usersTable.id],
  }),
}));

export const quizAssignmentsRelations = relations(quizAssignmentsTable, ({ one }) => ({
  quiz: one(quizzesTable, {
    fields: [quizAssignmentsTable.quiz_id],
    references: [quizzesTable.id],
  }),
  class: one(classesTable, {
    fields: [quizAssignmentsTable.class_id],
    references: [classesTable.id],
  }),
}));

export const quizSubmissionsRelations = relations(quizSubmissionsTable, ({ one, many }) => ({
  quiz: one(quizzesTable, {
    fields: [quizSubmissionsTable.quiz_id],
    references: [quizzesTable.id],
  }),
  student: one(usersTable, {
    fields: [quizSubmissionsTable.student_id],
    references: [usersTable.id],
  }),
  answers: many(studentAnswersTable),
}));

export const studentAnswersRelations = relations(studentAnswersTable, ({ one }) => ({
  submission: one(quizSubmissionsTable, {
    fields: [studentAnswersTable.submission_id],
    references: [quizSubmissionsTable.id],
  }),
  question: one(questionsTable, {
    fields: [studentAnswersTable.question_id],
    references: [questionsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Class = typeof classesTable.$inferSelect;
export type NewClass = typeof classesTable.$inferInsert;

export type Quiz = typeof quizzesTable.$inferSelect;
export type NewQuiz = typeof quizzesTable.$inferInsert;

export type Question = typeof questionsTable.$inferSelect;
export type NewQuestion = typeof questionsTable.$inferInsert;

export type ClassEnrollment = typeof classEnrollmentsTable.$inferSelect;
export type NewClassEnrollment = typeof classEnrollmentsTable.$inferInsert;

export type QuizAssignment = typeof quizAssignmentsTable.$inferSelect;
export type NewQuizAssignment = typeof quizAssignmentsTable.$inferInsert;

export type QuizSubmission = typeof quizSubmissionsTable.$inferSelect;
export type NewQuizSubmission = typeof quizSubmissionsTable.$inferInsert;

export type StudentAnswer = typeof studentAnswersTable.$inferSelect;
export type NewStudentAnswer = typeof studentAnswersTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  classes: classesTable,
  quizzes: quizzesTable,
  questions: questionsTable,
  classEnrollments: classEnrollmentsTable,
  quizAssignments: quizAssignmentsTable,
  quizSubmissions: quizSubmissionsTable,
  studentAnswers: studentAnswersTable,
};