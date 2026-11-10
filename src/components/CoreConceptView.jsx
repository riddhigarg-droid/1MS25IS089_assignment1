import React from 'react';
import katex from 'katex';
import { AlertCircle, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CoreConceptView({ coreConcept, paperTitle }) {
  if (!coreConcept) return null;

  // Render LaTeX math string with fallback
  const renderMath = (latex) => {
    try {
      return {
        __html: katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false
        })
      };
    } catch (e) {
      return { __html: latex };
    }
  };

  // Estimate word count for core concepts
  const breakthroughsText = Array.isArray(coreConcept.breakthroughs)
    ? coreConcept.breakthroughs.map(b => (typeof b === 'object' ? `${b.title || ''} ${b.description || ''}` : String(b))).join(' ')
    : '';
  const fullText = `${coreConcept.problemStatement || ''} ${coreConcept.primaryMethodology || ''} ${breakthroughsText}`;
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header with Word Count Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" size={20} />
          <h2 className="text-lg font-bold text-slate-100">Core Concept Extraction</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
          {wordCount} words (&lt; 300 words target)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Problem Statement Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <AlertCircle size={18} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold font-mono">Problem Statement</span>
              <h3 className="text-sm font-semibold text-slate-200">The Core Bottleneck</h3>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {coreConcept.problemStatement}
          </p>
        </div>

        {/* Primary Methodology Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Cpu size={18} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold font-mono">Primary Methodology</span>
              <h3 className="text-sm font-semibold text-slate-200">Proposed Solution</h3>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {coreConcept.primaryMethodology}
          </p>
        </div>
      </div>

      {/* Key Mathematical & Algorithmic Breakthroughs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-indigo-400" size={18} />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide font-mono text-xs">
            Key Mathematical & Algorithmic Breakthroughs
          </h3>
        </div>

        <div className="space-y-4">
          {Array.isArray(coreConcept.breakthroughs) && coreConcept.breakthroughs.map((item, idx) => {
            const title = typeof item === 'object' && item ? (item.title || `Breakthrough ${idx + 1}`) : `Breakthrough ${idx + 1}`;
            const description = typeof item === 'object' && item ? (item.description || item.title || '') : String(item);
            const formula = typeof item === 'object' && item ? item.formula : null;

            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    {title}
                  </span>
                </div>

                {formula && (
                  <div
                    className="my-3 py-2 px-3 bg-slate-900/90 border border-slate-800 rounded text-center overflow-x-auto text-blue-200"
                    dangerouslySetInnerHTML={renderMath(formula)}
                  />
                )}

                <p className="text-xs text-slate-300/90 leading-relaxed">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
