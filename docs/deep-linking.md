# Deep linking: configuration & native testing

This app receives links itself on the `deeplinkcontroller://` scheme (see `scheme` in
`app.json`). No production HTTPS domain is configured on purpose — claiming one
would be dishonest without a real, verified domain.

## The three mechanisms (do not confuse them)

| Mechanism | Example | What it proves | What it needs |
|---|---|---|---|
| Custom URL scheme | `deeplinkcontroller://debug/hello` | Only that the OS routed the scheme to this app | `scheme` in `app.json` (already set). OS-level conflicts possible. |
| iOS Universal Links | `https://example.com/product/42` | Requires Apple-verified domain ownership | `associatedDomains` entitlement + hosted `apple-app-site-association` file |
| Android App Links | `https://example.com/product/42` | Requires Google-verified domain ownership | Intent filter with `autoVerify` + hosted `assetlinks.json` |

An HTTPS URL opening in a browser proves nothing about Universal/App Link
configuration. The Launcher and Inspector deliberately label HTTPS links as
"HTTPS link", never as "verified".

## Testing incoming links (Debugger tab)

Expo Go cannot fully validate custom-scheme delivery. Use a development build:

```bash
npx expo run:android   # or: npx expo run:ios
```

Then, while the app runs (or is killed, to test cold start):

```bash
# Android — runtime + cold start
adb shell am start -a android.intent.action.VIEW -d "deeplinkcontroller://debug/hello?from=adb"

# iOS Simulator — booted device
xcrun simctl openurl booted "deeplinkcontroller://debug/hello?from=simctl"
```

The Debugger tab shows `getInitialURL()` (cold start) and `url` events
(runtime). It only observes links delivered to *this* app — never other apps.

## Testing outgoing links (Launcher tab)

`Linking.canOpenURL()` behavior notes:

- iOS returns `false` for custom schemes unless the querying app lists them in
  `LSApplicationQueriesSchemes`. `false` therefore means "unavailable *or*
  unqueryable" — the Launcher says exactly that and offers no fake success.
- `openURL()` resolving only means the OS accepted the request, not that the
  target app handled the link. The success copy says "Handed to the operating
  system" for this reason.

## What Jest covers (and does not)

`npm test` covers URL parsing, classification, query edge cases, shell
quoting, command generation, and persistence-schema validation (35 tests).
It cannot validate native link delivery — that requires the manual steps above
on a development build or physical device.
