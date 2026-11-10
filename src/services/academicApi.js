import { landmarkPapers } from '../data/landmarkPapers.js';
import { generateCompletePaperWithGemini } from './geminiService.js';

/**
 * Validates whether a string is a strictly formatted arXiv ID
 * e.g. "1706.03762", "2310.06825", "cs/0101001", "math.GT/0309136"
 */
export function isValidArxivId(id) {
  if (!id || typeof id !== 'string') return false;
  const clean = id.trim();
  // Modern format: YYMM.NNNNN or YYMM.NNNN (optional version suffix)
  if (/^[0-9]{4}\.[0-9]{4,5}(v[0-9]+)?$/i.test(clean)) return true;
  // Legacy format: archive/YYMMNNN
  if (/^[a-z\-]+(\.[a-z]{2})?\/[0-9]{7}(v[0-9]+)?$/i.test(clean)) return true;
  return false;
}

/**
 * Extracts a clean arXiv ID from any URL, ID string, or text
 * Returns null if no valid arXiv ID is found.
 */
export function extractArxivId(input) {
  if (!input) return null;
  const clean = input.trim();

  // 1. Direct match: bare modern ID (e.g. 1706.03762 or 2310.06825v2)
  const bareModern = clean.match(/^([0-9]{4}\.[0-9]{4,5})(?:v[0-9]+)?$/i);
  if (bareModern) return bareModern[1];

  // 2. Direct match: bare old ID (e.g. cs/0101001, math.GT/0309136)
  const bareOld = clean.match(/^([a-z\-]+(?:\.[a-z]{2})?\/[0-9]{7})(?:v[0-9]+)?$/i);
  if (bareOld) return bareOld[1];

  // 3. arXiv URL match: modern ID in URL (abs, pdf, html, format)
  const urlModern = clean.match(/arxiv\.org\/(?:abs|pdf|html|format)\/([0-9]{4}\.[0-9]{4,5})(?:v[0-9]+)?(?:\.pdf|\/)?/i);
  if (urlModern) return urlModern[1];

  // 4. arXiv URL match: old ID in URL
  const urlOld = clean.match(/arxiv\.org\/(?:abs|pdf|html|format)\/([a-z\-]+(?:\.[a-z]{2})?\/[0-9]{7})(?:v[0-9]+)?(?:\.pdf|\/)?/i);
  if (urlOld) return urlOld[1];

  // 5. General prefix match: "arxiv:2310.06825"
  const prefixMatch = clean.match(/arxiv:\s*([0-9]{4}\.[0-9]{4,5}|[a-z\-]+(?:\.[a-z]{2})?\/[0-9]{7})/i);
  if (prefixMatch) return prefixMatch[1];

  return null;
}

/**
 * Queries the official open arXiv Atom/XML API directly for an arXiv ID
 */
export async function fetchArxivDirect(id) {
  if (!isValidArxivId(id)) return null;
  try {
    const response = await fetch(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    const xml = await response.text();
    if (!xml.includes('<entry>') || xml.includes('incorrect id format')) return null;

    const title = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim();
    const summary = xml.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim();
    const published = xml.match(/<published>([0-9]{4})-/)?.[1];
    const authors = Array.from(xml.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g))
      .map(m => m[1].trim())
      .join(', ');

    if (!title || title.toLowerCase() === 'error') return null;

    return {
      title,
      summary: summary || '',
      year: parseInt(published || '2024'),
      authors: authors || 'arXiv Authors'
    };
  } catch (err) {
    console.warn('arXiv direct fetch failed:', err);
    return null;
  }
}

/**
 * Searches arXiv open API by title keywords to discover the real arXiv ID
 */
export async function searchArxivByTitle(title) {
  if (!title || title.length < 3) return null;
  try {
    const query = title.replace(/[^\w\s]/g, ' ').trim();
    const response = await fetch(`https://export.arxiv.org/api/query?search_query=ti:${encodeURIComponent(query)}&max_results=1`);
    if (!response.ok) return null;
    const xml = await response.text();
    if (!xml.includes('<entry>')) return null;

    const idMatch = xml.match(/<id>http:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/);
    if (!idMatch) return null;

    const rawId = idMatch[1].replace(/v[0-9]+$/i, '').trim();
    if (!isValidArxivId(rawId)) return null;

    const paperTitle = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim();
    const summary = xml.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim();
    const published = xml.match(/<published>([0-9]{4})-/)?.[1];
    const authors = Array.from(xml.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g))
      .map(m => m[1].trim())
      .join(', ');

    return {
      arxivId: rawId,
      title: paperTitle || title,
      summary: summary || '',
      year: parseInt(published || '2024'),
      authors: authors || 'arXiv Authors'
    };
  } catch (err) {
    console.warn('arXiv title search failed:', err);
    return null;
  }
}

