import { CardEnhancementProvider, PromptMessages, CardEnhancement } from './types';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Production-ready Gemini Card Enhancement Provider with comprehensive diagnostic logging.
 * Communicates with the Google Gemini API using structured JSON output or tolerant fallback parsing.
 */
export class GeminiCardEnhancementProvider implements CardEnhancementProvider {
  public readonly name = 'gemini';
  private readonly candidateModels = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
  ];

  private getApiKey(): string {
    try {
      // 1. Check Vite import.meta.env
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        const metaKey =
          // @ts-ignore
          import.meta.env.VITE_GEMINI_API_KEY ||
          // @ts-ignore
          import.meta.env.WXT_GEMINI_API_KEY ||
          // @ts-ignore
          import.meta.env.GEMINI_API_KEY;
        if (metaKey && typeof metaKey === 'string' && metaKey.trim()) {
          return metaKey.trim();
        }
      }

      // 2. Check Node / WXT process.env
      if (typeof process !== 'undefined' && process.env) {
        const procKey =
          process.env.VITE_GEMINI_API_KEY ||
          process.env.WXT_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY;
        if (procKey && typeof procKey === 'string' && procKey.trim()) {
          return procKey.trim();
        }
      }
    } catch (e) {
      if (isDev) {
        console.warn('[GeminiProvider] Exception while reading API key environment variable:', e);
      }
    }
    return '';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    const configured = Boolean(key);
    if (isDev) {
      console.log(`[GeminiProvider] isConfigured(): ${configured} (Key detected: ${configured ? 'YES' : 'NO'})`);
    }
    return configured;
  }

  public async enhance(messages: PromptMessages): Promise<CardEnhancement> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.error('[GeminiProvider] ERROR: GEMINI_API_KEY is missing or unconfigured.');
      throw new Error('GEMINI_API_KEY is missing or unconfigured.');
    }

    if (!apiKey.startsWith('AIzaSy')) {
      console.warn(
        `[GeminiProvider] WARNING: API key starting with '${apiKey.substring(
          0,
          5
        )}...' does not match standard Google AI Studio format ('AIzaSy...'). Google API gateway will return 400/404 for invalid keys.`
      );
    }

    const startTime = performance.now();

    const systemAndPrompt = `${messages.system}

CRITICAL: Return ONLY a raw valid JSON object matching the following schema:
{
  "exampleSentence": "A natural Japanese example sentence using the target word",
  "exampleTranslation": "A concise English translation of the example sentence",
  "usageNote": "A brief 1-2 sentence note explaining formality, typical nuance, or common collocations"
}

Do NOT wrap output in markdown codeblocks. Do NOT output any text before or after the JSON.

${messages.context}

User Instruction: ${messages.user}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemAndPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    };

    console.log('[GeminiProvider] --- DIAGNOSTIC REQUEST START ---');
    console.log('[GeminiProvider] Target Models:', this.candidateModels);
    console.log('[GeminiProvider] Request Payload:', JSON.stringify(payload, null, 2));

    let lastError: Error | null = null;

    for (const model of this.candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      console.log(`[GeminiProvider] Initiating HTTP POST request to endpoint: ${endpoint.replace(apiKey, '[REDACTED_API_KEY]')}`);

      let currentStatus = 0;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        currentStatus = response.status;
        console.log(`[GeminiProvider] Model: ${model} | HTTP Status: ${response.status} ${response.statusText}`);

        // Log Headers
        const headersObj: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          headersObj[key] = val;
        });
        console.log(`[GeminiProvider] Model: ${model} | Response Headers:`, JSON.stringify(headersObj, null, 2));

        const rawResponseBody = await response.text();
        console.log(`[GeminiProvider] Model: ${model} | COMPLETE RAW RESPONSE BODY:`);
        console.log(rawResponseBody);

        if (response.status === 404) {
          console.warn(`[GeminiProvider] Model ${model} returned 404 NOT_FOUND. Trying next model...`);
          lastError = new Error(`Gemini model ${model} returned 404 NOT_FOUND.`);
          continue;
        }

        if (!response.ok) {
          console.error(`[GeminiProvider] Model ${model} HTTP Error ${response.status}:`, rawResponseBody);
          throw new Error(`Gemini API returned HTTP status ${response.status}: ${rawResponseBody}`);
        }

        let data: any;
        try {
          data = JSON.parse(rawResponseBody);
        } catch (jsonErr) {
          console.error(`[GeminiProvider] Model ${model} failed to parse API response wrapper as JSON:`, rawResponseBody);
          throw new Error(`Failed to parse Gemini API wrapper as JSON: ${rawResponseBody}`);
        }

        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`[GeminiProvider] Model: ${model} | RAW CANDIDATE TEXT:`);
        console.log(candidateText || '(EMPTY CANDIDATE TEXT)');

        if (!candidateText) {
          throw new Error('Gemini API returned empty text content inside candidates.');
        }

        // Clean potential markdown wrapping (e.g. ```json ... ```)
        let cleanedText = candidateText.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          console.log('[GeminiProvider] Stripped markdown codeblock wrapper from model output.');
        }

        let parsed: any;
        try {
          parsed = JSON.parse(cleanedText);
        } catch (parseErr: any) {
          console.error('[GeminiProvider] JSON.parse failed on cleaned text. Raw text was:', cleanedText);
          console.error('[GeminiProvider] JSON Parse Error Details:', parseErr.message);

          // Tolerant fallback parser if JSON.parse fails
          parsed = this.tolerantParse(cleanedText);
          if (!parsed) {
            throw new Error(`JSON.parse failed on Gemini output: ${parseErr.message}. Raw text: "${cleanedText}"`);
          }
          console.log('[GeminiProvider] Tolerant parser successfully extracted fields from output!');
        }

        const elapsed = Math.round(performance.now() - startTime);
        console.log(`[GeminiProvider] Enhancement generated successfully using ${model} in ${elapsed}ms.`);
        console.log('[GeminiProvider] --- DIAGNOSTIC REQUEST END SUCCESS ---');

        return {
          exampleSentence: parsed.exampleSentence || parsed.sentence || '',
          exampleTranslation: parsed.exampleTranslation || parsed.translation || '',
          usageNote: parsed.usageNote || parsed.note || '',
          providerName: this.name,
          model: model,
          cached: false,
          responseTimeMs: elapsed,
        };
      } catch (err: any) {
        lastError = err;
        console.error(`[GeminiProvider] Error using model ${model}:`, err.message);
        if (currentStatus !== 404) {
          console.log('[GeminiProvider] --- DIAGNOSTIC REQUEST END FAILURE ---');
          throw err;
        }
      }
    }

    console.log('[GeminiProvider] --- DIAGNOSTIC REQUEST END FAILURE (ALL MODELS) ---');
    throw lastError || new Error('All candidate Gemini models failed.');
  }

  /**
   * Tolerant regex-based parser if JSON.parse fails on model text.
   */
  private tolerantParse(text: string): any | null {
    const exampleSentenceMatch = text.match(/"exampleSentence"\s*:\s*"([^"]+)"/i) || text.match(/"sentence"\s*:\s*"([^"]+)"/i);
    const exampleTranslationMatch = text.match(/"exampleTranslation"\s*:\s*"([^"]+)"/i) || text.match(/"translation"\s*:\s*"([^"]+)"/i);
    const usageNoteMatch = text.match(/"usageNote"\s*:\s*"([^"]+)"/i) || text.match(/"note"\s*:\s*"([^"]+)"/i);

    if (exampleSentenceMatch || exampleTranslationMatch || usageNoteMatch) {
      return {
        exampleSentence: exampleSentenceMatch ? exampleSentenceMatch[1] : '',
        exampleTranslation: exampleTranslationMatch ? exampleTranslationMatch[1] : '',
        usageNote: usageNoteMatch ? usageNoteMatch[1] : '',
      };
    }
    return null;
  }
}
