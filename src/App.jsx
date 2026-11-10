import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Layers, Rocket, Sparkles, ExternalLink, 
  RefreshCw, FileDown, Check, ArrowRight, Compass, ShieldCheck, AlertCircle
} from 'lucide-react';
import { landmarkPapers } from './data/landmarkPapers';
import { analyzePaper, isValidArxivId } from './services/academicApi';
import MermaidViewer from './components/MermaidViewer';
import CoreConceptView from './components/CoreConceptView';
import StudentOpportunities from './components/StudentOpportunities';
import PaperMetadataCard from './components/PaperMetadataCard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [selectedPaper, setSelectedPaper] = useState(landmarkPapers[0]);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'concepts', 'architecture', 'projects', 'metadata'
  const [copiedReport, setCopiedReport] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Analyze paper from input
  const handleAnalyze = async (inputQuery) => {
    const query = inputQuery || urlInput;
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchError(null);
    try {
      const result = await analyzePaper(query);
      if (result) {
        setSelectedPaper(result);
      } else {
        setSearchError(`Could not find details for "${query}". Displaying closest match.`);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setSearchError(err.message || 'Error querying paper details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = async (paper) => {
    setUrlInput(paper.arxivUrl);
    setSelectedPaper(paper);
    setSearchError(null);
    // Optionally trigger background refresh for citations
    handleAnalyze(paper.arxivId);
  };

  // Full Markdown Report Generator
  const handleExportMarkdown = () => {
    if (!selectedPaper) return;
    const breakthroughs = Array.isArray(selectedPaper.coreConcept?.breakthroughs)
      ? selectedPaper.coreConcept.breakthroughs.map((b, i) => `  ${i + 1}. **${typeof b === 'object' && b ? (b.title || '') : b}**: ${typeof b === 'object' && b ? (b.description || '') : ''}`).join('\n')
      : '';
    const opportunities = Array.isArray(selectedPaper.studentOpportunities)
      ? selectedPaper.studentOpportunities.map((opp, i) => `
#### Idea ${i + 1}: ${opp.title || 'Paper Extension'}
- **Exact Extension:** ${opp.extension || 'N/A'}
- **Targeted Metric:** ${opp.targetMetric || 'N/A'}
- **Recommended Tech Stack:** ${Array.isArray(opp.techStack) ? opp.techStack.join(', ') : (opp.techStack || 'PyTorch')}
`).join('\n')
      : '';

    const report = `# ${selectedPaper.title || 'Research Paper'}
${selectedPaper.arxivUrl || ''}

### 1. CORE CONCEPT EXTRACTION
* **Problem Statement:** ${selectedPaper.coreConcept?.problemStatement || 'N/A'}
* **Primary Methodology:** ${selectedPaper.coreConcept?.primaryMethodology || 'N/A'}
* **Key Breakthroughs:**
${breakthroughs}

### 2. ARCHITECTURAL FLOWCHART (Mermaid.js)
[FLOWCHART]
\`\`\`mermaid
${selectedPaper.mermaid || ''}
\`\`\`

### 3. FUTURE WORK & INTERNSHIP OPPORTUNITIES
${opportunities}

### Metadata of Paper
Metadata: Citations: ${selectedPaper.metadata?.citations ?? 0}, Authors: ${selectedPaper.metadata?.authors || 'Unknown'}, Publication: ${selectedPaper.metadata?.publication || 'Academic Publication'}, Year: ${selectedPaper.metadata?.year || 2024},
`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPaper.id || 'paper'}-research-analysis.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Compass size={20} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                PaperLens
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Agent v2.0
                </span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">CS Research & System Architecture Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
              title="Download analysis as Markdown"
            >
              <FileDown size={14} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
              <ShieldCheck size={13} />
              <span>Token Efficient (&lt; 25k)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Paper URL Ingestion & Search Bar */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5">
              Parse Academic Paper & Extract Architecture
            </h1>
            <p className="text-sm text-slate-400">
              Provide an arXiv URL or select a seminal benchmark paper to synthesize core concepts, generate Mermaid.js system flowcharts, and scout 3rd-year CS student project extensions.
            </p>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste arXiv URL, ID, or paper title (e.g., https://arxiv.org/abs/1706.03762 or 'Mamba')..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Extract Paper</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick-Select Landmark Papers */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-2.5 text-xs text-slate-400 font-medium">
              <Sparkles size={14} className="text-blue-400" />
              <span>Seminal Landmark Papers:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {landmarkPapers.map((paper) => {
                const isSelected = selectedPaper?.id === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() => handlePresetSelect(paper)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{paper.title.split(':')[0]}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({paper.metadata.year})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Paper Banner */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedPaper.category}
              </span>
              {selectedPaper.arxivId && isValidArxivId(selectedPaper.arxivId) ? (
                <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  arXiv:{selectedPaper.arxivId}
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {selectedPaper.metadata?.publication || 'Academic Publication'}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {selectedPaper.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl line-clamp-2">
              {selectedPaper.metadata?.authors || 'Academic Researchers'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={selectedPaper.pdfUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(selectedPaper.title + ' pdf')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition"
            >
              <span>{selectedPaper.arxivId && isValidArxivId(selectedPaper.arxivId) ? 'Open arXiv PDF' : 'Find Paper PDF'}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 overflow-x-auto pb-px gap-2">
          {[
            { id: 'all', label: 'Complete Overview', icon: BookOpen },
            { id: 'concepts', label: '1. Core Concepts', icon: Sparkles },
            { id: 'architecture', label: '2. System Flowchart', icon: Layers },
            { id: 'projects', label: '3. Student Opportunities', icon: Rocket },
            { id: 'metadata', label: '4. Paper Metadata', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Error Alert Banner */}
        {searchError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{searchError}</span>
            </div>
            <button
              onClick={() => setSearchError(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <ErrorBoundary onReset={() => setSelectedPaper(landmarkPapers[0])}>
          {/* Section 1: Core Concept Extraction */}
          {(activeTab === 'all' || activeTab === 'concepts') && (
            <section id="concepts">
              <CoreConceptView 
                coreConcept={selectedPaper.coreConcept} 
                paperTitle={selectedPaper.title} 
              />
            </section>
          )}

          {/* Section 2: Architectural Flowchart (Mermaid.js) */}
          {(activeTab === 'all' || activeTab === 'architecture') && (
            <section id="architecture" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="text-blue-400" size={20} />
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">Architectural Flowchart</h2>
                    <p className="text-xs text-slate-400">Mermaid.js (graph TD) components, model layers, and data tensors</p>
                  </div>
                </div>
              </div>
              
              <MermaidViewer 
                chartCode={selectedPaper.mermaid} 
                title={selectedPaper.title} 
              />
            </section>
          )}

          {/* Section 3: Future Work & Internship Opportunities */}
          {(activeTab === 'all' || activeTab === 'projects') && (
            <section id="projects">
              <StudentOpportunities 
                opportunities={selectedPaper.studentOpportunities} 
                paperTitle={selectedPaper.title} 
              />
            </section>
          )}

          {/* Section 4: Metadata of Paper */}
          {(activeTab === 'all' || activeTab === 'metadata') && (
            <section id="metadata">
              <PaperMetadataCard 
                metadata={selectedPaper.metadata} 
                paper={selectedPaper} 
              />
            </section>
          )}
        </ErrorBoundary>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>PaperLens • Computer Science Academic Research Agent & System Architecture Visualizer</p>
        <p className="mt-1 font-mono text-[11px] text-slate-700">Token Efficiency & Academic Integrity Compliance Active</p>
      </footer>
    </div>
  );
}
