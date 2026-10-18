const fs = require('fs');
const path = require('path');
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

// iOS 27 terminates apps built with the iOS 27 SDK that don't adopt the UIScene lifecycle
// (crash in _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption). Expo SDK 54's
// AppDelegate template doesn't, so this plugin adds a SceneDelegate that owns the window.

const SCENE_DELEGATE = fs.readFileSync(path.join(__dirname, 'SceneDelegate.swift.template'), 'utf8');

const SCENE_MANIFEST = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
      },
    ],
  },
};

// Keeps the `factory.startReactNative(` text so @react-native-firebase/app can still anchor on it.
const START_COMMENT = '// factory.startReactNative(...) is called from SceneDelegate (UIScene lifecycle is required on iOS 27+).';

function replaceOrThrow(contents, pattern, replacement, what) {
  if (!pattern.test(contents)) {
    throw new Error(`withSceneLifecycle: could not find ${what} in AppDelegate.swift`);
  }
  return contents.replace(pattern, replacement);
}

const withSceneManifest = (config) =>
  withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = SCENE_MANIFEST;
    return mod;
  });

const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: only a Swift AppDelegate is supported');
    }

    let contents = mod.modResults.contents;
    if (contents.includes('class SceneDelegate')) {
      return mod;
    }

    contents = replaceOrThrow(
      contents,
      /^[ \t]*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n/m,
      '',
      'window creation',
    );
    contents = replaceOrThrow(
      contents,
      /factory\.startReactNative\(\s*withModuleName:\s*"main",\s*in:\s*window,\s*launchOptions:\s*launchOptions\)/,
      START_COMMENT,
      'factory.startReactNative call',
    );
    contents = replaceOrThrow(
      contents,
      /\nclass ReactNativeDelegate:/,
      `\n${SCENE_DELEGATE.trimEnd()}\n\nclass ReactNativeDelegate:`,
      'ReactNativeDelegate class',
    );

    mod.modResults.contents = contents;
    return mod;
  });

const withSceneLifecycle = (config) => {
  config = withSceneManifest(config);
  config = withSceneAppDelegate(config);
  return config;
};

module.exports = withSceneLifecycle;
