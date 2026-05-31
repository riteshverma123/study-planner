import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("tRPC Procedures", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("auth", () => {
    it("should return current user from me query", async () => {
      const result = await caller.auth.me();
      expect(result).toEqual(ctx.user);
    });

    it("should clear cookie on logout", async () => {
      const result = await caller.auth.logout();
      expect(result.success).toBe(true);
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("subjects", () => {
    it("should list subjects for user", async () => {
      const result = await caller.subjects.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a subject", async () => {
      const result = await caller.subjects.create({
        name: "Mathematics",
        color: "#6366f1",
        icon: "Calculator",
        description: "Math studies",
      });
      expect(result.success).toBe(true);
    });

    it("should require subject name", async () => {
      try {
        await caller.subjects.create({
          name: "",
          color: "#6366f1",
          icon: "Calculator",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBeDefined();
      }
    });
  });

  describe("tasks", () => {
    it("should list tasks for user", async () => {
      const result = await caller.tasks.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a task", async () => {
      const result = await caller.tasks.create({
        title: "Complete Chapter 5",
        description: "Read and answer questions",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      expect(result.success).toBe(true);
    });

    it("should require task title", async () => {
      try {
        await caller.tasks.create({
          title: "",
          priority: "MEDIUM",
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBeDefined();
      }
    });

    it("should filter tasks by completion status", async () => {
      const result = await caller.tasks.list({ completed: false });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter tasks by priority", async () => {
      const result = await caller.tasks.list({ priority: "HIGH" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get upcoming tasks", async () => {
      const result = await caller.tasks.getUpcoming({ days: 7 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("pomodoro", () => {
    it("should list pomodoro sessions", async () => {
      const result = await caller.pomodoro.sessions.list({ limit: 50 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a pomodoro session", async () => {
      const result = await caller.pomodoro.sessions.create({
        duration: 1500, // 25 minutes in seconds
        type: "WORK",
      });
      expect(result.success).toBe(true);
    });

    it("should get today's sessions", async () => {
      const result = await caller.pomodoro.sessions.getToday();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get session statistics", async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = await caller.pomodoro.sessions.getStats({
        startDate: sevenDaysAgo,
        endDate: now,
      });
      expect(result).toHaveProperty("workSessions");
      expect(result).toHaveProperty("totalMinutes");
      expect(result).toHaveProperty("totalSessions");
    });
  });

  describe("statistics", () => {
    it("should get daily statistics", async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const result = await caller.statistics.getDaily({
        startDate: thirtyDaysAgo,
        endDate: now,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get study streak", async () => {
      const result = await caller.statistics.getStreak();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should get statistics by subject", async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = await caller.statistics.getBySubject({
        subjectId: 1,
        startDate: sevenDaysAgo,
        endDate: now,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should get all subject statistics", async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = await caller.statistics.getAllSubjects({
        startDate: sevenDaysAgo,
        endDate: now,
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("ai", () => {
    it("should handle AI chat with conversation history", async () => {
      vi.setConfig({ testTimeout: 15000 });
      const result = await caller.ai.chat({
        message: "What is photosynthesis?",
        conversationHistory: [],
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe("string");
      expect(result.message.length).toBeGreaterThan(0);
    }, 15000);

    it("should validate empty message in AI chat", async () => {
      try {
        await caller.ai.chat({
          message: "",
          conversationHistory: [],
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBeDefined();
      }
    });

    it("should handle question solver with image URL", async () => {
      vi.setConfig({ testTimeout: 15000 });
      const result = await caller.ai.solveQuestion({
        imageUrl: "https://example.com/question.jpg",
        questionText: "Solve this equation",
      });

      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(typeof result.solution).toBe("string");
    });

    it("should handle marking scheme generation", async () => {
      vi.setConfig({ testTimeout: 15000 });
      const result = await caller.ai.generateMarkingScheme({
        question: "What is the capital of France?",
        studentAnswer: "Paris",
      });

      expect(result.success).toBe(true);
      expect(result.markingScheme).toBeDefined();
      expect(typeof result.markingScheme).toBe("string");
    }, 15000);

    it("should handle answer evaluation with marking scheme", async () => {
      vi.setConfig({ testTimeout: 15000 });
      const result = await caller.ai.evaluateAnswerWithScheme({
        schemeImageUrl: "https://example.com/scheme.jpg",
        answerImageUrl: "https://example.com/answer.jpg",
      });

      expect(result.success).toBe(true);
      expect(result.evaluation).toBeDefined();
      expect(typeof result.evaluation).toBe("string");
    }, 15000);
  });
});
