import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false, // CRITICAL: prevents auto-rendering which causes "Syntax error" on page
  theme: 'base',
  suppressErrors: true, // Suppress error output to DOM
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#fff',
    primaryBorderColor: '#4f46e5',
    lineColor: '#6366f1',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#fff',
  },
  flowchart: {
    curve: 'basis',
    padding: 20
  }
});

// Only attempt to render diagrams that start with a valid Mermaid keyword
const VALID_PREFIXES = [
  'graph ', 'flowchart ', 'sequencediagram', 'classdiagram',
  'statediagram', 'erdiagram', 'gantt', 'pie', 'gitgraph', 'mindmap'
];

const isValidDiagram = (chart) => {
  if (!chart || typeof chart !== 'string' || chart.trim().length < 10) return false;
  const lower = chart.trim().toLowerCase();
  return VALID_PREFIXES.some(p => lower.startsWith(p));
};

const Mermaid = ({ chart }) => {
  const ref = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!chart || !isValidDiagram(chart)) {
      setHasError(true);
      return;
    }

    setHasError(false);

    if (!ref.current) return;

    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    ref.current.id = id;

    mermaid.render(id, chart.trim())
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      })
      .catch((error) => {
        console.warn('[Mermaid] Invalid diagram syntax — skipping render:', error?.message);
        setHasError(true);
      });
  }, [chart]);

  // Return nothing — no error UI, no empty box
  if (hasError) return null;

  return (
    <div
      className="mermaid-container flex justify-center p-4 bg-white rounded-3xl border border-slate-100 shadow-inner overflow-x-auto"
      ref={ref}
    />
  );
};

export default Mermaid;

