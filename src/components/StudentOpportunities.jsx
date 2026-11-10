import React, { useState } from 'react';
import { Briefcase, Target, Wrench, Clock, Check, Copy, Award, Rocket } from 'lucide-react';

export default function StudentOpportunities({ opportunities, paperTitle }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!opportunities || opportunities.length === 0) return null;

  const copyProjectSpec = (opp, idx) => {
    const techStr = getTechList(opp.techStack).join(', ');
    const text = `### Resume Project: ${opp.title || 'Paper Extension'} (Extension of ${paperTitle})
- **Exact Extension**: ${opp.extension || 'N/A'}
- **Target Performance Metric**: ${opp.targetMetric || 'N/A'}
- **Tech Stack**: ${techStr}
- **Difficulty & Timeline**: ${opp.difficulty || 'Intermediate'} (${opp.timeline || '2-3 weeks'})
`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getDifficultyColor = (diff) => {
    const safeDiff = (diff || 'intermediate').toString().toLowerCase();
    if (safeDiff.includes('begin')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (safeDiff.includes('adv')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const getTechList = (stack) => {
    if (Array.isArray(stack)) return stack;
    if (typeof stack === 'string') return stack.split(',').map(s => s.trim()).filter(Boolean);
    return ['PyTorch', 'Python'];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="text-amber-400" size={20} />
          <div>
            <h2 className="text-lg font-bold text-slate-100">Future Work & Internship Opportunities</h2>
            <p className="text-xs text-slate-400">Tailored resume portfolio projects for 3rd-year CS undergrads</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition relative group"
          >
            <div>
              {/* Card Header & Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(opp.difficulty)}`}>
                  {opp.difficulty}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {opp.timeline}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-slate-100 mb-3 group-hover:text-blue-400 transition">
                {opp.title}
              </h3>

              {/* 1. Exact Extension */}
              <div className="mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                  <Briefcase size={13} className="text-blue-400" />
                  Exact Extension
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  {opp.extension}
                </p>
              </div>

              {/* 2. Target Performance Metric */}
              <div className="mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                  <Target size={13} className="text-emerald-400" />
                  Targeted Metric
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  {opp.targetMetric}
                </p>
              </div>

              {/* 3. Recommended Tech Stack */}
              <div className="mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mb-2">
                  <Wrench size={13} className="text-purple-400" />
                  Recommended Tech Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {getTechList(opp.techStack).map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-md font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800/80 mt-2">
              <button
                onClick={() => copyProjectSpec(opp, idx)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700/60"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Resume Project Spec</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
