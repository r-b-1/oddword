interface TimerProps {
  seconds: number;
  label: string;
  warning?: boolean;
}

export function Timer({ seconds, label, warning = false }: TimerProps) {
  return (
    <div className="timer-container">
      <div className="timer-label">{label}</div>
      <div
        className={`timer-display ${warning ? 'timer-warning' : ''}`}
        role="timer"
        aria-label={`${seconds} seconds ${label.toLowerCase()}`}
      >
        {seconds}
      </div>
    </div>
  );
}
