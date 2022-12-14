import assert from 'assert';
import fetch from 'node-fetch';
import multiStream from 'multistream';
import retry from 'async-retry';
import Sema from 'async-sema';
import { FileBase } from './types';

interface FileRefOptions {
  mode?: number;
  digest: string;
  contentType?: string;
  mutable?: boolean;
}

const DEFAULT_SEMA = 5;
const semaToDownloadFromS3 = new Sema(
  parseInt(
    process.env.VERCEL_INTERNAL_FILE_REF_SEMA || String(DEFAULT_SEMA),
    10
  ) || DEFAULT_SEMA
);

class BailableError extends Error {
  public bail: boolean;

  constructor(...args: string[]) {
    super(...args);
    this.bail = false;
  }
}

export default class FileRef implements FileBase {
  public type: 'FileRef';
  public mode: number;
  public digest: string;
  public contentType: string | undefined;
  private mutable: boolean;

  constructor({
    mode = 0o100644,
    digest,
    contentType,
    mutable = false,
  }: FileRefOptions) {
    assert(typeof mode === 'number');
    assert(typeof digest === 'string');
    this.type = 'FileRef';
    this.mode = mode;
    this.digest = digest;
    this.contentType = contentType;
    this.mutable = mutable;
  }

  async toStreamAsync(): Promise<NodeJS.ReadableStream> {
    let url = '';
    // sha:24be087eef9fac01d61b30a725c1a10d7b45a256
    const [digestType, digestHash] = this.digest.split(':');
    if (digestType === 'sha') {
      // This CloudFront URL edge caches the `now-files` S3 bucket to prevent
      // overloading it. Mutable files cannot be cached.
      // `https://now-files.s3.amazonaws.com/${digestHash}`
      url = this.mutable
        ? `https://now-files.s3.amazonaws.com/${digestHash}`
        : `https://dmmcy0pwk6bqi.cloudfront.net/${digestHash}`;
    } else if (digestType === 'sha+ephemeral') {
      // This URL is currently only used for cache files that constantly
      // change. We shouldn't cache it on CloudFront because it'd always be a
      // MISS.
      url = `https://now-ephemeral-files.s3.amazonaws.com/${digestHash}`;
    } else {
      throw new Error('Expected digest to be sha');
    }

    await semaToDownloadFromS3.acquire();
    // console.time(`downloading ${url}`);
    try {
      return await retry(
        async () => {
          const resp = await fetch(url);
          if (!resp.ok) {
            const error = new BailableError(
              `download: ${resp.status} ${resp.statusText} for ${url}`
            );
            if (resp.status === 403) error.bail = true;
            throw error;
          }
          return resp.body;
        },
        { factor: 1, retries: 3 }
      );
    } finally {
      // console.timeEnd(`downloading ${url}`);
      semaToDownloadFromS3.release();
    }
  }

  toStream(): NodeJS.ReadableStream {
    let flag = false;

    // eslint-disable-next-line consistent-return
    return multiStream(cb => {
      if (flag) return cb(null, null);
      flag = true;

      this.toStreamAsync()
        .then(stream => {
          cb(null, stream);
        })
        .catch(error => {
          cb(error, null);
        });
    });
  }
}
