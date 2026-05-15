import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
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

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.contentLoaded();
      // Use a unique ID for each mermaid diagram to prevent collisions
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      ref.current.id = id;
      
      try {
        mermaid.render(id, chart).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error("Mermaid Render Error:", error);
      }
    }
  }, [chart]);

  return (
    <div 
      className="mermaid-container flex justify-center p-4 bg-white rounded-3xl border border-slate-100 shadow-inner overflow-x-auto" 
      ref={ref} 
    />
  );
};

export default Mermaid;
