<script lang="ts" context="module">
	import { stores } from '@sapper/app';
	import { onMount } from 'svelte';
</script>

<script lang="ts">
	const { page } = stores();
	const { params } = $page;

	onMount(async () => {
		const hash = window.location.hash.substr(1);
		const data = JSON.parse(atob(hash));
		const url = `/oidc/interaction/${params.uid}/login`;

		HTMLFormElement.prototype.addInput = function (name: string, value: string) {
			const input = document.createElement('input');
			input.setAttribute('type', 'hidden');
			input.setAttribute('name', name);
			input.setAttribute('value', value);
			this.appendChild(input);
		};

		const form = document.createElement('form');
		form.setAttribute('action', url);
		form.setAttribute('method', 'POST');
		form.setAttribute('enctype', 'application/x-www-form-urlencoded');
		form.addInput('publicKey', data.publicKey);
		form.addInput('signed', data.signed);
		form.addInput('domain', data.domain);
		form.addInput('deviceId', data.deviceId);

		document.body.appendChild(form);
		form.submit();
	});
</script>

<h1 class="text-roboto-mono text-variant-huge text-weight-medium">Log in</h1>
<div class="container" style="display: flex; align-items: center; justify-content: space-between">
	<div class="text-roboto-mono text-variant-medium text-weight-medium">One moment please...</div>
</div>

<style>
	h1 {
		color: white;
		text-align: center;
		margin-bottom: 48px;
	}

	.container > div {
		text-align: center;
		color: white;
		flex: 1;
	}
</style>
