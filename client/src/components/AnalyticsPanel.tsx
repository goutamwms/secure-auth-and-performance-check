import { memo, useRef } from "react";
import type { Analytics } from "../types/Ticket";

interface AnalyticsPanelProps {
  analytics: Analytics;
}

function StatCard({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

export const AnalyticsPanel = memo(function AnalyticsPanel({
  analytics
}: AnalyticsPanelProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Analytics snapshot</h2>
        <span className="render-pill">
          analytics renders: {renderCount.current}
        </span>
      </div>

      <div className="stats-grid">
        <StatCard label="Total tickets" value={analytics.total} />
        <StatCard label="Open" value={analytics.open} />
        <StatCard label="In progress" value={analytics.inProgress} />
        <StatCard label="Resolved" value={analytics.resolved} />
        <StatCard label="High priority" value={analytics.highPriority} />
        <StatCard label="Avg. messages" value={analytics.avgMessages} />
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Status distribution</h3>

          <div className="bars">
            {analytics.statusBars.map((bar) => (
              <div key={bar.label} className="bar-row">
                <span className="bar-label">{bar.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${analytics.total ? (bar.value / analytics.total) * 100 : 0}%`,
                      backgroundColor: bar.color
                    }}
                  />
                </div>
                <strong>{bar.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Top assignees</h3>
          <ul className="assignee-list">
            {analytics.topAssignees.map((assignee) => (
              <li key={assignee.name}>
                <span>{assignee.name}</span>
                <strong>{assignee.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});
