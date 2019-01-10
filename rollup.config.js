import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

const config = {
  input: "./src/index.js",
  output: {
    name: "Redhooks",
    globals: {
      react: "React"
    },
    exports: "named"
  },
  external: ["react"],
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
    nodeResolve(),
    commonjs({
      include: /node_modules/
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );
}

export default config;
