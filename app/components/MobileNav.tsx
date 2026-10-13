"use client";

import { useState } from "react";

type NavigationLink = readonly [label: string, id: string];

export function MobileNav({ links }: { links: readonly NavigationLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" aria-label="Main navigation">
      <a className="brand" href="#home">
        <span className="brandmark" aria-hidden="true">✳</span>
        Gimbaled Drone System
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-links"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "×" : "☰"}
      </button>
      <div id="primary-links" className={`nav-links ${open ? "open" : ""}`}>
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
