import * as Notifications from "expo-notifications";
import { playRingtone, stopRingtone } from "./callHandler";
import { useEffect } from "react";

export function useIncomingCallNotification(onIncomingCall) {
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data.type === "incoming_call") {
        playRingtone();
        onIncomingCall && onIncomingCall(data);
      }
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data.type === "incoming_call") {
        stopRingtone();
        onIncomingCall && onIncomingCall(data);
      }
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);
}
