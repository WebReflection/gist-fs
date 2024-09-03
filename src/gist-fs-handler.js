import { encode, decode } from 'buffer-to-base64';

import {
  entries,
  fromPath,
  isDir,
  resolvePath,
  toFile,
  toPath,
  update,
} from './utils.js';

export default class GistFSHandler {
  #octokit;
  #id;
  #description;
  #files;
  constructor(octokit, id, description, files) {
    this.#octokit = octokit;
    this.#id = id;
    this.#description = description;
    this.#files = files;
  }

  isDir(path) {
    return isDir(toPath(path));
  }

  ls(path) {
    path = resolvePath(path);
    const p = toPath(path);
    if (!isDir(p)) throw new Error(`${path} is not a folder`);
    const drop = path.split('/').length - 1;
    const list = new Set;
    for (const [key] of entries(this.#files)) {
      if (key.startsWith(p))
        list.add(fromPath(key).split('/').at(drop));
    }
    return [...list];
  }

  stats(path) {
    const p = toFile(path, 'read');
    return isDir(p) ? { directory: true, files: this.ls(path) } : this.#files[p];
  }

  async read(path) {
    const p = toFile(path, 'read');
    const { content } = this.#files[p];
    if (/^data:([^;]+?);base64,(\S*)$/.test(content)) {
      const { $1: type, $2: base64 } = RegExp;
      return new File(
        [await decode(base64)],
        path.split('/').at(-1),
        { type }
      );
    }
    return content;
  }

  async rm(path, options = {}) {
    const p = toPath(path);
    if (options.recursive && !isDir(p))
      throw new Error(`${path} is not a folder`);
    const files = this.#files;
    for (const [key] of entries(this.#files)) {
      if (key.startsWith(p)) files[key] = null;
    }
    await update(
      this.#octokit,
      this.#id,
      this.#description,
      files,
    );
    for (const [key, value] of entries(files)) {
      if (value == null) delete files[key];
    }
  }

  async write(path, content) {
    const p = toFile(path, 'write');
    let c = String(content);
    if (content instanceof File) {
      const buffer = await content.arrayBuffer();
      c = `data:${content.type};base64,${await encode(buffer)}`;
    }
    if (this.#files.hasOwnProperty(p)) this.#files[p].content = c;
    else this.#files[p] = { content: c };
    await update(
      this.#octokit,
      this.#id,
      this.#description,
      this.#files,
    );
  }
}
