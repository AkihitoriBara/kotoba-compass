# Chapter 4 — Interface Design System

A consistent interface is essential to creating a product that feels polished and trustworthy.

Kotoba Compass should prioritize clarity, readability and simplicity over visual complexity.

Every component should exist to support learning rather than distract from it.

The interface should feel like a modern productivity application instead of a traditional language learning app.

---

# Design Principles

The interface follows five guiding principles.

## 1. Information First

Educational content is always the highest priority.

Decorative elements should never compete with learning resources.

---

## 2. Consistency

Spacing, typography, colors and component behavior should remain consistent throughout the application.

A learner should immediately understand how every screen behaves.

---

## 3. Calm Design

Avoid visual clutter.

Animations, colors and effects should remain subtle.

The interface should reduce cognitive load rather than increase it.

---

## 4. Fast Interaction

The interface should always feel responsive.

Loading states should communicate progress without interrupting the learner.

---

## 5. Accessibility

Every interface element should remain usable using both keyboard and mouse.

Color should never be the only indicator of meaning.

---

# Design Language

Kotoba Compass follows a modern desktop application style inspired by professional developer tools and productivity software.

Examples of inspiration include:

- Visual Studio Code
- Raycast
- Arc Browser
- Zen Browser
- Linear
- Notion

The interface should appear lightweight, minimal and content-focused.

---

# Color Philosophy

Kotoba Compass supports both Dark Mode and Light Mode.

The default follows the user's system preference.

Users may manually override the theme in Settings.

The color palette should remain neutral with restrained accent colors.

Educational content should remain highly readable.

AI features should not receive excessive visual emphasis.

---

# Typography

Primary Font

Inter

Fallback

System UI fonts

Typography hierarchy

Heading

- Bold
- Large
- High emphasis

Section Title

- Semi-bold

Body Text

- Regular

Metadata

- Smaller font
- Lower contrast

Japanese text should always render using appropriate system fonts capable of displaying Japanese correctly.

---

# Spacing System

Use an 8-point spacing system.

Common spacing values include:

- 4px
- 8px
- 12px
- 16px
- 24px
- 32px

Consistent spacing improves readability and maintainability.

---

# Border Radius

Small Components

8px

Cards

12px

Buttons

10px

The interface should avoid both completely sharp corners and excessively rounded components.

---

# Icons

Use Lucide icons.

Icons should always support text rather than replace it.

Avoid icon-only buttons whenever practical.

---

# Shadows

Shadows should remain subtle.

The interface should rely primarily on spacing and contrast rather than heavy elevation.

---

# Animations

Animations should communicate state changes.

Examples include:

- Opening Companion Panel
- Loading AI responses
- Switching tabs
- Success notifications

Animations should be:

- Short
- Smooth
- Non-distracting

Avoid decorative animations.

---

# Companion Panel

The Companion Panel is the primary interface.

Approximate dimensions

Width

420px

Minimum Height

560px

Maximum Height

720px

The panel should resize naturally when additional content is displayed.

---

# Companion Panel Layout

```
┌─────────────────────────────┐

 Kotoba Compass

──────────────────────────────

📖 Dictionary
🧠 AI Tutor
📝 Card Generator

──────────────────────────────

Content Area

──────────────────────────────

Footer Actions

└─────────────────────────────┘
```

---

# Header

The header should include:

- Application logo
- Project name
- Settings button

The header remains visible while scrolling.

---

# Navigation

Three primary tabs.

Dictionary

AI Tutor

Card Generator

Only one tab is active at a time.

Switching tabs should preserve state whenever practical.

---

# Dictionary Layout

The Dictionary tab contains:

Expression

Reading

Meaning

Part of Speech

JLPT Level

Frequency

Pitch Accent

Native Audio

Example Sentence

Grammar Notes

Each section should be visually separated using cards or spacing.

---

# AI Tutor Layout

Conversation area

↓

User questions

↓

AI responses

↓

Suggested follow-up questions

↓

Input field

The conversation should remain contextual to the selected Japanese text.

---

# Card Generator Layout

Preview Card

↓

Editable fields

↓

Deck Selection

↓

Add to Anki

The learner should always preview the generated card before exporting.

---

# Buttons

Primary Button

Used for important actions.

Examples:

- Ask AI Tutor
- Generate Mining Card
- Add to Anki

Secondary Button

Used for navigation and optional actions.

Danger Button

Reserved for destructive actions.

---

# Cards

Cards should group related information.

Every card should contain one clear purpose.

Avoid nesting cards inside cards.

---

# Loading States

Use skeleton placeholders whenever content is loading.

Avoid blank screens.

Examples include:

- Dictionary lookup
- AI response
- Card generation

Loading indicators should communicate progress without distracting the learner.

---

# Empty States

Every empty state should guide the learner.

Examples:

"No text selected."

"Highlight Japanese text to begin."

"Start a conversation with the AI Tutor."

The interface should always explain what the learner should do next.

---

# Error States

Errors should explain:

- What happened.
- Why it happened when possible.
- How to recover.

Avoid technical language.

---

# Notifications

Use lightweight toast notifications.

Examples:

Card added to Anki.

Copied successfully.

AI response failed.

Notifications should disappear automatically after a short duration.

---

# Keyboard Navigation

Every interactive component should be keyboard accessible.

Common shortcuts include:

Tab

Shift + Tab

Enter

Escape

Arrow Keys

Visible focus indicators are required.

---

# Responsive Behavior

The Companion Panel should adapt to different browser window sizes.

Content should scroll rather than overflow.

Important actions should remain visible whenever practical.

---

# Component Philosophy

Every component should have one clear responsibility.

Examples include:

Header

Tabs

Information Card

Audio Player

Example Card

Grammar Card

Deck Selector

Action Footer

Small reusable components are preferred over large monolithic components.

---

# Design Consistency

Every new component added to the project should answer three questions.

1.

Does it improve the learning experience?

2.

Does it remain visually consistent with existing components?

3.

Can another developer understand its purpose immediately?

If any answer is "No", the component should be redesigned.

---

# Definition of Good Design

Good design should feel invisible.

The learner should remember what they learned, not the interface they used.

The Companion Panel should quietly support immersion while remaining fast, readable and enjoyable to use.

---

End of Chapter 4.

---

