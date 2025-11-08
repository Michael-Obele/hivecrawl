<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Rocket, BookOpen, Github } from '@lucide/svelte';
</script>

<header
	class="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md supports-backdrop-filter:bg-background/60"
>
	<div class="container flex h-16 items-center justify-between px-4">
		<!-- Logo/Brand -->
		<a href="/" class="flex items-center space-x-2 transition-transform hover:scale-105">
			<Rocket class="h-8 w-8 text-primary" />
			<span
				class="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-xl font-bold text-transparent"
			>
				HiveCrawl
			</span>
		</a>

		<!-- Navigation -->
		<nav class="hidden items-center space-x-2 md:flex">
			<Button
				variant="ghost"
				href="/"
				class="text-sm font-medium transition-colors hover:text-primary"
			>
				Home
			</Button>
			<Button
				variant="ghost"
				href="/docs"
				class="text-sm font-medium transition-colors hover:text-primary"
			>
				<BookOpen class="mr-1.5 h-4 w-4" />
				Docs
			</Button>
			<Button
				variant="ghost"
				href="https://github.com/Michael-Obele/hivecrawl"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-medium transition-colors hover:text-primary"
			>
				<Github class="mr-1.5 h-4 w-4" />
				GitHub
			</Button>
		</nav>

		<!-- Theme Toggle -->
		<div class="flex items-center">
			<ThemeToggle />
		</div>
	</div>
</header>
