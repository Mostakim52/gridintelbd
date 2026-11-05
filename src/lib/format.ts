export const num = (v: number, decimals = 0) =>
  v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const pct1 = (v: number) => `${v.toFixed(1)}%`;

export const pointDiff = (v: number) =>
  `${v >= 0 ? "−" : "+"}${Math.abs(v).toFixed(1)} pp`;

export const short = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 10_000) return `${Math.round(v / 1000)}k`;
  return num(v);
};

export const thousands = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)} million`;
  if (v >= 1000) return `${Math.round(v / 1000)} thousand`;
  return num(v);
};
