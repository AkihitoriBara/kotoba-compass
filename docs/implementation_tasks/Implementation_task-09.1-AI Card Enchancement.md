# Tasks — Milestone 9.1 (AI Card Enhancement & Gemini Integration)

## Architecture & Providers

- [x] Create card-enhancement module.
- [x] Define CardEnhancement models.
- [x] Define EnhancedGeneratedCard.
- [x] Implement PromptBuilder.
- [x] Implement Validator.
- [x] Implement Mock Provider (`MockCardEnhancementProvider`).
- [x] Implement Gemini Provider (`GeminiCardEnhancementProvider`) using `process.env.GEMINI_API_KEY`.
- [x] Implement LRU Cache (`CardEnhancementCache`) with SHA-256 keys, max 250 entries, and 24h TTL.
- [x] Implement Enhancement Service (`CardEnhancementService`) with Gemini priority, cache lookup/save, and Mock fallback.

---

## UI

- [x] Replace placeholder sections.
- [x] Add Example Sentence card.
- [x] Add English Translation card.
- [x] Add Usage Note card.
- [x] Add loading skeleton.
- [x] Add graceful error state.

---

## Integration

- [x] Connect Card Generator.
- [x] Generate enhancement asynchronously.
- [x] Preserve deterministic preview.
- [x] Merge GeneratedCard + CardEnhancement into EnhancedGeneratedCard.

---

## Testing & Verification

- [x] Gemini provider selected when `GEMINI_API_KEY` exists.
- [x] Mock provider selected when key missing or API fails.
- [x] Cache hit on repeated requests (cached: true).
- [x] Cache miss on new prompts.
- [x] LRU eviction works (max 250 entries).
- [x] TTL expiration works (24 hours).
- [x] Invalid Gemini response falls back to Mock.
- [x] UI never blocks or crashes.
- [x] Run `pnpm typecheck`.
- [x] Run `pnpm build`.