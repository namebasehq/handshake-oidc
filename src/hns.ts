import hdns from 'hdns';
import { hsd_resolvers, isDevelopment } from './config';
const { subtle } = require('crypto').webcrypto;

hdns.setServers(isDevelopment ? ["103.196.38.38"] : hsd_resolvers);

const btoa = (str) => Buffer.from(str, 'binary').toString('base64');
const atob = (str) => Buffer.from(str, 'base64').toString('binary');
export default {
  atob: atob,
  btoa: btoa,

  async getRecordsAsync(id) {
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
  },

  async verifyFingerPrint(fingerprint, publicKey) {
    let fp = await this.generateFingerprint(publicKey);
    return fp === fingerprint;
  },

  _encodeMessage: (str) => new TextEncoder().encode(str),

  _str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  },
  _ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  },

  importCryptoKey(pem) {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    const binaryDerString = atob(pemContents);
    const binaryDer = this._str2ab(binaryDerString);
    return subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-PSS',
        hash: 'SHA-512',
      },
      true,
      ['verify']
    );
  },

  importCryptoPrivateKey(pem) {
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
      ['sign']
    );
  },

  async sign(privateKey, data) {
    let signature = await subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 128,
      },
      privateKey,
      this._encodeMessage(data)
    );
    const exportedAsString = this._ab2str(signature);
    const exportedAsBase64 = btoa(exportedAsString);
    return exportedAsBase64;
  },

  async verifySignature(publicKey, signature, data) {
    const binaryDerString = atob(signature);
    const binaryDer = this._str2ab(binaryDerString);
    return await subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 128,
      },
      publicKey,
      binaryDer,
      this._encodeMessage(data)
    );
  },

  async generateFingerprint(publicKey) {
    let fingerprint = await subtle.digest('SHA-256', new TextEncoder().encode(publicKey));
    const hashArray = Array.from(new Uint8Array(fingerprint));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  },
};
