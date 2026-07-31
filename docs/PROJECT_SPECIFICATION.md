# Kotoba Compass

> Your AI Japanese Immersion Companion

---

## Project Information

| Property     | Value            |
| ------------ | ---------------- |
| Project Name | Kotoba Compass   |
| Version      | 1.0.0 (Planning) |
| Status       | Draft            |
| Author       | Vivek Nayi       |
| Repository   | kotoba-compass   |
| License      | TBD              |

---

# Executive Summary

Kotoba Compass is an AI-powered browser extension that helps Japanese learners understand authentic Japanese content without interrupting immersion.

Instead of acting as another dictionary or translator, Kotoba Compass functions as an intelligent learning companion that explains vocabulary, grammar, sentence structure, nuance, pronunciation, and natural usage in context.

The extension combines high-quality language resources with AI tutoring to provide fast, reliable, and educational explanations directly from any webpage.

Kotoba Compass also serves as an intelligent Anki card generator, allowing learners to create production-quality mining cards from real-world content with minimal effort.

The goal is to reduce friction, encourage immersion, and help learners spend more time reading Japanese and less time searching for explanations.

Kotoba Compass is designed to be a product that learners genuinely use every day rather than a technical demonstration project.

---

# Vision

To become the most helpful AI-powered companion for Japanese immersion learners.

Kotoba Compass should feel like an experienced tutor sitting beside the learner while they read native Japanese content.

The extension should prioritize understanding, context, and long-term learning over simple translation.

Rather than replacing dictionaries or Anki, Kotoba Compass should connect them into one seamless learning experience.

---

# Mission Statement

Help learners spend more time reading Japanese and less time searching for explanations.

Learning should feel effortless.

The extension should remove friction while encouraging curiosity.

---

# Product Philosophy

Kotoba Compass follows six fundamental principles.

## 1. AI enhances learning.

AI exists to explain, teach and answer questions.

Reliable language resources such as dictionaries, pronunciation databases and grammar references should always provide the foundation.

AI should build upon those resources rather than replace them.

---

## 2. Fast first.

Useful information should appear immediately.

Dictionary definitions, readings, JLPT level, pitch accent, frequency information and pronunciation should load without waiting for AI.

AI explanations should always be optional enhancements.

---

## 3. Context matters.

Japanese cannot be understood by translating isolated words.

Kotoba Compass should explain grammar, sentence structure, nuance, natural usage and why something is written the way it is.

---

## 4. Stay immersed.

The learner should never feel forced to leave the content they are reading.

Every interaction should minimize interruption and encourage continuous immersion.

---

## 5. Quality over quantity.

Every feature must solve a real problem experienced by Japanese learners.

Features should never exist simply because they are technically possible.

---

## 6. Build cards worth studying.

Adding something to Anki should never feel like exporting dictionary data.

Kotoba Compass should generate production-quality mining cards that learners are happy to review months later.

---

# Goals

The primary goals of Version 1 are:

- Build a polished browser extension.
- Provide high-quality dictionary lookups.
- Explain grammar and nuance using AI.
- Encourage immersion rather than translation.
- Generate production-quality Anki mining cards.
- Minimize friction during reading.
- Deploy a production-ready application.
- Create an enjoyable and intuitive user experience.
- Build maintainable software with clean architecture.

---

# Non Goals

Version 1 will NOT include:

- User accounts
- Authentication
- Payments
- Social features
- Multiplayer
- AI memory
- Progress synchronization
- Mobile application
- Desktop application
- Gamification
- Building a flashcard review system
- Replacing Anki

Kotoba Compass creates excellent cards.

Anki remains responsible for scheduling, spaced repetition and reviewing.

These features may be considered for future releases.

---

# Target Audience

Kotoba Compass is designed for learners who:

- Read Japanese websites.
- Read manga.
- Read visual novels.
- Read news.
- Watch anime with subtitles.
- Use Anki.
- Study through immersion.
- Want deeper explanations than dictionaries provide.

