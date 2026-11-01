import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { format } from "date-fns";
import { MapPinIcon, RotateCcwIcon, SendHorizontalIcon, SproutIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import Logo from "@/components/logo.tsx";
import { useFarm, type ChatMessage } from "@/components/providers/farm-context.ts";
import { SUGGESTED_PROMPTS, getMockReply } from "@/lib/mock/assistant.ts";
import { getLocation } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({ meta: [{ title: "Siesta, AI Farming Assistant | TerraBites" }] }),
  component: Assistant,
});

// Simulated "thinking" time for sample replies.
const REPLY_DELAY_MS = 1600;

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function Assistant() {
  const { messages, setMessages, locationId, profile } = useFarm();
  const loc = getLocation(locationId);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      text: trimmed,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: getMockReply(trimmed),
          sentAt: new Date().toISOString(),
        },
      ]);
      setTyping(false);
    }, REPLY_DELAY_MS);
  };

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 flex flex-col bg-background md:static md:-mb-10 md:h-screen">
      <header className="border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <span className="relative">
            <Logo showText={false} />
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-primary ring-2 ring-background" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-xl font-semibold">Siesta</h1>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPinIcon className="size-3" />
              Using data for {loc.city}
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Start a new chat"
              className="rounded-full"
              onClick={() => setMessages([])}
              disabled={typing}
            >
              <RotateCcwIcon className="size-5" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <AssistantBubble>
            Hi {firstName}! I'm Siesta, your farming assistant. I can read NASA
            satellite data for your area and help with planting, pests, water
            and weather. What would you like to know?
          </AssistantBubble>

          {messages.length === 0 && (
            <div className="flex flex-col gap-2 pl-11">
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Try asking
              </p>
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-left text-sm font-semibold transition-colors hover:border-primary hover:bg-secondary"
                >
                  <SproutIcon className="size-4 shrink-0 text-primary" />
                  {p}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-end gap-1"
              >
                <div className="max-w-[82%] rounded-3xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
                  {m.text}
                </div>
                <time dateTime={m.sentAt} className="pr-2 text-xs text-muted-foreground">
                  {format(new Date(m.sentAt), "h:mm a")}
                </time>
              </motion.div>
            ) : (
              <AssistantBubble key={m.id} time={m.sentAt}>
                {m.text}
              </AssistantBubble>
            ),
          )}

          {typing && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card/95 px-4 py-3">
        {messages.length > 0 && !typing && (
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="h-9 shrink-0 cursor-pointer rounded-full bg-secondary px-3 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/70"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder="Ask about crops, weather, pests…"
            aria-label="Message"
            className="max-h-32 min-h-12 resize-none rounded-2xl bg-background px-4 py-3 text-base"
          />
          <Button
            type="submit"
            size="icon-lg"
            aria-label="Send message"
            disabled={!draft.trim() || typing}
            className="size-12 shrink-0 rounded-2xl"
          >
            <SendHorizontalIcon className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
      <SproutIcon className="size-4" />
    </span>
  );
}

function AssistantBubble({
  children,
  time,
}: {
  children: React.ReactNode;
  time?: string;
}) {
  return (
    <motion.div
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      className="flex items-end gap-3"
    >
      <AssistantAvatar />
      <div className="flex max-w-[85%] flex-col gap-1">
        <div className="rounded-3xl rounded-bl-md border border-border bg-card px-4 py-3 leading-relaxed whitespace-pre-line">
          {children}
        </div>
        {time && (
          <time dateTime={time} className="pl-2 text-xs text-muted-foreground">
            Siesta · {format(new Date(time), "h:mm a")}
          </time>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3" aria-live="polite" aria-label="Assistant is typing">
      <AssistantAvatar />
      <div className="flex gap-1.5 rounded-3xl rounded-bl-md border border-border bg-card px-5 py-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn("size-2 rounded-full bg-primary")}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
