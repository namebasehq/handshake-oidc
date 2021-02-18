<script lang="ts">
	import { stores } from '@sapper/app';
	const { page } = stores();
	const { host, path, params, query } = $page;
	import { onMount } from 'svelte';

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
