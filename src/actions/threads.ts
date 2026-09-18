import { ipc } from "@/ipc/manager";

export function listThreads() {
  return ipc.client.threads.list();
}

export function getThread(threadId: string) {
  return ipc.client.threads.get({ threadId });
}

export function getThreadMessages(threadId: string) {
  return ipc.client.threads.getMessages({ threadId });
}
