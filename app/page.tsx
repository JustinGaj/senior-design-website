import Image from "next/image";
import { ConceptChooser, type Concept } from "./components/ConceptChooser";
import { ProjectSchedule } from "./components/ProjectSchedule";
import { TrackingDemo } from "./components/TrackingDemo";
import { UpdatesFeed } from "./components/UpdatesFeed";
import { ProjectTabs, type ProjectTab } from "./components/ProjectTabs";

const team = [
  { name: "Claire Deatrick", role: "Mechanical Design Lead", focus: "Mechanical design and enclosure.", photo: "/images/team/claire-deatrick.png", linkedIn: "https://www.linkedin.com/in/claire-deatrick-a4749a298/", avatar: "a0" },
  { name: "Chris Persico", role: "Systems Lead", focus: "System requirements and interactions.", photo: "/images/team/chris-persico.jpg", linkedIn: "https://www.linkedin.com/in/christopher-m-persico/", avatar: "a4" },
  { name: "Robert Dominik", role: "Testing Lead", focus: "Test procedures and performance evaluation.", photo: "/images/team/robert-dominik.png", linkedIn: "https://www.linkedin.com/in/r-dominik/", avatar: "a5" },
  { name: "Ryan Paradine", role: "Hardware Lead", focus: "Electronics and sensor components.", photo: "/images/team/ryan-paradine.jpg", linkedIn: "https://www.linkedin.com/in/ryan-paradine-73b147388/", avatar: "a1" },
  { name: "Justin Gajewski", role: "Software Lead", focus: "Computer vision and control logic.", photo: "/images/team/justin-gajewski.jpg", linkedIn: "https://www.linkedin.com/in/justingaj/", avatar: "a2" },
  { name: "Matthew Hodorowski", role: "Integration Lead", focus: "Hardware and software integration.", photo: "/images/team/matthew-hodorowski.jpg", linkedIn: "https://www.linkedin.com/in/matthew-hodorowski/", avatar: "a3" },
];

