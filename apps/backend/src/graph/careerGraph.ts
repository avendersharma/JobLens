import { StateGraph, Annotation } from '@langchain/langgraph';
import { runResumeAgent, type ResumeAgentResult } from '../agents/resumeAgent';
import { runMatchAgent, type MatchResult } from '../agents/matchAgent';

const GraphState = Annotation.Root({
  fileBuffer: Annotation<Buffer | null>({ reducer: (_, next) => next, default: () => null }),
  mimetype: Annotation<string>({ reducer: (_, next) => next, default: () => '' }),
  filename: Annotation<string>({ reducer: (_, next) => next, default: () => '' }),
  jdText: Annotation<string>({ reducer: (_, next) => next, default: () => '' }),
  resumeResult: Annotation<ResumeAgentResult | null>({ reducer: (_, next) => next, default: () => null }),
  matchResult: Annotation<MatchResult | null>({ reducer: (_, next) => next, default: () => null }),
});

type GraphStateType = typeof GraphState.State;

async function parseResumeNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.fileBuffer) return {};
  const resumeResult = await runResumeAgent(state.fileBuffer, state.mimetype, state.filename);
  return { resumeResult };
}

async function analyzeMatchNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.jdText) return {};
  const matchResult = await runMatchAgent(state.jdText, state.resumeResult?.docId);
  return { matchResult };
}

const graph = new StateGraph(GraphState)
  .addNode('parseResume', parseResumeNode)
  .addNode('analyzeMatch', analyzeMatchNode)
  .addEdge('__start__', 'parseResume')
  .addEdge('parseResume', 'analyzeMatch')
  .addEdge('analyzeMatch', '__end__')
  .compile();

export { graph as careerGraph };
