<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { mode, toggleMode } from 'mode-watcher';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	// Create a reactive boolean for the switch
	let isDark = $derived(mode.current === 'dark');

	function handleToggle() {
		toggleMode();
	}

	// Re-run the derived when mode changes
	$effect(() => {
		isDark = mode.current === 'dark';
	});
</script>

<div class="flex items-center space-x-2">
	<SunIcon class="h-4 w-4" />
	<Switch id="dark-mode" checked={isDark} onCheckedChange={handleToggle} />
	<MoonIcon class="h-4 w-4" />
	<Label for="dark-mode" class="sr-only">Toggle dark mode</Label>
</div>
