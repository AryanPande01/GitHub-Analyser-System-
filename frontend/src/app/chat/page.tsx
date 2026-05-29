"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { PageHeader } from "@/components/layout/sidebar";
import { ChatMessageContent } from "@/components/chat/message-content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getChatHistory, sendChat } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What project should I build next?",
  "Are my current projects worth hiring?",
  "Am I ready for interviews?",
  "What career path fits me best?",
];

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async (user: string) => {
    if (!user.trim()) {
      setMessages([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await getChatHistory(user.trim());
      setMessages(
        (res.data || []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.message,
        }))
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.trim().length >= 2) loadHistory(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username, loadHistory]);

  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!username.trim() || !msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    setError("");
    try {
      const res = await sendChat(username.trim(), msg);
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        title="AI Career Coach"
        description="Powered by Gemini — ask anything about your profile: projects, skills, interviews, career paths, and more."
        action={
          <div className="flex items-center gap-1.5 rounded-full border bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Gemini AI
          </div>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="GitHub username (must be analyzed first)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {loadingHistory && (
            <div className="flex items-center justify-center py-8 text-sm text-[var(--text-dim)]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversation…
            </div>
          )}

          {!loadingHistory && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-[var(--accent-glow)] p-4 text-[var(--accent)]">
                <Bot className="h-8 w-8" />
              </div>
              <p className="font-medium">Ask me anything about your GitHub career</p>
              <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">
                I know your repos, skills, readiness scores, and insights — and I&apos;ll answer naturally, not with profile dumps.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSend(s)}
                    disabled={!username.trim()}
                    className="rounded-full border px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[var(--accent)] text-black"
                    : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <ChatMessageContent content={msg.content} />
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-hover)]">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-glow)]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
              </div>
              <span className="text-sm text-[var(--text-dim)]">Gemini is thinking…</span>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="e.g. What project should I build next?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || !username.trim()}
            />
            <Button type="submit" disabled={loading || !username.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
      </Card>
    </div>
  );
}
