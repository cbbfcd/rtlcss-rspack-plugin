import path from "path";
import rtlcss from "rtlcss";

import { type Compiler, type Assets, Compilation } from "@rspack/core";

const cssOnly = (filename: string) => path.extname(filename) === ".css";

export interface RtlCssPluginOptions {
  filename: string;
}

class RtlCssPlugin {
  options: RtlCssPluginOptions;

  constructor(options: RtlCssPluginOptions | string) {
    if (typeof options === "string") {
      options = {
        filename: options,
      };
    }
    this.options = {
      filename: options?.filename || "[name].rtl.css",
    };
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap("RtlCssPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "TPAStylePlugin.pluginName",
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets: Assets) => {
          compilation.chunks.forEach((chunk) => {
            Array.from(chunk.files)
              .filter(cssOnly)
              .forEach((filename) => {
                const asset = assets[filename];

                if (!asset) return;

                let source = asset.source();
                const { RawSource } = compiler.webpack.sources;

                if (Buffer.isBuffer(source)) {
                  source = source.toString("utf-8");
                }

                const dstSource = rtlcss.process(source);
                // Optimization: 目前 compilation 层面只支持 fullhash，试过 name, filename 都不行
                const dstFileName = compilation.getPath(
                  this.options.filename.replace(
                    "[name]",
                    path.parse(filename).name
                  ),
                  { chunk }
                );
                compilation.emitAsset(dstFileName, new RawSource(dstSource));
              });
          });
        }
      );
    });
  }
}

export { RtlCssPlugin };
