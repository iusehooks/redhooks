const execSync = require("child_process").execSync;

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: "inherit",
    env: Object.assign({}, process.env, extraEnv)
  });

console.log("Building CommonJS modules ...");

exec("rollup -c -f cjs -o build/index.js", {
  BABEL_ENV: "cjs",
  NODE_ENV: "production"
});

console.log("\nBuilding ES modules through Babel ...");

exec("babel src -d build/es --ignore __tests__", {
  BABEL_ENV: "es-babel",
  NODE_ENV: "production"
});

console.log("\nBuilding ES modules through Rollup ...");

exec("rollup -c -f es -o build/index.es.js", {
  BABEL_ENV: "es-rollup",
  NODE_ENV: "production"
});

console.log("\nBuilding UMD index.js ...");

exec("rollup -c -f umd -o build/umd/index.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "development"
});

console.log("\nBuilding UMD index.min.js ...");

exec("rollup -c -f umd -o build/umd/index.min.js", {
  BABEL_ENV: "umd",
  NODE_ENV: "production"
});
