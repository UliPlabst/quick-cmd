

const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin")

const isProd = process.argv.indexOf("production") > 0;
console.log(isProd ? "production": "development");


module.exports = { 
  mode: isProd ? "production" : "development",
  target: "web",
  stats: isProd ? undefined : 'errors-only',
  devtool: 'source-map',
  entry: {
    background: [ "./src/background.ts"],
    options: ["./src/options/options.ts"],
    popup: ["./src/popup/popup.ts"],
    // styles: "./src/styles.tsx",
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        loader: "ts-loader"
      },
      {
        test: /\.sass$/i,
        use: [ 
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProd,
              sassOptions: {
                indentedSyntax: true,
              }
            }
          },
        ]
      }
    ]
  },
  optimization: {
    usedExports: true,
    minimize: isProd,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'initial',
          enforce: true
        },
        vendors: false
      }
    }
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/options/options.html',
      filename: "options.html",
      // inject: false,
      // scriptLoading: 'defer',
      // inlineSource: '.(js|css)$'
      chunks: [ 'options' ]
      // excludeAssets: [/style.*.js/] //needs ExcludeAssetsPlugin
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: "popup.html",
      // inject: false,
      // scriptLoading: 'defer',
      // inlineSource: '.(js|css)$'
      chunks: [ 'popup' ]
      // excludeAssets: [/style.*.js/] //needs ExcludeAssetsPlugin
    }),
    new MiniCssExtractPlugin({
    }),
  ].filter(e => e != null)
};

