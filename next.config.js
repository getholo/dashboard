const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  webpack(config) {
    const webpackConfig = config;
    if (webpackConfig.resolve.plugins) {
      webpackConfig.resolve.plugins.push(new TsconfigPathsPlugin());
    } else {
      webpackConfig.resolve.plugins = [new TsconfigPathsPlugin()];
    }
    return webpackConfig;
  },
};
