# Milestone 2 - Browser Integration

## Objective

Implement the first browser interaction for Kotoba Compass.

The extension should capture the user's currently selected text from the active webpage and display it inside the Dictionary tab.

This milestone establishes the communication architecture between the browser, content scripts, and the popup.

---

# User Flow

User highlights Japanese text

↓

User opens Kotoba Compass

↓

Popup requests current selection

↓

Content Script retrieves selection

↓

Popup displays selected text

↓

If no text exists, show the existing empty state.

---

# Architecture

Current Webpage

↓

Content Script

↓

Extension Messaging

↓

Popup

↓

React State

↓

Dictionary Tab

---

# Components

## Content Script

Responsibilities:

- Read selected text.
- Respond to popup messages.
- Return plain text.

No AI.

No dictionary logic.

No translation.

---

## Popup

Responsibilities:

- Request selected text.
- Store selected text in React state.
- Display selection.
- Handle loading state.
- Handle empty state.
- Handle messaging failures.

---

# State

```ts
selectedText: string | null;

loading: boolean;

error: string | null;
```

---

# Error Handling

No active tab

↓

Display error

No selected text

↓

Display EmptyState

Messaging failure

↓

Display retry message

---

# Success Criteria

✅ Select text on any webpage.

✅ Open popup.

✅ Selected text appears.

✅ Empty state still works.

✅ Architecture prepared for future dictionary integration.

---

# Out of Scope

- Dictionary lookup
- AI Tutor
- Gemini
- Backend
- Anki
- Translation
- Grammar analysis
- OCR
