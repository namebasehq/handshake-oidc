import hdns from 'hdns';
import { hsdResolvers } from './config';
const { subtle } = require('crypto').webcrypto;

hdns.setServers(hsdResolvers);

function encodeMessage(str) {
  return new TextEncoder().encode(str);
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

export function btoa(str) {
  return Buffer.from(str, 'binary').toString('base64');
}
export function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

export async function getRecordsAsync(id) {
  const regex = /([^;]+)=([^;]*)/g;
  try {
    // @ts-ignore
    const txts: string[] = await hdns.resolveTxt(id, { all: true });
    const parsedRecords = txts
      .map((txt) => {
        const params: Record<string, any> = {};
        let match: RegExpExecArray = null;
        while ((match = regex.exec(txt))) {
          params[match[1]] = match[2];
        }
        return params;
      })
      .sort((a, b) => {
        if (!b.v) {
          return -1;
        }
        return a.v > b.v ? -1 : 1;
      });
    return parsedRecords;
  } catch (e) {
    console.warn('invalid hns check', e);
    return [];
  }
}

export async function verifyFingerPrint(fingerprint, publicKey) {
  const fp = await this.generateFingerprint(publicKey);
  return fp === fingerprint;
}

export function importCryptoKey(pem) {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  const binaryDerString = atob(pemContents);
  const binaryDer = str2ab(binaryDerString);
  return subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-PSS',
      hash: 'SHA-512',
    },
    true,
    ['verify'],
  );
}

export function importCryptoPrivateKey(pem) {
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = this._str2ab(binaryDerString);
  return subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSA-PSS',
      // Consider using a 4096-bit key for systems that require long-term security
      hash: 'SHA-512',
    },
    true,
    ['sign'],
  );
}

export async function sign(privateKey, data) {
  const signature = await subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 64,
    },
    privateKey,
    encodeMessage(data),
  );
  const exportedAsString = ab2str(signature);
  const exportedAsBase64 = btoa(exportedAsString);
  return exportedAsBase64;
}

export async function verifySignature(publicKey, signature, data) {
  const binaryDerString = atob(signature);
  const binaryDer = str2ab(binaryDerString);
  return await subtle.verify(
    {
      name: 'RSA-PSS',
      saltLength: 64,
    },
    publicKey,
    binaryDer,
    encodeMessage(data),
  );
}

export async function generateFingerprint(publicKey) {
  const fingerprint = await subtle.digest('SHA-256', new TextEncoder().encode(publicKey));
  const hashArray = Array.from(new Uint8Array(fingerprint));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}
