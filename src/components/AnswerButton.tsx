"use client";

interface AnswerButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  state?: "idle" | "correct" | "wrong" | "selected";
  ariaLabel?: string;
  large?: boolean;
}

export function AnswerButton({
  label,
  onClick,
  disabled = false,
  state = "idle",
  ariaLabel,
  large = true,
}: AnswerButtonProps) {
  const stateClass =
    state === "correct"
      ? "bg-emerald-400 border-emerald-600 text-emerald-950 ring-4 ring-emerald-200"
      : state === "wrong"
        ? "bg-amber-200 border-amber-400 text-amber-950"
        : state === "selected"
          ? "bg-sky-300 border-sky-500 text-sky-950"
          : "bg-white border-sky-200 text-sky-900 hover:bg-sky-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={`min-h-[4.5rem] rounded-3xl border-4 px-6 font-black tracking-wide shadow-md transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 disabled:opacity-70 ${large ? "text-3xl sm:text-4xl" : "text-2xl"} ${stateClass}`}
    >
      {label}
    </button>
  );
}
