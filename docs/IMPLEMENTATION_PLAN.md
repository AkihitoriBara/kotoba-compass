# Milestone 3 - Contextual Action Chip

## Objective

Allow users to launch Kotoba Compass directly from selected Japanese text without needing to click the browser toolbar.

---

# User Flow

User selects Japanese text

↓

Floating Action Chip appears

↓

User clicks the chip

↓

Companion Panel opens

↓

Selected text is transferred into the Dictionary tab

---

# Components

## Selection Observer

Responsibilities:

- Monitor browser text selection.
- Detect selection changes.
- Ignore empty selections.

---

## Floating Action Chip

Responsibilities:

- Position near the selected text.
- Animate into view.
- Dismiss automatically.
- Launch Kotoba Compass.

---

## Positioning Engine

Responsibilities:

- Calculate screen coordinates.
- Avoid viewport overflow.
- Handle scrolling.
- Handle zoom.
- Handle resizing.

---

# Out of Scope

- Dictionary lookups
- AI Tutor
- Backend
- Gemini
- Anki
- Grammar explanations

---

# Success Criteria

- Selecting Japanese text displays the contextual action chip.
- Clicking the chip opens Kotoba Compass.
- Previously selected text is preserved.
- Chip positions correctly near selections.
- No unnecessary UI appears during normal browsing.
