import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/openapi.json');
	const spec = await res.json();
	return { spec };
};
