// ─────────────────────────────────────────────────────────────
// AI Investment Research Agent
// 
// Architecture: LangGraph.js StateGraph with 6 sequential nodes
//   1. research_overview   → Company basics, business model
//   2. research_financials → Financial health & metrics
//   3. research_news       → News sentiment & developments
//   4. research_competition→ Competitive position & moat
//   5. research_market     → Industry & macro analysis
//   6. investment_decision → Final INVEST/PASS verdict
//
// Each node uses:
//   - TavilySearchResults (LangChain tool) for web research
//   - ChatGoogleGenerativeAI (Gemini) for analysis
//   - ChatPromptTemplate + RunnableSequence for structured chains
//
// Falls back to a direct pipeline if LangGraph encounters issues.
// ─────────────────────────────────────────────────────────────

import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  COMPANY_OVERVIEW_PROMPT,
  FINANCIAL_ANALYSIS_PROMPT,
  NEWS_SENTIMENT_PROMPT,
  COMPETITIVE_ANALYSIS_PROMPT,
  MARKET_ANALYSIS_PROMPT,
  INVESTMENT_DECISION_PROMPT,
} from "./prompts.js";

// ─── LLM & Tool Factories ──────────────────────────────────

function createLLM() {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_groq_api_key_here")) {
    console.log("🤖 Using Groq LLM (llama-3.3-70b-versatile)");
    return new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  console.log("🤖 Using Google Gemini LLM (gemini-2.0-flash)");
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // Reverted to 2.0-flash (1500 RPD) for higher limits
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });
}

function createSearchTool() {
  if (!process.env.TAVILY_API_KEY) {
    console.warn("⚠️  TAVILY_API_KEY not set — agent will use LLM knowledge only (no web search)");
    return null;
  }
  return new TavilySearchResults({
    maxResults: 5,
    apiKey: process.env.TAVILY_API_KEY,
  });
}

const outputParser = new StringOutputParser();

// ─── Core Helper: Search → Analyze Chain ────────────────────

async function searchAndAnalyze(companyName, searchQuery, systemPrompt, llm, searchTool) {
  // Step 1: Web search (or fallback to LLM knowledge)
  let searchResults = "No web search results available. Provide analysis based on your training knowledge.";

  if (searchTool) {
    try {
      const rawResults = await searchTool.invoke(searchQuery);
      searchResults = typeof rawResults === "string"
        ? rawResults
        : JSON.stringify(rawResults, null, 2);
    } catch (err) {
      console.warn(`  ⚠️  Search failed for "${searchQuery.slice(0, 50)}...": ${err.message}`);
      searchResults = `Web search unavailable (${err.message}). Provide analysis based on your training knowledge.`;
    }
  }

  // Step 2: LLM analysis via LangChain RunnableSequence
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "Company: {company}\n\nResearch Data:\n{searchResults}\n\nProvide your detailed analysis:"],
  ]);

  const chain = RunnableSequence.from([prompt, llm, outputParser]);

  return chain.invoke({
    company: companyName,
    searchResults,
  });
}

// ─── LangGraph Node Functions ───────────────────────────────
// Each function follows the LangGraph node pattern:
//   Input:  current state object
//   Output: partial state update (merged into graph state)

function createOverviewNode(llm, searchTool) {
  return async (state) => {
    console.log("  🏢 Researching company overview...");
    const overview = await searchAndAnalyze(
      state.companyName,
      `${state.companyName} company overview business model products services headquarters founded CEO leadership`,
      COMPANY_OVERVIEW_PROMPT,
      llm,
      searchTool
    );
    return { overview };
  };
}

function createFinancialsNode(llm, searchTool) {
  return async (state) => {
    console.log("  📊 Analyzing financial performance...");
    const financials = await searchAndAnalyze(
      state.companyName,
      `${state.companyName} financial results revenue profit earnings 2024 2025 stock price market cap quarterly results`,
      FINANCIAL_ANALYSIS_PROMPT,
      llm,
      searchTool
    );
    return { financials };
  };
}

function createNewsNode(llm, searchTool) {
  return async (state) => {
    console.log("  📰 Scanning news & sentiment...");
    const news = await searchAndAnalyze(
      state.companyName,
      `${state.companyName} latest news developments 2025 analyst rating opinion sentiment`,
      NEWS_SENTIMENT_PROMPT,
      llm,
      searchTool
    );
    return { news };
  };
}

function createCompetitionNode(llm, searchTool) {
  return async (state) => {
    console.log("  ⚔️  Evaluating competitive landscape...");
    const competition = await searchAndAnalyze(
      state.companyName,
      `${state.companyName} competitors market share competitive advantage moat industry position vs rivals`,
      COMPETITIVE_ANALYSIS_PROMPT,
      llm,
      searchTool
    );
    return { competition };
  };
}

function createMarketNode(llm, searchTool) {
  return async (state) => {
    console.log("  📈 Analyzing market & industry...");
    const market = await searchAndAnalyze(
      state.companyName,
      `${state.companyName} industry market trends growth outlook regulation macroeconomic factors 2025`,
      MARKET_ANALYSIS_PROMPT,
      llm,
      searchTool
    );
    return { market };
  };
}

