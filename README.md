# Handshake OIDC Provider

## Requirements

NodeJS 15+

```
nvm install 15.8.0
nvm use 15.8.0
```

Telepresence



## Running the web app

```
npm run dev
```

Debug Kubernetes deployment: [see here](https://nb-ops@dev.azure.com/nb-ops/namernews/_git/charts)
```
npm config set hs-id:deploymentName <deploymentName>
npm config set hs-id:namespace <namespace>
npm run dev:remote
```
or
```
npm run dev:remote:shell
npm run dev
```

## Sources

Visit https://github.com/panva/node-oidc-provider/blob/master/docs/README.md for more details on OIDC Provider concepts and user flow.

