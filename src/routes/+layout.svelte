<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/logo.svg';
	import Header from '$lib/components/Header.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Header />
{@render children()}
