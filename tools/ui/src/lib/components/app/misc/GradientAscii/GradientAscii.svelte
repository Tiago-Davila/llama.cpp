<script lang="ts">
	/**
	 * GradientASCII background: soft gradient glows drawn in ASCII characters that
	 * scramble under the cursor. Svelte port of the React Bits component.
	 */
	import {
		createGradientAscii,
		GRADIENT_ASCII_DEFAULTS,
		type GradientAsciiOptions,
		toSettings
	} from './gradient-ascii';
	import { onMount } from 'svelte';

	interface Props extends Partial<GradientAsciiOptions> {
		class?: string;
	}

	let { class: className = '', ...options }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let canvas: HTMLCanvasElement | undefined = $state();
	let renderer: ReturnType<typeof createGradientAscii> = null;

	let settings = $derived(toSettings({ ...GRADIENT_ASCII_DEFAULTS, ...options }));

	onMount(() => {
		if (!container || !canvas) return;
		renderer = createGradientAscii(container, canvas, () => settings);
		return () => {
			renderer?.dispose();
			renderer = null;
		};
	});

	// any option change (pausing included) restarts the frame loop if it stopped
	$effect(() => {
		void settings;
		renderer?.wake();
	});
</script>

<div bind:this={container} class="gradient-ascii-container {className}">
	<canvas bind:this={canvas} aria-hidden="true" class="gradient-ascii-canvas"></canvas>
</div>

<style>
	.gradient-ascii-container {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.gradient-ascii-canvas {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
