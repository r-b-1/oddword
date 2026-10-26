export function DepthMeter({
  depth,
  maxDepth = 7000,
}: {
  depth: number;
  maxDepth?: number;
}) {
  return (
    <div className="score-meter">
      <span>
        Your score{" "}
        <strong>
          {depth / 10}
          <small> pts</small>
        </strong>
      </span>
      <div
        className="score-track"
        role="meter"
        aria-label="Score"
        aria-valuemin={0}
        aria-valuemax={maxDepth / 10}
        aria-valuenow={depth / 10}
      >
        <div
          style={{ transform: `scaleX(${Math.min(depth / maxDepth, 1)})` }}
        />
      </div>
    </div>
  );
}
