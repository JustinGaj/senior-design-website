type MockUpdate = {
  id: string;
  title: string;
  category: string;
  summary: string;
  image: "engineering" | "concept" | "flight";
  paragraphs: string[];
};

// Temporary, illustrative content for the mock-updates review branch.
// These are not published team reports or records of completed work.
export const mockUpdates: MockUpdate[] = [
  {
    id: "design-review",
    title: "Design review and next steps",
    category: "Design",
    summary:
      "A preview of how the team will share design decisions, open questions, and priorities for the next two weeks.",
    image: "concept",
    paragraphs: [
      "A typical design update will explain which mounting and stabilization approaches are being compared, the constraints guiding those choices, and the questions still being evaluated. Supporting sketches or analysis can help make the reasoning easy to follow.",
      "The entry will finish with a few concrete next steps, such as refining the selected layout or preparing a focused bench test. This sample illustrates the format; it does not announce a finalized design or completed test.",
    ],
  },
  {
    id: "tracking-stabilization",
    title: "Tracking and stabilization",
    category: "Engineering",
    summary:
      "A sample engineering note connecting target tracking, camera motion, and vibration isolation in one concise update.",
    image: "engineering",
    paragraphs: [
      "Engineering entries will connect the optical tracker to the rest of the flight system. A future report might describe a control-loop change, a camera alignment check, or the effect of mounting vibration on the image.",
      "Measured results will be distinguished from proposed improvements, with remaining issues and follow-up checks stated clearly. Hardware choices and performance claims in the real report will be based on the team's recorded work; no results are implied by this placeholder.",
    ],
  },
  {
    id: "build-test-planning",
    title: "Build planning and test preparation",
    category: "Planning",
    summary:
      "An example of a progress note covering materials, integration dependencies, and preparation for the next test.",
    image: "flight",
    paragraphs: [
      "Planning updates will explain how the build is progressing alongside the schedule and materials list. They can identify parts that need review, dependencies between team roles, and the checks required before components are integrated.",
      "The next reporting period will have a short, specific focus rather than a long task inventory. This entry is temporary sample copy for reviewing the website layout; actual purchases, budget changes, and test readiness will be reported only when confirmed by the team.",
    ],
  },
];
