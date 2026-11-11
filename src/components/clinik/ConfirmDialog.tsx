import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";

export interface ConfirmRequest {
  title: string;
  body: string;
  action: () => void;
  danger?: boolean;
}

interface ConfirmDialogProps {
  request: ConfirmRequest;
  onClose: () => void;
}

/**
 * Destructive/irreversible action confirmation. Escape and backdrop clicks
 * cancel; the action always runs before the dialog closes.
 */
export function ConfirmDialog({ request, onClose }: ConfirmDialogProps) {
  const { backdropProps, panelProps } = useDialogDismiss(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/20 backdrop-blur-sm"
      {...backdropProps}
    >
      <div
        {...panelProps}
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-lg)] outline-none"
      >
        <h3 id="confirm-dialog-title" className="text-[16px] font-medium">
          {request.title}
        </h3>
        <p className="text-[14px] text-muted-foreground mt-2">{request.body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              request.action();
              onClose();
            }}
            className={`h-10 px-5 rounded-full text-[14px] font-medium transition ${
              request.danger
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