function createDecisionNode(llm) {
  return async (state) => {
    console.log("  🎯 Making investment decision...");

    // Aggregate all research into a single context
    const allResearch = [
      `## Company Overview\n${state.overview}`,
      `## Financial Analysis\n${state.financials}`,
      `## News & Sentiment\n${state.news}`,
      `## Competitive Analysis\n${state.competition}`,
      `## Market & Industry\n${state.market}`,
    ].join("\n\n---\n\n");

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", INVESTMENT_DECISION_PROMPT],
      ["human", "Company: {company}\n\nComplete Research Report:\n{allResearch}\n\nProvide your investment decision as a JSON object:"],
    ]);

    const chain = RunnableSequence.from([prompt, llm, outputParser]);
    const rawDecision = await chain.invoke({
      company: state.companyName,
      allResearch,
    });

    // Parse JSON from LLM response (handle markdown fences)
    let decision;
    try {
      const cleaned = rawDecision
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      decision = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn("  ⚠️  Could not parse decision JSON, creating fallback:", parseErr.message);
      decision = {
        verdict: "PASS",
        confidence: 40,
        overallScore: 40,
        summary: rawDecision.slice(0, 500),
        scores: {
          businessModel: 5, financialHealth: 5, growthPotential: 5,
          competitivePosition: 5, managementQuality: 5,
          valuationAttractiveness: 5, riskProfile: 5, marketConditions: 5,
        },
        keyReasons: ["Analysis completed but structured scoring was unavailable"],
        risks: ["Unable to parse detailed risk assessment"],
        catalysts: ["Requires further manual analysis"],
        timeHorizon: "Medium-term (1-3 years)",
        targetAction: "Conduct additional due diligence before making a decision",
      };
    }

    return { decision };
  };
}

// ─── LangGraph: Build & Compile State Graph ─────────────────

function buildResearchGraph(llm, searchTool) {
  /*
   * State Graph Architecture:
   * 
   *  START → overview → financials → news → competition → market → decision → END
   *
   * Each node enriches the shared state with its analysis.
   * The decision node reads all prior analyses to make the final call.
   */
  const workflow = new StateGraph({
    channels: {
      companyName: { value: (x, y) => y ?? x, default: () => "" },
      overview:    { value: (x, y) => y ?? x, default: () => "" },
      financials:  { value: (x, y) => y ?? x, default: () => "" },
      news:        { value: (x, y) => y ?? x, default: () => "" },
      competition: { value: (x, y) => y ?? x, default: () => "" },
      market:      { value: (x, y) => y ?? x, default: () => "" },
      decision:    { value: (x, y) => y ?? x, default: () => null },
    },
  })
    .addNode("research_overview", createOverviewNode(llm, searchTool))
    .addNode("research_financials", createFinancialsNode(llm, searchTool))
    .addNode("research_news", createNewsNode(llm, searchTool))
    .addNode("research_competition", createCompetitionNode(llm, searchTool))
    .addNode("research_market", createMarketNode(llm, searchTool))
    .addNode("investment_decision", createDecisionNode(llm))
    .addEdge(START, "research_overview")
    .addEdge("research_overview", "research_financials")
    .addEdge("research_financials", "research_news")
    .addEdge("research_news", "research_competition")
    .addEdge("research_competition", "research_market")
    .addEdge("research_market", "investment_decision")
    .addEdge("investment_decision", END);

  return workflow.compile();
}

// ─── Fallback: Direct Pipeline (no LangGraph dependency) ────

async function* runDirectPipeline(companyName, llm, searchTool) {
  const state = { companyName };

  const phases = [
    { id: "overview", node: createOverviewNode(llm, searchTool) },
    { id: "financials", node: createFinancialsNode(llm, searchTool) },
    { id: "news", node: createNewsNode(llm, searchTool) },
    { id: "competition", node: createCompetitionNode(llm, searchTool) },
    { id: "market", node: createMarketNode(llm, searchTool) },
  ];

  for (const phase of phases) {
    const update = await phase.node(state);
    Object.assign(state, update);
    yield { type: "phase_complete", phase: phase.id, data: update[phase.id] };
  }

  // Final decision
  const decisionNode = createDecisionNode(llm);
  const decisionUpdate = await decisionNode(state);
  yield { type: "decision", data: decisionUpdate.decision };
  yield { type: "complete" };
}

// ─── Main Export: Run Research Agent ────────────────────────
// Attempts LangGraph execution first, falls back to direct pipeline.

export async function* runResearchAgent(companyName) {
  console.log(`\n🔬 Starting research on "${companyName}"...\n`);

  const llm = createLLM();
  const searchTool = createSearchTool();

  try {
    // Primary: LangGraph-based execution with streaming
    const graph = buildResearchGraph(llm, searchTool);
    const stream = await graph.stream({ companyName });

    for await (const event of stream) {
      const [nodeName, nodeData] = Object.entries(event)[0];

      if (nodeName === "investment_decision") {
        yield { type: "decision", data: nodeData.decision };
      } else {
        const phase = nodeName.replace("research_", "");
        yield { type: "phase_complete", phase, data: nodeData[phase] || "" };
      }
    }

    yield { type: "complete" };
    console.log(`\n✅ Research on "${companyName}" completed via LangGraph.\n`);
  } catch (graphError) {
    console.warn(`\n⚠️  LangGraph failed: ${graphError.message}`);
    console.log("   Falling back to direct pipeline...\n");
    yield* runDirectPipeline(companyName, llm, searchTool);
    console.log(`\n✅ Research on "${companyName}" completed via direct pipeline.\n`);
  }
}
