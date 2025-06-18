interface StreamingSimulatorOptions {
  onUpdate: (content: string) => void;
  minDelay?: number;
  maxDelay?: number;
  adaptiveSpeed?: boolean;
  wordByWord?: boolean;
}

export class StreamingSimulator {
  private content: string = '';
  private displayContent: string = '';
  private currentIndex: number = 0;
  private isStreaming: boolean = false;
  private lastUpdateTime: number = 0;
  private recentDelays: number[] = [];
  private options: Required<StreamingSimulatorOptions>;
  private animationFrame: number | null = null;
  private wordBuffer: string[] = [];
  private lastChunkLength: number = 0;

  constructor(options: StreamingSimulatorOptions) {
    this.options = {
      onUpdate: options.onUpdate,
      minDelay: options.minDelay ?? 2, // Reduced for faster typing
      maxDelay: options.maxDelay ?? 8, // Reduced for faster typing
      adaptiveSpeed: options.adaptiveSpeed ?? true,
      wordByWord: options.wordByWord ?? false // Default to letter-by-letter
    };
  }

  private getAverageDelay(): number {
    if (!this.options.adaptiveSpeed || this.recentDelays.length === 0) {
      return (this.options.minDelay + this.options.maxDelay) / 2;
    }

    // Calculate average delay from recent updates
    const avg = this.recentDelays.reduce((a, b) => a + b, 0) / this.recentDelays.length;
    
    // Clamp between min and max delay
    return Math.max(
      this.options.minDelay,
      Math.min(this.options.maxDelay, avg)
    );
  }

  private getNextDisplayIndex(currentContent: string, currentIndex: number): number {
    if (!this.options.wordByWord) {
      // Add slight variation to make it feel more natural
      const char = currentContent[currentIndex];
      if (char === ' ' || char === '\n') {
        return currentIndex + 2; // Skip space/newline faster
      }
      return currentIndex + 1;
    }

    // Word-by-word logic remains unchanged
    let nextSpace = currentContent.indexOf(' ', currentIndex);
    let nextNewline = currentContent.indexOf('\n', currentIndex);
    let nextPunctuation = currentContent.slice(currentIndex).search(/[,.!?:;]/);
    if (nextPunctuation >= 0) nextPunctuation += currentIndex;

    const boundaries = [nextSpace, nextNewline, nextPunctuation]
      .filter(pos => pos >= 0)
      .sort((a, b) => a - b);

    if (boundaries.length === 0) {
      return currentIndex + 1;
    }

    return boundaries[0] + 1;
  }

  private updateDisplayContent = () => {
    if (!this.isStreaming || this.currentIndex >= this.content.length) {
      this.isStreaming = false;
      this.animationFrame = null;
      return;
    }

    const now = performance.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;
    let targetDelay = this.getAverageDelay();

    // Add micro-variations for more natural feel
    const char = this.content[this.currentIndex];
    if (char === '.' || char === '!' || char === '?') {
      targetDelay *= 2; // Slight pause at end of sentences
    } else if (char === ',' || char === ';') {
      targetDelay *= 1.5; // Tiny pause at commas
    } else if (char === ' ' || char === '\n') {
      targetDelay *= 0.5; // Speed through spaces
    }

    if (timeSinceLastUpdate >= targetDelay) {
      const nextIndex = this.getNextDisplayIndex(this.content, this.currentIndex);
      this.displayContent = this.content.slice(0, nextIndex);
      this.currentIndex = nextIndex;

      // Calculate actual characters added
      const charsAdded = nextIndex - this.currentIndex;
      
      // Adjust delay for large chunks
      if (charsAdded > 5) {
        targetDelay *= 1.2;
      }
      this.lastChunkLength = charsAdded;

      this.options.onUpdate(this.displayContent);
      this.lastUpdateTime = now;
    }

    this.animationFrame = requestAnimationFrame(this.updateDisplayContent);
  };

  updateContent(newContent: string) {
    const now = performance.now();
    
    if (this.content !== '') {
      // Calculate and store the delay since last content update
      const delay = now - this.lastUpdateTime;
      this.recentDelays.push(delay);
      
      // Keep only recent delays (last 5)
      if (this.recentDelays.length > 5) {
        this.recentDelays.shift();
      }

      // Calculate chunk size for adaptive timing
      const chunkSize = newContent.length - this.content.length;
      this.lastChunkLength = chunkSize;
    }

    this.content = newContent;
    this.lastUpdateTime = now;

    // Start streaming if not already started
    if (!this.isStreaming) {
      this.isStreaming = true;
      this.animationFrame = requestAnimationFrame(this.updateDisplayContent);
    }
  }

  stop() {
    this.isStreaming = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.content = '';
    this.displayContent = '';
    this.currentIndex = 0;
    this.recentDelays = [];
    this.wordBuffer = [];
    this.lastChunkLength = 0;
  }
} 