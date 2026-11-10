/**
 * Gemini Service for PaperLens
 * Generates full paper breakdowns, architectural Mermaid flowcharts,
 * and 3rd-year student opportunities using Gemini 2.5 Flash.
 */

function parseJsonSafely(raw) {
  if (!raw) return null;
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Failed to parse Gemini JSON output:', e);
    return null;
  }
}

export async function generateCompletePaperWithGemini(query, arxivId = null) {
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

Target Paper Query: "${query}"
${arxivId ? `Detected arXiv ID: "${arxivId}"` : ''}

Generate a complete, scientifically accurate research analysis for this computer science / machine learning paper.
Return a single JSON object strictly matching this schema:
{
  "title": "Exact Full Paper Title",
  "arxivId": "arXiv ID (e.g. 2310.06825) or leave empty if not on arXiv",
  "authors": "Full list of primary authors separated by commas",
  "publication": "Conference/Journal venue (e.g. NeurIPS 2023, ICML, ICLR, CVPR, or arXiv)",
  "year": 2023,
  "citations": 1500,
  "category": "Domain (e.g. Large Language Models, Computer Vision, Systems for ML)",
  "coreConcept": {
    "problemStatement": "Clear summary of the problem and computational/algorithmic bottleneck (under 75 words).",
    "primaryMethodology": "Clear summary of the primary methodology/architecture introduced (under 75 words).",
    "breakthroughs": [
      {
        "title": "Breakthrough 1 Name",
        "formula": "LaTeX formula if relevant (e.g. \\\\text{Attention}(Q, K, V) = \\\\text{softmax}\\\\left(\\\\frac{QK^T}{\\\\sqrt{d_k}}\\\\right)V) or empty string",
        "description": "Why this breakthrough works and what it improves."
      },
      {
        "title": "Breakthrough 2 Name",
        "formula": "",
        "description": "Why this breakthrough works and what it improves."
      }
    ]
  },
  "mermaid": "graph TD\\n    subgraph Inputs[\\\"Data Inputs\\\"]\\n        In[\\\"Input Data\\\"] --> Layer1[\\\"Layer 1\\\"]\\n    end\\n    subgraph Architecture[\\\"Core Architecture\\\"]\\n        Layer1 --> Layer2[\\\"Transformation Block\\\"]\\n    end\\n    subgraph Output[\\\"Outputs\\\"]\\n        Layer2 --> Out[\\\"Final Output\\\"]\\n    end",
  "studentOpportunities": [
    {
      "title": "Resume Project Idea 1",
      "extension": "Exact architectural extension or optimization a 3rd-year CS student could implement.",
      "targetMetric": "Targeted performance metric (e.g., 3x latency reduction, 50% memory drop).",
      "techStack": ["PyTorch", "CUDA", "Triton"],
      "difficulty": "Intermediate",
      "timeline": "2-3 weeks"
    },
    {
      "title": "Resume Project Idea 2",
      "extension": "Exact architectural extension or optimization.",
      "targetMetric": "Targeted performance metric.",
      "techStack": ["PyTorch", "ONNX Runtime"],
      "difficulty": "Beginner-Intermediate",
      "timeline": "1-2 weeks"
    },
    {
      "title": "Resume Project Idea 3",
      "extension": "Exact architectural extension or optimization.",
      "targetMetric": "Targeted performance metric.",
      "techStack": ["PyTorch", "Hugging Face"],
      "difficulty": "Advanced",
      "timeline": "3-4 weeks"
    }
  ]
}

Important:
- Keep the mermaid flowchart clean and strictly valid graph TD without Markdown inside. Quote all node labels containing brackets or parentheses.
- Ensure breakthroughs and opportunities are concrete and technically sound.
- Return ONLY the raw JSON object.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API responded with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = parseJsonSafely(text);
    return parsed;
  } catch (err) {
    console.error('Gemini paper generation error:', err);
    return null;
  }
}
