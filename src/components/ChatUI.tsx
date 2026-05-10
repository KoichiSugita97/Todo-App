import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const ChatUI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/chat");
      if (!response.ok) {
        throw new Error(`Failed to load conversation (${response.status})`);
      }
      const payload = (await response.json()) as { messages: Message[] };
      setMessages(payload.messages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }, []);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingMessage.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pendingMessage.trim() })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }

      const payload = (await response.json()) as { messages: Message[] };
      setMessages(payload.messages);
      setPendingMessage("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="card">
      <h1>Team Chat Prototype</h1>
      <p>
        Send a message to simulate a lightweight assistant. Messages persist in the database via Prisma.
      </p>
      <div className="chat-log" ref={scrollRef}>
        {hasMessages ? (
          messages.map((message) => (
            <div key={message.id} className={`message message--${message.role}`}>
              <span className="message__role">{message.role}</span>
              <p className="message__content">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span>[no messages]</span>
            <div>No messages yet. Start the conversation!</div>
          </div>
        )}
      </div>
      {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
      <form className="form" onSubmit={submit}>
        <textarea
          placeholder="Type a message..."
          value={pendingMessage}
          onChange={(event) => setPendingMessage(event.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending" : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatUI;
