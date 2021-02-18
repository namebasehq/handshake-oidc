<script context="module" lang="ts">
	const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
</script>

<script lang="ts">
	export let error: Error | null = null;
</script>

<svelte:head>
	<title>Login | Namebase | Error</title>
</svelte:head>

<div class="main">
	<h1>404</h1>
	<h2>An error occurred. But we caught it.</h2>
	<div class="cta">We don't know how to fix this right now, so maybe try again later.</div>
	{#if IS_DEVELOPMENT && error && error.stack}
		<div class="error-stack-text">
			<pre>{error.stack}</pre>
		</div>
	{/if}
</div>

<style>
	h1 {
		color: #383838;
		display: block;
		font-size: 144px;
		text-align: center;
		font-family: 'Roboto Variable';
		font-variation-settings: 'wght' 700;
	}

	h2 {
		color: #484848;
		display: block;
		font-size: 20px;
		text-align: center;
		padding-top: 24px;
		line-height: 32px;
		font-family: 'Roboto Variable';
		font-variation-settings: 'wght' 700;
	}

	pre {
		color: #676767;
		margin-top: 32px;
		white-space: pre-wrap;
		font-family: 'Roboto Mono';
	}

	.cta {
		color: #676767;
		display: block;
		font-size: 18px;
		text-align: center;
		padding-top: 16px;
		line-height: 28px;
		font-family: 'Roboto Variable';
		font-variation-settings: 'wght' 500;
	}

	.main {
		display: flex;
		margin-top: 96px;
		text-align: center;
		flex-direction: column;
	}

	.error-stack-text {
		font-size: 14px;
		line-height: 24px;
	}
</style>
