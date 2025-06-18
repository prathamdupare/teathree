import { Id } from "~/convex/_generated/dataModel";

interface MessageMetadata {
  tokenCount?: number;
  processingTime?: number;
  finishReason?: string;
  reasoning?: string;
  reasoningTokens?: number;
}

interface UpdateOptions {
  messageId: Id<"messages">;
  content: string;
  metadata?: MessageMetadata;
  isComplete: boolean;
}

export class StreamingMessageManager {
  private lastContent: string = '';
  private updateTimer: ReturnType<typeof setTimeout> | null = null;
  private batchSize: number = 50; // Update every 50 characters
  private debounceMs: number = 100; // 100ms debounce
  private updateFn: (opts: UpdateOptions) => Promise<void>;

  constructor(updateFn: (opts: UpdateOptions) => Promise<void>) {
    this.updateFn = updateFn;
  }

  async updateMessage(opts: UpdateOptions) {
    const { messageId, content, metadata, isComplete } = opts;
    
    // Clear any pending updates
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }

    // Force immediate update if:
    // 1. Message is complete
    // 2. Content diff exceeds batch size
    // 3. No previous content (first update)
    const contentDiff = Math.abs(content.length - this.lastContent.length);
    const forceUpdate = isComplete || contentDiff >= this.batchSize || !this.lastContent;

    if (forceUpdate) {
      console.log('[StreamManager] Immediate update:', {
        contentLength: content.length,
        diff: contentDiff,
        isComplete
      });
      
      await this.updateFn({
        messageId,
        content,
        metadata,
        isComplete
      });
      
      this.lastContent = content;
      return;
    }

    // Debounce updates
    this.updateTimer = setTimeout(async () => {
      console.log('[StreamManager] Debounced update:', {
        contentLength: content.length,
        diff: contentDiff,
        isComplete
      });

      await this.updateFn({
        messageId,
        content,
        metadata,
        isComplete
      });
      
      this.lastContent = content;
      this.updateTimer = null;
    }, this.debounceMs);
  }

  reset() {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    this.lastContent = '';
  }
} 