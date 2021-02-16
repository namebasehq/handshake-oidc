<script>
	import { stores } from '@sapper/app';
	const { page } = stores();
	const { host, path, params, query } = $page;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h1>Login</h1>

<form action="/oidc/interaction/{params.uid}/manager" method="POST">
	<input type="text" name="id" />
	<input type="submit" value="Continue" />
</form>
