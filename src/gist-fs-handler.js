import {
  entries,
  fromPath,
  isDir,
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
    const p = toPath(path);
    let drop = 0;
    if (!isDir(p)) throw new Error(`${path} is not a folder`);
    else drop = path.split('/').length - 1;
    const { length } = p;
    const list = new Set;
    for (const [key] of entries(this.#files)) {
      if (!length || key.startsWith(p))
        list.add(fromPath(key).split('/').at(drop));
    }
    return [...list];
  }

  read(path) {
    const p = toFile(path, 'read');
    return this.#files[p].content;
  }

  async rm(path, options = {}) {
    const p = toPath(path);
    if (options.recursive && !isDir(p))
      throw new Error(`${path} is not a folder`);
    const files = this.#files;
    for (const [key] of entries(this.#files)) {
      if (key.startsWith(p)) files[key] = null;
    }
    const result = await update(
      this.#octokit,
      this.#id,
      this.#description,
      files,
    );
    for (const [key, value] of entries(files)) {
      if (value == null) delete files[key];
    }
    return result;
  }

  async write(path, content) {
    const p = toFile(path, 'write');
    const c = typeof content === 'object' ? content : String(content);
    if (this.#files.hasOwnProperty(p)) this.#files[p].content = c;
    else this.#files[p] = { content: c };
    return await update(
      this.#octokit,
      this.#id,
      this.#description,
      this.#files,
    );
  }
}
