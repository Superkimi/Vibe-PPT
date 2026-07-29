"use client";

import type { ChartElement } from "@/lib/presentation-schema";

export function ChartVisual({ element }: { element: ChartElement }) {
  const values = element.series.flatMap((series) => series.values);
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);

  if (element.chart === "pie") {
    const series = element.series[0];
    const total = Math.max(series.values.reduce((sum, value) => sum + Math.max(0, value), 0), 1);
    const stops = series.values
      .map((value, index) => {
        const cursor = series.values
          .slice(0, index)
          .reduce((sum, current) => sum + Math.max(0, current), 0);
        const start = (cursor / total) * 100;
        const end = ((cursor + Math.max(0, value)) / total) * 100;
        const palette = [series.color, "#9b8bc3", "#c8bde0", "#3d344c", "#80758f"];
        return `${palette[index % palette.length]} ${start}% ${end}%`;
      })
      .join(",");
    return (
      <div className="chart-pie-wrap">
        <div className="chart-pie" style={{ background: `conic-gradient(${stops})` }} />
        {element.showLegend && (
          <div className="chart-legend">
            {element.labels.map((label, index) => (
              <span key={label}>
                <i style={{ background: [series.color, "#9b8bc3", "#c8bde0", "#3d344c", "#80758f"][index % 5] }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (element.chart === "line") {
    const series = element.series[0];
    const points = series.values
      .map((value, index) => {
        const x = element.labels.length === 1 ? 50 : (index / (element.labels.length - 1)) * 100;
        const y = 92 - (value / max) * 80;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <div className="chart-line-wrap">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={series.name}>
          <polyline points={points} fill="none" stroke={series.color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="chart-axis-labels">
          {element.labels.map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="chart-bars">
      {element.labels.map((label, labelIndex) => (
        <div className="chart-bar-group" key={label}>
          <div className="chart-bar-stack">
            {element.series.map((series) => (
              <div
                className="chart-bar"
                key={series.name}
                style={{
                  height: `${Math.max(2, (Math.abs(series.values[labelIndex] || 0) / max) * 100)}%`,
                  background: series.color,
                }}
                title={`${series.name}: ${series.values[labelIndex] || 0}`}
              />
            ))}
          </div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
