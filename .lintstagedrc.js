const path = require("path");

const scoped = (pkg, dir) => (files) => {
  const rel = files.map((f) => path.relative(path.join(__dirname, dir), f));
  if (rel.length === 0) return [];
  const fileArgs = rel.join(" ");
  return [
    `pnpm --filter ${pkg} exec prettier --write ${fileArgs}`,
    `pnpm --filter ${pkg} exec eslint --fix ${fileArgs}`,
  ];
};

module.exports = {
  "apps/api/**/*.{ts,js,json,md}": scoped("api", "apps/api"),
  "apps/web/**/*.{ts,tsx,js,jsx,json,md,css}": scoped("web", "apps/web"),
};
