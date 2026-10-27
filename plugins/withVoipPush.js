const {
  withAppDelegate,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
  IOSConfig,
} = require('expo/config-plugins');

const VOIP_HEADER_PATH = '"$(SRCROOT)/../node_modules/react-native-voip-push-notification/ios/RNVoipPushNotification"';
const CALLKEEP_HEADER_PATH = '"$(SRCROOT)/../node_modules/react-native-callkeep/ios/RNCallKeep"';

const BRIDGING_IMPORTS = [
  '#import "RNVoipPushNotificationManager.h"',
  '#import "RNCallKeep.h"',
];

// Inserted before an already indented `return super.application(...)`.
const CALLKEEP_INIT = `// Create CallKeep's module now so its CXProvider has a delegate before React Native loads.
    // Otherwise a call answered from the lock screen after a VoIP launch is never fulfilled and
    // CallKit fails it. Its events are buffered until JS listens.
    _ = RNCallKeep()
    RNVoipPushNotificationManager.voipRegistration()`;

const DELEGATE_EXTENSION = `
extension AppDelegate: PKPushRegistryDelegate {
  public func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }

  public func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {}

  public func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    let data = payload.dictionaryPayload
    let uuidCandidate = (data["uuid"] as? String) ?? (data["callUUID"] as? String)
    let uuid: String
    if let candidate = uuidCandidate, UUID(uuidString: candidate) != nil {
      uuid = candidate.lowercased()
    } else {
      uuid = UUID().uuidString.lowercased()
    }

    let callerName = (data["callerName"] as? String) ?? (data["title"] as? String) ?? "AIOGlobal"
    let handle = (data["handle"] as? String) ?? (data["counterpart_id"] as? String) ?? "aio"
    let hasVideo: Bool = {
      if let value = data["hasVideo"] as? Bool { return value }
      if let value = data["hasVideo"] as? NSNumber { return value.boolValue }
      if let value = data["hasVideo"] as? String { return value != "false" && value != "0" }
      return true
    }()

    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)
    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: handle,
      handleType: "generic",
      hasVideo: hasVideo,
      localizedCallerName: callerName,
      supportsHolding: true,
      supportsDTMF: true,
      supportsGrouping: true,
      supportsUngrouping: true,
      fromPushKit: true,
      payload: data,
      withCompletionHandler: completion
    )
    startReactNativeInBackground()
  }
}
`;

function ensureHeaderSearchPath(project, headerPath) {
  const configurations = project.pbxXCBuildConfigurationSection();
  Object.values(configurations).forEach((config) => {
    if (!config.buildSettings) return;
    const current = config.buildSettings.HEADER_SEARCH_PATHS;
    if (!current) {
      config.buildSettings.HEADER_SEARCH_PATHS = ['$(inherited)', headerPath];
      return;
    }
    const list = Array.isArray(current) ? current : [current];
    if (!list.includes(headerPath)) {
      config.buildSettings.HEADER_SEARCH_PATHS = [...list, headerPath];
    }
  });
}

const withVoipAppDelegate = (config) =>
  withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== 'swift') {
      return mod;
    }

    let contents = mod.modResults.contents;
    if (!contents.includes('import PushKit')) {
      contents = contents.replace('import Expo\n', 'import Expo\nimport PushKit\n');
    }
    if (!contents.includes('RNVoipPushNotificationManager.voipRegistration()')) {
      contents = contents.replace(
        'return super.application(application, didFinishLaunchingWithOptions: launchOptions)',
        `${CALLKEEP_INIT}\n    return super.application(application, didFinishLaunchingWithOptions: launchOptions)`,
      );
    }
    if (!contents.includes('PKPushRegistryDelegate')) {
      contents = `${contents.trimEnd()}\n${DELEGATE_EXTENSION}\n`;
    }
    mod.modResults.contents = contents;
    return mod;
  });

const withVoipBridgingHeader = (config) =>
  withAppDelegate(config, (mod) => {
    const projectRoot = mod.modRequest.projectRoot;
    const fs = require('fs');
    const path = require('path');
    const headerPath = path.join(
      projectRoot,
      'ios',
      mod.modRequest.projectName || 'AIOGlobal',
      `${mod.modRequest.projectName || 'AIOGlobal'}-Bridging-Header.h`,
    );
    if (!fs.existsSync(headerPath)) {
      return mod;
    }
    let header = fs.readFileSync(headerPath, 'utf8');
    BRIDGING_IMPORTS.forEach((line) => {
      if (!header.includes(line)) {
        header = `${header.trimEnd()}\n${line}\n`;
      }
    });
    fs.writeFileSync(headerPath, header);
    return mod;
  });

const withVoipInfoPlist = (config) =>
  withInfoPlist(config, (mod) => {
    const modes = Array.isArray(mod.modResults.UIBackgroundModes)
      ? mod.modResults.UIBackgroundModes
      : [];
    ['voip', 'audio'].forEach((mode) => {
      if (!modes.includes(mode)) modes.push(mode);
    });
    mod.modResults.UIBackgroundModes = modes;
    return mod;
  });

const withVoipEntitlements = (config) =>
  withEntitlementsPlist(config, (mod) => {
    if (!mod.modResults['aps-environment']) {
      mod.modResults['aps-environment'] = 'development';
    }
    return mod;
  });

const withVoipXcode = (config) =>
  withXcodeProject(config, (mod) => {
    ensureHeaderSearchPath(mod.modResults, CALLKEEP_HEADER_PATH);
    ensureHeaderSearchPath(mod.modResults, VOIP_HEADER_PATH);
    const target = IOSConfig.XcodeUtils.getApplicationNativeTarget({
      project: mod.modResults,
      projectName: mod.modRequest.projectName,
    });
    try {
      mod.modResults.addFramework('PushKit.framework', { target: target.uuid });
    } catch {
      // already linked
    }
    return mod;
  });

const withVoipPush = (config) => {
  config = withVoipInfoPlist(config);
  config = withVoipEntitlements(config);
  config = withVoipXcode(config);
  config = withVoipBridgingHeader(config);
  config = withVoipAppDelegate(config);
  return config;
};

module.exports = withVoipPush;
