"use client";

import { useState } from "react";

export type Concept = {
  n: string;
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
      <details className="disclosure concept-disclosure">
        <summary>
          <span>Explore finalist scores and trade-offs</span>
          <small>Four concepts advanced for deeper evaluation</small>
        </summary>
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
                <span className="concept-tag">CONCEPT {concept.n} / 8</span>
                <div className="radar" aria-hidden="true"><i /><i /><i /><b>+</b><span className="radar-dot" /></div>
                <div className="concept-caption"><small>WEIGHTED MATRIX</small><strong>{concept.score}</strong></div>
              </div>
              <div className="concept-description">
                <div>
                  <small>SELECTION SUMMARY</small>
                  <h3>{concept.name}</h3>
                  <p><b>Strength:</b> {concept.strength} <b>Trade-off:</b> {concept.tradeoff}</p>
                </div>
                <div className="score-tags"><span>Cost</span><span>Range</span><span>Power</span><span>Accuracy</span><span>Safety</span></div>
              </div>
            </article>
          </div>
        </div>
      </details>
    </>
  );
}
