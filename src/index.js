import GistFS from './gitst-fs.js';

const gist_fs = auth => new GistFS(auth);
const gistFS = gist_fs;

const gist_key_fs = (key, prompt = globalThis.prompt) => {
  let auth = localStorage.getItem(key);
  while (!auth) auth = prompt('Please provide yor GitHub gists enabled token');
  localStorage.setItem(key, auth);
  return gist_fs(auth);
};

const gistKeyFS = gist_key_fs;

export {
  GistFS,
  gist_fs, gistFS,
  gist_key_fs, gistKeyFS,
};
