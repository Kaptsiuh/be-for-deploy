const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
        test: /\.d\.ts$/,
        loader: "ignore-loader",
      },
      {
        test: /\.md$/,
        type: "asset/resource",
        generator: {
          filename: "docs/[name].[hash][ext]",
        },
      },
      {
        test: /LICENSE$/,
        type: "asset/resource",
        generator: {
          filename: "licenses/[name].[hash][ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
      util: require.resolve("util/"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist"),
  },
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
  performance: {
    hints: false,
  },
};