The initial audience is expected to range between JLPT N5 and JLPT N1.

---

# Success Criteria

Version 1 will be considered successful if a learner can:

1. Highlight Japanese text on any supported webpage.

2. Instantly receive reliable dictionary information.

3. Understand the vocabulary, grammar and nuance.

4. Ask follow-up questions using AI when deeper explanations are needed.

5. Generate a high-quality Anki mining card.

6. Preview the generated card before saving it.

7. Add the card directly into an existing Anki deck.

All without leaving the webpage.

---

# Core User Workflow

Kotoba Compass is designed around one primary workflow.

```

Read Japanese

↓

Highlight a word, phrase or sentence

↓

Open Kotoba Compass

↓

View dictionary information

- Reading
- Meaning
- JLPT Level
- Pitch Accent
- Frequency
- Native Audio
- Example Sentence

↓

(Optional)

Ask AI Tutor

- Explain grammar
- Explain nuance
- Compare similar grammar
- Ask follow-up questions

↓

Generate Anki Card

↓

Preview Card

↓

Choose Deck

↓

Add directly to Anki

↓

Continue Reading

```

The learner should remain immersed throughout the entire workflow without repeatedly switching between different websites or applications.

# Product Tagline

Kotoba Compass

**Your AI Japanese Immersion Companion**

---

End of Chapter 1.

---

# Chapter 2 — Architecture & Engineering Decisions

This chapter defines the technical architecture of Kotoba Compass and explains why each engineering decision was made.

The purpose of this chapter is not only to document the chosen technologies, but also to explain the reasoning behind them so future contributors understand why the project was designed this way.

Every architectural decision in this project must answer one question:

> "Why is this the best decision for Kotoba Compass?"

If a technology cannot be justified, it should not be included.

---

# Engineering Philosophy

Kotoba Compass is intentionally being developed as an experiment in modern AI-assisted software engineering.

The objective is not to see whether an AI can generate code.

The objective is to evaluate whether a modern coding model can successfully build and maintain a production-quality software project when provided with a complete software specification and clear architectural guidance.

Throughout development, the AI is treated as a software engineer working within an established engineering process rather than a code generator.

The specification contained within this repository serves as the project's single source of truth.

Every implementation should follow this specification rather than inventing new architecture.

Whenever uncertainty exists, the specification takes priority.

---

# Core Engineering Principles

The project follows these engineering principles.

## Simplicity

Prefer simple solutions over clever ones.

Every dependency, abstraction and feature should provide clear value.

---

## Readability

Code should be written for humans first.

Maintainability is more important than writing fewer lines of code.

---

## Modularity

Every major feature should exist as an independent module.

Components should have a single responsibility.

Business logic should remain separate from presentation.

---

## Consistency

Naming conventions, folder structures and coding patterns should remain consistent throughout the project.

Consistency improves maintainability and makes AI-generated code easier to review.

---

## Scalability

Although Version 1 intentionally avoids unnecessary complexity, the architecture should make future expansion straightforward.

Future features should integrate naturally rather than requiring significant rewrites.

---

## Cross-Platform Compatibility

Whenever practical, implementation should rely on standardized WebExtension APIs rather than browser-specific functionality.

The goal is to maximize compatibility while minimizing browser-specific code.

If browser-specific implementations become necessary, they should be isolated behind clearly documented abstractions.

---

## Performance

Fast interactions are critical.

Dictionary lookups should appear almost instantly.

AI should enhance the experience rather than slowing it down.

---

# Repository Architecture

Kotoba Compass will be developed as a monorepo.

```
kotoba-compass/

apps/
    extension/
    backend/

packages/
    shared/
    types/
    prompts/

docs/

docker/

scripts/
```

---

# Why a Monorepo?

A monorepo allows every application to share code while remaining independently deployable.

Benefits include:

