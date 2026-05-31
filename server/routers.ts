import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ SUBJECTS ============
  subjects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getSubjectsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        color: z.string().default("#6366f1"),
        icon: z.string().default("BookOpen"),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSubject(ctx.user.id, input.name, input.color, input.icon, input.description);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const subject = await db.getSubjectById(input.id, ctx.user.id);
        if (!subject) throw new TRPCError({ code: "NOT_FOUND" });
        
        const updates: any = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.color !== undefined) updates.color = input.color;
        if (input.icon !== undefined) updates.icon = input.icon;
        if (input.description !== undefined) updates.description = input.description;
        
        await db.updateSubject(input.id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const subject = await db.getSubjectById(input.id, ctx.user.id);
        if (!subject) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.deleteSubject(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ TASKS ============
  tasks: router({
    list: protectedProcedure
      .input(z.object({
        subjectId: z.number().optional(),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
        completed: z.boolean().optional(),
        dueAfter: z.date().optional(),
        dueBefore: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getTasksByUserId(ctx.user.id, input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND" });
        return task;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
        subjectId: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTask(
          ctx.user.id,
          input.title,
          input.priority,
          input.subjectId,
          input.description,
          input.dueDate
        );
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
        subjectId: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND" });
        
        const updates: any = {};
        if (input.title !== undefined) updates.title = input.title;
        if (input.description !== undefined) updates.description = input.description;
        if (input.priority !== undefined) updates.priority = input.priority;
        if (input.subjectId !== undefined) updates.subjectId = input.subjectId;
        if (input.dueDate !== undefined) updates.dueDate = input.dueDate;
        
        await db.updateTask(input.id, ctx.user.id, updates);
        return { success: true };
      }),

    toggleComplete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND" });
        
        const completedAt = task.completedAt ? null : new Date();
        await db.updateTask(input.id, ctx.user.id, { completedAt });
        
        // Update daily statistics if completing a task
        if (completedAt && task.subjectId) {
          const today = new Date();
          const stats = await db.getOrCreateDailyStatistics(ctx.user.id, today);
          if (stats) {
            const tasksCompleted = (stats as any).tasksCompleted || 0;
            await db.updateDailyStatistics(ctx.user.id, today, { tasksCompleted: tasksCompleted + 1 });
          }
          
          const subjectStats = await db.getOrCreateSubjectDailyStatistics(ctx.user.id, task.subjectId, today);
          if (subjectStats) {
            const tasksCompleted = (subjectStats as any).tasksCompleted || 0;
            await db.updateSubjectDailyStatistics(ctx.user.id, task.subjectId, today, { tasksCompleted: tasksCompleted + 1 });
          }
        }
        
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND" });
        
        await db.deleteTask(input.id, ctx.user.id);
        return { success: true };
      }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        return db.getTasksByDate(ctx.user.id, input.date);
      }),

    getUpcoming: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return db.getUpcomingTasks(ctx.user.id, input.days);
      }),
  }),

  // ============ POMODORO ============
  pomodoro: router({
    sessions: router({
      list: protectedProcedure
        .input(z.object({ limit: z.number().default(50) }))
        .query(async ({ ctx, input }) => {
          return db.getPomodoroSessionsByUserId(ctx.user.id, input.limit);
        }),

      create: protectedProcedure
        .input(z.object({
          duration: z.number().positive(),
          type: z.enum(["WORK", "BREAK", "LONG_BREAK"]),
          taskId: z.number().optional(),
          subjectId: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          await db.createPomodoroSession(
            ctx.user.id,
            input.duration,
            input.type,
            input.taskId,
            input.subjectId
          );
          
          // Update daily statistics
          const today = new Date();
          const stats = await db.getOrCreateDailyStatistics(ctx.user.id, today);
          if (stats) {
            const totalMinutes = ((stats as any).totalMinutes || 0) + Math.ceil(input.duration / 60);
            const sessionsCompleted = input.type === "WORK" ? ((stats as any).sessionsCompleted || 0) + 1 : (stats as any).sessionsCompleted;
            await db.updateDailyStatistics(ctx.user.id, today, { totalMinutes, sessionsCompleted });
          }
          
          // Update subject statistics if provided
          if (input.subjectId) {
            const subjectStats = await db.getOrCreateSubjectDailyStatistics(ctx.user.id, input.subjectId, today);
            if (subjectStats) {
              const minutesSpent = ((subjectStats as any).minutesSpent || 0) + Math.ceil(input.duration / 60);
              await db.updateSubjectDailyStatistics(ctx.user.id, input.subjectId, today, { minutesSpent });
            }
          }
          
          return { success: true };
        }),

      getToday: protectedProcedure.query(async ({ ctx }) => {
        const today = new Date();
        return db.getPomodoroSessionsByDate(ctx.user.id, today);
      }),

      getStats: protectedProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(async ({ ctx, input }) => {
          const sessions = await db.getPomodoroSessionsByUserId(ctx.user.id, 1000);
          const filtered = sessions.filter(s => {
            const date = new Date(s.completedAt);
            return date >= input.startDate && date <= input.endDate;
          });
          
          const workSessions = filtered.filter(s => s.type === "WORK").length;
          const totalMinutes = filtered.reduce((sum, s) => sum + Math.ceil(s.duration / 60), 0);
          
          return { workSessions, totalMinutes, totalSessions: filtered.length };
        }),
    }),
  }),

  // ============ STATISTICS ============
  statistics: router({
    getDaily: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(async ({ ctx, input }) => {
        return db.getDailyStatistics(ctx.user.id, input.startDate, input.endDate);
      }),

    getStreak: protectedProcedure.query(async ({ ctx }) => {
      return db.getStudyStreak(ctx.user.id);
    }),

    getBySubject: protectedProcedure
      .input(z.object({ subjectId: z.number(), startDate: z.date(), endDate: z.date() }))
      .query(async ({ ctx, input }) => {
        return db.getSubjectStatistics(ctx.user.id, input.subjectId, input.startDate, input.endDate);
      }),

    getAllSubjects: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(async ({ ctx, input }) => {
        return db.getAllSubjectStatistics(ctx.user.id, input.startDate, input.endDate);
      }),
  }),

  // ============ AI FEATURES ============
  ai: router({
       // Check AI call limits
    checkCallLimit: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      const used = await db.getDailyAICallUsage(ctx.user.id, today);
      const limit = await db.getDailyAICallLimit(ctx.user.id, today);
      const canCall = await db.canMakeAICall(ctx.user.id, today);
      const availableRewards = await db.getAvailableAdRewards(ctx.user.id);
      
      return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        canCall,
        availableRewards: availableRewards.length,
      };
    }),

    // Watch ad and unlock questions
    watchAd: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        await db.createAdReward(ctx.user.id, 1);
        return {
          success: true,
          questionsUnlocked: 1,
          message: "Great! You've unlocked 1 additional AI question.",
        };
      } catch (error) {
        console.error("Ad reward error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process ad reward. Please try again.",
        });
      }
    }),

    // AI Chat - conversational AI for answering study questions
    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user can make AI calls
        const today = new Date();
        const canCall = await db.canMakeAICall(ctx.user.id, today);
        if (!canCall) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You've reached your daily AI call limit. Watch an ad to unlock more questions!",
          });
        }

        try {
          // Increment call usage
          await db.incrementAICallUsage(ctx.user.id, today);
          const messages = [
            { role: "system" as const, content: "You are an expert study assistant helping students understand concepts and solve problems. Provide clear, concise explanations with examples when helpful. Be encouraging and supportive." },
            ...(input.conversationHistory || []).map(msg => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
            { role: "user" as const, content: input.message },
          ];

          const response = await invokeLLM({ messages });
          const content = response.choices?.[0]?.message?.content;
          const assistantMessage = typeof content === "string" ? content : "I couldn't generate a response. Please try again.";

          return {
            success: true,
            message: assistantMessage,
          };
        } catch (error) {
          console.error("AI Chat error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process your question. Please try again.",
          });
        }
      }),

    // Question Solver - upload photo of question and get AI solution
    solveQuestion: protectedProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        questionText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user can make AI calls
        const today = new Date();
        const canCall = await db.canMakeAICall(ctx.user.id, today);
        if (!canCall) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You've reached your daily AI call limit. Watch an ad to unlock more questions!",
          });
        }

        try {
          // Increment call usage
          await db.incrementAICallUsage(ctx.user.id, today);
          const messages = [
            {
              role: "system" as const,
              content: "You are an expert tutor. Analyze the question in the image and provide a detailed, step-by-step solution. Explain your reasoning clearly.",
            },
            {
              role: "user" as const,
              content: [
                {
                  type: "text" as const,
                  text: input.questionText || "Please solve this question and provide a detailed step-by-step solution.",
                },
                {
                  type: "image_url" as const,
                  image_url: {
                    url: input.imageUrl,
                    detail: "high" as const,
                  },
                },
              ] as any,
            },
          ];

          const response = await invokeLLM({ messages });
          const content = response.choices?.[0]?.message?.content;
          const solution = typeof content === "string" ? content : "Could not generate a solution. Please try again.";

          return {
            success: true,
            solution,
          };
        } catch (error) {
          console.error("Question solver error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to solve the question. Please try again.",
          });
        }
      }),

    // AI Marking Scheme - get detailed marking schemes and evaluations
    generateMarkingScheme: protectedProcedure
      .input(z.object({
        question: z.string(),
        studentAnswer: z.string(),
        imageUrl: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user can make AI calls
        const today = new Date();
        const canCall = await db.canMakeAICall(ctx.user.id, today);
        if (!canCall) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You've reached your daily AI call limit. Watch an ad to unlock more questions!",
          });
        }

        try {
          // Increment call usage
          await db.incrementAICallUsage(ctx.user.id, today);
          const contentArray: any[] = [
            {
              type: "text",
              text: `Question: ${input.question}\n\nStudent's Answer: ${input.studentAnswer}\n\nPlease provide:\n1. A detailed marking scheme with points allocation\n2. Evaluation of the student's answer\n3. Feedback for improvement\n4. Correct answer if needed\n5. Total marks and score out of 10`,
            },
          ];

          if (input.imageUrl) {
            contentArray.push({
              type: "image_url",
              image_url: {
                url: input.imageUrl,
                detail: "high",
              },
            });
          }

          const messages = [
            {
              role: "system" as const,
              content: "You are an expert examiner. Evaluate student answers and provide detailed marking schemes with constructive feedback.",
            },
            {
              role: "user" as const,
              content: contentArray,
            },
          ];

          const response = await invokeLLM({ messages });
          const content = response.choices?.[0]?.message?.content;
          const markingScheme = typeof content === "string" ? content : "Could not generate marking scheme. Please try again.";

          return {
            success: true,
            markingScheme,
          };
        } catch (error) {
          console.error("Marking scheme error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate marking scheme. Please try again.",
          });
        }
      }),

    // Enhanced AI Marking - evaluate answer against marking scheme with marks
    evaluateAnswerWithScheme: protectedProcedure
      .input(z.object({
        schemeImageUrl: z.string().url(),
        answerImageUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user can make AI calls
        const today = new Date();
        const canCall = await db.canMakeAICall(ctx.user.id, today);
        if (!canCall) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You've reached your daily AI call limit. Watch an ad to unlock more questions!",
          });
        }

        try {
          // Increment call usage
          await db.incrementAICallUsage(ctx.user.id, today);
          const messages = [
            {
              role: "system" as const,
              content: "You are an expert examiner. Compare the student's answer against the marking scheme. Evaluate and assign marks. Provide detailed feedback. Start with MARKS: X/Y format.",
            },
            {
              role: "user" as const,
              content: [
                {
                  type: "text" as const,
                  text: "First image is the marking scheme/answer key. Second image is the student's answer. Compare and evaluate. Provide marks in format MARKS: X/Y",
                },
                {
                  type: "image_url" as const,
                  image_url: {
                    url: input.schemeImageUrl,
                    detail: "high" as const,
                  },
                },
                {
                  type: "image_url" as const,
                  image_url: {
                    url: input.answerImageUrl,
                    detail: "high" as const,
                  },
                },
              ] as any,
            },
          ];

          const response = await invokeLLM({ messages });
          const content = response.choices?.[0]?.message?.content;
          const evaluation = typeof content === "string" ? content : "Could not evaluate answer. Please try again.";

          // Extract marks from the evaluation
          let marksObtained: number | null = null;
          let totalMarks: number | null = null;
          const marksMatch = evaluation.match(/MARKS:\s*(\d+)\/(\d+)/);
          if (marksMatch) {
            marksObtained = parseInt(marksMatch[1] || '0', 10);
            totalMarks = parseInt(marksMatch[2] || '0', 10);
          }

          return {
            success: true,
            evaluation,
            marksObtained,
            totalMarks,
          };
        } catch (error: any) {
          console.error("Answer evaluation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to evaluate answer. Please try again.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