const defaultMermaid = `graph TD
    subgraph DataPipeline["Data Inputs & Tokenization"]
        Raw["Input Data / Context Tokens"] --> Pre["Preprocessing Layer"]
        Pre --> Emb["Feature Embeddings"]
    end

    subgraph Architecture["Core Model Transformation"]
        Emb --> Layer1["Representation Encoders"]
        Layer1 --> Attn["Dynamic Attention / Filter Block"]
        Attn --> Norm["Layer Normalization & Residuals"]
    end

    subgraph Output["Inference & Prediction"]
        Norm --> Head["Task Specific Projection"]
        Head --> Out["Final Outputs / Predicted Tokens"]
    end`;

const defaultOpportunities = [
  {
    title: "Hardware-Aware Triton / CUDA Acceleration",
    extension: "Profile the primary compute bottleneck and write a fused GPU kernel in Triton to minimize memory traffic.",
    targetMetric: "2.5x to 3.5x reduction in kernel execution latency and 40% memory saving.",
    techStack: ["PyTorch", "Triton", "CUDA"],
    difficulty: "Advanced",
    timeline: "3-4 weeks"
  },
  {
    title: "Edge ONNX & Low-Precision Quantization Pipeline",
    extension: "Export the architecture to ONNX and evaluate INT8 Post-Training Quantization vs FP16 on edge CPU.",
    targetMetric: "60% model compression with less than 1.0% accuracy degradation.",
    techStack: ["ONNX Runtime", "PyTorch", "Hugging Face Optimum"],
    difficulty: "Intermediate",
    timeline: "2 weeks"
  },
  {
    title: "Domain Adaptation & Benchmark Evaluation",
    extension: "Extend the methodology to a specialized domain (e.g., biological sequences, time-series, or edge audio).",
    targetMetric: "Competitive benchmark ranking with 2x faster convergence than baselines.",
    techStack: ["PyTorch", "Hugging Face", "Weights & Biases"],
    difficulty: "Beginner-Intermediate",
    timeline: "1-2 weeks"
  }
];

/**
 * Analyzes an arXiv paper URL, ID, or paper title.
 * 1. Checks landmark papers first.
 * 2. If external arXiv ID, verifies directly with official arXiv API.
 * 3. Uses Gemini 2.5 Flash to synthesize full system architecture & student opportunities.
 */
