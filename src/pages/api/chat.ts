import type { NextApiRequest, NextApiResponse } from "next";
import type { Message, Role } from "@prisma/client";
import prisma from "@/lib/db";

type MessageDto = {
  id: number;
  role: Role;
  content: string;
  createdAt: string;
};

type MessageResponse = {
  messages: MessageDto[];
};

const serializeMessages = (records: Message[]): MessageDto[] =>
  records.map(({ id, role, content, createdAt }) => ({
    id,
    role,
    content,
    createdAt: createdAt.toISOString()
  }));

const listMessages = async () => {
  const records = await prisma.message.findMany({
    orderBy: { createdAt: "asc" }
  });

  return serializeMessages(records);
};

const buildAssistantReply = (prompt: string) => {
  const seedResponses = [
    "Interesting thought! Could you expand on that?",
    `Here is what I heard: "${prompt}"`,
    "Sounds like you're planning something exciting.",
    "Thanks for sharing. What's the next step?"
  ];
  const index = Math.abs(prompt.trim().length) % seedResponses.length;
  return seedResponses[index];
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse | { error: string }>
) => {
  if (req.method === "GET") {
    const messages = await listMessages();
    res.status(200).json({ messages });
    return;
  }

  if (req.method === "POST") {
    const { content } = req.body as { content?: string };

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Message content is required." });
      return;
    }

    const sanitizedContent = content.trim().slice(0, 1500);

    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          role: "user",
          content: sanitizedContent
        }
      });

      await tx.message.create({
        data: {
          role: "assistant",
          content: buildAssistantReply(sanitizedContent)
        }
      });
    });

    const messages = await listMessages();
    res.status(201).json({ messages });
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
};

export default handler;
