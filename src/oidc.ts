import type { JSONWebKeySet } from 'jose';
import { JWK, JWKS } from 'jose';
import {
  CanBePromise,
  ClientMetadata, Configuration, interactionPolicy, KoaContextWithOIDC, Provider
} from 'oidc-provider';
import { oidc as config } from './config';
import { RedisAdapter } from './redis-adapter';
import { skipPolicy } from './skip-policy';
// create a requestable prompt with no implicit checks
const Prompt = interactionPolicy.Prompt;
const policy = interactionPolicy.base;

const selectAccount = new Prompt({
  name: 'select_account',
  requestable: true,
});

// copies the default policy, already has login and consent prompt policies
const interactions = policy();
// add to index 0, order goes select_account > login > consent
interactions.add(selectAccount, 0);

function RedisAdapterFactory(name: string) {
  return new RedisAdapter(name);
}
export type ClientConfig = ClientMetadata & { audience: string };

const audiences = (
  ctx: KoaContextWithOIDC,
  sub: string | undefined,
  token: any,
  use: 'access_token' | 'client_credentials',
): CanBePromise<false | string | string[]> => {
  const client = config.oidc_provider_clients.find((c) => c.client_id == token?.clientId);
  return client?.audience;
};
const getJWKS = (): JSONWebKeySet => {
  const keystore = new JWKS.KeyStore(config.jwks.map(k => JWK.asKey(k)));
  if (keystore.size === 0) {
    keystore.generateSync('RSA', 4096, { alg: 'RS512', use: 'sig' });
    keystore.generateSync('RSA', 4096, { alg: 'RS512', use: 'enc' });
    console.log('add these keys to OIDC_JWKS\r\n', keystore.toJWKS(true));
  }
  return keystore.toJWKS(true);
}
const configuration: Configuration = {
  adapter: RedisAdapterFactory,
  cookies: {
    long: { signed: true, maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day in ms
    short: { signed: true },
    keys: config.oidc_provider_secrets,
  },
  claims: {
    profile: [],
  },
  interactions: {
    policy: interactions,
    url(ctx, interaction) {
      return `/oidc/interaction/${ctx.oidc.uid}`;
    },
  },
  audiences: audiences,
  clients: <ClientConfig[]>config.oidc_provider_clients,
  jwks: getJWKS(),
  features: {
    devInteractions: { enabled: false }, // defaults to true
    deviceFlow: { enabled: true }, // defaults to false
    introspection: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
    rpInitiatedLogout: {
      enabled: true,
      logoutSource: async (ctx, form) => {
        // @param ctx - koa request context
        // @param form - form source (id="op.logoutForm") to be embedded in the page and submitted by
        //   the End-User
        ctx.body = `<!DOCTYPE html>
          <head>
            <title>Logout Request</title>
          </head>
          <body>
            <div>
              ${form}
              <button style="display:none;" autofocus id="submit" type="submit" form="op.logoutForm" value="yes" name="logout">Yes, sign me out</button>
              <script>document.getElementById('submit').click()</script>
            </div>
          </body>
          </html>`;
      },
    },
  },
  formats: { AccessToken: 'jwt' },
  async findAccount(ctx, id) {
    return {
      accountId: id,
      async claims(use, scope) {
        return { sub: id };
      },
    };
  },
};


const oidc = new Provider(`https://${config.host}/`, configuration);
oidc.proxy = true;

skipPolicy(oidc);

export default oidc
