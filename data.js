/* Single source of truth for the site. Edit here; index.html and the chart render from it.
   Dates are decimal years (2020.5 = mid-2020). Use `date: null` to keep a project off the chart. */

const ROLES = [
  { id: 'hansen', company: 'Hansen Technologies', place: 'Pune', title: 'Analyst, Data Engineering & Platforms',
    start: 2018.58, end: 2020.83, range: 'Aug 2018 – Nov 2020',
    points: ['Data-driven insights for telecom product optimisation across Latin America and Australia.',
             'Built reporting frameworks supporting strategic decisions for the telecom product portfolio.'] },
  { id: 'pharmeasy', company: 'PharmEasy', place: 'Bangalore', title: 'Business Data Analyst (Data Science)',
    start: 2020.83, end: 2022.0, range: 'Nov 2020 – Jan 2022',
    points: ['Ensemble demand forecasting (SARIMA, ARIMA, weighted moving average) for procurement and inventory planning.',
             'Raised forecast accuracy by 40% (from 30–40% to 50–70%) through COVID-era demand surges.'] },
  { id: 'niyo', company: 'Niyo Solutions', place: 'Bangalore · Fintech', title: 'Senior Data Scientist',
    start: 2022.0, end: 2023.21, range: 'Jan 2022 – Mar 2023',
    points: ['Lending propensity ensembles: +20% disbursement rate at 79.5% recall on imbalanced data.',
             'Linear-programming budget allocation: 5–7% weekly user growth and $20–30K monthly savings.',
             'XGBoost VKYC demand filter lifted approvals from 20% to 24% in week one; deployed models on SageMaker and Lambda.'] },
  { id: 'twid', company: 'Twid Pay', place: 'Bangalore · Fintech', title: 'Lead Data Scientist',
    start: 2023.42, end: 2026.1, range: 'Jun 2023 – Feb 2026',
    points: ['Affluence scoring: +8–9% conversion for new users and +16% uplift for repeat customers (F1 0.78, 84% recall).',
             'RFM models drove $280K (INR 2.5 cr) monthly GMV impact, validated with A/B tests.',
             'Cut API response time 64% (700ms → 250ms) with pre-screening confidence scoring.',
             'End-to-end MLOps on S3, Airflow and MLflow; graph-based merchant recommendations.'] },
  { id: 'bicycle', company: 'Bicycle.ai', place: 'Bangalore', title: 'Principal Data Scientist',
    start: 2026.1, end: null, range: 'Feb 2026 – Present',
    points: ['Five-agent Claude forecasting pipeline with a RAG layer, ~675K daily orders, zero hard-coded schema.',
             'Skill-driven Detect→Explain RFM migration engine for ~89,590 customers, deployed multi-tenant on AWS Lambda and ECS.',
             'Config-driven churn platform (XGBoost, LightGBM, SHAP, LIME) with DoWhy/EconML causal drivers, ~34M events.'] }
];

const NOW = 2026.77; // chart right edge (Oct 2026)

const MILESTONES = [
  { id: 'be', label: 'B.E. graduation', date: 2018.4, side: 'right',
    text: 'Bachelor of Engineering in Computer Science, MIT College of Engineering, Pune.' },
  { id: 'vil', label: 'VIL CodeFest winner', date: 2020.12, side: 'right',
    text: 'Winner of the Vodafone-Idea Hackathon (VIL CodeFest), February 2020.' },
  { id: 'rak', label: 'Rakathon top 100', date: 2023.7, side: 'right',
    text: 'Top 100 finalist at Rakathon by Rakuten with an LLM-based project, September 2023.' }
];

/* row: vertical slot inside the projects lane; side: which way the label runs from the dot */
const CHART_PROJECTS = [
  { id: 'p-churn', label: 'Customer-Churn', date: 2019.77, row: 0, side: 'right',
    text: 'Customer churn analysis with machine learning (Jupyter). Oct 2019.', url: 'https://github.com/pratik9696/Customer-Churn' },
  { id: 'p-opt', label: 'StockOptions', date: 2020.03, row: 1, side: 'right',
    text: 'Basics of options strategies in Python (Jupyter). Jan 2020.', url: 'https://github.com/pratik9696/StockOptions' },
  { id: 'p-genai', label: 'GenAI', date: 2025.21, row: 0, side: 'right',
    text: 'GenAI experiments in Python. Mar 2025.', url: 'https://github.com/pratik9696/GenAI' },
  { id: 'p-tel', label: 'ThinkEasyLabs site', date: 2026.25, row: 1, side: 'left',
    text: 'Next.js + Tailwind marketing site for ThinkEasyLabs, live on Vercel. Apr 2026.', url: 'https://github.com/pratik9696/tel-website' },
  { id: 'p-sb', label: 'Second Brain', date: 2026.45, row: 2, side: 'left',
    text: 'Always-on AI business analyst on a hybrid Claude + open-weight stack, ~70% cheaper than pure Claude. In progress.', anchor: 'second-brain' },
  { id: 'p-rag', label: 'Self-Correcting RAG', date: 2026.68, row: 3, side: 'left',
    text: 'RAG agent with a learned router and a validated groundedness grader. Sep 2026.', url: 'https://github.com/pratik9696/dataworkz' },
  { id: 'p-ims', label: 'Iceano IMS', date: 2026.74, row: 4, side: 'left',
    text: 'Inventory management system for Iceano on Cloudflare Pages, Functions and D1. Sep 2026.', url: 'https://github.com/pratik9696/icecream-inventory' }
];

