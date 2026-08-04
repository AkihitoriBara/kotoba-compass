# Implementation Plan — Milestone 8.0
# Settings System

This milestone introduces the centralized Settings System for Kotoba Compass.

The Settings System becomes the single source of truth for all configurable behaviors inside the extension.

---

# 1. Goal

Replace scattered feature-specific configuration with one unified settings architecture.

The Settings page provides a clean interface for users while keeping the application architecture modular and extensible.

---

# 2. User Review Required

> [!IMPORTANT]
>
> - Settings replace the current Companion Panel instead of opening another browser popup.
> - Settings are accessed via the existing gear icon.
> - Translation remains disabled by default.
> - AI Tutor configuration is intentionally postponed.
> - Every setting has a default value.
> - Missing values are automatically migrated during loading.

---

# 3. Data Model

## AnalysisSettings

The unified settings object becomes the single configuration model.

Example hierarchy:

AnalysisSettings

├── general

├── dictionary

├── translation

├── mining

└── aiTutor

No future feature should create independent storage helpers.

---

# 4. Storage

Create:

analysis-settings-storage.ts

Responsibilities:

- loadSettings()
- saveSettings()
- resetSettings()
- mergeDefaults()

The storage layer is responsible for data persistence only.

No UI logic belongs here.

---

# 5. UI Architecture

Create reusable components.

SettingsPage

↓

SettingsSection

↓

SettingRow

↓

Toggle / Select

This avoids duplicated layout code.

---

# 6. Navigation

Current

Dictionary

↓

Settings

↓

Back

The panel itself is reused.

Only the content changes.

---

# 7. Initial Sections

General

- Theme (placeholder)

Dictionary

- Vocabulary
- Kanji
- Names
- Grammar

Translation

- Enable Translation
- Translation Mode

Mining

- Front Card Format
- Furigana

AI Tutor

Placeholder

Advanced

- Reset Settings
- Version

---

# 8. Furigana Recommendation

When enabling Furigana on the front side of Mining Cards, display:

"It is generally recommended to memorize kanji by shape rather than relying on furigana."

Users may continue after confirmation.

---

# 9. Verification

## Automated

- pnpm typecheck

- pnpm build

---

## Manual

Verify:

✓ Settings open from gear icon

✓ Back button returns to Dictionary

✓ Settings persist after reload

✓ Translation toggle affects Translation Provider

✓ Dictionary toggles hide/show corresponding sections

✓ Furigana warning appears before enabling front-side furigana

✓ Reset Settings restores defaults