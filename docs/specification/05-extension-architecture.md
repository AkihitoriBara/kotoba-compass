# Chapter 5 - Browser Integration & Extension Architecture

## 5.1 Purpose

Kotoba Compass is fundamentally a browser extension.

Unlike traditional web applications, it must interact with the content currently displayed inside the user's browser while remaining lightweight, private, and unobtrusive.

This chapter defines how the extension communicates with webpages, captures user selections, and prepares the foundation for all future browser interactions.

---

# 5.2 Design Philosophy

The browser should remain the user's primary workspace.

Kotoba Compass should never interrupt reading or force the user to leave the page.

Instead, the extension quietly observes user intent and responds only when explicitly invoked.

The extension follows three guiding principles:

- Never interrupt reading.
- Never perform unnecessary processing.
- Only react to deliberate user actions.

---

# 5.3 Browser Interaction Model

Version 1 uses an explicit interaction model.

The extension never scans entire webpages automatically.

Instead, interaction begins only after the user intentionally selects text.

```
User reads webpage

↓

User highlights Japanese text

↓

User opens Kotoba Compass

↓

Extension retrieves selected text

↓

Popup displays the selection

↓

Future features operate on that selection
```

This workflow minimizes unnecessary permissions while keeping the experience predictable.

---

# 5.4 Content Script Architecture

Kotoba Compass uses a dedicated Content Script to communicate with webpages.

```
Current Webpage

↓

Content Script

↓

Extension Messaging

↓

Popup

↓

UI
```

Responsibilities of the Content Script include:

- Reading selected text
- Reading surrounding context
- Detecting page language
- Future DOM interactions
- Future floating companion panel

The Content Script should never perform AI processing or dictionary lookups.

Its responsibility is collecting browser information only.

---

# 5.5 Popup Responsibilities

The popup is responsible for presenting information.

It should never directly manipulate webpage content.

Responsibilities include:

- Display selected text
- Display dictionary results
- Display AI explanations
- Generate Anki cards
- Display loading and error states

Communication with webpages must always occur through extension messaging.

---

# 5.6 Messaging Philosophy

All communication between extension components should use message passing.

```
Popup

↓

Message

↓

Content Script

↓

Browser

↓

Response

↓

Popup
```

This architecture keeps responsibilities clearly separated and allows future expansion without tightly coupling components.

---

# 5.7 Selection Handling

The extension should only retrieve text when requested.

Automatic monitoring of user selections is intentionally avoided.

Expected behavior:

No selection:

```
No text selected.

Highlight Japanese text to begin.
```

Valid selection:

```
こんにちは
```

Very large selections:

The extension should gracefully truncate extremely large selections before processing.

Future versions may allow expanding the full text.

---

# 5.8 Supported Content

Version 1 supports:

- Plain text
- Japanese websites
- Mixed Japanese/English webpages
- Static webpage content

Version 1 does not support:

- Images
- PDFs
- Screenshots
- OCR
- Editable text fields
- Password fields

These may be added in future milestones.

---

# 5.9 Privacy Philosophy

Selected text remains local unless the user explicitly requests AI assistance.

Opening the popup alone should never send information to any external service.

Future AI requests will always be initiated by the user.

---

# 5.10 Error Handling

The extension should gracefully handle common browser situations.

Examples include:

No active tab

Display:

```
Unable to access the current tab.
```

No selected text

Display the default empty state.

Restricted browser pages

Display:

```
This page does not allow browser extensions.
```

Messaging failure

Display:

```
Unable to retrieve selected text.
Please try again.
```

Errors should always explain what happened without exposing technical details.

---

# 5.11 Accessibility

Browser interactions should remain keyboard accessible.

Users should be able to:

- Select text using the keyboard.
- Open the extension using keyboard shortcuts.
- Navigate the popup without a mouse.

All interactive controls should support focus indicators and ARIA labels.

---

# 5.12 Future Expansion

This architecture intentionally prepares the project for future milestones.

Future browser capabilities include:

- Floating companion panel
- Context menus
- Right-click actions
- Hover dictionary
- Sentence extraction
- Context awareness
- Page language detection
- Mining directly from subtitles
- Video player integration

These features should build upon the same messaging architecture defined in this chapter without requiring significant architectural changes.

End of Chapter 5.

---

