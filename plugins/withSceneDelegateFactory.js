/**
 * iOS 27 requires scene-lifecycle adoption. The scene manifest in app.json routes
 * scene connections to Expo's EXExpoAppSceneDelegate, which retrieves the React
 * Native factory from the app delegate through ExpoReactNativeFactoryProvider.
 *
 * The stock prebuild template declares neither the manifest nor this conformance,
 * so without this plugin the app dies in fatalError on every launch, before any
 * JavaScript loads.
 */
const { withAppDelegate } = require('@expo/config-plugins');

const PROTOCOL = 'ExpoReactNativeFactoryProvider';

const EXTENSION = `
// Added by withSceneDelegateFactory: exposes the React Native factory owned by
// the app delegate to EXExpoAppSceneDelegate (required for iOS 27 scene lifecycle).
extension AppDelegate: ${PROTOCOL} {}
`;

function withSceneDelegateFactory(config) {
  return withAppDelegate(config, (config) => {
    const contents = config.modResults.contents;
    // Idempotent: skip if the template (or a future Expo version) already conforms.
    if (!contents.includes(PROTOCOL)) {
      config.modResults.contents = `${contents.trimEnd()}\n${EXTENSION}`;
    }
    return config;
  });
}

module.exports = withSceneDelegateFactory;
