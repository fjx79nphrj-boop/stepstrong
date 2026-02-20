import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const NOTIFICATION_ID = 1001;
const CHANNEL_ID = "daily-reminder";

export function isSupported() {
  return Capacitor.isNativePlatform();
}

export async function requestPermission() {
  if (!isSupported()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

export async function scheduleDaily(hour = 20, minute = 0) {
  if (!isSupported()) return;
  try { await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] }); } catch { /* nothing to cancel */ }
  await LocalNotifications.schedule({
    notifications: [
      {
        id: NOTIFICATION_ID,
        title: "StepStrong",
        body: "How did it go today? Log your interaction.",
        schedule: { on: { hour, minute }, repeating: true, allowWhileIdle: true },
        channelId: CHANNEL_ID,
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#D4A853",
      },
    ],
  });
}

export async function cancelAll() {
  if (!isSupported()) return;
  try { await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] }); } catch { /* nothing to cancel */ }
}
