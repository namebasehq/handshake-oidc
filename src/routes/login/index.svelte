<script lang="ts" context="module">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import TextInput from '../../components/TextInput.svelte';

	const handballToIdManager = (uidHash: string, identity: string) => {
		const form = document.createElement('form');
		form.setAttribute('action', `/oidc/interaction/${uidHash}/manager`);
		form.setAttribute('method', 'POST');

		const idInput = document.createElement('input');
		idInput.setAttribute('type', 'hidden');
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', btoa(identity));

		form.appendChild(idInput);
		document.body.appendChild(form);
		form.submit();
	};
</script>

<script lang="ts">
	let uidHash: string | null = null;
	let newIdentityValue: string = '';

	onMount(() => {
		if (typeof window === 'undefined') return;
		uidHash = window.location.hash.substring(1);
	});

	const onNewIdentityClick = () => {
		handballToIdManager(uidHash, newIdentityValue);
	};
</script>

<svelte:head>
	<title>Login | Namebase</title>
</svelte:head>

{#if typeof uidHash === 'string'}
	<div class="identities" transition:fade|local={{ duration: 185 }}>
		<h1>Log in</h1>
		<div>
			<label for="new-id">Your Handshake name</label>
			<div class="input">
				<TextInput
					id="new-id"
					name="new-id"
					autocomplete="username"
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
						href="https://6cqg3vy1fsb.typeform.com/to/famUtbd0"
						target="_blank"
						rel="noopener noreferrer">Request one for free</a
					>
				</div>
				<button class="new-id-button" on:click={onNewIdentityClick} disabled={!newIdentityValue}>
					Continue
				</button>
			</div>
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
