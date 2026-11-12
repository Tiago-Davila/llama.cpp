import { ReasoningEffort } from '$lib/enums';
import type { ReasoningEffortLevel } from '$lib/types';

/**
 * Reasoning effort UI labels.
 * Keys match the ReasoningEffort enum values for type-safe lookups.
 */
export const REASONING_EFFORT_LABELS: Record<string, string> = {
	[ReasoningEffort.DEFAULT]: 'Por defecto',
	[ReasoningEffort.HIGH]: 'Alto',
	[ReasoningEffort.LOW]: 'Bajo',
	[ReasoningEffort.MAX]: 'Máximo',
	[ReasoningEffort.MEDIUM]: 'Medio',
	[ReasoningEffort.MINIMAL]: 'Minimal',
	[ReasoningEffort.OFF]: 'Apagado',
	[ReasoningEffort.XHIGH]: 'Muy alto'
};

/** Levels of every menu, ahead of the template levels or the budget levels. */
export const REASONING_EFFORT_BASE_LEVELS: ReasoningEffortLevel[] = [
	{ label: 'Por defecto', value: ReasoningEffort.DEFAULT },
	{ label: 'Apagado', value: ReasoningEffort.OFF }
];

/** Menu of a chat template that honors no effort level: each level is a token budget. */
export const REASONING_EFFORT_BUDGET_LEVELS: ReasoningEffortLevel[] = [
	...REASONING_EFFORT_BASE_LEVELS,
	{ label: 'Bajo', value: ReasoningEffort.LOW },
	{ label: 'Medio', value: ReasoningEffort.MEDIUM },
	{ label: 'Alto', value: ReasoningEffort.HIGH },
	{ hasInfo: true, label: 'Máximo', value: ReasoningEffort.MAX }
];

/**
 * Reasoning effort to token budget mapping.
 * Maps the ReasoningEffort enum values to concrete token counts for the server.
 */
export const REASONING_EFFORT_TOKENS: Record<string, number> = {
	[ReasoningEffort.HIGH]: 8192,
	[ReasoningEffort.LOW]: 512,
	[ReasoningEffort.MAX]: -1, // unlimited
	[ReasoningEffort.MEDIUM]: 2048
};
