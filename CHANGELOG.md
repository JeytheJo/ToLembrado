# Changelog — Tô Lembrado

All notable changes to this project will be documented here.

---

## [0.6.0-alpha] — 2026-03-28
### Added
- Onboarding screen for new users (5 slides with swipe navigation)
  - Custom buttons to avoid Android navigation bar overlap
  - Shown only once on first launch
  - Logo with Modak font, emoji illustrations per feature
- Photo picker for user profiles (camera and gallery support)
  - Photo visible on home screen header
  - Photo visible on profile selection screen
  - Option to remove photo on edit screen
- TimePicker (DateTimePicker) for task time selection
  - Replaces keyboard input with native time picker dialog
  - Supports both clock and numeric input modes
- Notification action button "✓ Marcar como Feito"
  - Marks task as done directly from notification without opening app
  - Dismisses notification after marking as done
  - Home screen auto-reloads when app returns to foreground
- Android notification channel "tarefas" with high importance
- Monochrome notification icon for dark mode compatibility
- Glucometer icon support (PNG) for glucose monitoring tasks

### Changed
- FAB (+) button now fixed at bottom-right of screen (no longer scrolls with content)
- Home screen header now shows user profile photo when available
- Profile selection screen shows profile photo when available
- Task card status button text changed to "Não realizada!" for clarity
- Day of week selector now starts unselected (user must choose days)
- Back button (BotaoVoltar) redesigned with border and larger touch area

### Fixed
- Notification response listener now correctly handles MARCAR_FEITO action
- Circular import removed from notificacoes.js
- AppState subscription now uses correct 'change' event name
- gradle.properties cleaned of local Java path causing EAS Build failures
- app.json permissions deduplicated and syntax error fixed

---

## [0.5.0] — 2026-03-23
### Added
- EAS Build configured for Android development build
- Local notifications working on physical device
- Weekly scheduling per task and day of the week
- Notification permission request on first launch
- `expo-notifications` and `expo-dev-client` installed and configured

### Fixed
- Removed `org.gradle.java.home` from `gradle.properties` causing EAS Build failure
- Removed unused `react-native-reanimated` dependency blocking native compilation

---

## [0.4.0] — 2026-03-23
### Added
- History screen showing the last 7 days with task status per day
- History access button (📋) on the home screen
- Day grouping with summary of completed vs total tasks
- Expand/collapse per day in the history screen
- Notifications service (`src/services/notificacoes.js`)
- Native Android build setup with Android SDK and `local.properties`

---

## [0.3.0] — 2026-03-22
### Added
- Unified profile creation and editing screen
- Logo and greeting message on first launch
- Optional fields: description and general observations on profile
- Visual indicator for required fields with asterisk (*)
- Back button visible on the add new profile screen

### Changed
- `CadastroScreen` now supports `primeroAcesso` prop to switch layout
- "Add new profile" flow redirects to the same registration screen

---

## [0.2.0] — 2026-03-21
### Added
- Global accessibility theme (`src/constants/theme.js`)
  - Larger fonts (minimum 16px, default 18-22px)
  - Minimum touch target height of 56px on all buttons
  - High contrast color palette
- Reusable `BotaoAcessivel` component with variants (primary, secondary, danger)
- Accessible `BotaoVoltar` component with border and larger size
- Profile selection and management screen (`MudarPerfilScreen`)
  - Avatar with first letter of the name
  - Active profile indicator
  - Edit (✏️) and delete (🗑️) buttons per profile
  - Protection against deleting the only profile
- Profile editing screen (`EditarPerfilScreen`)
  - Edit name, age, description and general observations
  - Required field validation
- Task cards with visible emoji icon
- Three-dot menu (⋮) on cards with edit and delete options
- Confirmation dialog before deleting a task
- Support for editing existing tasks in `CadastroTarefaScreen`

### Changed
- `CadastroScreen` updated with accessibility standards
- `CadastroTarefaScreen` uses `BotaoVoltar` and `BotaoAcessivel`
- Home screen cards display emoji icon and highlight completed tasks

---

## [0.1.0] — 2026-03-20
### Added
- Initial project setup with Expo + React Native (JavaScript)
- Local SQLite database with 3 tables:
  - `perfil_usuario` — elderly person data
  - `medicamento` — tasks and medications with schedule and frequency
  - `historico_uso` — execution records by date
- First access / profile registration screen (`CadastroScreen`)
  - Button disabled until required fields are filled
- Home screen (`HomeScreen`)
  - Task listing for the day grouped by period (Morning, Afternoon, Night)
  - Day of the week filter via `frequencia_dias`
  - Mark task as done or not done
  - Floating action button (+) to add task
- Task registration screen (`CadastroTarefaScreen`)
  - Icon selection (💊 🩺 💧 🍽️ 🩹 🩸)
  - Title, quick instruction, time, days of the week and description
  - Required field validation
- State-based navigation system in `app/index.jsx`
- Git repository configured and published on GitHub

### Infrastructure
- Node.js v22, Expo SDK 54
- Dependencies: `expo-sqlite`, `expo-file-system`, `@react-navigation/native`
- Folder structure: `src/screens`, `src/components`, `src/database`, `src/assets`, `src/constants`
- `.gitignore` configured
- Custom `README.md`

---

## Upcoming
- [ ] Publish to Google Play Store (beta)
- [ ] Dark mode support
- [ ] Backup and restore data
- [ ] Multiple caregivers per profile