const concepts: Concept[] = [
  {
    n: "3",
    image: { src: "/images/concepts/concept-3.jpg", width: 1668, height: 2157, viewHeight: 951, alt: "Orange Pi and Arduino electronics enclosure with viscous dampers, stepper yaw and pitch motors, and a Lucid Triton 2 camera." },
    name: "Concept 3",
    body: "Orange Pi 5 Plus · Lucid Triton 2",
    score: "Net +3 · Rank 1",
    color: "red",
    strength: "Light, compact, and power efficient.",
    tradeoff: "Shorter reach and slower stepper response.",
  },
  {
    n: "5",
    image: { src: "/images/concepts/concept-5.jpg", width: 1920, height: 1484, viewHeight: 1484, alt: "Autonomous hexacopter with LiPo batteries, rubber dampers, pancake motor gimbal, FarVis22 camera, and Jetson and FPGA electronics enclosure." },
    name: "Concept 5",
    body: "Jetson Orin Nano · FarVis22 10X",
    score: "Net +2 · Rank 2",
    color: "teal",
    strength: "Long range, fast tracking, and autonomous operation.",
    tradeoff: "Higher mass and power from the compute and optics.",
  },
  {
    n: "6",
    image: { src: "/images/concepts/concept-6.jpg", width: 809, height: 426, viewHeight: 426, alt: "Two-axis servo gimbal with an FPGA, lithium-ion battery, polymer damper, FarVis22 camera, and a perspective view." },
    name: "Concept 6",
    body: "Jetson Orin Nano · FarVis22 10X",
    score: "Net +1 · Rank 3",
    color: "blue",
    strength: "Strong range, accuracy, and flexible control.",
    tradeoff: "Cost, mass, and FPGA integration effort.",
  },
  {
    n: "7",
    image: { src: "/images/concepts/concept-7.jpg", width: 827, height: 532, viewHeight: 532, alt: "Three-axis brushless gimbal with Arduino control, LiPo battery, viscous damper, Lucid Triton 2 camera, and an alternate view." },
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
  ["Temperature", "—", "60°C"],
  ["Loiter time", "30 min", "20 min"],
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
                    <h1>A steadier view<br />from the <em>sky.</em></h1>
                    <p className="hero-lead">
                      A lightweight, stabilized optical tracker for multi-rotor drones—built to find a target,
                      hold the lock, and keep the picture clear.
                    </p>
                    <div className="actions">
                      <a className="button primary" href="#project">Explore the project <span>↓</span></a>
                      <a className="button ghost" href="#tracking">See tracking demo</a>
                    </div>
                    <div className="hero-note"><span className="pulse" /> Sponsored by Siemens</div>
                  </div>
                  <div className="visual" role="img" aria-label="Drone with a compact horizontal camera gimbal and rubber vibration dampeners mounted underneath">
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
                      <rect x="309" y="191" width="13" height="12" rx="4" fill="#27313C" />
                      <rect x="358" y="191" width="13" height="12" rx="4" fill="#27313C" />
                      <rect x="295" y="199" width="90" height="6" rx="3" fill="#AAB9C8" />
                      <rect x="280" y="205" width="120" height="55" rx="16" fill="#E9EDF2" />
                      <rect x="292" y="211" width="96" height="43" rx="12" fill="#16293F" />
                      <circle cx="340" cy="232" r="17" fill="url(#lens)" />
                      <circle cx="340" cy="232" r="9" fill="#0D1B2A" />
                      <circle cx="336" cy="228" r="4" fill="#DCE8F2" />
                      <path d="M280 214h-14v37h14M400 214h14v37h-14" stroke="#0AA5A0" strokeWidth="5" />
                      <path d="M340 263v118" stroke="#FF7B8C" strokeDasharray="5 7" />
                      <circle cx="340" cy="398" r="12" fill="#FF7B8C" />
                      <circle cx="340" cy="398" r="28" stroke="#FF7B8C" strokeOpacity=".5" />
                      <rect x="34" y="30" width="206" height="34" rx="17" fill="#0D1B2A" fillOpacity=".82" stroke="white" strokeOpacity=".16" />
                      <circle cx="54" cy="47" r="5" fill="#0AA5A0" />
                      <text x="68" y="51" fill="#E7EEF6" fontFamily="monospace" fontSize="10" letterSpacing=".7">IMU STABILIZATION ON</text>
                      <path d="M208 245L279 205" stroke="#0AA5A0" strokeDasharray="4 5" strokeOpacity=".8" />
                      <rect x="34" y="220" width="174" height="58" rx="12" fill="#0D1B2A" fillOpacity=".86" stroke="white" strokeOpacity=".14" />
                      <text x="48" y="241" fill="#9FB0C4" fontFamily="monospace" fontSize="9">VIBRATION ISOLATION</text>
                      <text x="48" y="259" fill="white" fontFamily="monospace" fontSize="11">Rubber dampeners</text>
                      <path d="M398 237l78 118" stroke="#0AA5A0" strokeDasharray="5 5" />
                      <rect x="476" y="355" width="174" height="76" rx="12" fill="#0D1B2A" fillOpacity=".84" stroke="white" strokeOpacity=".12" />
                      <text x="490" y="374" fill="#9FB0C4" fontFamily="monospace" fontSize="8">PAYLOAD · 2-AXIS GIMBAL</text>
                      <text x="490" y="394" fill="white" fontFamily="monospace" fontSize="9">ONBOARD VISION COMPUTE</text>
                      <text x="490" y="415" fill="#9FB0C4" fontFamily="monospace" fontSize="9">TARGET LOCK · ACTIVE</text>
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
                    <p className="lead">
                      Eagle Eye is a compact optical tracking payload designed to keep ground and aerial targets
                      in view as a multi-rotor drone moves. By combining vibration isolation, stabilized pointing,
                      and onboard vision, the project aims to give operators a clear, steady view without adding
                      unnecessary weight to the aircraft.
                    </p>
                    <a className="text-link" href="https://www.siemens.com/" target="_blank" rel="noreferrer">
                      Project sponsor: Siemens ↗
                    </a>
                  </div>

                </div>
              </section>
      
              <UpdatesFeed limit={2} hidePlaceholders />

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
                    {team.map((member) => (
                      <article className="card person" key={member.name}>
                        <span className={`avatar ${member.avatar}`}>
                          <Image
                            className="avatar-photo"
                            src={member.photo}
                            alt={`${member.name} profile portrait`}
                            width={54}
                            height={54}
                            sizes="(max-width: 680px) 44px, 54px"
                          />
                        </span>
                        <h3><a href={member.linkedIn} target="_blank" rel="noreferrer">{member.name} ↗</a></h3>
                        <div className="role">{member.role}</div>
                        <p>{member.focus}</p>
                      </article>
                    ))}
                  </div>
                  <div className="people-foot">
                    <div className="person-affil"><small>FACULTY ADVISOR</small><a href="https://www.linkedin.com/in/hamid-jafarnejad-sani-phd-37461457/" target="_blank" rel="noreferrer"><strong>Dr. Hamid Jafanejad Sani ↗</strong></a></div>
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
                    description="Subsystem requirements and the proposed system architecture."
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
                    description="Project milestones, detailed schedule, build materials, and budget."
                  />
                  <details className="disclosure">
                    <summary><span>View Gantt chart</span><small>September–November 2026 project schedule</small></summary>
                    <div className="disclosure-body">
                      <ProjectSchedule />
                    </div>
                  </details>
                  <div className="resource-grid">
                    <article className="resource-card card static-panel bom-disclosure">
                      <div className="static-panel-heading"><div><small>PRELIMINARY BOM</small><h3>Build materials</h3></div><span>6 groups</span></div>
                      <div className="disclosure-body">
                        <div className="bom-list">
                          {billOfMaterials.map(([group, item, quantity, cost]) => (
                            <div className="bom-row" key={group}><span>{group}</span><b>{item}</b><small>{quantity}</small><strong>{cost}</strong></div>
                          ))}
                        </div>
                      </div>
                    </article>
                    <article className="budget-card">
                      <div className="eyebrow">Budget baseline</div><h3>$3,000</h3><p>Project budget target</p>
                      <div className="budget-track" aria-label="Budget target is 60 percent of the current planned cap"><i style={{ width: "60%" }} /></div>
                      <div className="budget-values"><span>Target <b>$3,000</b></span><span>Current planned cap <b>$5,000</b></span></div>
                    </article>
                  </div>
                </div>
              </section>
    </>
  ) },
  { id: "updates", label: "Updates", content: (
    <>
      <UpdatesFeed />
      
              
    </>
  ) },
];

export default function Home() {
  return (
    <>
      <ProjectTabs tabs={tabs} />
      <footer className="footer">
              <div className="wrap footer-inner">
                <span>Gimbaled Drone System</span>
                <span><a href="https://www.siemens.com/" target="_blank" rel="noreferrer">Siemens</a><i>·</i><a href="https://www.stevens.edu/" target="_blank" rel="noreferrer">Stevens Institute of Technology</a></span>
              </div>
            </footer>
    </>
  );
}
