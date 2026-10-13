"use client";

import { useEffect, useRef, useState } from "react";

type TargetMode = "ground" | "air";

export function TrackingDemo() {
  const [mode, setMode] = useState<TargetMode>("ground");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const aircraft = svg.querySelector<SVGGElement>("[data-aircraft]");
    const groundTarget = svg.querySelector<SVGGElement>("[data-ground-target]");
    const airTarget = svg.querySelector<SVGGElement>("[data-air-target]");
    const beam = svg.querySelector<SVGLineElement>("[data-beam]");
    const gimbal = svg.querySelector<SVGGElement>("[data-gimbal]");
    const lockRing = svg.querySelector<SVGGElement>("[data-lock-ring]");
    if (!aircraft || !groundTarget || !airTarget || !beam || !gimbal || !lockRing) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let frame = 0;
    let active = false;
    let lastFrame = 0;

    const animate = (time: number) => {
      if (!active) return;
      if (time - lastFrame >= 32) {
        const seconds = time / 1000;
        const aircraftX = 162 + Math.sin(seconds * 0.55) * 20;
        const aircraftY = 62 + Math.sin(seconds * 1.2) * 4;
        const targetX = 675 + Math.sin(seconds * 0.72) * 95;
        const targetY = mode === "ground" ? 306 : 166 + Math.sin(seconds * 0.62) * 25;

        // The camera's pivot is fixed to the drone's underside; only its pan angle changes.
        const pivotY = aircraftY + 30;
        const angle = -Math.atan2(targetX - aircraftX, targetY - pivotY);
        const lensX = aircraftX - Math.sin(angle) * 12;
        const lensY = pivotY + Math.cos(angle) * 12;

        aircraft.setAttribute("transform", `translate(${aircraftX} ${aircraftY})`);
        groundTarget.setAttribute("transform", `translate(${targetX} 306)`);
        airTarget.setAttribute("transform", `translate(${targetX} ${targetY})`);
        lockRing.setAttribute("transform", `translate(${targetX} ${targetY})`);
        gimbal.setAttribute("transform", `rotate(${angle * 180 / Math.PI} 0 30)`);
        beam.setAttribute("x1", String(lensX));
        beam.setAttribute("y1", String(lensY));
        beam.setAttribute("x2", String(targetX));
        beam.setAttribute("y2", String(targetY));
        beam.setAttribute("stroke-dashoffset", String((time / 30) % 22));
        lastFrame = time;
      }
      frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !active) {
        active = true;
        frame = requestAnimationFrame(animate);
      } else if (!entry.isIntersecting && active) {
        active = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(svg);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mode]);

  return (
    <section className="tracking-section" id="tracking">
      <div className="wrap">
        <div className="tracking-heading">
          <div>
            <div className="eyebrow">Live system concept</div>
            <h2>Follow the target. Keep the image steady.</h2>
            <p className="lead">Switch between a ground target and another drone to see the tracking geometry change.</p>
          </div>
          <div className="tracking-controls" role="group" aria-label="Choose tracking target">
            <button type="button" aria-pressed={mode === "ground"} onClick={() => setMode("ground")}>
              Ground target
            </button>
            <button type="button" aria-pressed={mode === "air"} onClick={() => setMode("air")}>
              Aerial target
            </button>
          </div>
        </div>

        <div className="tracking-canvas">
          <svg
            ref={svgRef}
            viewBox="0 0 900 380"
            role="img"
            aria-labelledby="tracking-title tracking-description"
          >
            <title id="tracking-title">
              {mode === "ground" ? "Drone tracking a ground target" : "Drone tracking another drone"}
            </title>
            <desc id="tracking-description">
              An animated illustration shows the tracking drone maintaining a line of sight to a moving target.
            </desc>
            <defs>
              <linearGradient id="tracking-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9e8f5" />
                <stop offset="1" stopColor="#f5f8fb" />
              </linearGradient>
            </defs>
            <rect width="900" height="380" fill="url(#tracking-sky)" />
            <path d="M0 265 Q160 245 320 268 T640 260 T900 270 V380 H0Z" fill="#dce8d4" />
            <path d="M0 294 Q175 280 330 295 T670 288 T900 298" stroke="#c1d4b7" strokeWidth="2" fill="none" />

            <line data-beam x1="162" y1="154" x2="675" y2="306" stroke="#a32638" strokeWidth="2" strokeDasharray="8 7" />
            <g data-lock-ring transform="translate(675 306)">
              <circle r="35" fill="none" stroke="#0aa5a0" strokeOpacity=".32" />
              <circle r="57" fill="none" stroke="#0aa5a0" strokeOpacity=".16" />
            </g>

            <g data-aircraft transform="translate(162 62)">
              <path d="M-72 6H72" stroke="#0d1b2a" strokeWidth="8" strokeLinecap="round" />
              <path d="M-47 5L-69 -14M47 5L69 -14" stroke="#0d1b2a" strokeWidth="6" strokeLinecap="round" />
              <path d="M-88 -15H-49M49 -15H88" stroke="#0aa5a0" strokeWidth="5" strokeLinecap="round" />
              <rect x="-24" y="-8" width="48" height="28" rx="11" fill="#16293f" />
              <path d="M0 20V30" stroke="#71869b" strokeWidth="4" />
              <rect x="-17" y="20" width="9" height="6" rx="3" fill="#27313c" />
              <rect x="8" y="20" width="9" height="6" rx="3" fill="#27313c" />
              <rect x="-21" y="26" width="42" height="4" rx="2" fill="#aab9c8" />
              <circle cx="0" cy="30" r="6" fill="#0aa5a0" stroke="#fff" strokeWidth="3" />
              <g data-gimbal transform="rotate(0 0 30)">
                <rect x="-26" y="28" width="52" height="28" rx="9" fill="#e8edf3" stroke="#71869b" strokeWidth="3" />
                <circle cx="0" cy="42" r="10" fill="#a32638" />
                <circle cx="0" cy="42" r="4" fill="#0d1b2a" />
                <circle cx="0" cy="42" r="18" fill="none" stroke="#0aa5a0" strokeOpacity=".6" />
              </g>
            </g>

            <g data-ground-target transform="translate(675 306)" style={{ display: mode === "ground" ? "block" : "none" }}>
              <circle r="12" fill="#ff8a1f" />
              <path d="M-18 0H18M0 -18V18" stroke="#fff" strokeWidth="2" />
              <circle r="25" fill="none" stroke="#ff8a1f" strokeOpacity=".45" />
            </g>
            <g data-air-target transform="translate(675 166)" style={{ display: mode === "air" ? "block" : "none" }}>
              <path d="M-40 0H40" stroke="#44566c" strokeWidth="6" strokeLinecap="round" />
              <path d="M-26 -2L-40 -15M26 -2L40 -15" stroke="#44566c" strokeWidth="4" />
              <path d="M-52 -16H-30M30 -16H52" stroke="#0aa5a0" strokeWidth="4" strokeLinecap="round" />
              <rect x="-15" y="-8" width="30" height="16" rx="7" fill="#44566c" />
              <circle cx="0" cy="13" r="5" fill="#ff8a1f" />
              <circle r="30" fill="none" stroke="#ff8a1f" strokeOpacity=".45" />
            </g>

            <rect x="20" y="20" width="189" height="31" rx="15" fill="#0d1b2a" fillOpacity=".8" />
            <circle cx="39" cy="35" r="5" fill="#0aa5a0" />
            <text x="52" y="39" fill="#e7eef6" fontFamily="monospace" fontSize="10" letterSpacing="1">
              {mode === "ground" ? "GROUND TARGET LOCK" : "AERIAL TARGET LOCK"}
            </text>
            <text x="866" y="350" textAnchor="end" fill="#5a6778" fontFamily="monospace" fontSize="9">
              CONCEPT ILLUSTRATION · NOT FLIGHT TELEMETRY
            </text>
          </svg>
        </div>
        <p className="tracking-caption">The camera is physically mounted below the aircraft in this concept view. Its gimbal pivots at that mount to keep the selected target centered.</p>
      </div>
    </section>
  );
}
