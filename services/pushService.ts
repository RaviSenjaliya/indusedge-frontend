export const pushService = {
  /**
   * Initialize and check for existing permissions
   */
  async checkPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }
    return Notification.permission;
  },

  /**
   * Request user permission
   */
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  /**
   * Send a local notification (Simulation for UI testing or instant feedback)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    icon: string = "https://cdn-icons-png.flaticon.com/512/1087/1087080.png",
    url: string = "/"
  ) {
    if (Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // Use a unique tag and timestamp to prevent icon caching and force a new instance
        registration.showNotification(title, {
          body,
          icon,
          tag: `indusedge-notif-${Date.now()}`,
          data: { url },
        });
      } else {
        // Fallback to basic Notification if SW not ready
        new Notification(title, { body, icon });
      }
    }
  },

  /**
   * Register the Service Worker
   */
  async registerSW() {
    if ("serviceWorker" in navigator) {
      try {
        // Using a relative path without a leading slash to ensure it is resolved
        // relative to the current origin's root directory, avoiding origin mismatch errors.
        await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        console.log("IndusEdge SW Registered successfully");
      } catch (err) {
        console.error("SW Registration Failed:", err);
      }
    }
  },
};
