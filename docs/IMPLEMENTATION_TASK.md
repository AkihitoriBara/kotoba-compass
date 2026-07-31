# Milestone 2

## Objective

Implement browser integration for reading the user's selected text.

---

# Scope

Implement:

- Content Script
- Extension messaging
- Active tab communication
- Selected text retrieval
- Popup state management
- Display selected text
- Loading state
- Error state

---

# Out of Scope

Do not implement:

- AI
- Dictionary
- Gemini
- Backend
- Storage
- OCR
- Translation
- Grammar parsing
- Anki generation

---

# Acceptance Criteria

The implementation is complete when:

- Selecting text on a webpage and opening the popup displays the selected text.
- Empty selections display the existing empty state.
- Errors are handled gracefully.
- Hot reload continues to work.
- Existing UI remains unchanged except where required to display selected text.

---

# Notes

Follow the architecture defined in PROJECT_SPECIFICATION.md Chapter 5.

Keep components small and modular.

Use WXT best practices.

Do not implement future milestones.

Stop after Milestone 2.
