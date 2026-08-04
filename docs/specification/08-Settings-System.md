# Chapter 8 — Settings System

## Goal

Kotoba Compass should provide a centralized settings experience that allows users to customize the extension without modifying code or browser storage manually.

The Settings System acts as the configuration layer for the entire extension. Rather than each feature managing its own preferences independently, every configurable behavior is stored inside a unified settings model.

This chapter introduces the architecture, UI, storage layer, and navigation flow for extension settings.

---

# Design Principles

The Settings System should be:

- Centralized
- Extensible
- Persistent
- Independent from individual providers
- Easy to migrate when new settings are added

Settings should never contain feature logic.

They simply describe how the application should behave.

---

# User Experience

The Settings page replaces the current Companion Panel view.

```
Dictionary
AI Tutor
Mining Card

        ⚙
```

↓

```
← Back

Settings
```

The user always has a quick path back to the Dictionary tab.

---

# Categories

The settings page is divided into logical groups.

## General

General application preferences.

Example:

- Theme
- Language

---

## Dictionary

Controls visibility of dictionary-related providers.

- Vocabulary
- Kanji
- Names
- Grammar

---

## Translation

Controls Translation Provider.

- Enable Translation
- Translation Mode

---

## AI Tutor

Reserved for future milestones.

Initially displays placeholder information only.

---

## Mining

Controls Anki card generation.

Example:

- Front Card Format
- Furigana Preferences

---

## Advanced

Maintenance utilities.

Examples:

- Reset Settings
- Clear Cache (future)
- Version Information

---

# Unified Settings Model

All configuration should be stored in a single object.

Example hierarchy:

AnalysisSettings

├── dictionary

├── translation

├── aiTutor

├── mining

└── general

Future milestones should extend this model instead of creating additional storage helpers.

---

# Storage

Settings are persisted using browser.storage.local.

Every setting should have a default value.

Missing fields are automatically filled with defaults during loading.

---

# Navigation

Settings are not implemented as another tab.

Instead:

Dictionary

↓

Settings

↓

Back

This avoids unnecessary top-level navigation and keeps the primary workflow focused on learning.

---

# Future Compatibility

Upcoming milestones will extend the Settings System.

Examples:

- AI Provider selection
- API Keys
- Prompt preferences
- Translation Providers
- Mining Templates
- Keyboard Shortcuts
- Theme selection

No future milestone should require redesigning the settings architecture.