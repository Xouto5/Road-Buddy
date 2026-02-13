# Road App — Architecture Guide

This document explains:

- Where code should go
- How the project is structured
- Rules we must follow when adding new files
- How Firebase, Screens, Logic, and Features are organized

This keeps the project clean, scalable, and maintainable.

------------------------------------

# High-Level Project Structure

```
road-app/
├─ App.js
├─ app.json
├─ package.json
├─ babel.config.js
├─ assets/
└─ src/
   ├─ app/
   ├─ core/
   ├─ features/
   └─ navigation/
```

Everything inside `src/` is application code.

Root-level files are configuration only.

------------------------------------

# Root-Level Files (Do Not Move)

These must stay in the root:

- `App.js` → Entry point for Expo
- `app.json` → Expo configuration
- `package.json` → Dependencies + scripts
- `babel.config.js` → Build configuration
- `assets/` → Images, icons, static assets

Do NOT move these files into `src/`.

------------------------------------

# src/app/

Purpose: App bootstrap and global providers.

This folder is responsible for:

- App initialization
- Wrapping providers (AuthProvider, ThemeProvider, etc.)
- Global configuration

Keep business logic OUT of this folder.

------------------------------------

# src/core/

Purpose: Shared foundation code used across multiple features.

If more than one feature uses something, it belongs in `core/`.

Structure:

```
core/
├─ config/
├─ firebase/
├─ api/
├─ theme/
├─ ui/
├─ hooks/
└─ utils/
```

------------------------------------

## core/config/

Contains:

- Environment variable mapping
- Global constants
- App-level configuration

Example:
- `env.js`
- `constants.js`

------------------------------------

## core/firebase/

Contains Firebase setup and shared Firebase utilities.

Example structure:

```
firebase/
├─ firebase.js
├─ auth.js
├─ firestore.js
└─ index.js
```

- `firebase.js` → initializeApp
- `auth.js` → signIn, signOut, register
- `firestore.js` → common database helpers

⚠ Feature-specific Firebase logic does NOT go here.
That belongs in the feature's service layer.

------------------------------------

## core/api/

If we add external APIs later:

- axios client setup
- base URL configuration
- shared API interceptors

------------------------------------

## core/theme/

Shared styling configuration:

- Colors
- Spacing
- Typography

Do NOT hardcode global colors everywhere.

------------------------------------

## core/ui/

Reusable UI components used across multiple features.

Examples:
- Button
- Input
- Card
- Modal

If only one feature uses the component → keep it inside that feature.

------------------------------------

## core/hooks/

Reusable custom hooks used across features.

Examples:
- useAuth
- useDebounce
- useNetworkStatus

------------------------------------

## core/utils/

Shared helper functions.

Examples:
- formatCurrency()
- validateEmail()
- formatDate()

------------------------------------

# src/features/

Purpose: Feature-based modular architecture.

Each major feature gets its own folder.

Example:

```
features/
├─ auth/
├─ trip/
├─ cost/
└─ settings/
```

Each feature may contain:

```
feature-name/
├─ screens/
├─ components/
├─ services/
├─ hooks/
└─ utils/
```

------------------------------------

# Screens

Screens MUST live inside their feature.

Example:

```
features/auth/screens/LoginScreen.js
features/trip/screens/TripHomeScreen.js
```

Do NOT place screens inside `core/`.

------------------------------------

# Services (Business Logic)

Business logic lives inside:

```
features/<feature>/services/
```

Examples:

- Login logic
- Firestore reads/writes
- Cost calculation
- Trip creation logic

Example:

```
features/cost/services/costCalculator.js
```

This is where math like MPG calculations belongs.

------------------------------------

# Firebase Usage Rule

Firebase initialization:
```
core/firebase/
```

Feature-specific usage:
```
features/<feature>/services/
```

Example:

Auth service:
```
features/auth/services/authService.js
```

Trip database logic:
```
features/trip/services/tripService.js
```

------------------------------------

# src/navigation/

Contains navigation configuration.

Examples:
- Stack navigators
- Tab navigators
- Root navigator

Navigation logic should stay centralized here.

------------------------------------

# Code Placement Rules (IMPORTANT)

Before adding a file, ask:

1) Is it shared across features?
   → Put it in `core/`

2) Is it specific to one feature?
   → Put it in `features/<feature>/`

3) Is it UI reused in multiple places?
   → `core/ui/`

4) Is it calculation logic?
   → `features/<feature>/services/`

------------------------------------

# What NOT To Do

❌ Do NOT mix feature code into `core/`  
❌ Do NOT place business logic inside screens  
❌ Do NOT commit `.env`  
❌ Do NOT hardcode secrets  

------------------------------------

# Security Rules

- `.env` is local only.
- `.env.example` is committed.
- Never commit API keys.
- Never commit service account files.

------------------------------------

# Goal of This Architecture

- Scalable
- Clean separation of concerns
- Easy to maintain
- Easy to onboard new developers
- Clear ownership of features

------------------------------------

# Final Rule

If you are unsure where something goes,
ask before adding it.

Structure matters more than speed.