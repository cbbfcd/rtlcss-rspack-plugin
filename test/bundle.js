/* global wallaby */
const path = require('path');
const { rspack } = require('@rspack/core');
const MemoryFS = require('memory-fs');
const { RtlCssPlugin } = require('../dist/index.js');

function fixture(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

function bundle(options, entry = {}) {
  return new Promise((resolve, reject) => {
    const compiler = rspack(
      {
        entry: {
          bundle: fixture('index.js'),
          ...entry,
        },
        output: {
          filename: '[name].js',
        },
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: [rspack.CssExtractRspackPlugin.loader, 'css-loader'],
              type: 'javascript/auto',
            },
          ],
        },
        plugins: [
          new rspack.CssExtractRspackPlugin({
            filename: '[name].css',
          }),
          new RtlCssPlugin(options),
        ],
      },
    );
    const memoryFileSystem = new MemoryFS();
    compiler.outputFileSystem = memoryFileSystem;
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      } else if (stats && stats.hasErrors()) {
        return reject(new Error(stats.toString()));
      } else {
        resolve(memoryFileSystem);
      }
    });
  });
}

function filePath(name) {
  return path.join(process.cwd(), 'dist', name);
}

exports.filePath = filePath;
exports.fixture = fixture;
exports.bundle = bundle;
