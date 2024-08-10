const { entries } = Object;

const fixHeaders = options => ({
  ...options,
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
    ...options?.headers
  }
});

const fromPath = path => path.replace(/@([^:]*?):/g, '$1/');

const isDir = path => !path.length || path.endsWith(':');

const notExt = (name, i, { length }) => (
  i < (length - 1) || (name && !/\.\w+$/.test(name)) ?
    `@${name}:` :
    name
);

const req = ($, endPoint, options) => $.request(
  endPoint,
  fixHeaders(options),
);

const resolvePath = path => {
  const branches = [];
  for (const branch of path.replace(/^\/+/, '/').split('/')) {
    switch (branch) {
      case '..':
        branches.pop();
      case '':
      case '.':
        break;
      default:
        branches.push(branch);
        break;
    }
  }
  return branches.join('/');
};

const toFile = (path, how) => {
  const p = toPath(path);
  if (isDir(p)) throw new Error(`Unable to ${how} ${path}`);
  return p;
};

const toPath = path => {
  path = resolvePath(path);
  return path.split('/').map(notExt).join('');
};

const update = async (octokit, gist_id, description, files) => {
  const { status, data } = await req(
    octokit,
    `PATCH /gists/${gist_id}`,
    { gist_id, description, files }
  );
  if (valid(status)) {
    for (const [key, value] of entries(data.files))
      files[key] = value;
    return;
  }
  throw data;
};

const valid = status => (status > 199 && status < 400);

export {
  entries,
  fromPath,
  isDir,
  req,
  resolvePath,
  toFile,
  toPath,
  update,
  valid,
};
