function skipPolicy(oidc) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('implicit-force-https diabled');
    console.warn('implicit-forbid-localhost disabled');

    oidc.Client.Schema.prototype.invalidate = function invalidate(message, code) {
      if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') {
        return;
      }
    };
  }
}

export { skipPolicy };
