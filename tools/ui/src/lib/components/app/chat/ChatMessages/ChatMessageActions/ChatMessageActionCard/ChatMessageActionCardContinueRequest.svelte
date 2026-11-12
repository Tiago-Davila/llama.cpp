<script lang="ts">
	import ChatMessageActionCard from './ChatMessageActionCard.svelte';
	import { RotateCw } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		onDecision: (shouldContinue: boolean) => void;
	}

	let { onDecision }: Props = $props();
</script>

<ChatMessageActionCard icon={RotateCw}>
	{#snippet message()}
		Se alcanzó el límite de turnos agénticos. ¿Continuar?
	{/snippet}

	{#snippet actions()}
		<Button onclick={() => onDecision(true)} size="sm">Continuar</Button>

		<Button
			class="text-destructive hover:text-destructive"
			onclick={() => onDecision(false)}
			size="sm"
			variant="destructive"
		>
			Detener
		</Button>
	{/snippet}
</ChatMessageActionCard>
