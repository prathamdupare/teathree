import { Id } from "~/convex/_generated/dataModel";

export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isComplete?: boolean;
  createdAt: number;
  updatedAt: number;
  chatId: Id<"chats">;
  provider?: string;
  model?: string;
  metadata?: {
    tokenCount?: number;
    processingTime?: number;
    finishReason?: string;
  };
} 