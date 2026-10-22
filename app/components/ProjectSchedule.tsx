"use client";

import { useEffect, useState } from "react";

type ScheduleTask = {
  id: string;
  name: string;
  start: string;
  end: string;
  status: "Done" | "In progress" | "Open";
};

type SchedulePhase = {
  id: string;
  name: string;
  start: string;
  end: string;
  tasks: ScheduleTask[];
};

// Phase dates are printed in the reference chart. Task dates are inferred from
// its bars, including the half-day offsets visible in three Phase 1 tasks.
const phases: SchedulePhase[] = [
  {
    id: "1",
    name: "Phase 1",
    start: "2026-09-08",
    end: "2026-09-29",
    tasks: [
      { id: "1.1", name: "Create Gantt Chart", start: "2026-09-08", end: "2026-09-10", status: "Done" },
      { id: "1.2", name: "Perform Background Research", start: "2026-09-08", end: "2026-09-10", status: "Done" },
      { id: "1.3", name: "Generate Concepts", start: "2026-09-10", end: "2026-09-12", status: "Done" },
      { id: "1.4", name: "Identify Needs and Specifications", start: "2026-09-10", end: "2026-09-15", status: "Done" },
      { id: "1.5", name: "Write Progress Report", start: "2026-09-14T12:00:00Z", end: "2026-09-17T12:00:00Z", status: "Done" },
      { id: "1.6", name: "Perform Concept Screening", start: "2026-09-16", end: "2026-09-20", status: "Done" },
      { id: "1.7", name: "Write Mission Statement", start: "2026-09-16", end: "2026-09-20", status: "Done" },
      { id: "1.8", name: "Finish Phase 1 Report", start: "2026-09-15T12:00:00Z", end: "2026-09-27T12:00:00Z", status: "In progress" },
      { id: "1.9", name: "Finish Phase 1 Presentation", start: "2026-09-23T12:00:00Z", end: "2026-09-29", status: "In progress" },
    ],
  },
  {
    id: "2",
    name: "Phase #2",
    start: "2026-09-28",
    end: "2026-11-03",
    tasks: [
      { id: "2.1", name: "Draft System Architecture", start: "2026-09-28", end: "2026-10-13", status: "Open" },
      { id: "2.2", name: "Create Preliminary CAD Concept Model", start: "2026-09-28", end: "2026-10-10", status: "Open" },
      { id: "2.3", name: "Run Simulation Tests", start: "2026-10-06", end: "2026-10-15", status: "Open" },
      { id: "2.4", name: "Perform Technical Analysis Calculations", start: "2026-10-06", end: "2026-10-20", status: "Open" },
      { id: "2.5", name: "Create Project Website", start: "2026-10-08", end: "2026-10-22", status: "Open" },
      { id: "2.6", name: "Finish Phase 2 Presentation", start: "2026-10-19", end: "2026-11-03", status: "Open" },
    ],
  },
];

const dayMs = 24 * 60 * 60 * 1000;
const chartStart = Date.parse("2026-08-30T00:00:00Z");
const chartEnd = Date.parse("2026-11-29T00:00:00Z");
const chartDuration = chartEnd - chartStart;
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function timestamp(date: string) {
  return Date.parse(date.includes("T") ? date : date + "T00:00:00Z");
}

function dateLabel(date: string) {
  const value = new Date(timestamp(date));
  return dateFormatter.format(value) + (value.getUTCHours() === 12 ? " noon" : "");
}

function position(date: number) {
  return (date - chartStart) / chartDuration * 100;
}

function barStyle(start: string, end: string) {
  return {
    left: position(timestamp(start)) + "%",
    width: (timestamp(end) - timestamp(start)) / chartDuration * 100 + "%",
  };
}

const weeks = Array.from({ length: 13 }, (_, index) => {
  const start = chartStart + index * 7 * dayMs;
  return { start, label: dateFormatter.format(start), endLabel: dateFormatter.format(start + 6 * dayMs) };
});

export function ProjectSchedule() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const updateToday = () => {
      const now = new Date();
      // Use the viewer's calendar day, without a server time zone or build date.
      setToday(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    };
    updateToday();
    const timer = window.setInterval(updateToday, 60_000);
    window.addEventListener("focus", updateToday);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateToday);
    };
  }, []);

  const showToday = today !== null && today >= chartStart && today < chartEnd;

  return (
    <>
      <div className="gantt-label">
        <span>Project schedule · 2026</span>
        <small>{today === null ? "Today marker follows the current date" : "Today: " + dateFormatter.format(today) + ", " + new Date(today).getUTCFullYear()}</small>
      </div>
      <div className="gantt-scroll" role="region" aria-label="Project Gantt chart; scroll horizontally for all dates" tabIndex={0}>
        <div className="gantt">
          <div className="gantt-head">
            <b>Task name · Status</b>
            <div className="gantt-weeks">
              {weeks.map((week) => <span key={week.start}>{week.label}<small>– {week.endLabel}</small></span>)}
            </div>
          </div>
          <div className="gantt-body">
            {phases.map((phase) => (
              <div key={phase.id}>
                <div className="gantt-row gantt-phase">
                  <b>{phase.id} · {phase.name}<small>{phase.start} – {phase.end}</small></b>
                  <div className="gantt-track">
                    <i className={"phase-bar phase-" + phase.id} style={barStyle(phase.start, phase.end)} />
                  </div>
                </div>
                {phase.tasks.map((task) => (
                  <div className="gantt-row" key={task.id}>
                    <b>{task.id} · {task.name}<small>{dateLabel(task.start)} – {dateLabel(task.end)} · {task.status}</small></b>
                    <div className="gantt-track">
                      <i
                        style={barStyle(task.start, task.end)}
                        title={task.name + ": " + dateLabel(task.start) + " – " + dateLabel(task.end) + " · " + task.status}
                        role="img"
                        aria-label={task.name + ": " + dateLabel(task.start) + " to " + dateLabel(task.end) + "; " + task.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {showToday && (
              <div className="gantt-marker-lane" aria-hidden="true">
                <div className="gantt-today" style={{ left: position(today) + "%" }}>
                  <span>Today</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
