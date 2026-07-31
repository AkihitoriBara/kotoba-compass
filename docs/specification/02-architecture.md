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

