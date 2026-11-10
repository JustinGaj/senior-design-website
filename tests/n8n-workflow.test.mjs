import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseSubmission } from "../lib/updates/validation.ts";

const workflow = JSON.parse(
  readFileSync(new URL("../n8n/biweekly-updates.json", import.meta.url), "utf8"),
);
const node = (name) => workflow.nodes.find((entry) => entry.name === name);

function runCode(name, inputs, precedingNodes = {}, now = Date.now()) {
  const run = new Function("$input", "$", "Date", node(name).parameters.jsCode);
  const input = { first: () => inputs[0], all: () => inputs };
  class TestDate extends Date {
    static now() {
      return now;
    }
  }
  return run(input, (precedingName) => precedingNodes[precedingName], TestDate);
}

const config = JSON.parse(node("Project configuration").parameters.jsonOutput);
const project = {
  ...config.projects[0],
  id: "9cb4b524-02f1-4d60-a57a-5e6dd3085ca0",
};

test("scheduled periods stay anchored, and manual retries can select a past period", () => {
  const runPeriod = (when, scheduled, overridePeriodEnd = "") =>
    runCode(
      "Reporting period",
      [{ json: { ...config, projects: [project], overridePeriodEnd } }],
      { "Sunday schedule": { isExecuted: scheduled } },
      Date.parse(when),
    );

  assert.deepEqual(runPeriod("2026-11-08T14:00:00Z", true), []);
  const [{ json: first }] = runPeriod("2026-11-15T14:00:00Z", true);
  assert.equal(first.periodStart, "2026-11-01");
  assert.equal(first.periodEnd, "2026-11-15");
  assert.deepEqual(runPeriod("2026-11-22T14:00:00Z", true), []);
  const [{ json: next }] = runPeriod("2026-11-29T14:00:00Z", true, "2026-11-15");
  assert.equal(next.periodEnd, "2026-11-29");
  const [{ json: retry }] = runPeriod("2026-11-29T14:00:00Z", false, "2026-11-15");
  assert.equal(retry.periodEnd, "2026-11-15");
  assert.throws(() => runPeriod("2026-11-29T14:00:00Z", false, "2026-11-22"), /aligned/);
});

test("Plane activity is filtered before summarization and produces a valid website payload", () => {
  const period = { ...config, periodStart: "2026-11-01", periodEnd: "2026-11-15" };
  const work = {
    id: "work-id",
    identifier: "SOFT-42",
    name: "Calibrate tracking",
    projectName: "Software",
  };
  const event = {
    id: "state-event",
    issue: work.id,
    created_at: "2026-11-08T15:00:00Z",
    field: "state",
    verb: "updated",
    old_value: "In progress",
    new_value: "Done",
  };
  const [{ json: collected }] = runCode(
    "Collect Plane activity",
    [{ json: { results: [
      event,
      event,
      { ...event, id: "comment-event", field: "comment", new_value: "Private note" },
      { ...event, id: "outside-window", created_at: "2026-11-15T00:00:00Z" },
    ] } }],
    {
      "Reporting period": { first: () => ({ json: period }) },
      "Prepare work items": { all: () => [{ json: work }] },
    },
  );

  assert.equal(collected.evidenceCount, 2);
  assert.equal(collected.activities.find((entry) => entry.id === "comment-event").newValue, null);
  assert.equal(collected.modelActivities.length, 1);
  assert.equal(collected.modelActivities[0].newValue, "Done");

  const [{ json: validated }] = runCode(
    "Validate website post",
    [{ json: { output: { title: "Tracking progress", summary: "Short update.", body: "Full update." } } }],
    { "Collect Plane activity": { first: () => ({ json: collected }) } },
  );
  assert.equal(validated.publishEnabled, false);
  assert.equal(validated.publishUrl, "https://eagleye.stevensweb.org/api/updates");
  assert.equal(parseSubmission(validated.payload).activities.length, 2);
  assert.equal(node("Publish to Eagle Eye").parameters.genericAuthType, "httpBearerAuth");
  assert.equal(workflow.active, false);
  assert.ok(workflow.nodes.every((entry) => !entry.credentials));
});