- Shared TypeScript types.
- Shared utility functions.
- Shared AI prompt templates.
- Shared validation logic.
- Consistent tooling.
- Simplified dependency management.
- Easier long-term maintenance.

This architecture reduces duplicated code while keeping responsibilities clearly separated.

---

# Package Manager

The project will use **pnpm**.

## Why pnpm?

Compared to npm, pnpm offers:

- Faster installations.
- Better monorepo support.
- Reduced disk usage.
- Excellent TypeScript integration.
- Modern workspace management.

Since Kotoba Compass is a multi-application project, pnpm provides a better long-term developer experience.

---

# Technology Stack

## Browser Extension

- WXT
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Why?

WXT provides a modern browser extension framework with excellent TypeScript support, rapid development tooling and compatibility with the WebExtensions standard.

Version 1 officially targets Chromium-based browsers and Firefox-based browsers, allowing Kotoba Compass to work on browsers such as Google Chrome, Microsoft Edge, Brave, Vivaldi, Opera, Firefox and Zen Browser.

The architecture should remain browser-agnostic whenever possible so future browser support can be added with minimal changes.

React provides a component-based UI architecture that is maintainable and familiar.

TypeScript improves maintainability and catches errors during development.

Tailwind CSS enables rapid UI development while maintaining consistent styling.

shadcn/ui provides accessible, customizable UI components without introducing unnecessary abstraction.

# Supported Browsers

Kotoba Compass follows the WebExtensions standard.

Version 1 officially supports:

- Google Chrome
- Mozilla Firefox
- Zen Browser
- Microsoft Edge
- Brave
- Vivaldi
- Opera

Other browsers that support the WebExtensions API should require little to no additional development.

Browser-specific functionality should only be implemented when absolutely necessary.

Whenever possible, the codebase should rely on standardized browser APIs rather than vendor-specific implementations.

---

## Backend

- Node.js
- Express
- TypeScript
- Gemini SDK
- Zod
- Pino

### Why?

Express is lightweight, mature and well understood.

The backend only exists to securely communicate with AI providers and perform server-side processing.

No server-rendered frontend is required.

TypeScript allows types to be shared across the entire project.

Zod provides runtime validation for every request and response.

Pino offers structured logging with minimal overhead.

---

# AI Architecture

The application will communicate with AI through an abstraction layer.

```
Extension

↓

Backend API

↓

AI Provider

↓

Gemini
```

Although Version 1 only supports Gemini, the abstraction allows additional providers to be added later without modifying application logic.

Future providers may include:

- OpenRouter
- Ollama
- Claude
- OpenAI

This approach isolates provider-specific code from the rest of the application.

---

# Why the Backend Exists

The backend exists for three reasons.

## 1. Security

API keys should never be exposed inside a browser extension.

Keeping AI requests server-side protects credentials.

---

## 2. Future Expansion

The backend creates a natural location for future features including:

- AI response caching.
- Analytics.
- Rate limiting.
- Multiple AI providers.
- User synchronization.

---

## 3. Maintainability

Business logic should remain outside the browser extension whenever practical.

The extension should remain focused on the user experience.

---

# Database Strategy

Version 1 intentionally does **not** include a database.

## Why?

Kotoba Compass currently has no persistent user data that requires storage.

Adding PostgreSQL and Prisma during Version 1 would increase project complexity without providing meaningful user value.

When future features such as caching, analytics or synchronization become necessary, a database can be introduced without changing the overall architecture.

---

# Extension Responsibilities

The browser extension is responsible for:

- Detecting highlighted Japanese text.
- Opening the popup interface.
- Displaying dictionary information.
- Displaying AI responses.
- Generating Anki cards.
- Communicating with the backend.
- Managing local settings.

The extension should remain lightweight, responsive and independent of any specific browser implementation.

---

# Backend Responsibilities

The backend is responsible for:

- Receiving lookup requests.
- Communicating with AI providers.
- Validating requests.
- Formatting AI responses.
- Handling provider-specific logic.
- Protecting API keys.

