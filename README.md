# Deep Link Controller

A developer utility for launching, inspecting, and debugging mobile deep links. Built with [Expo](https://expo.dev) (SDK 57) and [React Native](https://reactnative.dev).

If you build mobile apps that use deep links — custom schemes (`myapp://...`), Universal Links (iOS), or App Links (Android) — this app helps you test them: type a link, inspect how it parses, hand it to the OS, and observe which links get delivered back to an app.

## What you can do with it

- **Launch links (Launcher tab)** — Type or paste any URL, see it classified (custom scheme / HTTPS / invalid), inspect its scheme, host, path, and query parameters, then hand it to the operating system. Results are reported honestly: "opened" only means the OS accepted the request, never that the target app handled it.
- **Debug incoming links (Debugger tab)** — Observe links delivered to this app, both on cold start (`getInitialURL()`) and at runtime (`url` events). Includes copy-paste `adb` / `simctl` commands so you can fire test links at the app from your computer.
- **Keep a history (History tab)** — Every tested link is saved on-device with search, link-type filters, and platform filters.
- **Pin favorites (Favorites screen)** — Star links for one-tap reuse; favorites survive history clears.
- **Inspect any saved link (Link details screen)** — Full URL breakdown, edit the URL, copy it, re-open it, or generate device test commands.
- **Dark / light themes (Settings tab)** — System, light, or dark appearance; all data stays on-device and can be wiped per category.

## Who is it for?

- Mobile developers verifying their app's deep link handling.
- QA engineers testing link routing across Android and iOS.
- Anyone curious about what a URL actually contains before opening it.

## Getting started

Prerequisites: [Node.js](https://nodejs.org) (LTS) and the [Expo](https://docs.expo.dev/get-started/set-up-your-environment/) toolchain
(Xcode for iOS, Android Studio for Android).

```bash
npm install
```

This project uses `expo-dev-client` plus custom native config, so **Expo Go
cannot run it**. The first run must be a development build, which compiles and
installs the app on your emulator / simulator / device:

```bash
npx expo run:android   # or: npx expo run:ios
```

If you see `No development build ... is installed`, it means this step was
skipped. Once the development build is installed, you can use the dev server
for subsequent runs:

```bash
npm start        # start the Expo development server
```

Then fire a link at the running (or killed) app:

```bash
# Android — runtime + cold start
adb shell am start -a android.intent.action.VIEW -d "deeplinkcontroller://debug/hello?from=adb"

# iOS Simulator — booted device
xcrun simctl openurl booted "deeplinkcontroller://debug/hello?from=simctl"
```

See [`docs/deep-linking.md`](docs/deep-linking.md) for the full guide: custom schemes vs. Universal Links vs. App Links, what each test proves, and what Jest does (and does not) cover.

## Scripts

| Command           | What it does                                  |
|-------------------|-----------------------------------------------|
| `npm start`       | Start the Expo development server             |
| `npm run android` | Build & run on Android (`expo run:android`)   |
| `npm run ios`     | Build & run on iOS (`expo run:ios`)           |
| `npm run web`     | Run in the browser (`expo start --web`)       |
| `npm test`        | Run the Jest suite (35 tests)                 |
| `npm run lint`    | Run ESLint                                    |
| `npm run typecheck` | Type-check with `tsc --noEmit`              |

## Project structure

```
app/                  # expo-router screens (tabs + stack screens)
  (tabs)/             # Launcher · History · Debugger · Settings
  favorites.tsx       # Favorites list screen
  link-details.tsx    # Per-link inspect / edit / test screen
src/
  components/ui/      # Reusable themed UI primitives
  features/deep-link/ # URL parsing, link opening, incoming-link listener
  store/              # Zustand store + AsyncStorage persistence (on-device only)
  theme/              # Light/dark theme
docs/                 # Deep linking guide
plugins/              # Expo config plugin (iOS scene lifecycle)
```

## Tech stack

Expo SDK 57 · React 19 · React Native 0.86 · expo-router · Zustand · TanStack Query · Zod · AsyncStorage · TypeScript (strict) · Jest · ESLint

## Privacy

All links and preferences are stored only in on-device storage (AsyncStorage). Nothing is sent anywhere, and URLs are never logged with full query strings.

## License

MIT — see [LICENSE](LICENSE). Everyone is free to use, modify, and share this project, including for commercial purposes.
