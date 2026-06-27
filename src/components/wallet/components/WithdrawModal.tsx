import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type WithdrawModalProps = {
  open: boolean;
  amount: number;
  destination: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  isSubmitting: boolean;
  isDark: boolean;
};

export function WithdrawModal({ open, amount, destination, onCancel, onConfirm, isSubmitting, isDark }: WithdrawModalProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Confirm withdrawal"
      description={`You are withdrawing ${amount.toLocaleString()} ETB to ${destination}.`}
      cancelLabel="Cancel"
      confirmLabel="Confirm withdrawal"
      submittingLabel="Processing..."
      onCancel={onCancel}
      onConfirm={onConfirm}
      isDark={isDark}
      variant="neutral"
      isSubmitting={isSubmitting}
    />
  );
}
