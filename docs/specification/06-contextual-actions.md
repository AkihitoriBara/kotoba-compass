# Chapter 6 - Browser Interaction & Contextual Actions

## Overview

Kotoba Compass is designed to integrate naturally into the user's reading experience.

Rather than requiring users to repeatedly move their cursor to the browser toolbar, the extension should surface contextual actions directly beside selected Japanese text.

The interaction should feel lightweight, unobtrusive, and respectful of the reading flow.

---

# Design Philosophy

The extension should never interrupt the user.

Nothing should appear unless the user explicitly selects Japanese text.

Hovering over text must never trigger any interface.

Selection is the only activation gesture.

---

# Selection Workflow

User selects Japanese text

↓

Selection detected

↓

Contextual Action Chip appears

↓

User clicks the chip

↓

Companion Panel opens

↓

Selected text is automatically loaded

↓

Dictionary lookup begins

---

# Contextual Action Chip

The floating chip acts as the primary entry point into Kotoba Compass.

Example:

🧭 Kotoba Compass

Characteristics:

- Small
- Lightweight
- Rounded pill design
- Appears near the selected text
- Fades in smoothly
- Fades out automatically
- Never blocks reading
- Never steals keyboard focus

---

# Positioning

The chip should appear close to the selected text while remaining inside the viewport.

It should intelligently reposition itself when:

- selection is near screen edges
- page is zoomed
- page is scrolled
- browser window is resized

The selected text itself should never become obscured.

---

# Companion Panel Launch

Selecting the chip immediately opens Kotoba Compass.

The selected text should already be available inside the Dictionary tab.

The user should never need to select the text again.

---

# Visibility Rules

Show the chip only when:

- Japanese text is selected

Hide the chip when:

- selection is cleared
- Escape is pressed
- user clicks elsewhere
- page changes
- timeout expires

---

# Accessibility

The contextual action must:

- support keyboard navigation
- expose ARIA labels
- respect reduced-motion preferences
- remain usable in both Light and Dark Mode

---

# Future Expansion

The contextual action architecture should be reusable for future browser interactions without redesigning the system.

End of Chapter 6

---
