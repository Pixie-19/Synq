# CLAUDE.md — Synq Developer Cheat Sheet

This document contains standard operating procedures, build commands, and coding guidelines for the **Synq** Expo project.

---

## 🚀 Key Commands

### Development Server
```bash
npx expo start
```
* **Interactive Shortcuts:**
  * `a`: Open on Android emulator / device
  * `i`: Open on iOS simulator / device
  * `w`: Open in Web browser
  * `r`: Reload the app bundle

### Build and Package
```bash
npx expo export          # Export static assets for deployment
npx eas build --profile development   # Build development client via EAS
```

### Verification & Linting
```bash
npx tsc --noEmit        # Run complete TypeScript compiler type-check
```

---

## 🎨 Architecture & Style Conventions

### 1. Style Guide (Theme Accents)
* **Backgrounds:** Strictly dark modern gradients (e.g. `['#06050C', '#0C0A1A', '#06050C']`).
* **Electric Violet:** `#8A2BE2` (Primary call to actions, user label highlights).
* **Neon Blue:** `#00F0FF` (Secondary interactive borders, stats values, ticks).
* **Hot Pink / Magenta:** `#FF007F` (UI Perfectionist accents, glowing rings).
* **Neon Orange:** `#FF5722` (Sleepless Builder labels).
* **Gold:** `#FFD700` (Pitch Wizard indicators, Emergency Fast-Match alert shields).

### 2. Glassmorphism Card Wrapper
* Always wrap visual blocks in the reusable `<GlassCard>` component (`src/components/GlassCard.tsx`) to enforce a premium, glass-like frosted background rather than using standard opaque borders.
* GlassCard takes `borderColor` and `backgroundColor` as customizable options:
```tsx
import { GlassCard } from '../components/GlassCard';

<GlassCard borderColor="rgba(0, 240, 255, 0.2)">
  <Text style={styles.cardText}>Frosted glow container content</Text>
</GlassCard>
```

### 3. State-Controlled Navigator Switching
* Synq uses a state-driven navigation manager in `AppContext.tsx` using `currentScreen` to maximize performance on Expo Go and bypass heavy navigator routers.
* To transition between screens, simply pull `setCurrentScreen` from the `useApp` hook:
```tsx
import { useApp } from '../context/AppContext';

const { setCurrentScreen } = useApp();
// Transition to chat room
setCurrentScreen('CHAT');
```

---

## 🛠️ Folder Structure Reference

* [src/types/index.ts](file:///c:/Users/RISHITA%20SEAL/OneDrive/Documents/hackathon/Synq/src/types/index.ts) - Contract profiles and data interfaces.
* [src/context/AppContext.tsx](file:///c:/Users/RISHITA%20SEAL/OneDrive/Documents/hackathon/Synq/src/context/AppContext.tsx) - Unified provider managing AI archetypes, chats, voice speaking, timer count downs, and telemetry builders.
* [src/components/](file:///c:/Users/RISHITA%20SEAL/OneDrive/Documents/hackathon/Synq/src/components) - Core visual widgets (`GlassCard`, high-fidelity animated `Confetti`).
* [src/screens/](file:///c:/Users/RISHITA%20SEAL/OneDrive/Documents/hackathon/Synq/src/screens) - Cinematic visual views.
