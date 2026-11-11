import { useEffect, useRef, type MouseEvent } from "react";

export interface DialogDismiss {
  /** Spread onto the fixed backdrop element. */
  backdropProps: {
    onClick: (e: MouseEvent<HTMLElement>) => void;
  };
  /** Spread onto the dialog panel. Stops backdrop clicks and adds dialog semantics. */
  panelProps: {
    ref: (node: HTMLDivElement | null) => void;
    role: "dialog";
    "aria-modal": true;
    tabIndex: -1;
    onClick: (e: MouseEvent<HTMLElement>) => void;
  };
}

/**
 * Shared dismissal and a11y wiring for the hand-rolled modal overlays:
 * Escape closes, backdrop clicks close, panel clicks do not, body scroll is
 * locked while open, and focus moves into the panel on mount.
 */
export function useDialogDismiss(onClose: () => void): DialogDismiss {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return {
    backdropProps: {
      onClick: () => onCloseRef.current(),
    },
    panelProps: {
      ref: (node) => {
        panelRef.current = node;
        // Only pull focus if it is not already inside the panel (e.g. autoFocus input).
        if (node && !node.contains(document.activeElement)) node.focus();
      },
      role: "dialog",
      "aria-modal": true,
      tabIndex: -1,
      onClick: (e) => e.stopPropagation(),
    },
  };
}
