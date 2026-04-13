function tokenToVar(key) {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `--tt-${kebab}`;
}
function tokensToStyle(tokens) {
  return Object.entries(tokens).map(([key, val]) => `${tokenToVar(key)}: ${val}`).join(";");
}
function diffTokens(base, next) {
  const diff = {};
  for (const [key, val] of Object.entries(next)) {
    if (base[key] !== val) {
      diff[key] = val;
    }
  }
  return diff;
}
export {
  diffTokens,
  tokenToVar,
  tokensToStyle
};
