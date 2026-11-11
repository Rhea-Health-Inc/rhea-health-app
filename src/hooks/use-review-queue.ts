import { useCallback, useState } from "react";

export type ReviewPriority = "high" | "normal";
export type ReviewAction = "approved" | "dismissed";

export interface ReviewItem {
  id: string;
  patient: string;
  photo: string;
  note: string;
  reason: string;
  waited: string;
  priority: ReviewPriority;
}

interface LastAction {
  kind: ReviewAction;
  item: ReviewItem;
}

export interface ReviewQueueState {
  items: ReviewItem[];
  lastAction: LastAction | null;
  act: (id: string, kind: ReviewAction) => void;
  undo: () => void;
}

/**
 * Owns the approve / dismiss / undo behaviour of the review queue so the
 * component stays purely presentational. Undo re-inserts the item at its
 * original position in `initial`.
 */
export function useReviewQueue(initial: ReviewItem[]): ReviewQueueState {
  const [items, setItems] = useState<ReviewItem[]>(initial);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const act = useCallback((id: string, kind: ReviewAction) => {
    setItems((current) => {
      const item = current.find((x) => x.id === id);
      if (!item) return current;
      setLastAction({ kind, item });
      return current.filter((x) => x.id !== id);
    });
  }, []);

  const undo = useCallback(() => {
    setLastAction((last) => {
      if (!last) return null;
      setItems((current) => {
        if (current.some((x) => x.id === last.item.id)) return current;
        const next = [...current];
        const originalIndex = initial.findIndex((x) => x.id === last.item.id);
        next.splice(Math.min(Math.max(originalIndex, 0), next.length), 0, last.item);
        return next;
      });
      return null;
    });
  }, [initial]);

  return { items, lastAction, act, undo };
}
