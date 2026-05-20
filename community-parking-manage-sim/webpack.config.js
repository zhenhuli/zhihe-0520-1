const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const portfinder = require('portfinder-sync');

const PORT = portfinder.getPort(8080);

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /vue/,
            use: ['vue-style-loader', 'css-loader']
          },
          {
            use: ['style-loader', 'css-loader']
          }
        ]
      },
      {
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: /vue/,
            use: ['vue-style-loader', 'css-loader', 'sass-loader']
          },
          {
            use: ['style-loader', 'css-loader', 'sass-loader']
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true
    })
  ],
  devServer: {
    host: '0.0.0.0',
    port: PORT,
    hot: true,
    open: true,
    historyApiFallback: true,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        }
      }
    }
  }
};
