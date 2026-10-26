interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  status?: "idle" | "correct" | "incorrect";
  placeholder?: string;
}

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  status = "idle",
  placeholder = "Type your answer...",
}: AnswerInputProps) {
  const inputClass = [
    "answer-input",
    status === "correct"
      ? "correct"
      : status === "incorrect"
        ? "incorrect"
        : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      className="answer-input-container"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value.trim());
      }}
    >
      <input
        type="text"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        aria-invalid={status === "incorrect"}
        aria-label="Answer"
      />
      <button
        className="btn btn-primary answer-submit"
        type="submit"
        disabled={disabled || !value.trim()}
      >
        Lock it in <span aria-hidden="true">↗</span>
      </button>
      <div className="input-hint">Press Enter to submit</div>
    </form>
  );
}
