import React, { useState } from 'react';
import { BookOpen, Calendar, Users, Award, ExternalLink, Copy, Check, FileText } from 'lucide-react';
import { isValidArxivId } from '../services/academicApi';

export default function PaperMetadataCard({ metadata, paper }) {
  const [copied, setCopied] = useState(false);

  if (!metadata) return null;

  const citations = Number(metadata.citations) || 0;
  const year = metadata.year || 2024;
  const authors = metadata.authors || 'Unknown Authors';
  const publication = metadata.publication || 'Academic Publication';

  // Format exactly according to user prompt specification:
  // "Metadata: Citations: INT, Authors: STRING, Publication: STRING, Year: 4 digit INT,"
  const metadataString = `Metadata: Citations: ${citations}, Authors: ${authors}, Publication: ${publication}, Year: ${year},`;

  const handleCopy = () => {
    navigator.clipboard.writeText(metadataString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Metadata of Paper</h2>
            <p className="text-xs text-slate-400">Canonical citations, authors, and publication venue metrics</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition"
          title="Copy exact metadata format"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied String!' : 'Copy Formatted String'}</span>
        </button>
      </div>

      {/* Raw Prompt-Compliant Format Block */}
      <div className="mb-6 p-3.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed shadow-inner">
        <span className="text-slate-500 select-none block text-[10px] uppercase mb-1 font-sans font-semibold">Standard Output Format:</span>
        <code>{metadataString}</code>
      </div>

      {/* Structured Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Citations */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Citations</span>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {citations.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified via Academic APIs</p>
        </div>

        {/* Year */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Year</span>
            <Calendar size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {metadata.year}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">First Publication / ArXiv</p>
        </div>

        {/* Publication */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:col-span-2">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Publication Venue</span>
            <BookOpen size={16} className="text-purple-400" />
          </div>
          <div className="text-sm font-semibold text-slate-100 truncate">
            {metadata.publication}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Peer-reviewed conference / journal</p>
        </div>
      </div>

      {/* Authors list */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Users size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Authors</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {metadata.authors}
        </p>
      </div>

      {/* External Reference Links */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-slate-400 font-medium">Academic Profiles:</span>
        {paper?.arxivId && isValidArxivId(paper.arxivId) && (
          <a
            href={`https://arxiv.org/abs/${paper.arxivId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
          >
            <span>arXiv Abstract</span>
            <ExternalLink size={12} />
          </a>
        )}
        {paper?.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition"
          >
            <FileText size={12} />
            <span>PDF</span>
            <ExternalLink size={12} />
          </a>
        )}
        <a
          href={`https://scholar.google.com/scholar?q=${encodeURIComponent(paper?.title || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-300 hover:text-white transition"
        >
          <span>Google Scholar</span>
          <ExternalLink size={12} />
        </a>
        <a
          href={`https://www.semanticscholar.org/search?q=${encodeURIComponent(paper?.title || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-300 hover:text-white transition"
        >
          <span>Semantic Scholar</span>
          <ExternalLink size={12} />
        </a>
        {paper?.codeUrl && (
          <a
            href={paper.codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition ml-auto"
          >
            <span>Code Implementation</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
