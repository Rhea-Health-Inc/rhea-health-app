import { useCallback, useState } from "react";
import { loadInbox, saveInbox, type InboxConnection } from "@/lib/messages";

/** Shared practice-inbox connection state, persisted to localStorage. */
export function useInboxConnection() {
  const [inbox, setInbox] = useState<InboxConnection>(loadInbox);

  const update = useCallback((patch: Partial<InboxConnection>) => {
    setInbox((prev) => {
      const next = { ...prev, ...patch };
      saveInbox(next);
      return next;
    });
  }, []);

  return { inbox, update };
}