The backend should not contain unnecessary business logic.

---

# Local Storage Strategy

Version 1 stores user preferences locally.

Examples include:

- Theme.
- Preferred deck.
- Keyboard shortcuts.
- Popup preferences.

No user accounts are required.

---

# Dependency Philosophy

Every dependency must satisfy at least one of the following requirements:

- Significantly improves developer experience.
- Solves a difficult engineering problem.
- Improves maintainability.
- Improves accessibility.
- Improves performance.

Dependencies should never be added solely because they are popular.

---

# Product Validation Philosophy

Every major feature should solve a real problem experienced during the author's own Japanese learning journey.

If a feature does not improve the immersion workflow or reduce friction for learners, its inclusion should be questioned.

Kotoba Compass is intended to be used daily by its own developer.

This ensures that product decisions are driven by practical experience rather than hypothetical use cases.

---

# Architecture Philosophy

Kotoba Compass follows one architectural principle above all others.

> Keep the product simple for users while keeping the architecture flexible for future developers.

Users should experience an intuitive, lightweight extension.

Developers should work within a clean, maintainable and well-documented codebase.

These goals are equally important.

---

End of Chapter 2.

---

# Chapter 3 — User Experience & Core Workflow

Technology exists to serve the user experience.

Regardless of how sophisticated the underlying architecture becomes, Kotoba Compass should always feel simple, intuitive and enjoyable to use.

This chapter defines the intended experience from the learner's perspective.

Every interaction should reduce friction, encourage curiosity and help learners remain immersed in Japanese content.

---

# User Experience Philosophy

Kotoba Compass should never feel overwhelming.

The learner should always understand:

- What just happened.
- What information is available.
- What they can do next.
- Why the information is useful.

Every interaction should naturally guide the learner through the learning process.

The interface should feel calm, focused and educational rather than crowded with features.

---

# The Learning Flow

Kotoba Compass is designed around a single primary workflow.

```

Read Japanese

↓

Find something interesting

↓

Highlight a word, phrase or sentence

↓

Open Kotoba Compass

↓

Understand it

↓

Become curious

↓

Ask questions

↓

Generate a high-quality Anki mining card

↓

Continue reading

```

The learner should never need to leave the webpage unless they choose to.

Every feature exists to support this workflow.

---

# Core User Journey

A typical learning session should look like this.

1. The learner is reading Japanese content.

2. They discover an unfamiliar word, grammar point or sentence.

3. They highlight the text.

4. Kotoba Compass opens.

5. Dictionary information appears immediately.

6. The learner understands the basics.

7. If deeper understanding is needed, they ask the AI Tutor.

8. Once satisfied, they generate an Anki mining card.

9. They preview the generated card.

10. They choose an Anki deck.

11. The card is added directly to Anki.

12. The learner continues reading without breaking immersion.

This journey represents the ideal experience that every feature should support.

---

# The Companion Panel

The primary interface of Kotoba Compass is the Companion Panel.

The panel should appear quickly, remain lightweight and provide all essential information without feeling cluttered.

The learner should never need multiple windows for a single lookup.

---

# Companion Panel Structure

The Companion Panel is divided into three primary sections.

```

📖 Dictionary

🧠 AI Tutor

📝 Card Generator

```

Each section has a distinct responsibility.

---

## 📖 Dictionary

The Dictionary tab provides reliable language information.

It should appear first because it is fast, factual and immediately useful.

Information includes:

- Expression
- Reading
- Meaning
- Part of Speech
- JLPT Level
- Frequency
- Pitch Accent
- Native Audio
- Example Sentence

Dictionary information should be available even if AI services are unavailable.

---

## 🧠 AI Tutor

The AI Tutor explains the language rather than simply defining it.

Example interactions include:

- Explain this grammar.
- Why was this word chosen?
- Compare similar grammar.
- Give additional examples.
- Explain the nuance.
- Rewrite using simpler Japanese.

The AI Tutor should feel conversational.

