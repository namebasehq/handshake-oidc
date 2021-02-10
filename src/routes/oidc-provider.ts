import assert from 'assert';
import express, { urlencoded } from 'express';
import {
  atob,
  btoa,
  getRecordsAsync,
  importCryptoKey,
  verifyFingerPrint,
  verifySignature,
} from '../hns';
import oidc from '../oidc';
const router = express.Router();
const body = urlencoded({ extended: false });

declare module 'express-session' {
  export interface Session {
    state: string;
  }
}

function setNoCache(req, res, next) {
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store');
  next();
}

// initiate auth flow
router.get('/interaction/:uid', setNoCache, async (req, res, next) => {
  try {
    const { uid, prompt, params, session } = await oidc.interactionDetails(req, res);
    const client = await oidc.Client.find(params.client_id);

    if (prompt.name === 'login') {
      req.session.state = params.state;
      return res.redirect(`/login#${uid}`);
    }

    if (prompt.name === 'consent') {
      const consent = {
        rejectedScopes: [],
        rejectedClaims: [],
        replace: false,
      };
      const result = { consent };
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    }
  } catch (err) {
    return next(err);
  }
});
router.post('/interaction/:uid/manager', setNoCache, body, async (req, res, next) => {
  const { uid, prompt, params, session } = await oidc.interactionDetails(req, res);

  const id = atob(req.body.id);
  const managers = await getRecordsAsync('_idmanager.' + id);
  let managerUrl = new URL(`https://id.namebase.io`);
  if (managers.length > 0) {
    try {
      managerUrl = new URL(managers[0].url);
    } catch (e) {
      console.warn(e);
    }
  }

  const data = {
    callbackUrl: `${req.protocol}://${req.get('host')}/login/${uid}/challenge`,
    state: req.session.state,
    id,
  };
  managerUrl.hash = `#/login?state=${btoa(data.state)}&id=${btoa(data.id)}&callbackUrl=${btoa(
    data.callbackUrl,
  )}`;
  res.redirect(managerUrl.toString());
});
// login request
router.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {
  let result = {};
  try {
    const {
      prompt: { name },
      params,
    } = await oidc.interactionDetails(req, res);
    assert.strictEqual(name, 'login');
    const publickey = atob(req.body.publicKey);
    const id = atob(req.body.domain).toLowerCase();
    const signed = atob(req.body.signed);
    const deviceId = atob(req.body.deviceId);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let attempt = 3;
    let isFingerprintValid = false;
    while (attempt-- !== 0) {
      const fingerprintRecords = (await getRecordsAsync(`${deviceId}._auth.${id}`)).filter((r) =>
        r.fingerprint ? true : false,
      );
      isFingerprintValid =
        fingerprintRecords.length > 0 &&
        (await verifyFingerPrint(fingerprintRecords[0].fingerprint, publickey));
      if (isFingerprintValid) {
        break;
      } else {
        await sleep(300);
      }
    }

    const crypto = await importCryptoKey(publickey);
    const isSignatureValid = await verifySignature(crypto, signed, req.session.state);

    if (isFingerprintValid && isSignatureValid) {
      const account = { accountId: id };

      result = {
        select_account: {}, // make sure its skipped by the interaction policy since we just logged in
        login: {
          account: account.accountId,
        },
      };
    } else {
      result = {
        error: 'access_denied',
        error_description: 'Invalid credentials',
      };
      console.warn(
        `Fingerprint or decryption invalid: isFingerprintValid is ${isFingerprintValid}, isSignatureValid is ${isSignatureValid}`,
      );
    }
    await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
  } catch (err) {
    result = {
      error: 'access_denied',
      error_description: err,
    };
    console.error(err);

    next(err);
  }
});

// resume auth flow after account selection
router.post('/interaction/:uid/continue', setNoCache, body, async (req, res, next) => {
  try {
    const interaction = await oidc.interactionDetails(req, res);
    const {
      prompt: { name, details },
    } = interaction;
    assert.equal(name, 'select_account');

    if (req.body.switch) {
      if (interaction.params.prompt) {
        const prompts = new Set(interaction.params.prompt.split(' '));
        prompts.add('login');
        interaction.params.prompt = [...prompts].join(' ');
      } else {
        interaction.params.prompt = 'login';
      }
      await interaction.save();
    }

    const result = { select_account: {} };
    await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
  } catch (err) {
    next(err);
  }
});

// consent third-party screen
router.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
  try {
    const {
      prompt: { name, details },
    } = await oidc.interactionDetails(req, res);
    assert.strictEqual(name, 'consent');

    const consent = {
      rejectedScopes: [],
      rejectedClaims: [],
      replace: false,
    };
    const result = { consent };
    // skip consent screen at the moment, the only client configured is a first-party
    await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
  } catch (err) {
    next(err);
  }
});

// abort auth flow
router.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
  try {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction',
    };
    await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
  } catch (err) {
    next(err);
  }
});

router.use('/', oidc.callback);

export default router;
