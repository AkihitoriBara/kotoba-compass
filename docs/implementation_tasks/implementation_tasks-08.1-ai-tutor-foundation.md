# Implementation Tasks — Milestone 8.1 (AI Tutor Foundation)

## Data Models & Provider Abstraction

- [ ] Define `PromptMessages`, `AiTutorResponse`, `AiTutorExample`, `ProviderCapabilities`, `AiTutorProvider`, and `TutorAction` enum in `lib/ai-tutor/types.ts`.
- [ ] Ensure `AiTutorProvider.explain(messages: PromptMessages)` accepts ONLY `PromptMessages`.
- [ ] Create `MockAiTutorProvider` in `lib/ai-tutor/mock-provider.ts` returning deterministic canned responses (setting all optional capabilities to `false`).

---

## Validation, Prompt Building & Orchestration

- [ ] Create `PromptBuilder` in `lib/ai-tutor/prompt-builder.ts` generating provider-agnostic `PromptMessages` (`system`, `context`, `user`).
- [ ] Create `QuestionValidator` in `lib/ai-tutor/question-validator.ts` to allow Japanese learning queries and reject unrelated prompts.
- [ ] Create `AiTutorService` in `lib/ai-tutor/ai-tutor-service.ts` as the single orchestration layer holding internal `AiTutorRequest` model, handling prompt construction, validation, timeout, cancellation (`AbortController`), error normalization, and "Not Enough Context" handling.

---

## UI Components & Tab Integration

- [ ] Create `QuestionInput` component with structured `TutorAction` preset buttons (`Explain`, `Grammar`, `Nuance`, `Example`, `Mistakes`).
- [ ] Create structured response card components (`SummaryCard`, `GrammarCard`, `NuanceCard`, `ExampleCard`, `CommonMistakeCard`, `ContextRequiredCard`).
- [ ] Create `LoadingState`, `ErrorState`, and `EmptyState` views in AI Tutor tab.
- [ ] Update `CompanionPanel` AI Tutor tab to render active `TutorView`, interacting ONLY through `AiTutorService`.

---

## Verification & Testing

- [ ] Verify `AiTutorProvider.explain` accepts ONLY `PromptMessages`.
- [ ] Verify `AiTutorService` acts as the single orchestration layer for UI calls.
- [ ] Verify `QuestionValidator` rejects non-Japanese/unrelated prompts.
- [ ] Verify "Not Enough Context" handling for single particle selections (e.g. は).
- [ ] Verify Information Priority (Analysis Engine > Dictionary > Grammar > AI reasoning).
- [ ] Verify provider capabilities contract.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build`.