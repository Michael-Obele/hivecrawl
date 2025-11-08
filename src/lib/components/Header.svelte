<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import HiveIcon from '@lucide/svelte/icons/flower-2';
</script>

<header
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
	<div class="container flex h-16 items-center justify-between px-4">
		<!-- Logo/Brand -->
		<div class="flex items-center space-x-2">
			<HiveIcon class="h-8 w-8 text-primary" />
			<span
				class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-xl font-bold text-transparent"
			>
				HiveCrawl
			</span>
		</div>

		<!-- Navigation -->
		<nav class="hidden items-center space-x-6 md:flex">
			<Button variant="ghost" href="/" class="text-sm font-medium">Home</Button>
			<Button variant="ghost" href="/docs" class="text-sm font-medium">Docs</Button>
			<Button
				variant="ghost"
				href="https://github.com/Michael-Obele/hivecrawl"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-medium"
			>
				GitHub
			</Button>
		</nav>

		<!-- Theme Toggle -->
		<div class="flex items-center">
			<ThemeToggle />
		</div>
	</div>
</header>
