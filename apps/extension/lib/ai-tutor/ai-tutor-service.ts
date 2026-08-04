import {
  AiTutorProvider,
  AiTutorRequest,
  AiTutorResponse,
  PromptMessages,
  TutorAction,
} from './types';
import { MockAiTutorProvider } from './mock-provider';
import { QuestionValidator } from './question-validator';
import { PromptBuilder } from './prompt-builder';

export interface ExplainOptions {
  userQuestion?: string;
  action?: TutorAction;
  context?: AiTutorRequest['context'];
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Single Orchestration Layer for the AI Tutor subsystem.
 * The UI communicates EXCLUSIVELY with AiTutorService.
 */
export class AiTutorService {
  private static instance: AiTutorService;
  private provider: AiTutorProvider;
  private activeAbortController: AbortController | null = null;

  private constructor(provider?: AiTutorProvider) {
    this.provider = provider || new MockAiTutorProvider();
  }

  public static getInstance(provider?: AiTutorProvider): AiTutorService {
    if (!AiTutorService.instance) {
      AiTutorService.instance = new AiTutorService(provider);
    } else if (provider) {
      AiTutorService.instance.provider = provider;
    }
    return AiTutorService.instance;
  }

  public setProvider(provider: AiTutorProvider): void {
    this.provider = provider;
  }

  public getActiveProviderName(): string {
    return this.provider.name;
  }

  /**
   * Orchestrates prompt validation, context assembly, prompt building,
   * provider execution, and timeout/cancellation management.
   */
  public async explain(
    sourceText: string,
    options: ExplainOptions = {}
  ): Promise<AiTutorResponse> {
    const { userQuestion = '', action, context, timeoutMs = 15000 } = options;

    // 1. Cancel any active pending request
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    this.activeAbortController = new AbortController();
    const currentSignal = this.activeAbortController.signal;

    // Listen to optional external signal
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        this.activeAbortController?.abort();
      });
    }

    // 2. Validate Question Relevance
    if (userQuestion.trim()) {
      const validation = QuestionValidator.validate(userQuestion, sourceText);
      if (!validation.valid) {
        return {
          summary: validation.redirectionMessage || 'I am designed specifically to help explain the currently selected Japanese text.',
          providerName: this.provider.name,
        };
      }
    }

    // 3. Construct Internal Service Request Model (Owned exclusively by AiTutorService)
    const request: AiTutorRequest = {
      sourceText,
      userQuestion,
      action,
      context,
    };

    // 4. Generate Provider-Agnostic PromptMessages via PromptBuilder
    const promptMessages: PromptMessages = PromptBuilder.build(request);

    // 5. Execute Provider with Timeout Handling & Cancellation Check
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('AI Tutor request timed out. Please try again.'));
        }, timeoutMs);

        currentSignal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Request cancelled.'));
        });
      });

      const providerPromise = this.provider.explain(promptMessages);
      const response = await Promise.race([providerPromise, timeoutPromise]);

      return response;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Request cancelled.') {
        throw err;
      }
      return {
        summary: err.message || 'An error occurred while generating explanation.',
        providerName: this.provider.name,
      };
    } finally {
      if (this.activeAbortController?.signal === currentSignal) {
        this.activeAbortController = null;
      }
    }
  }
}
