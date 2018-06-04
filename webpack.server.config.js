const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: { lambda: './src/lambda.ts' },
  resolve: { extensions: ['.js', '.ts'] },
  target: 'node',
  // this makes sure we include node_modules and other 3rd party libraries
  externals: [/(node_modules|main\..*\.js)/],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.(ts|js)$/, loader: 'regexp-replace-loader', query: { match: { pattern: '\\[(Mouse|Keyboard)Event\\]', flags: 'g' }, replaceWith: '[]', } }
      // This second one is to fix libraries that depend on mouse and keyboard events in the server side render : https://github.com/valor-software/ngx-bootstrap/issues/964
    ]
  },
  plugins: [
    // Temporary Fix for issue: https://github.com/angular/angular/issues/11580
    // for 'WARNING Critical dependency: the request of a dependency is an expression'
    new webpack.ContextReplacementPlugin(
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
};
