# Implementation Task
# Milestone 6

Read

- docs/specification/07-language-analysis-engine.md
- docs/IMPLEMENTATION_PLAN.md
- docs/IMPLEMENTATION_TASK.md

The Language Analysis Engine currently supports:

✓ Vocabulary Provider

✓ Kanji Provider

Implement the third provider:

NameProvider

Objectives

1. Research the best JMnedict source.

2. Design preprocessing pipeline.

3. Create NameEntry interface.

4. Implement NameProvider.

5. Register provider.

6. Build Companion Panel UI.

7. Add automated verification.

Do not implement:

- Grammar Provider
- AI Tutor
- Sentence parsing
- Mining Cards

Success Criteria

Selecting:

東京

returns:

Vocabulary

+

Name information

Selecting:

山田

returns

Surname

Selecting:

太郎

returns

Given Name

Selecting:

OpenAI

returns

No NameEntry.