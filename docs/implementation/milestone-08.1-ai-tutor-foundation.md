# Implementation Plan — Milestone 8.1 (AI Tutor Foundation)

This milestone introduces the extensible architectural foundation for the AI Tutor in Kotoba Compass.

The AI Tutor is designed specifically as a contextual Japanese learning assistant bound to the currently selected text — **NOT** a general-purpose chatbot.

---

# User Review Required

> [!IMPORTANT]
> - **Providers Consume `PromptMessages` ONLY**: `AiTutorProvider.explain(messages: PromptMessages)` accepts ONLY intermediate `PromptMessages`. Providers receive ZERO raw request objects or UI models.
> - **Internal Service Request Model**: `AiTutorRequest` is an internal service model owned by `AiTutorService`. The UI never constructs it.
> - **Provider Capabilities**: Providers expose `capabilities: ProviderCapabilities` (`supportsStreaming`, `supportsExamples`, `supportsImages`, `supportsAudio`). `MockAiTutorProvider` sets all capabilities to `false`.
> - **Single Orchestration Layer (`AiTutorService`)**: The UI interacts exclusively with `AiTutorService`. UI components have zero direct knowledge of providers.
> - **Response Schema Stability**: Core fields (`summary`, `grammar`, `nuance`, `example`, `commonMistake`) are a stable contract with identical semantics across providers.
> - **Information Priority Hierarchy**:
>   1. Language Analysis Engine output
>   2. Dictionary data
>   3. Grammar analysis
>   4. AI reasoning
>   Supplied context always overrides model internal reasoning.
> - **Mandatory Response Constraints**: Enforces 11 strict rules including prohibiting introduction of unneeded grammar concepts.
> - **"Not Enough Context" Handling**: Selecting isolated particles (e.g. は, を) returns `needsMoreContext: true` requesting surrounding context instead of hallucinating.
> - **Structured Actions (`TutorAction`)**: Preset questions use an enum model (`Explain`, `Grammar`, `Nuance`, `Example`, `Mistakes`).
> - **Deterministic Mock Provider**: `MockAiTutorProvider` produces repeatable canned outputs for testing and architecture verification.

---

# Proposed Changes

### 1. Data Models & Provider Abstraction

#### [NEW] [types.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/ai-tutor/types.ts)
Define data interfaces:
- `PromptMessages`: `system`, `context`, `user`.
- `ProviderCapabilities`: `supportsStreaming`, `supportsExamples`, `supportsImages`, `supportsAudio`.
- `AiTutorExample`: `japanese`, `english`, `explanation`.
- `AiTutorResponse`: `summary`, `grammar`, `nuance`, `example`, `commonMistake`, `learningTip`, `needsMoreContext`, `providerName`, `model`, `cached`, `responseTimeMs`.
- `TutorAction`: Enum (`Explain`, `Grammar`, `Nuance`, `Example`, `Mistakes`).
- `AiTutorProvider`: `name: string`, `capabilities: ProviderCapabilities`, `isConfigured(): boolean`, `explain(messages: PromptMessages): Promise<AiTutorResponse>`.

#### [NEW] [mock-provider.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/ai-tutor/mock-provider.ts)
- Implement `MockAiTutorProvider` consuming `PromptMessages` and returning deterministic, repeatable canned outputs.

---

### 2. Validation & Prompt Pipeline

#### [NEW] [question-validator.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/ai-tutor/question-validator.ts)
- Implement `QuestionValidator.validate(question, sourceText)` checking prompt relevance and rejecting non-Japanese/unrelated queries.

#### [NEW] [prompt-builder.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/ai-tutor/prompt-builder.ts)
- Constructs provider-agnostic `PromptMessages` enforcing Response Constraints and Information Precedence.

#### [NEW] [ai-tutor-service.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/ai-tutor/ai-tutor-service.ts)
- Single orchestration layer handling internal `AiTutorRequest` construction, provider selection, prompt construction (`PromptBuilder`), question validation (`QuestionValidator`), request cancellation (`AbortController`), timeout handling, error normalization, and "Not Enough Context" verification.

---

### 3. UI Components

#### [NEW] [tutor-view.tsx](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/components/tutor/tutor-view.tsx)
- Renders AI Tutor tab content interacting exclusively with `AiTutorService`.

#### [MODIFY] [companion-panel.tsx](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/components/companion-panel.tsx)
- Update `tutor` tab to render `TutorView` with current selection and analysis context.

---

# Verification Strategy

### Automated Tests
- `pnpm typecheck`
- `pnpm build`

### Manual Verification Checklist
- [ ] Provider receives ONLY `PromptMessages`.
- [ ] Context from Language Analysis Engine is injected into `PromptMessages` automatically.
- [ ] Selecting single particle (e.g. は) returns `needsMoreContext: true` requesting surrounding context.
- [ ] Unrelated questions ("Write Python code") are rejected with polite redirection message.
- [ ] Suggested `TutorAction` buttons populate query and dispatch structured action requests via `AiTutorService`.
- [ ] Information Priority is observed (supplied context overrides AI internal reasoning).
- [ ] Provider capabilities contract is respected.