<script lang="ts" context="module">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import BackArrow from '../../components/BackArrow.svelte';
	import TextInput from '../../components/TextInput.svelte';

	const LOCAL_STORAGE_KEY = 'namebase:oidc:names:cached';

	type TLocalStorageItem = ReturnType<WindowLocalStorage['localStorage']['getItem']>;
	const parseCachedIdentities = (localStorageValue: TLocalStorageItem): string[] | null => {
		if (typeof localStorageValue !== 'string') return null;

		const parsedNames = JSON.parse(localStorageValue);
		if (!parsedNames || !Array.isArray(parsedNames)) return null;
		if (!parsedNames.every((name) => typeof name === 'string')) return null;

		return parsedNames;
	};

	const cacheIdentities = (identities: string[]) => {
		const parsedNames = JSON.stringify(identities);
		window.localStorage.setItem(LOCAL_STORAGE_KEY, parsedNames);
	};

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
	let cachedIdentities: string[] | null = null;

	let newIdentityValue: string = '';
	let showNewIdentityScreen: boolean = false;

	onMount(() => {
		if (typeof window === 'undefined') return;
		uidHash = window.location.hash.substring(1);
		cachedIdentities = parseCachedIdentities(window.localStorage.getItem(LOCAL_STORAGE_KEY));
	});

	const onNewIdentityClick = () => {
		const newIdenties = cachedIdentities
			? [...cachedIdentities, newIdentityValue]
			: [newIdentityValue];

		cacheIdentities(newIdenties);
		handballToIdManager(uidHash, newIdentityValue);
	};
</script>

<svelte:head>
	<title>Login | Namebase</title>
</svelte:head>

{#if typeof uidHash === 'string'}
	<div class="identities" transition:fade|local={{ duration: 185 }}>
		{#if !cachedIdentities || cachedIdentities.length === 0 || showNewIdentityScreen}
			<h1>Setup a new identify</h1>
			<div class="stack-spacing-24px">
				<label for="new-id">Your Handshake name</label>
				<div>
					<TextInput
						id="new-id"
						name="new-id"
						bind:value={newIdentityValue}
						placeholder="Enter a Handshake name that you own*"
					/>
				</div>
				<div style="display: flex; justify-content: flex-end;">
					<button class="new-id-button" on:click={onNewIdentityClick} disabled={!newIdentityValue}>
						Continue
					</button>
				</div>
			</div>
			{#if cachedIdentities && cachedIdentities.length}
				<button
					on:click={() => (showNewIdentityScreen = false)}
					style="position: absolute; top: 0; left: 0;"
				>
					<BackArrow />
				</button>
			{/if}
		{:else}
			<h1>Choose an identify</h1>
			<ul class="existing-ids">
				{#each cachedIdentities as identity}
					<li>
						<button
							class="existing-id-button"
							on:click={() => handballToIdManager(uidHash, identity)}
						>
							{`${identity}/`}
						</button>
					</li>
				{/each}
				<li>
					<button class="existing-id-button" on:click={() => (showNewIdentityScreen = true)}>
						+ Setup another identity
					</button>
				</li>
			</ul>
		{/if}
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
		text-align: center;
		font-weight: medium;
		line-height: 24px;
		font-family: 'Roboto Mono';
		padding-top: 48px;
	}

	.existing-ids {
		border-top: 1px solid #383838;
		margin-top: 64px;
		border-bottom: 1px solid #383838;
	}

	.existing-ids > * + * {
		border-top: 1px solid #383838;
	}

	.existing-id-button {
		color: #ffffff;
		width: 100%;
		font-size: 14px;
		text-align: left;
		font-family: 'Roboto Variable';
		line-height: 24px;
		padding-top: 16px;
		padding-bottom: 16px;
		font-variation-settings: 'wght' 500;
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

	.identities {
		display: flex;
		flex-direction: column;
	}

	.stack-spacing-24px > * + * {
		margin-top: 24px;
	}
</style>
