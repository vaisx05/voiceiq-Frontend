"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";
import { SendHorizontal, Loader2, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown"; // ✅ Markdown support
import { BASE_URL } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";

const ChatBox = ({ messages, setMessages }) => {
  const params = useParams();
  const uuid = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
    };
  }, [recordingInterval]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      const interval = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
      setRecordingInterval(interval);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      setTimeout(() => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        sendAudioMessage(audioBlob);
      }, 100);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    const placeholderMessage = {
      type: "user",
      text: "",
      timestamp: formatTimestamp(),
      isAudio: true,
      isProcessing: true,
    };

    setMessages((prev) => [...prev, placeholderMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");
      formData.append("uuid", uuid);

      const res = await fetch(`${BASE_URL}/voice_chat`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: data.user_prompt || "Voice message processed",
            isProcessing: false,
          };
          return updated;
        });

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: data.content,
            timestamp: formatTimestamp(),
          },
        ]);
      } else {
        showErrorMsg("Failed to process voice message");
      }
    } catch {
      showErrorMsg("Network error occurred");
    } finally {
      setIsLoading(false);
      setRecordingTime(0);
    }
  };

  const showErrorMsg = (text) => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        text,
        isProcessing: false,
      };
      return updated;
    });

    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: "Sorry, I couldn't process that audio message.",
        timestamp: formatTimestamp(),
      },
    ]);
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: input,
        timestamp: formatTimestamp(),
      },
    ]);

    // Helper to get token from cookies
    function getTokenFromCookies() {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      return match ? match[2] : null;
    }

    const token = getTokenFromCookies();

    const payload = { user_prompt: input, uuid };
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text:
            data.status === "success"
              ? data.content
              : "Sorry, I couldn't process that request.",
          timestamp: formatTimestamp(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Network error. Please try again later.",
          timestamp: formatTimestamp(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <SendHorizontal className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-foreground font-medium mb-2">No messages yet</h3>
      <p className="text-muted-foreground text-sm">
        Ask a question about this call or send a voice message to get started
      </p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-background rounded-lg overflow-hidden border border-border shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((msg: any, idx: any) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3",
                  msg.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.type === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    AI
                  </div>
                )}

                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm whitespace-pre-wrap",
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                        : "bg-muted text-foreground mr-auto rounded-tl-none"
                    )}
                  >
                    {msg.isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="h-3 w-1 bg-current rounded-full animate-pulse"
                              style={{
                                animationDelay: `${i * 200}ms`,
                                animationDuration: "1.2s",
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs opacity-75">
                          Processing audio...
                        </span>
                      </div>
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.type === "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                    You
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {isLoading && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-center gap-2 text-sm text-red-600">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span>Recording... {formatRecordingTime(recordingTime)}</span>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 px-3 bg-muted/50 text-foreground rounded-full outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background transition-colors"
          placeholder="Ask about this call..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRecording && handleSend()}
          disabled={isLoading || isRecording}
        />

        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          size="sm"
          className={cn(
            "rounded-full h-10 w-10 p-0 flex items-center justify-center flex-shrink-0",
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {isRecording ? (
            <Square size={18} className="fill-current" />
          ) : (
            <Mic size={18} />
          )}
        </Button>

        <Button
          onClick={handleSend}
          disabled={input.trim() === "" || isLoading || isRecording}
          size="sm"
          className={cn(
            "rounded-full h-10 w-10 p-0 flex items-center justify-center flex-shrink-0",
            input.trim() === "" || isRecording
              ? "bg-muted text-muted-foreground"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          <SendHorizontal size={18} className="text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
