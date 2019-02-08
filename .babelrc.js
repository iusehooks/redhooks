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

let plugins = ["@babel/plugin-proposal-class-properties"];
if (process.env.NODE_ENV === "test") {
  plugins.push("@babel/transform-modules-commonjs");
}

module.exports = {
  presets,
  plugins
};
