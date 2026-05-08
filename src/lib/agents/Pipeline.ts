import { Project } from '../../hooks/useStorage';
import { generateViaProxy } from '../ai-engine';

export interface AgentContext {
  project: Project;
  history: string[];
  evidenceData: any[]; // Extended context
}

export const AgentSchemas = {
  Critique: {
    type: 'object',
    properties: {
      weaknesses: { type: 'array', items: { type: 'string' } },
      missingEvidence: { type: 'array', items: { type: 'string' } },
      counterArguments: { type: 'array', items: { type: 'string' } },
      confidenceScore: { type: 'number' },
      riskLevel: { type: 'string' }
    },
    required: ['weaknesses', 'missingEvidence', 'confidenceScore', 'riskLevel']
  },
  Research: {
    type: 'object',
    properties: {
      foundEvidence: { type: 'array', items: { type: 'string' } },
      semanticMatches: { type: 'array', items: { type: 'string' } },
      relevanceScore: { type: 'number' }
    },
    required: ['foundEvidence', 'relevanceScore']
  },
  Synthesis: {
    type: 'object',
    properties: {
      executiveSummary: { type: 'string' },
      validatedClaims: { type: 'array', items: { type: 'string' } },
      recommendedDecision: { type: 'string' },
      expectedOutcomes: { type: 'array', items: { type: 'string' } }
    },
    required: ['executiveSummary', 'validatedClaims', 'recommendedDecision']
  },
  Scenario: {
    type: 'object',
    properties: {
      scenarios: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            risk: { type: 'string' },
            mitigation: { type: 'string' },
            riskScore: { type: 'number' },
            sensitivityFactor: { type: 'string' }
          },
          required: ['id', 'title', 'risk', 'mitigation', 'riskScore', 'sensitivityFactor']
        }
      }
    },
    required: ['scenarios']
  }
};

export class MultiAgentOrchestrator {
  static async simulateScenarios(context: AgentContext): Promise<any> {
    const prompt = `Project: ${context.project.name}\nProblem: ${context.project.problem.text}\nIdeas: ${JSON.stringify(context.project.ideas)}\nEvidence: ${JSON.stringify(context.project.evidence)}\nGenerate highly specific failure scenarios and rank them based on severity and sensitivity.`;
    const sysInstruction = "You are a Pre-Mortem Scenario Simulator and Risk Analyst. Output JSON ONLY matching the schema. Assess specific stress tests (financial, technical, adoption, regulatory). Output in Arabic for content.";
    
    try {
      const res = await generateViaProxy(prompt, { 
        systemInstruction: sysInstruction, 
        responseSchema: AgentSchemas.Scenario 
      });
      return JSON.parse(res);
    } catch (e) {
      console.error("Scenario Agent failed", e);
      return null;
    }
  }
  static async runCritiqueAgent(context: AgentContext, decisionContext: string): Promise<any> {
    const prompt = `Decision Context: ${decisionContext}\nEvidence: ${JSON.stringify(context.project.evidence)}\nAssess vulnerabilities and risks.`;
    const sysInstruction = "You are an elite Critic Agent. Identify counter-arguments, weaknesses, and assign a confidence score (0-100). Respond in JSON ONLY according to schema. Output in Arabic for content.";
    
    try {
      const res = await generateViaProxy(prompt, { 
        systemInstruction: sysInstruction, 
        responseSchema: AgentSchemas.Critique 
      });
      return JSON.parse(res);
    } catch (e) {
      console.error("Critic Agent failed", e);
      return null;
    }
  }

  static async runResearchAgent(context: AgentContext, query: string): Promise<any> {
    const prompt = `Query: ${query}\nAvailable History/Experiments: ${JSON.stringify(context.project.history)}\nExtract semantic matches and relevance.`;
    const sysInstruction = "You are a Research Analyst. Correlate local claims to evidence. Identify relevance. Respond in JSON ONLY. Output in Arabic for content.";
    
    try {
      const res = await generateViaProxy(prompt, { 
        systemInstruction: sysInstruction, 
        responseSchema: AgentSchemas.Research 
      });
      return JSON.parse(res);
    } catch (e) {
      console.error("Research Agent failed", e);
      return null;
    }
  }

  static async runSynthesisAgent(context: AgentContext, analystFindings: any, critique: any): Promise<any> {
    const prompt = `Project: ${context.project.name}\nProblem: ${context.project.problem.text}\nAnalyst findings: ${JSON.stringify(analystFindings)}\nCritique: ${JSON.stringify(critique)}\nSynthesize a highly rational decision.`;
    const sysInstruction = "You are the Executive Strategic Agent. You combine analysis and critique to issue a final recommendation with expected outcomes. Output JSON ONLY. Output in Arabic for content.";
    
    try {
      const res = await generateViaProxy(prompt, { 
        systemInstruction: sysInstruction, 
        responseSchema: AgentSchemas.Synthesis 
      });
      return JSON.parse(res);
    } catch (e) {
      console.error("Synthesis Agent failed", e);
      return null;
    }
  }

  // Full reasoning pipeline
  static async executeDecisionPipeline(context: AgentContext, decisionTopic: string) {
    console.log("Multi-Agent Pipeline started for:", decisionTopic);
    
    console.log("1. Running Research Agent...");
    const research = await this.runResearchAgent(context, decisionTopic);
    
    console.log("2. Running Critic Agent...");
    const critique = await this.runCritiqueAgent(context, decisionTopic);
    
    console.log("3. Running Strategic Synthesis...");
    const synthesis = await this.runSynthesisAgent(context, research, critique);
    
    return {
      research,
      critique,
      synthesis
    };
  }
}
