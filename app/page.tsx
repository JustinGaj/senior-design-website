import { ConceptChooser, type Concept } from "./components/ConceptChooser";
import { TrackingDemo } from "./components/TrackingDemo";
import { UpdatesFeed } from "./components/UpdatesFeed";
import { ProjectTabs, type ProjectTab } from "./components/ProjectTabs";

const team = [
  { name: "Claire Deatrick", role: "Mechanical Design Lead", focus: "Mechanical design and enclosure.", initials: "CD" },
  { name: "Ryan Paradine", role: "Hardware Lead", focus: "Electronics and sensor components.", initials: "RP" },
  { name: "Justin Gajewski", role: "Software Lead", focus: "Computer vision and control logic.", initials: "JG" },
  { name: "Matthew Hodorowski", role: "Integration Lead", focus: "Hardware and software integration.", initials: "MH" },
  { name: "Chris Persico", role: "Systems Lead", focus: "System requirements and interactions.", initials: "CP" },
  { name: "Robert Dominik", role: "Testing Lead", focus: "Test procedures and performance evaluation.", initials: "RD" },
];

const concepts: Concept[] = [
  {
    n: "3",
    name: "Concept 3",
    body: "Orange Pi 5 Plus · Lucid Triton 2",
    score: "Net +3 · Rank 1",
    color: "red",
    strength: "Light, compact, and power efficient.",
    tradeoff: "Shorter reach and slower stepper response.",
  },
  {
    n: "5",
    name: "Concept 5",
    body: "Jetson Orin Nano · FarVis22 10X",
    score: "Net +2 · Rank 2",
    color: "teal",
    strength: "Long range, fast tracking, and autonomous operation.",
    tradeoff: "Higher mass and power from the compute and optics.",
  },
  {
    n: "6",
    name: "Concept 6",
    body: "Jetson Orin Nano · FarVis22 10X",
    score: "Net +1 · Rank 3",
    color: "blue",
    strength: "Strong range, accuracy, and flexible control.",
    tradeoff: "Cost, mass, and FPGA integration effort.",
  },
  {
    n: "7",
    name: "Concept 7",
    body: "Raspberry Pi 5 + AI Hat · Lucid Triton 2",
    score: "Net +1 · Rank 3",
    color: "gold",
    strength: "Light and accurate with low-power ML acceleration.",
    tradeoff: "Shorter range and added three-axis complexity.",
  },
];

const requirements = [
  ["Target detection range", "1.5 mi", "1 mi"],
  ["Gimbal mass", "< 3 lb", "3 lb"],
  ["Gimbal power draw", "30 W", "45 W"],
  ["Camera frame rate", "≥ 20 fps", "20 fps"],
  ["IMU sample rate", "≥ 500 Hz", "500 Hz"],
  ["End-to-end latency", "< 100 ms", "100 ms"],
] as const;

const milestones = [
  ["M1", "Design proposal", "Mission, needs, requirements, and concepts"],
  ["M2", "Preliminary design review", "Select a concept; document design and analysis"],
  ["M3", "Design & cost review", "Alpha prototype demonstration"],
  ["M4", "Alpha assessment", "Test results and design refinements"],
  ["M5", "Final design review", "Beta prototype assessment"],
  ["M6", "Report & expo", "Final demonstration and project handoff"],
] as const;

const schedule = [
  ["Requirements & user needs", 1, 2],
  ["Concept selection", 1, 3],
  ["Detailed design & analysis", 2, 4],
  ["Prototype build & integration", 3, 6],
  ["Verification & demonstration", 4, 7],
  ["Final report & expo", 5, 7],
] as const;

const billOfMaterials = [
  ["Compute", "Jetson Orin Nano", "1", "TBD"],
  ["Camera", "Long-range optical camera", "1", "TBD"],
  ["Motion", "2-axis gimbal, motors & drivers", "1 set", "TBD"],
  ["Sensing", "IMU and flight-controller interface", "1 set", "TBD"],
  ["Power", "Battery, regulation & protection", "1 set", "TBD"],
  ["Structure", "Enclosure, mounts & isolation", "1 set", "TBD"],
] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-head">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {description && <p className="lead">{description}</p>}
    </div>
  );
}

