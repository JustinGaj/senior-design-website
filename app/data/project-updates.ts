type ProjectUpdate = {
  id: string;
  date: string;
  title: string;
  category: string;
  summary: string;
  image: "engineering" | "concept" | "flight";
  paragraphs: string[];
};

// Curated from Plane activity for October 18–31, 2026.
// Subsystem analysis completion was confirmed directly by the team.
// Dates reflect recorded project activity, not the website deployment date.
// PMGT-16: created and assigned to all six members on October 29; In Progress.
// PMGT-5: changed from In Progress to Done on October 29.
export const projectUpdates: ProjectUpdate[] = [
  {
    id: "phase-two-presentation",
    date: "2026-10-29",
    title: "Phase 2 presentation preparation underway",
    category: "Project planning",
    summary:
      "Individual subsystem analyses are complete, and the team is preparing the findings for the Phase 2 presentation targeted for November 3.",
    image: "concept",
    paragraphs: [
      "The Phase 2 presentation task was opened on October 29 and assigned to all six team members. It is now part of the Phase 2 project-management module, bringing the team together for the next design review.",
      "Our individual subsystem analyses are complete, providing a foundation for the next design review. The review requirements cover performance, physical constraints, cost, and component choices. The presentation will need to connect technical analysis to design decisions, document assumptions, and explain validation through appropriate calculations, diagrams, simulations, or experiments.",
    ],
  },
  {
    id: "component-recovery",
    date: "2026-10-29",
    title: "Component-recovery task completed",
    category: "Hardware",
    summary:
      "The task to locate missing components from the previous build has been marked Done, closing a hardware-recovery item in the project plan.",
    image: "engineering",
    paragraphs: [
      "On October 29, the team moved the component-recovery task from In Progress to Done. The task addressed locating parts from the previous year's disassembled system, with the camera identified as the highest-priority component.",
      "This closes the recovery work item alongside ongoing preparation for the Phase 2 review. The tracker keeps the completed task and its history available as the team documents the system's components and design decisions.",
    ],
  },
];
