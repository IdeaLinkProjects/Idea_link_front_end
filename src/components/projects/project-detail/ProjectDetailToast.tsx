type ProjectDetailToastProps = {
  message: string;
};

export function ProjectDetailToast({ message }: ProjectDetailToastProps) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-primary-400/40 bg-gradient-to-r from-primary-950 to-primary-900 px-5 py-4 text-center text-sm font-semibold text-primary-50 shadow-2xl shadow-primary-950/50"
      role="status"
    >
      {message}
    </div>
  );
}
