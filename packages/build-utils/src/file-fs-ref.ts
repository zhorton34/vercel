import assert from 'assert';
import fs from 'fs-extra';
import multiStream from 'multistream';
import path from 'path';
import Sema from 'async-sema';
import { FileBase } from './types';

const DEFAULT_SEMA = 20;
const semaToPreventEMFILE = new Sema(
  parseInt(
    process.env.VERCEL_INTERNAL_FILE_FS_REF_SEMA || String(DEFAULT_SEMA),
    10
  ) || DEFAULT_SEMA
);

interface FileFsRefOptions {
  mode?: number;
  contentType?: string;
  fsPath: string;
}

interface FromStreamOptions {
  mode: number;
  contentType?: string;
  stream: NodeJS.ReadableStream;
  fsPath: string;
}

class FileFsRef implements FileBase {
  public type: 'FileFsRef';
  public mode: number;
  public fsPath: string;
  public contentType: string | undefined;

  constructor({ mode = 0o100644, contentType, fsPath }: FileFsRefOptions) {
    assert(typeof mode === 'number');
    assert(typeof fsPath === 'string');
    this.type = 'FileFsRef';
    this.mode = mode;
    this.contentType = contentType;
    this.fsPath = fsPath;
  }

  static async fromFsPath({
    mode,
    contentType,
    fsPath,
  }: FileFsRefOptions): Promise<FileFsRef> {
    let m = mode;
    if (!m) {
      const stat = await fs.lstat(fsPath);
      m = stat.mode;
    }
    return new FileFsRef({ mode: m, contentType, fsPath });
  }

  static async fromStream({
    mode = 0o100644,
    contentType,
    stream,
    fsPath,
  }: FromStreamOptions): Promise<FileFsRef> {
    assert(typeof mode === 'number');
    assert(typeof stream.pipe === 'function'); // is-stream
    assert(typeof fsPath === 'string');
    await fs.mkdirp(path.dirname(fsPath));

    await new Promise<void>((resolve, reject) => {
      const dest = fs.createWriteStream(fsPath, {
        mode: mode & 0o777,
      });
      stream.pipe(dest);
      stream.on('error', reject);
      dest.on('finish', resolve);
      dest.on('error', reject);
    });

    return new FileFsRef({ mode, contentType, fsPath });
  }

  async toStreamAsync(): Promise<NodeJS.ReadableStream> {
    await semaToPreventEMFILE.acquire();
    const release = () => semaToPreventEMFILE.release();
    const stream = fs.createReadStream(this.fsPath);
    stream.on('close', release);
    stream.on('error', release);
    return stream;
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

export default FileFsRef;
