import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types/hygraph";
import { actions } from "astro:actions";

const STORAGE_KEY = "feedback-chat-history";

// System messages
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  type: "system",
  content: "¡Bienvenido! Por favor comparte tu opinión sobre el evento.",
  timestamp: Date.now(),
  isUser: false,
};

const CONFIRMATION_MESSAGE: ChatMessage = {
  id: `confirm-${Date.now()}`,
  type: "system",
  content: "¡Gracias! Tu opinión ha sido recibida.",
  timestamp: Date.now(),
  isUser: false,
};

export default function FeedbackChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingMessageId, setUploadingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedMessages = JSON.parse(stored);
        // Filter out any messages with blob URLs (they're no longer valid)
        const validMessages = parsedMessages.filter((msg: ChatMessage) => {
          if (msg.type === "audio" && msg.content.startsWith("blob:")) {
            return false; // Skip invalid blob URLs
          }
          return true;
        });
        setMessages(validMessages.length > 0 ? validMessages : [WELCOME_MESSAGE]);
      } catch (e) {
        console.error("Error parsing chat history:", e);
        setMessages([WELCOME_MESSAGE]);
      }
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle text submission
  const handleSendText = async () => {
    if (!inputText.trim() || isSubmitting) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "text",
      content: inputText,
      timestamp: Date.now(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const textToSubmit = inputText;
    setInputText("");
    setIsSubmitting(true);
    setError(null);

    try {
      // Call Astro Action - this runs on the server
      const { data, error } = await actions.submitText({
        textContent: textToSubmit,
        language: "es",
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessages((prev) => [
        ...prev,
        { ...CONFIRMATION_MESSAGE, id: `confirm-${Date.now()}` },
      ]);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(
        "No se pudo enviar tu opinión. Por favor intenta de nuevo."
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "system",
          content:
            "No se pudo enviar tu opinión. Por favor intenta de nuevo.",
          timestamp: Date.now(),
          isUser: false,
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "No se pudo acceder al micrófono. Por favor verifica los permisos."
      );
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    stopRecording();
    // Clean up blob URL to prevent memory leaks
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  // Send audio
  const handleSendAudio = async () => {
    if (!audioBlob || isSubmitting) return;

    const tempMessageId = `audio-${Date.now()}`;
    const audioMessage: ChatMessage = {
      id: tempMessageId,
      type: "audio",
      content: audioPreviewUrl || "", // Temporary blob URL for immediate display
      timestamp: Date.now(),
      isUser: true,
    };

    setMessages((prev) => [...prev, audioMessage]);
    setIsSubmitting(true);
    setUploadingMessageId(tempMessageId);
    setError(null);

    try {
      // Convert Blob to File for form submission
      const audioFile = new File([audioBlob], `feedback-${Date.now()}.webm`, {
        type: audioBlob.type,
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("language", "es");

      // Call Astro Action - this runs on the server
      const { data, error } = await actions.submitAudio(formData);

      if (error) {
        throw new Error(error.message);
      }

      // Update the message with the actual Hygraph URL
      const hygraphUrl = data?.feedback?.audioFile?.url;
      if (hygraphUrl) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === tempMessageId) {
              // Clean up the old blob URL to prevent memory leaks
              if (msg.content.startsWith("blob:")) {
                URL.revokeObjectURL(msg.content);
              }
              return { ...msg, content: hygraphUrl };
            }
            return msg;
          })
        );
      }

      setMessages((prev) => [
        ...prev,
        { ...CONFIRMATION_MESSAGE, id: `confirm-${Date.now()}` },
      ]);
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      setRecordingTime(0);
      setUploadingMessageId(null);
    } catch (err) {
      console.error("Error submitting audio:", err);
      setError(
        "No se pudo enviar tu audio. Por favor intenta de nuevo."
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "system",
          content:
            "No se pudo enviar tu audio. Por favor intenta de nuevo.",
          timestamp: Date.now(),
          isUser: false,
        },
      ]);
      setUploadingMessageId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)] max-h-screen overflow-auto bg-[#0d1418]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.isUser
                  ? "bg-[#005c4b] text-white rounded-br-none"
                  : "bg-[#1f2c34] text-white rounded-bl-none"
              }`}
            >
              {msg.type === "audio" ? (
                <div>
                  <audio
                    src={msg.content}
                    controls
                    className="max-w-full"
                    preload="metadata"
                  />
                  {uploadingMessageId === msg.id && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-300">
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                      <span>Subiendo audio...</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm md:text-base break-words">
                  {msg.content}
                </p>
              )}
              <span className="text-xs text-gray-400 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-white text-sm">
          {error}
        </div>
      )}

      {/* Audio preview */}
      {audioPreviewUrl && !isRecording && (
        <div className="px-4 py-3 bg-[#1f2c34] border-t border-gray-700">
          <div className="flex items-center gap-3">
            <audio
              src={audioPreviewUrl}
              controls
              className="flex-1"
              preload="metadata"
            />
            <button
              onClick={cancelRecording}
              className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSendAudio}
              className="px-3 py-2 text-sm bg-[#005c4b] hover:bg-[#004a3d] text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="px-4 py-3 bg-[#1f2c34] border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm">
                Grabando... {formatTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Detener
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      {!audioPreviewUrl && !isRecording && (
        <div className="px-4 py-3 bg-[#1f2c34] border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              placeholder="Escribe tu opinión..."
              className="flex-1 px-4 py-3 bg-[#2a3942] text-white rounded-lg outline-none focus:ring-2 focus:ring-[#005c4b] placeholder-gray-400"
              disabled={isSubmitting}
            />
            {inputText.trim() ? (
              <button
                onClick={handleSendText}
                disabled={isSubmitting}
                className="p-3 bg-[#005c4b] hover:bg-[#004a3d] text-white rounded-lg transition-colors disabled:opacity-50"
                aria-label="Enviar mensaje"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={isSubmitting}
                className="p-3 bg-[#005c4b] hover:bg-[#004a3d] text-white rounded-lg transition-colors disabled:opacity-50"
                aria-label="Grabar audio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
