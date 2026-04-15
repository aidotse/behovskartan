<script lang="ts">
	import { navigating } from '$app/stores';

	let visible = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if ($navigating) {
			timer = setTimeout(() => { visible = true; }, 120);
		} else {
			if (timer) clearTimeout(timer);
			timer = null;
			visible = false;
		}
		return () => {
			if (timer) clearTimeout(timer);
			timer = null;
		};
	});
</script>

{#if visible}
	<div
		class="fixed top-0 left-0 right-0 h-[3px] z-[60] overflow-hidden pointer-events-none"
		aria-hidden="true"
	>
		<div class="nav-progress-bar h-full" style="background-color: #1690b8;"></div>
	</div>
{/if}

<style>
	.nav-progress-bar {
		width: 40%;
		animation: nav-progress 1.1s ease-in-out infinite;
	}

	@keyframes nav-progress {
		0%   { transform: translateX(-100%); }
		50%  { transform: translateX(150%); }
		100% { transform: translateX(250%); }
	}
</style>