const PROJECTS = [
  { id: 'rag', name: 'Self-Correcting RAG', tag: 'LLM · RAG · Evals', repo: 'https://github.com/pratik9696/dataworkz',
    blurb: 'A question-answering agent over a 70-document corpus. A classical ML router picks the retrieval strategy per query, a hybrid dense+sparse retriever fetches evidence, a local LLM answers with citations, and a validated groundedness grader decides whether to retry with a different strategy.',
    facts: ['Router held-out accuracy 0.933', 'Retrieval recall@5 0.947', 'Key-fact accuracy 0.947 → 1.000 with self-correction', 'Runs on CPU, no API keys; reproduced with zero diffs'],
    stack: ['Python', 'Ollama (llama3.1:8b)', 'scikit-learn', 'Hybrid RRF retrieval'],
    note: 'The README is candid that the router adds little recall on this corpus and that multi-hop retrieval is the weakest part.' },
  { id: 'iceano', name: 'Iceano IMS', tag: 'Full-stack · Inventory', repo: 'https://github.com/pratik9696/icecream-inventory',
    blurb: 'Inventory management system for Iceano, an ice-cream business. A lightweight web front end backed by Cloudflare Pages Functions and a D1 database, with writes mirrored to the existing Google Sheet so its native dashboard keeps working.',
    facts: ['Serverless on Cloudflare Pages + D1', 'Schema migrations and migration scripts', 'Backwards-compatible Google Sheets mirror'],
    stack: ['JavaScript', 'Cloudflare Pages Functions', 'D1 (SQLite)', 'Wrangler'] },
  { id: 'second-brain', name: 'Second Brain', tag: 'Agentic AI · Cost-optimised', repo: null,
    blurb: 'An analyst that keeps working while the business owner runs the business. It uses a hybrid of Claude and open-weight models to give better visibility into the business at a fraction of the cost.',
    facts: ['~70% cheaper than pure-Claude setups', 'Evals and harness work in progress', 'Hybrid Claude + open-weight routing'],
    stack: ['Claude', 'Open-weight LLMs', 'Evals', 'Agent harness'],
    note: 'Repository is not public yet.' },
  { id: 'ezquote', name: 'EZquote', tag: 'Product', repo: null,
    blurb: 'A quoting product built end to end. A full write-up is on the way.',
    facts: [],
    stack: [],
    note: 'Repository is not public yet.' },
  { id: 'bicycle', name: 'Bicycle.ai agentic engines', tag: 'Production · Agentic AI', repo: null,
    blurb: 'Three production platforms where classical ML meets agents: a five-agent demand-forecasting pipeline (Prophet, SARIMA, LSTM, Croston/SBA) with RAG grounding, a skill-driven RFM migration engine, and a config-driven churn platform with causal ML (DoWhy, EconML, Double ML, X-Learner).',
    facts: ['~675K daily orders forecast', '~89,590 customers across 10 RFM segments', '~34M events, new vertical = one YAML file'],
    stack: ['Claude Agent SDK', 'XGBoost / LightGBM', 'SHAP / LIME', 'AWS Lambda + ECS'],
    note: 'Proprietary work; described from the résumé.' },
  { id: 'tel', name: 'ThinkEasyLabs landing page', tag: 'Web', repo: 'https://github.com/pratik9696/tel-website', live: 'https://tel-website-one.vercel.app',
    blurb: 'Production marketing site for ThinkEasyLabs, which builds AI solutions across manufacturing, healthcare, BFSI, retail and logistics using open-source and Claude models.',
    facts: ['Next.js App Router', 'Tailwind CSS', 'SEO metadata, smooth scroll, Vercel deploy'],
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel'] }
];

const MORE_REPOS = [
  { name: 'Customer-Churn', desc: 'Customer churn analysis using machine learning', year: 2019, url: 'https://github.com/pratik9696/Customer-Churn' },
  { name: 'StockOptions', desc: 'Basics of options strategy using Python', year: 2020, url: 'https://github.com/pratik9696/StockOptions' },
  { name: 'GenAI', desc: 'GenAI experiments', year: 2025, url: 'https://github.com/pratik9696/GenAI' },
  { name: 'SEM_Bicycle_DS', desc: 'Bicycle data science assessment', year: 2025, url: 'https://github.com/pratik9696/SEM_Bicycle_DS' }
];

const SKILLS = [
  ['LLM & Agentic AI', ['Claude Agent SDK', 'Multi-agent pipelines', 'MCP tool-calling', 'RAG', 'Skill-driven automation', 'Vertex AI', 'Prompt engineering']],
  ['ML & Deep Learning', ['XGBoost', 'LightGBM', 'Random Forest', 'PyTorch', 'TensorFlow', 'scikit-learn', 'HuggingFace']],
  ['Causal & Explainability', ['DoWhy', 'EconML', 'Double ML', 'X-Learner', 'Uplift modelling', 'SHAP', 'LIME']],
  ['Forecasting & Analytics', ['Prophet', 'SARIMA', 'LSTM', 'Croston/SBA', 'A/B testing', 'RFM', 'Statistical modelling']],
  ['Cloud & MLOps', ['AWS SageMaker', 'Bedrock', 'Lambda', 'ECS', 'S3', 'Airflow', 'MLflow', 'Kafka', 'CI/CD for ML']],
  ['Languages & Tools', ['Python', 'SQL', 'PySpark', 'Git', 'Jupyter', 'Tableau']]
];
