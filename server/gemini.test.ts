import { describe, it, expect } from "vitest";
import { invokeLLM } from "./server/_core/llm";

describe("Gemini API Integration", () => {
  it("should validate Gemini API key by making a test API call", async () => {
    try {
      const response = await invokeLLM({
        messages: [
          { role: "user", content: "Say 'Gemini API is working'" },
        ],
      });

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(response.choices.length).toBeGreaterThan(0);
      expect(response.choices[0].message.content).toBeDefined();
    } catch (error) {
      throw new Error(`Gemini API test failed: ${error}`);
    }
  }, 15000);
});
