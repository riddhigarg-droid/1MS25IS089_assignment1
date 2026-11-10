export const landmarkPapers = [
  {
    id: "attention-is-all-you-need",
    title: "Attention Is All You Need",
    arxivId: "1706.03762",
    arxivUrl: "https://arxiv.org/abs/1706.03762",
    pdfUrl: "https://arxiv.org/pdf/1706.03762",
    codeUrl: "https://github.com/tensorflow/tensor2tensor",
    category: "Natural Language Processing / Foundation Models",
    coreConcept: {
      problemStatement: "Pre-existing sequence transduction models (RNNs, LSTMs, GRUs) processed tokens sequentially step-by-step. This sequential constraint barred training parallelization and resulted in significant information bottlenecking over long distances.",
      primaryMethodology: "The authors introduced the Transformer, replacing all recurrence and convolutional layers entirely with a multi-head self-attention mechanism to compute representations globally in constant path length.",
      breakthroughs: [
        {
          title: "Scaled Dot-Product Attention",
          formula: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
          description: "Scaling dot products by 1/sqrt(d_k) prevents magnitude growth in high-dimensional spaces that would otherwise saturate the softmax function into regions with near-zero gradients."
        },
        {
          title: "Multi-Head Attention",
          formula: "\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O",
          description: "Linearly projects queries, keys, and values into h distinct representation subspaces simultaneously, enabling the model to jointly attend to various semantic and positional cues."
        },
        {
          title: "Sinusoidal Positional Encodings",
          formula: "PE_{(pos, 2i)} = \\sin(pos/10000^{2i/d_{model}})",
          description: "Injects order information via trigonometric frequencies without adding trainable parameters, allowing interpolation to sequence lengths longer than those observed during training."
        }
      ]
    },
    mermaid: `graph TD
    subgraph Inputs["Data Inputs & Embeddings"]
        Inp["Source Tokens (Input)"] --> InpEmb["Input Embedding Layer"]
        InpEmb --> InpPE["Add Positional Encoding"]
        Tgt["Target Tokens (Shifted Right)"] --> TgtEmb["Output Embedding Layer"]
        TgtEmb --> TgtPE["Add Positional Encoding"]
    end

    subgraph Encoder["Encoder Stack (N=6 Layers)"]
        InpPE --> EncMHA["Multi-Head Self-Attention"]
        EncMHA --> EncAddNorm1["Add & LayerNorm"]
        EncAddNorm1 --> EncFFN["Position-wise Feed Forward"]
        EncFFN --> EncAddNorm2["Add & LayerNorm"]
    end

    subgraph Decoder["Decoder Stack (N=6 Layers)"]
        TgtPE --> DecMaskMHA["Masked Multi-Head Self-Attention"]
        DecMaskMHA --> DecAddNorm1["Add & LayerNorm"]
        DecAddNorm1 --> DecCrossMHA["Multi-Head Cross-Attention"]
        EncAddNorm2 -->|"Keys (K) & Values (V)"| DecCrossMHA
        DecCrossMHA --> DecAddNorm2["Add & LayerNorm"]
        DecAddNorm2 --> DecFFN["Position-wise Feed Forward"]
        DecFFN --> DecAddNorm3["Add & LayerNorm"]
    end

    subgraph Outputs["Data Outputs"]
        DecAddNorm3 --> Linear["Linear Projection"]
        Linear --> Softmax["Softmax Layer"]
        Softmax --> OutProbs["Output Probabilities (Next Token)"]
    end`,
    studentOpportunities: [
      {
        title: "Triton-Accelerated Fused Attention Kernel",
        extension: "Replace the standard O(N^2) memory-bound attention implementation with an SRAM tile-fused attention kernel using OpenAI Triton.",
        targetMetric: "3x to 4x reduction in peak GPU VRAM usage and 2.5x wall-clock training speedup on 2048+ token sequence lengths.",
        techStack: ["PyTorch", "Triton", "CUDA", "Hugging Face Transformers"],
        difficulty: "Advanced",
        timeline: "3-4 weeks"
      },
      {
        title: "Edge INT8/INT4 Quantization & KV Cache Compression",
        extension: "Implement post-training INT8/INT4 weight quantization alongside 8-bit dynamic Key-Value cache compression for local Apple Silicon / Raspberry Pi execution.",
        targetMetric: "60-75% reduction in disk/RAM footprint and 2x faster token generation latency on CPU with <0.5 BLEU loss.",
        techStack: ["PyTorch", "ONNX Runtime", "llama.cpp", "GGML"],
        difficulty: "Intermediate",
        timeline: "2-3 weeks"
      },
      {
        title: "Speculative Decoding Accelerator",
        extension: "Build a speculative decoding pipeline utilizing a lightweight 2-layer draft Transformer to hypothesize tokens verified in parallel by the full 6-layer model.",
        targetMetric: "1.8x to 2.3x end-to-end generation speedup with zero loss in greedy exact-match output accuracy.",
        techStack: ["PyTorch", "vLLM", "Hugging Face Accelerate", "NumPy"],
        difficulty: "Intermediate",
        timeline: "2 weeks"
      }
    ],
    metadata: {
      citations: 202085,
      authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin",
      publication: "Advances in Neural Information Processing Systems (NeurIPS)",
      year: 2017
    }
  },
  {
    id: "lora-low-rank-adaptation",
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    arxivId: "2106.09685",
    arxivUrl: "https://arxiv.org/abs/2106.09685",
    pdfUrl: "https://arxiv.org/pdf/2106.09685",
    codeUrl: "https://github.com/microsoft/LoRA",
    category: "Efficient Fine-Tuning / PEFT",
    coreConcept: {
      problemStatement: "Fine-tuning all parameters of massive language models (e.g., 175B GPT-3) is prohibitively expensive in GPU memory and requires storing enormous checkpoints for every downstream task.",
      primaryMethodology: "LoRA freezes pre-trained model weights and injects trainable rank decomposition matrices into each transformer layer, dramatically reducing trainable parameters without adding inference latency.",
      breakthroughs: [
        {
          title: "Low-Rank Decomposition",
          formula: "W = W_0 + \\Delta W = W_0 + \\frac{\\alpha}{r} B \\cdot A",
          description: "Decomposes the weight update matrix into low-rank matrices A (size d x r) and B (size r x k) with r << min(d, k), dropping trainable parameters by 10,000x."
        },
        {
          title: "Zero Latency Overhead at Inference",
          formula: "W_{\\text{deployed}} = W_0 + \\frac{\\alpha}{r}(B \\cdot A)",
          description: "During deployment, the low-rank product is added directly to W_0, incurring zero additional runtime operations or memory access overhead."
        },
        {
          title: "Intrinsically Low Dimension Hypothesis",
          formula: "\\text{rank}(\\Delta W) \\le r \\ll \\min(d, k)",
          description: "Demonstrates empirically that weight updates during downstream task adaptation have an extremely low intrinsic dimensionality."
        }
      ]
    },
    mermaid: `graph TD
    subgraph Input["Input Vector"]
        X["Activation Vector x (Dimension d)"]
    end

    subgraph Pretrained["Frozen Pre-trained Branch"]
        X --> FrozenW["Frozen Pre-trained Weight W0 (d x k)"]
        FrozenW --> OutFrozen["h_frozen = W0 * x"]
    end

    subgraph LoRABranch["Trainable Low-Rank Adapter Branch"]
        X --> MatA["Down-projection Matrix A (d x r)"]
        MatA -->|"Rank r bottleneck"| MatB["Up-projection Matrix B (r x k)"]
        MatB --> Scale["Scale factor (alpha / r)"]
        Scale --> OutLoRA["Delta h = (alpha / r) * B * A * x"]
    end

    subgraph Merge["Output Aggregation"]
        OutFrozen --> Add["Vector Addition (+)"]
        OutLoRA --> Add
        Add --> FinalOut["Final Output Vector h (Dimension k)"]
    end`,
    studentOpportunities: [
      {
        title: "Dynamic Rank Allocation (AdaLoRA) on Consumer GPUs",
        extension: "Implement singular value decomposition (SVD) based dynamic rank pruning that allocates budget to important attention heads while zeroing uninformative weights.",
        targetMetric: "25% parameter reduction over static LoRA (r=8) while achieving equal or better GLUE benchmark score.",
        techStack: ["PyTorch", "PEFT", "Hugging Face Datasets", "PyTorch Lightning"],
        difficulty: "Intermediate",
        timeline: "2-3 weeks"
      },
      {
        title: "Multi-LoRA Serving Router with Fast Adapter Swapping",
        extension: "Build an asynchronous inference server capable of hot-swapping specialized domain LoRAs (code, medical, math) into a single base model on the fly.",
        targetMetric: "Sub-15ms adapter hot-swap latency and support for 20+ concurrent domain adapters on a single 16GB GPU.",
        techStack: ["FastAPI", "vLLM / S-LoRA", "PyTorch", "Docker"],
        difficulty: "Advanced",
        timeline: "3-4 weeks"
      },
      {
        title: "Quantized LoRA (QLoRA) 4-bit NormalFloat Benchmark",
        extension: "Re-implement 4-bit NormalFloat quantization and double quantization from scratch to fine-tune a 7B LLM on a single Google Colab T4 GPU.",
        targetMetric: "Maintain 99% of 16-bit LoRA performance while reducing fine-tuning memory from 28GB down to under 10GB.",
        techStack: ["bitsandbytes", "PyTorch", "TRL", "Weights & Biases"],
        difficulty: "Beginner-Intermediate",
        timeline: "1-2 weeks"
      }
    ],
    metadata: {
      citations: 11420,
      authors: "Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen",
      publication: "International Conference on Learning Representations (ICLR)",
      year: 2022
    }
  },
  {
    id: "mamba-selective-state-spaces",
    title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces",
    arxivId: "2312.00752",
    arxivUrl: "https://arxiv.org/abs/2312.00752",
    pdfUrl: "https://arxiv.org/pdf/2312.00752",
    codeUrl: "https://github.com/state-spaces/mamba",
    category: "Sequence Models / Efficient Architectures",
    coreConcept: {
      problemStatement: "Transformers suffer from quadratic compute and memory scaling O(N^2) with context length, while traditional State Space Models (SSMs) fail to selectively remember or filter out input-dependent context.",
      primaryMethodology: "Mamba introduces selective state spaces where transition parameters are functions of the current input, coupled with a hardware-aware parallel associative scan algorithm that computes linear-time O(N) inference.",
      breakthroughs: [
        {
          title: "Selective State Space Mechanism",
          formula: "B_t = s_B(x_t), \\quad C_t = s_C(x_t), \\quad \\Delta_t = \\tau_{\\Delta}(\\text{Linear}(x_t))",
          description: "Makes matrices B, C, and step size Delta dynamic functions of the input token, allowing the model to selectively propagate or discard information along the sequence dimension."
        },
        {
          title: "Hardware-Aware Parallel Scan",
          formula: "h_t = \\bar{A}_t h_{t-1} + \\bar{B}_t x_t",
          description: "Avoids materializing intermediate states in high-bandwidth memory (HBM); computes the scan directly in ultrafast SRAM using parallel prefix sum reductions."
        },
        {
          title: "Linear O(N) Inference Time & Constant Memory",
          formula: "\\text{Memory}(t) = \\mathcal{O}(1), \\quad \\text{Compute}(N) = \\mathcal{O}(N)",
          description: "Enables millions of tokens of effective context window during generation without the exploding KV cache requirements of Transformers."
        }
      ]
    },
    mermaid: `graph TD
    subgraph Input["Input Sequence"]
        X["Token Sequence X (B, L, D)"]
    end

    subgraph Expansion["Dimension Expansion & Conv1D"]
        X --> LinearUp["Linear Projection (Expand to 2D)"]
        LinearUp --> Conv["1D Depthwise Convolution"]
        Conv --> SiLU["SiLU Activation"]
    end

    subgraph SelectiveSSM["Selective State Space Core (SRAM Fused)"]
        SiLU --> InputB["Compute B(x) & C(x)"]
        SiLU --> DeltaCalc["Compute Step Size Delta(x)"]
        InputB --> Disc["Discretize A and B (Zero-Order Hold)"]
        DeltaCalc --> Disc
        Disc --> Scan["Hardware-Aware Parallel Associative Scan"]
        Scan --> SSMOut["Hidden State Projection y = C * h"]
    end

    subgraph Gating["Gated Bilinear Residual"]
        LinearUp --> GateLinear["Bilinear Gate Branch"]
        GateLinear --> GateSiLU["SiLU Activation"]
        SSMOut --> Mult["Hadamard Elementwise Product (*)"]
        GateSiLU --> Mult
    end

    subgraph Output["Output Projection"]
        Mult --> LinearDown["Linear Down-Projection (Back to D)"]
        LinearDown --> OutAdd["Residual Addition (+)"]
        X --> OutAdd
        OutAdd --> Final["Mamba Block Output (B, L, D)"]
    end`,
    studentOpportunities: [
      {
        title: "Hybrid Mamba-Transformer Architecture for Edge Audio",
        extension: "Construct an edge speech recognition model combining 4 Mamba linear layers for long-range audio frames with 1 local Transformer attention block for phoneme binding.",
        targetMetric: "4x lower decoding latency on 30-second audio clips with identical Word Error Rate (WER) to Whisper-Tiny.",
        techStack: ["PyTorch", "Mamba-SSM", "Torchaudio", "Hugging Face"],
        difficulty: "Advanced",
        timeline: "3-4 weeks"
      },
      {
        title: "Mamba ONNX Export & WebAssembly (Wasm) In-Browser Inference",
        extension: "Trace the custom hardware scan into a portable WebAssembly / ONNX graph to run real-time text completion directly in the user's browser with zero backend server.",
        targetMetric: "Sub-50ms token generation latency on consumer laptop Chrome browser with 0MB server compute cost.",
        techStack: ["ONNX Runtime Web", "WebAssembly", "JavaScript", "React"],
        difficulty: "Intermediate",
        timeline: "2-3 weeks"
      },
      {
        title: "Synthetic Needle-In-A-Haystack Stress Tester",
        extension: "Build an automated evaluation harness testing retrieval accuracy of Mamba vs. Llama-3 at context lengths from 4k to 64k tokens across varying needle depths.",
        targetMetric: "Comprehensive visualization matrix demonstrating memory scaling linearity vs. quadratic attention breakdown.",
        techStack: ["Python", "Matplotlib / Plotly", "vLLM", "Hugging Face"],
        difficulty: "Beginner-Intermediate",
        timeline: "1-2 weeks"
      }
    ],
    metadata: {
      citations: 1850,
      authors: "Albert Gu, Tri Dao",
      publication: "arXiv Preprint / Under Review",
      year: 2023
    }
  },
  {
    id: "flashattention",
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    arxivId: "2205.14135",
    arxivUrl: "https://arxiv.org/abs/2205.14135",
    pdfUrl: "https://arxiv.org/pdf/2205.14135",
    codeUrl: "https://github.com/Dao-AILab/flash-attention",
    category: "Systems for ML / GPU Kernel Optimization",
    coreConcept: {
      problemStatement: "Attention is memory-bound rather than compute-bound: standard implementations read and write intermediate N x N attention matrices repeatedly to slow High Bandwidth Memory (HBM), throttling GPU compute cores.",
      primaryMethodology: "FlashAttention reorders the attention algorithm using tiling to load blocks of keys, queries, and values into fast SRAM once, incrementally computing the softmax via online softmax without materializing full N x N matrices.",
      breakthroughs: [
        {
          title: "Online Softmax with Tiling",
          formula: "m(x) = \\max(m(x^{(1)}), m(x^{(2)})), \\quad \\ell(x) = e^{m(x^{(1)}) - m(x)}\\ell(x^{(1)}) + e^{m(x^{(2)}) - m(x)}\\ell(x^{(2)})",
          description: "Maintains running maximums and normalizers across blocks, allowing exact mathematical softmax computation in a single pass without storing the full intermediate matrix."
        },
        {
          title: "Recomputation in Backward Pass",
          formula: "\\text{Memory Overhead: } \\mathcal{O}(N) \\text{ instead of } \\mathcal{O}(N^2)",
          description: "Discards intermediate attention maps during the forward pass and rapidly recomputes them from Q, K, V blocks in fast SRAM during backpropagation, dramatically saving HBM."
        },
        {
          title: "IO-Aware Complexity Analysis",
          formula: "\\text{HBM Accesses: } \\mathcal{O}\\left(\\frac{N^2 d^2}{M}\\right) \\quad \\text{vs Standard } \\mathcal{O}(N d + N^2)",
          description: "Directly optimizes GPU memory hierarchy data transfers (SRAM vs. HBM) rather than merely counting floating point operations (FLOPs)."
        }
      ]
    },
    mermaid: `graph TD
    subgraph GPUHBM["Slow GPU HBM (High Bandwidth Memory)"]
        HBM_Q["Q Matrix (N x d)"]
        HBM_K["K Matrix (N x d)"]
        HBM_V["V Matrix (N x d)"]
        HBM_O["Output O (N x d)"]
    end

    subgraph FastSRAM["Fast On-Chip SRAM (Shared Memory)"]
        TileQ["Load Q Block (B_r x d)"]
        TileK["Load K Block (B_c x d)"]
        TileV["Load V Block (B_c x d)"]
        
        HBM_Q -->|"Block Transfer"| TileQ
        HBM_K -->|"Block Transfer"| TileK
        HBM_V -->|"Block Transfer"| TileV

        Matmul1["Compute S_tile = Q_tile * K_tile^T"]
        TileQ --> Matmul1
        TileK --> Matmul1

        OnlineSoftmax["Incremental Online Softmax Update (m_new, l_new)"]
        Matmul1 --> OnlineSoftmax

        Matmul2["Accumulate O_tile = Softmax_tile * V_tile"]
        OnlineSoftmax --> Matmul2
        TileV --> Matmul2
    end

    subgraph Writeback["Write Back to HBM"]
        Matmul2 -->|"Single Writeback (No N x N Matrix)"| HBM_O
    end`,
    studentOpportunities: [
      {
        title: "FlashDecoding for Ultra-Long Prompt Generation",
        extension: "Implement a split-K parallel Flash-Decoding kernel in PyTorch/Triton that parallelizes generation along the sequence dimension across multiple streaming multiprocessors.",
        targetMetric: "4x speedup in time-to-first-token (TTFT) and generation latency on 16k context prompts.",
        techStack: ["Triton", "PyTorch", "CUDA C++", "Nsight Compute"],
        difficulty: "Advanced",
        timeline: "3-4 weeks"
      },
      {
        title: "Sliding Window Sparse FlashAttention Benchmarker",
        extension: "Extend the block-tiling algorithm to support arbitrary causal sliding window patterns (e.g., Mistral 4k window) with custom ring attention communication.",
        targetMetric: "50% lower memory consumption on 32k sequences with sub-5% training throughput overhead.",
        techStack: ["PyTorch", "CUDA", "Hugging Face Transformers"],
        difficulty: "Intermediate",
        timeline: "2-3 weeks"
      },
      {
        title: "Hardware Roofline Model Visualizer for Deep Learning Kernels",
        extension: "Create an interactive diagnostic tool that analyzes PyTorch models and plots memory bandwidth vs. arithmetic intensity against the GPU hardware roofline.",
        targetMetric: "Accurately flag memory-bound vs compute-bound operations with automated recommendations for kernel fusion.",
        techStack: ["Python", "Streamlit / React", "PyTorch Profiler", "Plotly"],
        difficulty: "Beginner-Intermediate",
        timeline: "2 weeks"
      }
    ],
    metadata: {
      citations: 3840,
      authors: "Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré",
      publication: "Advances in Neural Information Processing Systems (NeurIPS)",
      year: 2022
    }
  },
  {
    id: "deep-residual-learning-resnet",
    title: "Deep Residual Learning for Image Recognition",
    arxivId: "1512.03385",
    arxivUrl: "https://arxiv.org/abs/1512.03385",
    pdfUrl: "https://arxiv.org/pdf/1512.03385",
    codeUrl: "https://github.com/KaimingHe/deep-residual-networks",
    category: "Computer Vision / Deep Learning Fundamentals",
    coreConcept: {
      problemStatement: "As deep convolutional networks increased in depth, network accuracy became saturated and then degraded rapidly. This degradation was not caused by overfitting, but by severe vanishing/exploding gradients during optimization.",
      primaryMethodology: "ResNet introduced identity shortcut connections that bypass one or more layers, allowing layers to learn residual mappings F(x) = H(x) - x instead of attempting to fit the underlying unreferenced mapping directly.",
      breakthroughs: [
        {
          title: "Residual Shortcut Mapping",
          formula: "\\mathcal{F}(x, \\{W_i\\}) + x",
          description: "If an identity mapping is optimal, training can simply drive residual weights toward zero, ensuring a deeper network never performs worse than its shallower counterpart."
        },
        {
          title: "Bottleneck Design for Deep Stacks",
          formula: "1\\times 1 \\text{ Conv (Reduce)} \\to 3\\times 3 \\text{ Conv} \\to 1\\times 1 \\text{ Conv (Restore)}",
          description: "Enables scaling networks to 50, 101, and 152 layers with fewer parameters and FLOPs than standard 34-layer plain networks."
        },
        {
          title: "Highway to Training 1000+ Layers",
          formula: "\\frac{\\partial \\mathcal{E}}{\\partial x_l} = \\frac{\\partial \\mathcal{E}}{\\partial x_L}\\left(1 + \\frac{\\partial}{\\partial x_l}\\sum_{i=l}^{L-1}\\mathcal{F}_i\\right)",
          description: "Gradients flow back directly to early layers through the additive +1 term, completely eliminating the vanishing gradient barrier during backpropagation."
        }
      ]
    },
    mermaid: `graph TD
    subgraph ResidualBlock["Standard ResNet BasicBlock"]
        X["Input Feature Map x"]
        X -->|"Identity Shortcut"| Add["Elementwise Addition (+)"]
        
        X --> Conv1["Weight Layer (3x3 Conv, stride 1)"]
        Conv1 --> BN1["Batch Normalization"]
        BN1 --> ReLU1["ReLU Activation"]
        
        ReLU1 --> Conv2["Weight Layer (3x3 Conv, stride 1)"]
        Conv2 --> BN2["Batch Normalization"]
        
        BN2 -->|"Residual F(x)"| Add
        Add --> FinalReLU["Output ReLU: sigma(F(x) + x)"]
    end`,
    studentOpportunities: [
      {
        title: "Stochastic Depth & Layer Pruning for Real-Time Edge Vision",
        extension: "Implement stochastic depth regularization during training followed by structural layer pruning to produce a dynamic inference-time ResNet that adapts depth based on battery constraints.",
        targetMetric: "45% reduction in FLOPs and latency with <1.2% Top-1 accuracy drop on ImageNet-1k.",
        techStack: ["PyTorch", "Torchvision", "Torch-Pruning", "TensorRT"],
        difficulty: "Intermediate",
        timeline: "2-3 weeks"
      },
      {
        title: "ConvNeXt Modernization Challenge",
        extension: "Incrementally modernize ResNet-50 by integrating 7x7 depthwise convolutions, LayerNorm instead of BatchNorm, and GELU activations to match Vision Transformer performance.",
        targetMetric: "Improve ImageNet Top-1 accuracy from 76.1% to 82.0%+ without using any attention mechanisms.",
        techStack: ["PyTorch", "timm (PyTorch Image Models)", "Weights & Biases"],
        difficulty: "Beginner-Intermediate",
        timeline: "2 weeks"
      },
      {
        title: "Medical Pathology Slide Classifier with Grad-CAM Explainability",
        extension: "Fine-tune a pretrained ResNet-50 on histopathological cancer detection datasets and build an interactive Grad-CAM heatmap overlay to explain model predictions to doctors.",
        targetMetric: "94%+ AUC-ROC score with visual localization of malignant cell clusters.",
        techStack: ["PyTorch", "OpenCV", "Streamlit / Gradio", "scikit-learn"],
        difficulty: "Intermediate",
        timeline: "2 weeks"
      }
    ],
    metadata: {
      citations: 215430,
      authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
      publication: "IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
      year: 2016
    }
  }
];
