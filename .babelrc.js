// Jest needs to turn on the transpilation of ES2015 modules { loose: true,  modules: false }
let presets = [
  [
    "@babel/preset-env",
    {
      loose: true,
      modules: false,
      exclude: ["transform-async-to-generator", "transform-regenerator"],
      targets: {
        browsers: ["ie >= 11"]
      }
    }
  ],
  "@babel/preset-react"
];

let plugins = [];
if (process.env.NODE_ENV === "test") {
  plugins.push("@babel/transform-modules-commonjs");
}

module.exports = {
  presets,
  plugins
};
