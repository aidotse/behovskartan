<script lang="ts">
	import { viewStore } from '$lib/stores/viewStore.svelte';
	import { parameterStore } from '$lib/stores/parameterStore.svelte';
	import { fetchDemandData } from '$lib/dataService';
	import { makeDemandQuery } from '$lib/utilities';
	import InsightBox from '$lib/components/report/InsightBox.svelte';

	let peakGW = $state(0);
	let valleyGW = $state(0);
	let ratio = $state(0);

	const targetYear = $derived(viewStore.year);

	$effect(() => {
		const baseScenario = parameterStore.baseScenario;
		const currentYear = viewStore.year;
		if (!baseScenario || !currentYear) return;

		const paramValues = parameterStore.isDefaultScenario
			? parameterStore.parameterValues
			: undefined;

		const query = makeDemandQuery({
			start: `${currentYear}-01-01`,
			end: `${currentYear + 1}-01-01`,
			resolution: '1h',
			aggregation: 'sum',
			geography: 'total',
			segment: 'total',
			baseScenario: baseScenario,
			parameterValues: paramValues
		});

		fetchDemandData(query).then((data) => {
			if (!data.length) return;
			let max = 0;
			let min = Infinity;
			for (const d of data) {
				const v = d.value || 0;
				if (v > max) max = v;
				if (v > 0 && v < min) min = v;
			}
			peakGW = Math.round(max);
			valleyGW = Math.round(min);
			ratio = min > 0 ? Math.round(max / min) : 0;
		});
	});
</script>

<InsightBox title="Effektbehovet varierar enormt inom ett år">
	En kall vintermorgon {targetYear} kan Sveriges samlade effektbehov nå runt
	{peakGW} GW. En mild sommarnatt samma år kan det ligga under
	{valleyGW} GW. Det innebär att elnätet måste klara ungefär {ratio} gånger
	så hög belastning som vid årets lugnaste timmar.
</InsightBox>
