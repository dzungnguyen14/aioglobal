import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

let sound;
let vibrationLoop;

export async function playRingtone() {
  try {
    sound = new Audio.Sound();
    await sound.loadAsync(require("./assets/ringtone.mp3"));
    await sound.setIsLoopingAsync(true);
    await sound.playAsync();

    vibrationLoop = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 1000);
  } catch (error) {
    console.log("Ringtone error:", error);
  }
}

export async function stopRingtone() {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
    if (vibrationLoop) clearInterval(vibrationLoop);
  } catch (error) {
    console.log("Stop ringtone error:", error);
  }
}
