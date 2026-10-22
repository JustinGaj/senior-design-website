"use client";

import { useState } from "react";

export type Concept = {
  n: string;
  image: { src: string; width: number; height: number; viewHeight: number; alt: string };
  name: string;
  body: string;
  score: string;
  color: string;
  strength: string;
  tradeoff: string;
};

export function ConceptChooser({ concepts }: { concepts: Concept[] }) {
  const [selected, setSelected] = useState(0);
  const concept = concepts[selected];

  return (
    <>
      <div className="finalist-row">
        <span>ADVANCED FOR FURTHER EVALUATION</span>
        {concepts.map((item) => <b key={item.n}>{item.name}</b>)}
      </div>
      <div className="card static-panel concept-disclosure">
        <div className="static-panel-heading">
          <h3>Finalist scores and trade-offs</h3>
          <small>Four concepts advanced for deeper evaluation</small>
        </div>
        <div className="disclosure-body">
          <div className="concept-layout">
            <div className="concept-list" role="group" aria-label="Select a finalist concept">
              {concepts.map((item, index) => (
                <button
                  className={`concept-choice ${selected === index ? "selected" : ""}`}
                  key={item.n}
                  type="button"
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                >
                  <span className={`concept-index ${item.color}`}>{item.n}</span>
                  <span><b>{item.name}</b><small>{item.body}</small></span>
                  <span className="arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <article className="concept-feature" aria-live="polite">
              <div className="concept-visual">
                <div className="concept-visual-header">
                  <span className="concept-tag">CONCEPT {concept.n} / 8</span>
                  <div className="concept-caption"><small>WEIGHTED MATRIX</small><strong>{concept.score}</strong></div>
                </div>
                <a className="concept-image-link" href={concept.image.src} target="_blank" rel="noreferrer" aria-label={`Open full-size ${concept.name} diagram`}>
                  <svg
                    className="concept-diagram"
                    viewBox={`0 0 ${concept.image.width} ${concept.image.viewHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label={concept.image.alt}
                  >
                    {/* Concept 3 uses the report's bottom-page whitespace crop; no drawing content is clipped. */}
                    <image href={concept.image.src} width={concept.image.width} height={concept.image.height} />
                  </svg>
                  <span className="concept-full-size">Full-size diagram ↗</span>
                </a>
              </div>
              <div className="concept-description">
                <div>
                  <small>SELECTION SUMMARY</small>
                  <h3>{concept.name}</h3>
                  <p><b>Strength:</b> {concept.strength}</p>
                  <p><b>Trade-off:</b> {concept.tradeoff}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
