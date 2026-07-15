<div align="center">

# 🔬 ResearchOS

### AI-powered multi-agent research platform built with LangGraph

ResearchOS automates the entire research workflow—from planning and web search to scraping, semantic retrieval, and report generation.

<img src="./assets/home.png" width="100%" />

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-green)
![License](https://img.shields.io/badge/License-MIT-orange)

</div>

---

# 📖 Overview

ResearchOS is an AI-powered research platform that transforms a simple research query into a structured report backed by multiple online sources.

Instead of relying on a single prompt, the application orchestrates multiple AI agents using **LangGraph** to perform different stages of the research pipeline.

The system can:

- 🔍 Search the web
- 🌐 Crawl multiple websites in parallel
- ✂️ Extract and clean content
- 🧠 Generate embeddings
- 📚 Perform semantic retrieval
- 📝 Generate structured research reports
- 🔗 Provide references to original sources

---

# ✨ Features

## Multi-Agent Workflow

Different agents collaborate to complete one research task.

- Planner
- Searcher
- Scraper
- Embedder
- Writer

---

## Parallel Web Crawling

Multiple websites are scraped simultaneously for faster research.

---

## Intelligent Text Chunking

Large documents are automatically divided into semantic chunks before embedding.

---

## Embedding-based Retrieval

Relevant information is retrieved using semantic similarity instead of keyword matching.

---

## AI Report Generation

Generates professional reports including

- Executive Summary
- Key Findings
- Detailed Analysis
- References

---

## Persistent Research History

Every research session is stored and can be revisited later.

---

# 🏗 Architecture

```

                    User Query
                         │
                         ▼
                Planner Agent
                         │
                         ▼
                Search Agent
                         │
                         ▼
         Parallel Website Scraping
                         │
                         ▼
               Content Extraction
                         │
                         ▼
              Intelligent Chunking
                         │
                         ▼
             OpenAI Embeddings
                         │
                         ▼
              Vector Retrieval
                         │
                         ▼
                Writer Agent
                         │
                         ▼
              Structured Report

```

---

# 🖼 Screenshots

## Home

![Home](./assets/home.png)

---

## Generated Report

![Report](./assets/report.png)

---

## Sources

![Sources](./assets/sources.png)

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Framer Motion

## Backend

- Express
- LangGraph
- LangChain
- OpenAI API

## Database

- PostgreSQL
- Drizzle ORM

## Deployment

- Vercel
- Railway

---

# ⚙ How it Works

### 1. Planning

The Planner agent breaks the research request into an execution plan.

↓

### 2. Searching

Relevant websites are discovered using search APIs.

↓

### 3. Scraping

Multiple websites are scraped in parallel.

↓

### 4. Processing

The extracted text is cleaned and chunked.

↓

### 5. Embeddings

Chunks are converted into vector embeddings.

↓

### 6. Semantic Retrieval

Relevant chunks are selected for report generation.

↓

### 7. Report Generation

The Writer agent creates the final report with citations.

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/AmriteshSingh0/research-os.git
```

Install dependencies

```bash
npm install
```

Setup environment variables

```env
OPENAI_API_KEY=

DATABASE_URL=

TAVILY_API_KEY=
```

Run locally

```bash
npm run dev
```

---

# 📂 Project Structure

```text
apps/
   web/
   server/

packages/

docs/

```

---

# 🛣 Roadmap

## Completed

- Multi-agent LangGraph workflow
- Parallel web scraping
- Intelligent chunking
- Embedding generation
- Semantic retrieval
- AI report generation
- PostgreSQL persistence
- Streaming execution logs

## In Progress

- Cross-source confidence scoring
- Source credibility ranking
- Contradiction detection
- Intelligent caching
- Evidence graph generation

## Future

- Local LLM support (Ollama)
- PDF export
- Knowledge graph visualization
- Deep Research Mode
- Live collaboration
- Plugin system

---

# 💡 Why I Built This

I wanted to understand how production AI systems are actually built.

Instead of experimenting with isolated prompts, I wanted to learn how to orchestrate multiple AI agents, manage long-running workflows, retrieve contextual information with embeddings, and build reliable research pipelines.

ResearchOS has been my way of exploring those ideas through a real-world project.

---

# 🤝 Contributions

Contributions, feature suggestions, and discussions are always welcome.

If you have ideas to improve ResearchOS, feel free to open an issue or submit a pull request.

---

# ⭐ Support

If you found this project interesting, consider giving it a star—it really helps and motivates me to keep building.
