"use client";

import type { ChartElement } from "@/lib/presentation-schema";

const PALETTE = ["#6650a4", "#9b8bc3", "#c8bde0", "#3d344c", "#80758f", "#af4c36", "#2457a7", "#1f6d5c"];

function Legend({ element }: { element: ChartElement }) {
  if (!element.showLegend) return null;
  return (
    <div className="chart-legend">
      {element.series.map((series, index) => (
        <span key={series.name || index}>
          <i style={{ background: series.color || PALETTE[index % PALETTE.length] }} />
          {series.name}
        </span>
      ))}
    </div>
  );
}

export function ChartVisual({ element }: { element: ChartElement }) {
  const values = element.series.flatMap((series) => element.labels.map((_, index) => series.values[index] ?? 0));
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  if (element.chart === "pie") {
    const series = element.series[0];
    const positiveValues = series.values.map((value) => Math.max(0, value));
    const total = positiveValues.reduce((sum, value) => sum + value, 0);
    const stops = total > 0
      ? positiveValues
          .map((value, index) => {
            const cursor = positiveValues.slice(0, index).reduce((sum, current) => sum + current, 0);
            return `${PALETTE[index % PALETTE.length]} ${(cursor / total) * 100}% ${((cursor + value) / total) * 100}%`;
          })
          .join(",")
      : "#e2dfe7 0% 100%";
    return (
      <div className="chart-pie-wrap">
        <div className="chart-pie" style={{ background: `conic-gradient(${stops})` }} />
        {element.showLegend && (
          <div className="chart-legend">
            {element.labels.map((label, index) => (
              <span key={`${label}-${index}`}>
                <i style={{ background: PALETTE[index % PALETTE.length] }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (element.chart === "line") {
    return (
      <div className="chart-line-wrap">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={element.series.map((series) => series.name).join(", ")}>
          {element.series.map((series, seriesIndex) => {
            const points = series.values
              .map((value, index) => {
                const x = element.labels.length === 1 ? 50 : (index / (element.labels.length - 1)) * 100;
                const y = 92 - (((value - minValue) / range) * 80);
                return `${x},${y}`;
              })
              .join(" ");
            return <polyline key={series.name || seriesIndex} points={points} fill="none" stroke={series.color || PALETTE[seriesIndex % PALETTE.length]} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <div className="chart-axis-labels">
          {element.labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
        </div>
        <Legend element={element} />
      </div>
    );
  }

  const zeroY = (maxValue / range) * 100;
  return (
    <div className="chart-bars">
      {element.labels.map((label, labelIndex) => (
        <div className="chart-bar-group" key={`${label}-${labelIndex}`}>
          <div className="chart-bar-stack" style={{ background: `linear-gradient(to bottom, transparent calc(${zeroY}% - 1px), rgba(62,53,73,.28) calc(${zeroY}% - 1px), rgba(62,53,73,.28) calc(${zeroY}% + 1px), transparent calc(${zeroY}% + 1px))` }}>
            {element.series.map((series, seriesIndex) => {
              const value = series.values[labelIndex] || 0;
              const height = Math.max(value === 0 ? 0 : 2, Math.abs(value) / range * 100);
              const top = value >= 0 ? zeroY - height : zeroY;
              return (
                <div
                  className={`chart-bar ${value < 0 ? "is-negative" : ""}`}
                  key={`${series.name}-${seriesIndex}`}
                  style={{
                    left: `${(seriesIndex / Math.max(element.series.length, 1)) * 100}%`,
                    width: `${100 / Math.max(element.series.length, 1) - 2}%`,
                    height: `${height}%`,
                    top: `${top}%`,
                    background: series.color || PALETTE[seriesIndex % PALETTE.length],
                  }}
                  title={`${series.name}: ${value}`}
                >
                  {element.showValues && <b>{value}</b>}
                </div>
              );
            })}
          </div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
