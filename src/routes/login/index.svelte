<script lang="ts" context="module">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import TextInput from '../../components/TextInput.svelte';
</script>

<script lang="ts">
	let uidHash: string | null = null;
	let newIdentityValue: string = '';
	let btoaNewIdentityValue: string = '';

	onMount(() => {
		if (typeof window === 'undefined') return;
		uidHash = window.location.hash.substring(1);
	});

	const formatIdentityValue = () => {
		const formatted = newIdentityValue.replace(/\//g, '');
		return formatted;
	};
</script>

<svelte:head>
	<title>Login | Namebase</title>
</svelte:head>

{#if typeof uidHash === 'string'}
	<div class="identities" transition:fade|local={{ duration: 185 }}>
		<h1>Log in</h1>
		<div>
			<form action={`/oidc/interaction/${uidHash}/manager`} method="POST" autocomplete="on">
				<label for="handhsake">Your Handshake name</label>
				<div class="input">
					<input type="hidden" name="id" bind:value={btoaNewIdentityValue} />
					<TextInput
						id="handhsake"
						name="handhsake"
						type="text"
						autocomplete="on"
						autocorrect="off"
						autocapitalize="none"
						bind:value={newIdentityValue}
						placeholder="Enter a Handshake name that you own*"
					/>
				</div>
				<div style="display: flex; justify-content: space-between;">
					<div class="free-handshake-name">
						<div>Don't have a Handshake name?</div>
						<a
							href="https://help.namebase.io/article/xkmc3ftupd-getting-a-free-handshake-name"
							target="_blank"
							rel="noopener noreferrer">Request one for free</a
						>
					</div>
					<button
						type="submit"
						on:click={() => (btoaNewIdentityValue = btoa(formatIdentityValue()))}
						class="new-id-button"
						disabled={!newIdentityValue}
					>
						Continue
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	h1 {
		color: #ffffff;
		font-size: 24px;
		text-align: center;
		line-height: 34px;
		font-weight: medium;
		font-family: 'Roboto Mono';
	}

	label {
		width: 100%;
		color: #ffffff;
		display: block;
		font-size: 14px;
		font-weight: medium;
		line-height: 24px;
		font-family: 'Roboto Mono';
		padding-top: 48px;
	}

	.input {
		margin-top: 16px;
		margin-bottom: 24px;
	}

	.new-id-button {
		width: max-content;
		color: #ffffff;
		padding: 8px 24px;
		font-size: 14px;
		background: #0a6cff;
		line-height: 24px;
		font-family: 'Roboto Variable';
		border-radius: 4px;
		font-variation-settings: 'wght' 500;
	}

	.free-handshake-name {
		color: #a9a9a9;
		font-size: 12px;
		line-height: 16px;
		font-family: 'Roboto Variable';
	}

	.free-handshake-name a {
		text-decoration: underline;
	}

	.free-handshake-name a:hover {
		color: #ffffff;
	}

	.new-id-button:hover:not([disabled]) {
		background: #4891ff;
	}

	.identities {
		display: flex;
		flex-direction: column;
	}
</style>
