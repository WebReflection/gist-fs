import { Octokit } from '@octokit/core';
import GistFSHandler from './gist-fs-handler.js';

import {
  entries,
  req,
  toPath,
  valid,
} from './utils.js';

const getID = options => (
  typeof options === 'string' ?
    options :
    (options.id || options.gist_id)
);

/**
 * @typedef {Object} ListOptions
 * @prop {string} [username] list results only for a specific user (usually *your one*)
 * @prop {number} [page=1] the page to start showing `per_page` results, default: 1
 * @prop {number} [per_page=30] the amount of results per each `page`, default: 30
 * @prop {string | Date} [since] only show results that were last updated after the given time, represented as  ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
 */

/**
 * @typedef {Object} ListResult
 * @prop {string} id
 * @prop {string} description
 * @prop {string} html_url
 * @prop {string} created_at
 * @prop {string} updated_at
 * @prop {boolean} public
 * @prop {number} comments
 * @prop {object} files
 * @prop {GistFSHandler} fs
 */

export default class GistFS {
  #octokit;

  constructor(auth) {
    this.#octokit = new Octokit({ auth });
  }

  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#create-a-gist
  async create(options = {}) {
    const opt = { ...options };
    if (!opt.description) opt.description = 'GistFS: no description';
    if (!opt.hasOwnProperty('public')) opt.public = false;
    if (opt.files) opt.files = { ...opt.files };
    else opt.files = { 'README.md': { content: opt.description } };
    for (const [key, value] of entries(opt.files)) {
      delete opt.files[key];
      opt.files[toPath(key)] = value;
    }
    const { data, status } = await req(this.#octokit, 'POST /gists', opt);
    if (valid(status)) return lessDetails.call(this.#octokit, data);
    throw data;
  }

  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#get-a-gist
  async get(options) {
    const gist_id = getID(options);
    const { data, status } = await req(this.#octokit, `GET /gists/${gist_id}`, { gist_id });
    if (valid(status)) return lessDetails.call(this.#octokit, data);
    throw data;
  }

  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#list-public-gists
  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#list-gists-for-a-user
  /**
   * @param {ListOptions} [options]
   * @returns {ListResult[] | Promise<void, Error>}
   */
  async list(options = {}) {
    const { page, per_page, since, username } = options;
    const usp = new URLSearchParams;
    if (page) usp.append('page', page);
    if (per_page) usp.append('per_page', per_page);
    if (since) {
      if (typeof since === 'string') usp.append('since', since);
      else usp.append('since', since.toISOString().replace(/\.\d+Z$/, 'Z'));
    }
    const endPoint = username ? `/users/${username}/gists` : '/gists/public';
    const args = [`GET ${endPoint}?${usp}`];
    if (username) args.push({ username });
    const { data, status } = await req(this.#octokit, ...args);
    if (valid(status)) return data.map(lessDetails, this.#octokit);
    throw data;
  }

  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#delete-a-gist
  async delete(options) {
    const gist_id = getID(options);
    const { data, status } = await req(this.#octokit, `DELETE /gists/${gist_id}`, { gist_id });
    if (!valid(status)) throw data;
  }
}

function lessDetails(details) {
  const octokit = this;
  const { description, files, id } = details;
  return {
    id,
    files,
    description,
    html_url: details.html_url,
    created_at: details.created_at,
    updated_at: details.updated_at,
    public: details.public,
    comments: details.comments,
    fs: new GistFSHandler(octokit, id, description, files),
  };
}
