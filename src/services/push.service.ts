import api from "./api";

export async function getPushPublicKey(): Promise<string | null> {
  const { data } = await api.get<{ publicKey: string | null }>("/push/public-key");
  return data.publicKey;
}

export async function saveSubscription(subscription: PushSubscription) {
  await api.post("/push/subscriptions", subscription.toJSON());
}

export async function deleteSubscription(endpoint: string) {
  await api.delete("/push/subscriptions", { data: { endpoint } });
}

// Turns this browser's reminders off, for when the resident logs out: the
// server forgets the subscription and the browser drops it, so a shared
// phone stops getting the last person's reminders.
export async function endReminders() {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await deleteSubscription(subscription.endpoint).catch(() => {});
  await subscription.unsubscribe().catch(() => {});
}
