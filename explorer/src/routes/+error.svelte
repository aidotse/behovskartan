<script lang="ts">
	import { page } from '$app/stores';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';

	function goBack() {
		if (typeof history !== 'undefined' && history.length > 1) {
			history.back();
		} else {
			location.href = '/';
		}
	}
</script>

<svelte:head>
	<title>{$page.status === 404 ? 'Sidan finns inte' : 'Något gick fel'} — Behovskartan</title>
</svelte:head>

<PageContainer>
	<div class="px-1 sm:px-8 lg:px-20 pt-4 lg:pt-8">
		<p class="text-sm font-semibold text-gray-500 mb-2">{$page.status}</p>
		<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
			{#if $page.status === 404}
				Sidan finns inte
			{:else}
				Något gick fel
			{/if}
		</h1>
		<p class="text-lg text-gray-700 mb-8 max-w-2xl">
			{#if $page.status === 404}
				Länken du följde leder inte till någon sida på Behovskartan. Den kan ha
				flyttats, tagits bort, eller så är adressen felstavad.
			{:else}
				{$page.error?.message ?? 'Ett oväntat fel inträffade.'}
			{/if}
		</p>
		<div class="flex flex-wrap gap-3">
			<button
				type="button"
				onclick={goBack}
				class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
			>
				← Tillbaka
			</button>
			<a
				href="/"
				class="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
			>
				Till startsidan
			</a>
		</div>
	</div>
</PageContainer>