Each answer should encourage deeper understanding instead of simply providing a translation.

The learner should be able to continue asking follow-up questions without losing context.

---

## 📝 Card Generator

The Card Generator transforms what the learner has just studied into a production-quality Anki mining card.

The learner should not need to manually collect information from multiple sources.

Generated cards should require little to no editing before being added to Anki.

---

# Information Priority

Information should appear in the following order.

1. Dictionary information

2. Pronunciation resources

3. Grammar information

4. AI explanations

5. Card generation

This order prioritizes speed while keeping AI as an enhancement rather than a dependency.

---

# Companion Panel Layout

The interface should follow a clear visual hierarchy.

```

Expression

Reading

Meaning

────────────────────────

JLPT

Frequency

Pitch Accent

Audio

────────────────────────

Example Sentence

────────────────────────

AI Tutor

────────────────────────

Generate Mining Card

```

Important information should always remain visible without requiring unnecessary scrolling.

---

# User Motivation

Kotoba Compass should encourage curiosity rather than simply answering questions.

Instead of ending the learning experience after providing a definition, the interface should naturally invite further exploration.

Examples include:

- "Want to know why this grammar is used?"
- "Compare with a similar expression."
- "Generate a mining card."
- "Listen to native pronunciation."

The goal is to make learning feel rewarding instead of transactional.

---

# Interaction Philosophy

Every interaction should require minimal effort.

The learner should never wonder:

"What am I supposed to do next?"

Instead, the interface should naturally guide them toward the next meaningful action.

Understanding should lead to curiosity.

Curiosity should lead to learning.

Learning should lead to retention.

Retention should happen through Anki.

---

# Keyboard Shortcuts

Version 1 should support keyboard-first interaction.

Common actions include:

- Open Companion Panel.
- Navigate between tabs.
- Generate mining card.
- Send card to Anki.
- Close the panel.

Keyboard shortcuts should be configurable through Settings.

---

# Mouse Interaction

The extension should also work naturally using only a mouse.

Typical workflow:

Highlight text

↓

Click floating action button (optional)

↓

Open Companion Panel

↓

Navigate tabs

↓

Generate mining card

↓

Return to reading

No feature should require a keyboard.

---

# Loading States

Loading should feel intentional.

The learner should always understand what the application is doing.

Examples include:

- Loading dictionary...
- Asking AI Tutor...
- Generating mining card...
- Connecting to Anki...

Instead of empty screens, use lightweight skeleton placeholders and subtle loading indicators.

---

# Error Handling

Errors should explain what happened and how to recover.

Examples:

- AI service unavailable.
- Unable to connect to backend.
- Could not reach AnkiConnect.
- No Japanese text detected.
- Network connection lost.

Whenever possible, provide an actionable next step.

---

# Accessibility

Kotoba Compass should be accessible to as many learners as possible.

Version 1 should include:

- Keyboard navigation.
- Screen reader support where practical.
- Sufficient color contrast.
- Readable typography.
- Clear focus indicators.
- Responsive layouts.

Accessibility should be considered a core requirement rather than an optional enhancement.

---

# Visual Design Philosophy

The interface should feel modern, clean and distraction-free.

Avoid unnecessary animations, excessive colors and decorative elements that compete with educational content.

Visual hierarchy should guide attention naturally.

Educational information should always take priority over aesthetics.

---

# Product Validation Philosophy

Every feature should solve a real problem encountered during Japanese immersion.

Features should not be added simply because they are technically interesting.

Kotoba Compass is intended to become part of the developer's own daily study routine.

If a feature does not improve the immersion workflow or reduce friction, its inclusion should be questioned.

---

# Definition of Success

A successful interaction should leave the learner thinking:

"I understand this now."

"I learned something new."

"I want to keep reading."

The greatest compliment Kotoba Compass can receive is that it quietly disappears into the learner's workflow, making immersion easier without demanding attention.

---

End of Chapter 3.
