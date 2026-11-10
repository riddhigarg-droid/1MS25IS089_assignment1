import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Code2, Eye, Maximize2 } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0f172a',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#3b82f6',
    lineColor: '#60a5fa',
    secondaryColor: '#1e1b4b',
    tertiaryColor: '#0f172a',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  securityLevel: 'loose'
});

export default function MermaidViewer({ chartCode, title = "System Architecture" }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentCode, setCurrentCode] = useState(chartCode);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCurrentCode(chartCode);
  }, [chartCode]);

  useEffect(() => {
    let isMounted = true;
    let activeId = null;

    const renderDiagram = async () => {
      if (!currentCode) return;
      setError(null);
      activeId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const { svg } = await mermaid.render(activeId, currentCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (isMounted) {
          setError(err.message || 'Syntax error in Mermaid flowchart definition.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      // Cleanup any dangling temporary elements mermaid may leave in DOM
      if (activeId) {
        const el = document.getElementById(activeId);
        if (el) el.remove();
        const dEl = document.getElementById(`d${activeId}`);
        if (dEl) dEl.remove();
      }
    };
  }, [currentCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60 gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            [FLOWCHART]
          </span>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/70 p-1 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setZoom(z => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono text-slate-400 px-1 min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition ${
              showEditor ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {showEditor ? <Eye size={14} /> : <Code2 size={14} />}
            <span>{showEditor ? 'Preview' : 'Edit Code'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Copy Mermaid Code"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleDownloadSvg}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Download SVG Diagram"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {showEditor ? (
        <div className="p-4 bg-slate-950 font-mono text-xs">
          <div className="text-slate-400 mb-2 flex items-center justify-between">
            <span>Live Mermaid.js Editor (graph TD):</span>
            <span className="text-[11px] text-slate-500">Edit below to update the diagram in real time</span>
          </div>
          <textarea
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            rows={14}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs leading-relaxed"
          />
        </div>
      ) : null}

      <div className="relative min-h-[360px] p-6 flex items-center justify-center overflow-auto bg-slate-950/80">
        {error ? (
          <div className="text-center p-6 max-w-md bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300">
            <p className="font-semibold text-sm mb-1">Mermaid Render Warning</p>
            <p className="text-xs font-mono text-rose-400/80">{error}</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="mermaid-container transition-transform duration-150 ease-out flex justify-center w-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      <div className="px-5 py-2.5 bg-slate-900/50 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Interactive Vector Architecture Diagram (Mermaid.js)</span>
        <span>Drag & scroll to explore components and model data flow</span>
      </div>
    </div>
  );
}
