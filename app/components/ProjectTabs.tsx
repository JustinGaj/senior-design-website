"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type ProjectTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function ProjectTabs({ tabs }: { tabs: ProjectTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const validIds = new Set(tabs.map((tab) => tab.id));
    const syncFromHash = () => {
      const hashId = window.location.hash.slice(1);
      if (validIds.has(hashId)) setActiveId(hashId);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [tabs]);

  const selectTab = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    selectTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <>
      <header className="project-nav">
        <a className="brand" href="#overview" onClick={() => selectTab("overview")}>
          <span className="brand-mark"><i /></span>
          GIMBALED<span>DRONE</span>
        </a>
        <div className="project-tabs" role="tablist" aria-label="Project sections">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={`tab-${tab.id}`}
              className="project-tab"
              type="button"
              role="tab"
              aria-selected={activeTab.id === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab.id === tab.id ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <main className="tab-page">
        <div
          id={`panel-${activeTab.id}`}
          className="tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          tabIndex={0}
        >
          {activeTab.content}
        </div>
        {tabs.filter((tab) => tab.id !== activeTab.id).map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden
          />
        ))}
      </main>
    </>
  );
}
