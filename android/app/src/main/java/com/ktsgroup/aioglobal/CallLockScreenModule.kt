package com.ktsgroup.aioglobal

import android.app.Activity
import android.app.KeyguardManager
import android.content.Intent
import android.os.Build
import android.view.WindowManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.ViewManager

/**
 * Lets MainActivity come up over the lock screen while an answered call is in progress.
 *
 * RNCallKeep.backToForeground() starts the activity behind the keyguard (it passes WindowManager
 * flags as Intent flags), so React stays paused, JS timers stop and the call is only joined
 * long after the user unlocks.
 */
object CallLockScreen {
  @Volatile
  var active = false

  fun show(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setShowWhenLocked(true)
      activity.setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      activity.window.addFlags(
          WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }
    // Bring up the unlock prompt right away; the call keeps connecting behind it.
    val keyguard = activity.getSystemService(KeyguardManager::class.java)
    if (keyguard?.isKeyguardLocked == true && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      keyguard.requestDismissKeyguard(activity, null)
    }
  }

  fun clear(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setShowWhenLocked(false)
      activity.setTurnScreenOn(false)
    } else {
      @Suppress("DEPRECATION")
      activity.window.clearFlags(
          WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
              WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }
  }
}

class CallLockScreenModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "CallLockScreen"

  /** Replacement for RNCallKeep.backToForeground() once a call is answered. */
  @ReactMethod
  fun bringToForeground() {
    CallLockScreen.active = true
    val activity = reactApplicationContext.currentActivity
    if (activity != null) {
      UiThreadUtil.runOnUiThread {
        CallLockScreen.show(activity)
        activity.startActivity(
            Intent(activity, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT))
      }
      return
    }
    // MainActivity.onCreate picks up CallLockScreen.active.
    reactApplicationContext.startActivity(
        Intent(reactApplicationContext, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT))
  }

  /** Call ended: stop showing the app over the lock screen. */
  @ReactMethod
  fun release() {
    CallLockScreen.active = false
    val activity = reactApplicationContext.currentActivity ?: return
    UiThreadUtil.runOnUiThread { CallLockScreen.clear(activity) }
  }
}

class CallLockScreenPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
      listOf(CallLockScreenModule(reactContext))

  override fun createViewManagers(
      reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> = emptyList()
}
