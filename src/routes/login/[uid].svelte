<script>
	import { stores } from '@sapper/app';

	const { page } = stores();
	const { host, path, params, query } = $page;

	const encode = (input) => {
		t.value = btoa(t.value);
	};
	// multiformform data
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h1>Login</h1>

<form
	action="/oidc/interaction/{params.uid}/manager"
	onsubmit={() => encode(this.elements('id'))}
	method="POST"
>
	<input type="text" name="id" />
	<input type="submit" value="Continue" />
</form>