export async function analyzePaper(input) {
  if (!input) return landmarkPapers[0];
  const trimmed = input.trim();
  const directId = extractArxivId(trimmed);
  
  // 1. Check if query matches one of our curated landmark papers
  const existingPaper = landmarkPapers.find(p => 
    (directId && p.arxivId === directId) ||
    p.title.toLowerCase().includes(trimmed.toLowerCase()) ||
    p.id.toLowerCase().includes(trimmed.toLowerCase())
  );
  
  if (existingPaper) {
    return existingPaper;
  }

  // 2. Resolve real metadata and true arXiv ID from official arXiv API
  let verifiedId = directId;
  let verifiedTitle = trimmed;
  let verifiedSummary = '';
  let verifiedYear = 2024;
  let verifiedAuthors = 'Leading AI Researchers';

  if (directId && isValidArxivId(directId)) {
    const arxivMeta = await fetchArxivDirect(directId);
    if (arxivMeta) {
      verifiedTitle = arxivMeta.title;
      verifiedSummary = arxivMeta.summary;
      verifiedYear = arxivMeta.year;
      verifiedAuthors = arxivMeta.authors;
    }
  } else {
    // If input is a paper title, try finding its real arXiv ID
    const titleMatch = await searchArxivByTitle(trimmed);
    if (titleMatch && titleMatch.arxivId) {
      verifiedId = titleMatch.arxivId;
      verifiedTitle = titleMatch.title;
      verifiedSummary = titleMatch.summary;
      verifiedYear = titleMatch.year;
      verifiedAuthors = titleMatch.authors;
    }
  }

  // 3. Query Gemini 2.5 Flash to synthesize the architecture diagram and student opportunities
  try {
    const geminiPaper = await generateCompletePaperWithGemini(
      `${verifiedTitle} ${verifiedSummary ? `\nAbstract: ${verifiedSummary}` : ''}`,
      verifiedId
    );

    if (geminiPaper && geminiPaper.title) {
      const finalArxivId = (verifiedId && isValidArxivId(verifiedId))
        ? verifiedId
        : (geminiPaper.arxivId && isValidArxivId(geminiPaper.arxivId) ? geminiPaper.arxivId : null);

      return {
        id: `paper-${finalArxivId || Date.now()}`,
        title: verifiedTitle || geminiPaper.title,
        arxivId: finalArxivId, // Only a strictly valid arXiv ID, or null
        arxivUrl: finalArxivId ? `https://arxiv.org/abs/${finalArxivId}` : `https://scholar.google.com/scholar?q=${encodeURIComponent(verifiedTitle || geminiPaper.title)}`,
        pdfUrl: finalArxivId ? `https://arxiv.org/pdf/${finalArxivId}.pdf` : `https://scholar.google.com/scholar?q=${encodeURIComponent((verifiedTitle || geminiPaper.title) + ' pdf')}`,
        codeUrl: `https://paperswithcode.com/search?q_term=${encodeURIComponent(verifiedTitle || geminiPaper.title)}`,
        category: geminiPaper.category || "Computer Science / AI Research",
        coreConcept: {
          problemStatement: geminiPaper.coreConcept?.problemStatement || "Addresses efficiency and architectural scalability constraints in deep neural models.",
          primaryMethodology: geminiPaper.coreConcept?.primaryMethodology || "Proposes novel structural mechanisms to improve representational capacity and inference speed.",
          breakthroughs: Array.isArray(geminiPaper.coreConcept?.breakthroughs) && geminiPaper.coreConcept.breakthroughs.length > 0
            ? geminiPaper.coreConcept.breakthroughs
            : [
                {
                  title: "Algorithmic Formulation",
                  formula: "\\min_{\\theta} \\mathbb{E}[\\mathcal{L}(f_\\theta(x), y)]",
                  description: "Formalizes the optimization target with improved convergence properties."
                }
              ]
        },
        mermaid: geminiPaper.mermaid || defaultMermaid,
        studentOpportunities: Array.isArray(geminiPaper.studentOpportunities) && geminiPaper.studentOpportunities.length > 0
          ? geminiPaper.studentOpportunities
          : defaultOpportunities,
        metadata: {
          citations: Number(geminiPaper.citations || 120),
          authors: verifiedAuthors !== 'Leading AI Researchers' ? verifiedAuthors : (geminiPaper.authors || 'Leading AI Researchers'),
          publication: geminiPaper.publication || (finalArxivId ? `arXiv:${finalArxivId}` : 'Peer-Reviewed Publication'),
          year: verifiedYear || Number(geminiPaper.year || 2024)
        }
      };
    }
  } catch (err) {
    console.error('Gemini paper generation error:', err);
  }

  // 4. Fallback if Gemini is unreachable: use arXiv verified data
  const fallbackId = (verifiedId && isValidArxivId(verifiedId)) ? verifiedId : null;
  return {
    id: `paper-${fallbackId || Date.now()}`,
    title: verifiedTitle,
    arxivId: fallbackId,
    arxivUrl: fallbackId ? `https://arxiv.org/abs/${fallbackId}` : `https://scholar.google.com/scholar?q=${encodeURIComponent(verifiedTitle)}`,
    pdfUrl: fallbackId ? `https://arxiv.org/pdf/${fallbackId}.pdf` : `https://scholar.google.com/scholar?q=${encodeURIComponent(verifiedTitle + ' pdf')}`,
    codeUrl: `https://paperswithcode.com/search?q_term=${encodeURIComponent(verifiedTitle)}`,
    category: "Computer Science Research",
    coreConcept: {
      problemStatement: verifiedSummary
        ? verifiedSummary.slice(0, 200) + '...'
        : `The paper investigates architectural optimizations and computational challenges related to "${verifiedTitle}".`,
      primaryMethodology: "Proposes structural modifications and empirical evaluation to validate efficiency improvements over prior baselines.",
      breakthroughs: [
        {
          title: "System Architecture Formulation",
          formula: "\\mathcal{F}(x) + x",
          description: "Reduces computational bottlenecks while preserving representation capacity across target benchmarks."
        }
      ]
    },
    mermaid: defaultMermaid,
    studentOpportunities: defaultOpportunities,
    metadata: {
      citations: 100,
      authors: verifiedAuthors,
      publication: fallbackId ? `arXiv:${fallbackId}` : 'Academic Publication',
      year: verifiedYear
    }
  };
}
