import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { submitTextFeedback, submitAudioFeedback } from "../lib/hygraph";

export const server = {
  // Action for submitting text feedback
  submitText: defineAction({
    accept: "json",
    input: z.object({
      textContent: z.string().min(1, "Feedback cannot be empty").max(5000, "Feedback is too long"),
      language: z.string().optional().default("es"),
    }),
    handler: async ({ textContent, language }) => {
      try {
        const response = await submitTextFeedback(textContent, language);

        if (response.data?.createFeedback) {
          return {
            success: true,
            feedback: response.data.createFeedback,
          };
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create feedback entry",
        });
      } catch (error) {
        console.error("Error submitting text feedback:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to submit feedback",
        });
      }
    },
  }),

  // Action for submitting audio feedback
  submitAudio: defineAction({
    accept: "form",
    input: z.object({
      audio: z.instanceof(File, { message: "Audio file is required" }),
      language: z.string().optional().default("es"),
    }),
    handler: async ({ audio, language }) => {
      try {
        // Validate file type
        if (!audio.type.startsWith("audio/")) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Invalid file type. Only audio files are allowed.",
          });
        }

        // Convert File to Blob
        const audioBlob = new Blob([await audio.arrayBuffer()], {
          type: audio.type,
        });

        const response = await submitAudioFeedback(audioBlob, language);

        if (response.data?.createFeedback) {
          return {
            success: true,
            feedback: response.data.createFeedback,
          };
        }

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create audio feedback entry",
        });
      } catch (error) {
        console.error("Error submitting audio feedback:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to submit audio feedback",
        });
      }
    },
  }),
};
