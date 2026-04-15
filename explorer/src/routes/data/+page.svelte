<script lang="ts">
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const spec = $derived(data.spec);
	const paths = $derived(Object.entries(spec.paths) as [string, Record<string, any>][]);

	const API_BASE_URL = 'https://api.behovskartan.se';

	// Strings from openapi.json are shown verbatim (in English) and styled as
	// code so readers understand they come from the machine-readable spec.
	function oa(text: unknown): string {
		return typeof text === 'string' ? text : '';
	}

	// Parse the limited markdown subset used in openapi.yaml descriptions
	// (heading, bullet, bold, inline code) into structured tokens so we can
	// render them through Svelte templating instead of {@html}. The spec is
	// project-controlled, but avoiding {@html} keeps any future spec edit from
	// becoming an XSS vector.
	type InlineToken =
		| { kind: 'text'; value: string }
		| { kind: 'bold'; value: string }
		| { kind: 'code'; value: string };
	type BlockToken =
		| { kind: 'heading'; inline: InlineToken[] }
		| { kind: 'bullet'; inline: InlineToken[] }
		| { kind: 'paragraph'; inline: InlineToken[] };

	function parseInline(line: string): InlineToken[] {
		const tokens: InlineToken[] = [];
		const re = /\*\*(.+?)\*\*|`(.+?)`/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = re.exec(line)) !== null) {
			if (match.index > lastIndex) {
				tokens.push({ kind: 'text', value: line.slice(lastIndex, match.index) });
			}
			if (match[1] !== undefined) tokens.push({ kind: 'bold', value: match[1] });
			else if (match[2] !== undefined) tokens.push({ kind: 'code', value: match[2] });
			lastIndex = re.lastIndex;
		}
		if (lastIndex < line.length) tokens.push({ kind: 'text', value: line.slice(lastIndex) });
		return tokens;
	}

	function parseDescription(text: string): BlockToken[] {
		return text
			.trim()
			.split('\n')
			.map((raw): BlockToken => {
				const heading = raw.match(/^#{1,3}\s+(.*)$/);
				if (heading) return { kind: 'heading', inline: parseInline(heading[1]) };
				const bullet = raw.match(/^-\s+(.*)$/);
				if (bullet) return { kind: 'bullet', inline: parseInline(bullet[1]) };
				return { kind: 'paragraph', inline: parseInline(raw) };
			});
	}

	function paramDefault(param: any): string | null {
		return param.schema?.default !== undefined ? String(param.schema.default) : null;
	}

	function paramEnum(param: any): string[] | null {
		return param.schema?.enum || null;
	}

	function schemaProperties(schema: any): [string, any][] {
		if (!schema?.properties) return [];
		return Object.entries(schema.properties);
	}

	function getResponseSchema(responses: any): { contentType: string; schema: any } | null {
		const ok = responses?.['200'];
		if (!ok?.content) return null;
		const [contentType, mediaType] = Object.entries(ok.content)[0] as [string, any];
		return { contentType, schema: mediaType?.schema };
	}

	function getExample(responses: any): string | null {
		const ok = responses?.['200'];
		if (!ok?.content) return null;
		for (const mediaType of Object.values(ok.content) as any[]) {
			if (mediaType?.examples) {
				const first = Object.values(mediaType.examples)[0] as any;
				if (first?.value) return JSON.stringify(first.value, null, 2);
			}
			if (mediaType?.example) return typeof mediaType.example === 'string'
				? mediaType.example
				: JSON.stringify(mediaType.example, null, 2);
		}
		return null;
	}

	// Nested object params (like period) — expand their sub-properties
	function expandedParams(params: any[]): any[] {
		const result: any[] = [];
		for (const p of params) {
			if (p.schema?.type === 'object' && p.schema.properties) {
				for (const [name, prop] of Object.entries(p.schema.properties) as [string, any][]) {
					result.push({
						name: `${p.name}.${name}`,
						schema: prop,
						required: p.schema.required?.includes(name) ?? false,
						description: prop.description || ''
					});
				}
			} else {
				result.push(p);
			}
		}
		return result;
	}
</script>

<svelte:head>
	<title>Data & API — Behovskartan</title>
	<meta name="description" content="Dokumentation för Behovskartans öppna API på api.behovskartan.se" />
</svelte:head>

<PageContainer maxWidth="max-w-5xl">
	<!-- Intro -->
	<header class="mb-10 px-1 sm:px-8 lg:px-20 pt-4 lg:pt-8">
		<h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Data & API</h1>
		<div class="prose prose-gray max-w-prose">
			<p>
				Alla scenarier i detta verktyg är tillgängliga via ett öppet API på
				<a href="{API_BASE_URL}" class="font-mono text-blue-700 hover:underline">api.behovskartan.se</a>.
				Data genereras från historiska tidsserier och parametriserade scenarier som
				modellerar olika utvecklingsbanor för elektrifiering, ekonomisk tillväxt och
				teknologisk utveckling.
			</p>
			<p>
				API:et använder DuckDB för snabba frågor mot strukturerade Parquet-filer.
				All data är tillgänglig med olika tidsupplösningar och kan filtreras på
				geografi, segment och scenario.
			</p>
		</div>
	</header>

	<div class="px-1 sm:px-8 lg:px-20">
	<!-- Base URL -->
	<section class="mb-10 p-5 border border-gray-200 rounded-lg">
		<h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basadress</h2>
		<p class="text-sm text-gray-700 mb-3">
			API:et ligger på <code class="text-xs bg-gray-100 px-1.5 py-0.5 rounded border font-mono">{API_BASE_URL}</code>.
			Lägg till önskad endpoint efter basadressen.
		</p>
		<p class="text-xs text-gray-500 mb-2">Exempel (cURL):</p>
		<pre class="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto"><code>curl "{API_BASE_URL}/demand?period[start]=2030&amp;period[end]=2051&amp;period[resolution]=1Y&amp;period[aggregation]=sum&amp;geography=total&amp;segment=total"</code></pre>
	</section>

	<!-- Quick reference -->
	<section class="mb-10 p-5 bg-gray-50 rounded-lg">
		<h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Snabbstart</h2>
		<ol class="list-decimal list-inside text-sm text-gray-700 space-y-1 mb-4">
			<li><code class="text-xs bg-white px-1.5 py-0.5 rounded border">GET /parameters</code> — Hämta tillgängliga parametervärden</li>
			<li><code class="text-xs bg-white px-1.5 py-0.5 rounded border">GET /scenarios</code> — Hämta tillgängliga scenarier</li>
			<li><code class="text-xs bg-white px-1.5 py-0.5 rounded border">GET /demand</code> — Hämta tidsserier med valfria filter</li>
		</ol>
		<p class="text-xs text-gray-500">
			Svarsformat: JSON (standard) eller CSV (<code class="bg-white px-1 py-0.5 rounded border">?format=csv</code>).
			Geografiendpointen stöder även GeoJSON.
		</p>
	</section>

	<!-- Endpoint index -->
	<nav class="mb-10">
		<h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ändpunkter</h2>
		<p class="text-xs text-gray-500 mb-3 max-w-prose">
			Beskrivningarna nedan hämtas direkt från API:ets OpenAPI-specifikation och
			visas därför på engelska. Text som kommer från specifikationen är satt i
			<span class="font-mono text-[11px] text-gray-600">typsnitt för kod</span>
			för att göra ursprunget tydligt.
		</p>
		<ul class="space-y-1">
			{#each paths as [path, methods]}
				{@const op = Object.values(methods)[0] as any}
				<li>
					<a href="#endpoint-{path.slice(1)}" class="flex items-center gap-3 py-1.5 text-sm hover:text-blue-600 transition-colors">
						<span class="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">GET</span>
						<span class="font-mono text-gray-900">{path}</span>
						<span class="hidden sm:inline font-mono text-xs text-gray-500 italic">// {oa(op.summary)}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Endpoint details -->
	<div class="space-y-12">
		{#each paths as [path, methods]}
			{@const method = Object.keys(methods)[0]}
			{@const op = methods[method]}
			{@const resp = getResponseSchema(op.responses)}
			{@const example = getExample(op.responses)}
			{@const params = op.parameters ? expandedParams(op.parameters) : []}

			<section id="endpoint-{path.slice(1)}" class="scroll-mt-20">
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
					<span class="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">{method.toUpperCase()}</span>
					<h2 class="text-base sm:text-lg font-bold font-mono text-gray-900 break-all">{API_BASE_URL}{path}</h2>
				</div>
				<p class="font-mono text-xs text-gray-600 italic mb-4">// {oa(op.summary)}</p>

				{#if op.description}
					<div class="font-mono text-xs text-gray-600 leading-relaxed mb-4 max-w-prose border-l-2 border-gray-200 pl-3 bg-gray-50/60 py-2 pr-2 rounded-r">
						{#each parseDescription(oa(op.description)) as block}
							{#if block.kind === 'heading'}
								<p class="font-semibold text-gray-800 mt-3">
									{#each block.inline as tok}{#if tok.kind === 'bold'}<strong>{tok.value}</strong>{:else if tok.kind === 'code'}<code class="text-[11px] bg-white px-1 py-0.5 rounded border border-gray-200">{tok.value}</code>{:else}{tok.value}{/if}{/each}
								</p>
							{:else if block.kind === 'bullet'}
								<span class="block pl-4">— {#each block.inline as tok}{#if tok.kind === 'bold'}<strong>{tok.value}</strong>{:else if tok.kind === 'code'}<code class="text-[11px] bg-white px-1 py-0.5 rounded border border-gray-200">{tok.value}</code>{:else}{tok.value}{/if}{/each}</span>
							{:else}
								<span class="block">{#each block.inline as tok}{#if tok.kind === 'bold'}<strong>{tok.value}</strong>{:else if tok.kind === 'code'}<code class="text-[11px] bg-white px-1 py-0.5 rounded border border-gray-200">{tok.value}</code>{:else}{tok.value}{/if}{/each}</span>
							{/if}
						{/each}
					</div>
				{/if}

				{#if params.length}
					<div class="mb-4">
						<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Parametrar</h3>
						<div class="border border-gray-200 rounded-lg overflow-hidden">
							<table class="w-full text-sm">
								<thead>
									<tr class="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
										<th class="px-4 py-2">Namn</th>
										<th class="px-4 py-2">Typ</th>
										<th class="px-4 py-2">Obligatorisk</th>
										<th class="px-4 py-2">Beskrivning</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each params as param}
										{@const enumVals = paramEnum(param)}
										{@const defVal = paramDefault(param)}
										<tr>
											<td class="px-4 py-2 font-mono text-xs text-gray-900">{param.name}</td>
											<td class="px-4 py-2 text-xs text-gray-500">
												{param.schema?.type || 'string'}
												{#if enumVals}
													<br /><span class="text-gray-400">{enumVals.join(' | ')}</span>
												{/if}
											</td>
											<td class="px-4 py-2 text-xs">
												{#if param.required}
													<span class="text-amber-600 font-medium">obligatorisk</span>
												{:else}
													<span class="text-gray-400">valfri</span>
													{#if defVal !== null}
														<br /><span class="text-gray-400">standard: {defVal}</span>
													{/if}
												{/if}
											</td>
											<td class="px-4 py-2 font-mono text-[11px] text-gray-600 italic">{oa(param.description)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				{#if resp?.schema?.properties}
					<div class="mb-4">
						<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Svar</h3>
						<p class="text-xs text-gray-400 mb-2">{resp.contentType}</p>
						<div class="border border-gray-200 rounded-lg overflow-hidden">
							<table class="w-full text-sm">
								<thead>
									<tr class="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
										<th class="px-4 py-2">Fält</th>
										<th class="px-4 py-2">Typ</th>
										<th class="px-4 py-2">Beskrivning</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									{#each schemaProperties(resp.schema) as [name, prop]}
										<tr>
											<td class="px-4 py-2 font-mono text-xs text-gray-900">{name}</td>
											<td class="px-4 py-2 text-xs text-gray-500">{prop.type || 'object'}</td>
											<td class="px-4 py-2 font-mono text-[11px] text-gray-600 italic">{oa(prop.description)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				{#if example}
					<details class="group">
						<summary class="text-sm font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none">
							Exempelsvar
						</summary>
						<pre class="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-80"><code>{example}</code></pre>
					</details>
				{/if}
			</section>
		{/each}
	</div>

	<!-- Tips -->
	<section class="mt-12 pt-8 border-t border-gray-200">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Användningstips</h2>
		<div class="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
			<div class="p-4 bg-gray-50 rounded-lg">
				<h3 class="font-semibold text-gray-800 mb-1">Server-side aggregering</h3>
				<p>Använd <code class="text-xs bg-white px-1 py-0.5 rounded border">geography=total</code> och <code class="text-xs bg-white px-1 py-0.5 rounded border">segment=total</code> för att låta servern aggregera åt dig.</p>
			</div>
			<div class="p-4 bg-gray-50 rounded-lg">
				<h3 class="font-semibold text-gray-800 mb-1">Upplösning & aggregering</h3>
				<p>För energi: <code class="text-xs bg-white px-1 py-0.5 rounded border">aggregation=sum</code>. För effekt: <code class="text-xs bg-white px-1 py-0.5 rounded border">aggregation=mean</code> eller <code class="text-xs bg-white px-1 py-0.5 rounded border">max</code>.</p>
			</div>
		</div>
	</section>

	<footer class="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
		<p>Genererad från <a href="/openapi.json" class="underline hover:text-gray-600">openapi.json</a> — OpenAPI {spec.openapi}</p>
		<a href="https://github.com/aidotse/behovskartan" class="underline hover:text-gray-600">GitHub</a>
	</footer>
	</div>
</PageContainer>