const tabs: ProjectTab[] = [
  { id: "overview", label: "Overview", content: (
    <>
      <header className="hero" id="home">
                <div className="wrap hero-grid">
                  <div className="hero-copy">
                    <div className="tag"><i /> ME 423 · SENIOR DESIGN · SIEMENS</div>
                    <h1>A steadier view<br />from the <em>sky.</em></h1>
                    <p className="hero-lead">
                      A lightweight, stabilized optical tracker for multi-rotor drones—built to find a target,
                      hold the lock, and keep the picture clear.
                    </p>
                    <div className="actions">
                      <a className="button primary" href="#project">Explore the project <span>↓</span></a>
                      <a className="button ghost" href="#tracking">See tracking demo</a>
                    </div>
                    <div className="hero-note"><span className="pulse" /> ME 423 · 2025–2026 · Sponsored by Siemens</div>
                  </div>
                  <div className="visual" role="img" aria-label="Illustration of a stabilized gimbal mounted below a drone">
                    <svg viewBox="0 0 680 520" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="frame" x1="100" y1="20" x2="580" y2="510">
                          <stop stopColor="#244566" /><stop offset="1" stopColor="#0D1B2A" />
                        </linearGradient>
                        <linearGradient id="lens" x1="0" y1="0" x2="1" y2="1">
                          <stop stopColor="#FF7B8C" /><stop offset="1" stopColor="#A32638" />
                        </linearGradient>
                      </defs>
                      <rect width="680" height="520" rx="28" fill="url(#frame)" />
                      <path d="M0 82H680M0 162H680M0 242H680M0 322H680M0 402H680M80 0V520M160 0V520M240 0V520M320 0V520M400 0V520M480 0V520M560 0V520" stroke="white" strokeOpacity=".055" />
                      <circle cx="442" cy="218" r="128" stroke="#0AA5A0" strokeOpacity=".12" />
                      <circle cx="442" cy="218" r="92" stroke="#0AA5A0" strokeOpacity=".22" />
                      <path d="M143 171H537" stroke="#AAB9C8" strokeWidth="10" strokeLinecap="round" />
                      <path d="M194 170L143 134M486 170L537 134" stroke="#AAB9C8" strokeWidth="7" strokeLinecap="round" />
                      <path d="M91 131h106M484 131h106" stroke="#0AA5A0" strokeWidth="7" strokeLinecap="round" />
                      <circle cx="144" cy="131" r="10" fill="#0AA5A0" /><circle cx="537" cy="131" r="10" fill="#0AA5A0" />
                      <rect x="288" y="161" width="104" height="32" rx="12" fill="#16293F" stroke="#71869B" />
                      <path d="M340 193v70" stroke="#FF7B8C" strokeWidth="7" />
                      <rect x="268" y="259" width="144" height="118" rx="28" fill="#E9EDF2" />
                      <rect x="284" y="273" width="112" height="88" rx="18" fill="#16293F" />
                      <circle cx="340" cy="317" r="29" fill="url(#lens)" /><circle cx="340" cy="317" r="15" fill="#0D1B2A" />
                      <circle cx="335" cy="311" r="5" fill="#DCE8F2" />
                      <path d="M268 282h-34v70h34M412 282h34v70h-34" stroke="#0AA5A0" strokeWidth="5" />
                      <path d="M340 390v35" stroke="#FF7B8C" strokeDasharray="5 7" /><circle cx="340" cy="441" r="12" fill="#FF7B8C" />
                      <circle cx="340" cy="441" r="28" stroke="#FF7B8C" strokeOpacity=".5" />
                      <rect x="34" y="30" width="167" height="34" rx="17" fill="#0D1B2A" fillOpacity=".72" stroke="white" strokeOpacity=".16" />
                      <circle cx="54" cy="47" r="5" fill="#0AA5A0" />
                      <text x="68" y="51" fill="#E7EEF6" fontFamily="monospace" fontSize="11" letterSpacing="1">STABILIZATION ACTIVE</text>
                      <path d="M439 315l74 50" stroke="#0AA5A0" strokeDasharray="5 5" />
                      <rect x="497" y="365" width="143" height="49" rx="12" fill="#0D1B2A" fillOpacity=".84" stroke="white" strokeOpacity=".12" />
                      <text x="511" y="385" fill="#9FB0C4" fontFamily="monospace" fontSize="9">TARGET LOCK</text>
                      <text x="511" y="402" fill="white" fontFamily="monospace" fontSize="12">TRACKING</text>
                    </svg>
                  </div>
                </div>
                <div className="wrap stats">
                  <div><strong>1.5<small> mi</small></strong><span>Target range goal</span></div>
                  <div><strong>&lt;3<small> lb</small></strong><span>Gimbal mass target</span></div>
                  <div><strong>25<small> W</small></strong><span>Average power goal</span></div>
                  <div><strong>2<small> axes</small></strong><span>Stabilized mount</span></div>
                </div>
              </header>
      
              <section id="project">
                <div className="wrap mission">
                  <div>
                    <div className="eyebrow">The mission</div>
                    <h2>Keep the target in frame while the aircraft moves.</h2>
                    <p className="lead">
                      The team is developing a compact optical tracking payload that can detect and follow ground
                      or airborne targets while mounted beneath a multi-rotor drone.
                    </p>
                    <p className="body-copy">
                      The project combines an upgraded airframe with a purpose-built gimbal. A useful aerial view
                      needs to stay stable through vibration, wind, and flight maneuvers while remaining light
                      enough to fly and clear enough for an operator to trust.
                    </p>
                    <a className="text-link" href="https://www.siemens.com/" target="_blank" rel="noreferrer">
                      Project sponsor: Siemens ↗
                    </a>
                  </div>
                  <div className="pillar-list">
                    <article className="card pillar"><span className="icon" aria-hidden="true">◎</span><div><h3>Stabilize</h3><p>Reduce vibration and maintain line of sight.</p></div></article>
                    <article className="card pillar"><span className="icon" aria-hidden="true">⌁</span><div><h3>Track</h3><p>Use onboard vision to follow moving targets.</p></div></article>
                    <article className="card pillar"><span className="icon" aria-hidden="true">↗</span><div><h3>Integrate</h3><p>Bring aircraft, sensing, compute, and control together.</p></div></article>
                  </div>
                </div>
              </section>
      
              <TrackingDemo />
    </>
  ) },
  { id: "team", label: "Team", content: (
    <>
      <section id="team" className="soft">
                <div className="wrap">
                  <SectionHeading
                    eyebrow="People behind the project"
                    title="Six roles. One flight system."
                    description="An interdisciplinary team covering mechanical, hardware, software, integration, systems, and test."
                  />
                  <div className="team-grid">
                    {team.map((member, index) => (
                      <article className="card person" key={member.name}>
                        <span className={`avatar a${index}`} aria-hidden="true">{member.initials}</span>
                        <h3>{member.name}</h3>
                        <div className="role">{member.role}</div>
                        <p>{member.focus}</p>
                      </article>
                    ))}
                  </div>
                  <div className="people-foot">
                    <div className="person-affil"><small>FACULTY ADVISOR</small><strong>Dr. Hamid Jafanejad Sani</strong></div>
                    <div className="person-affil"><small>PROJECT SPONSOR</small><a href="https://www.siemens.com/" target="_blank" rel="noreferrer"><strong>Siemens ↗</strong></a></div>
                    <div className="person-affil"><small>INSTITUTION</small><a href="https://www.stevens.edu/" target="_blank" rel="noreferrer"><strong>Stevens Institute of Technology ↗</strong></a></div>
                  </div>
                </div>
              </section>
    </>
  ) },
  { id: "design", label: "Design", content: (
    <>
      <section id="design">
                <div className="wrap">
                  <SectionHeading
                    eyebrow="Conceptual design"
                    title="Eight concepts. Four finalists."
                    description="The team compared system architectures across cost, range, power, accuracy, response, weight, size, schedule, and safety."
                  />
                  <ConceptChooser concepts={concepts} />
                </div>
              </section>
      
              <section id="engineering" className="soft">
                <div className="wrap">
                  <SectionHeading
                    eyebrow="Technical analysis & engineering"
                    title="Performance targets shape the design."
                    description="Review the key goals first; open the technical details for subsystem requirements and architecture."
                  />
                  <div className="metric-cards">
                    <article><strong>1.5 mi</strong><span>Target detection range</span></article>
                    <article><strong>&lt; 3 lb</strong><span>Gimbal mass target</span></article>
                    <article><strong>25 W</strong><span>Average power goal</span></article>
                  </div>
                  <details className="disclosure">
                    <summary><span>Technical targets and analysis</span><small>Requirements, constraints, and system architecture</small></summary>
                    <div className="disclosure-body">
                      <div className="engineering-grid">
                        <div className="requirements card">
                          <div className="table-head"><span>Requirement</span><span>Target</span><span>Limit</span></div>
                          {requirements.map(([name, target, limit]) => (
                            <div className="requirement-row" key={name}><span>{name}</span><b>{target}</b><small>{limit}</small></div>
                          ))}
                          <p className="note">Targets are starting engineering goals from the project brief. Confirm final values through testing and sponsor review.</p>
                        </div>
                        <div className="analysis-stack">
                          <article className="analysis-card">
                            <div className="analysis-icon" aria-hidden="true">⌖</div>
                            <small>VISION & CONTROL</small><h3>Track at camera rate</h3>
                            <p>Onboard detection feeds a closed-loop pointing controller. Flight telemetry and the IMU support stabilization; manual override remains available.</p>
                            <div className="mini-flow"><span>Camera</span><i>→</i><span>Detection</span><i>→</i><span>Gimbal</span></div>
                          </article>
                          <article className="analysis-card">
                            <div className="analysis-icon teal-icon" aria-hidden="true">ϟ</div>
                            <small>FLIGHT CONSTRAINTS</small><h3>Mass, power, heat</h3>
                            <p>Payload mass and average draw affect endurance. The sealed enclosure must also keep compute hardware below its thermal limit.</p>
                            <div className="mini-flow"><span>≤ 3 lb</span><i>·</i><span>25 W goal</span><i>·</i><span>&lt; 40°C</span></div>
                          </article>
                        </div>
                      </div>
                      <div className="architecture">
                        <div className="architecture-label"><small>PROPOSED SYSTEM ARCHITECTURE</small><span>Design baseline</span></div>
                        <div className="arch-flow">
                          <div><small>01 · SENSE</small><b>Optical camera + IMU</b></div><i>→</i>
                          <div><small>02 · COMPUTE</small><b>Jetson Orin Nano</b></div><i>→</i>
                          <div><small>03 · CONTROL</small><b>2-axis gimbal</b></div><i>→</i>
                          <div><small>04 · REVIEW</small><b>Wireless ground station</b></div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </section>
    </>
  ) },
  { id: "plan", label: "Plan & budget", content: (
    <>
      <section id="plan">
                <div className="wrap">
                  <SectionHeading
                    eyebrow="Execution plan & resources"
                    title="From design review to flight demo."
                    description="A concise milestone view, with the detailed schedule and parts list available when needed."
                  />
                  <div className="timeline">
                    {milestones.map(([id, title, description], index) => (
                      <article className="milestone" key={id}>
                        <div className="mile-mark"><span>{id}</span>{index < milestones.length - 1 && <i />}</div>
                        <div><small>PHASE {String(index + 1).padStart(2, "0")}</small><h3>{title}</h3><p>{description}</p></div>
                      </article>
                    ))}
                  </div>
                  <details className="disclosure">
                    <summary><span>View proposed Gantt chart</span><small>Phase spans shown; confirm calendar dates with the team</small></summary>
                    <div className="disclosure-body">
                      <div className="gantt-scroll">
                        <div className="gantt">
                          <div className="gantt-head"><b>Workstream</b>{milestones.map(([id]) => <span key={id}>{id}</span>)}</div>
                          {schedule.map(([task, start, end]) => (
                            <div className="gantt-row" key={task}>
                              <b>{task}</b><div className="gantt-track"><i style={{ gridColumn: `${start} / ${end}` }} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>
                  <div className="resource-grid">
                    <details className="resource-card disclosure bom-disclosure">
                      <summary><span><small>PRELIMINARY BOM</small><b>System components</b></span><span>6 groups</span></summary>
                      <div className="disclosure-body">
                        <div className="bom-list">
                          {billOfMaterials.map(([group, item, quantity, cost]) => (
                            <div className="bom-row" key={group}><span>{group}</span><b>{item}</b><small>{quantity}</small><strong>{cost}</strong></div>
                          ))}
                        </div>
                        <p className="note">Replace TBD costs with supplier quotes and confirmed quantities.</p>
                      </div>
                    </details>
                    <article className="budget-card">
                      <div className="eyebrow">Budget baseline</div><h3>$3,000</h3><p>Project budget target</p>
                      <div className="budget-track" aria-label="Budget target is 60 percent of the current planned cap"><i style={{ width: "60%" }} /></div>
                      <div className="budget-values"><span>Target <b>$3,000</b></span><span>Current planned cap <b>$5,000</b></span></div>
                      <div className="budget-callout">Update this panel as the BOM and sponsor contributions are confirmed.</div>
                    </article>
                  </div>
                </div>
              </section>
    </>
  ) },
  { id: "updates", label: "Updates", content: (
    <>
      <UpdatesFeed />
      
              <section className="closing">
                <div className="wrap closing-inner">
                  <div><div className="eyebrow">ME 423 · STEVENS INSTITUTE OF TECHNOLOGY</div><h2>Built to keep the view steady.</h2><p>Gimbaled Drone System · Siemens Senior Design Project</p></div>
                  <a className="button primary" href="#home">Back to top ↑</a>
                </div>
              </section>
    </>
  ) },
];

export default function Home() {
  return (
    <>
      <ProjectTabs tabs={tabs} />
      <footer className="footer">
              <div className="wrap footer-inner">
                <span>Gimbaled Drone System <i>·</i> ME 423 X2</span>
                <span><a href="https://www.siemens.com/" target="_blank" rel="noreferrer">Siemens</a><i>·</i><a href="https://www.stevens.edu/" target="_blank" rel="noreferrer">Stevens Institute of Technology</a></span>
                <span>Project information subject to team review.</span>
              </div>
            </footer>
    </>
  );
}
