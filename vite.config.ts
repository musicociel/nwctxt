import { readFile } from "fs/promises";
import { defineConfig } from "vite";
import pkg from "./package.json";

const exportsArray = [".", "./nwc", "./utils", "./midi", "./lowlevel", "./lowlevel/parser", "./lowlevel/generator", "./parser", "./generator"];
const exportsMap = {
  "./schema.json": {
    default: "./schema.json"
  }
};
const entry = {};
exportsArray.forEach((exportName) => {
  const exportFile = exportName === "." ? "./index" : exportName;
  entry[exportFile.substring(2)] = `src/${exportFile.substring(2)}.ts`;
  exportsMap[exportName] = {
    types: `${exportFile}.d.ts`,
    require: `${exportFile}.cjs`,
    default: `${exportFile}.js`
  };
});

export default defineConfig({
  build: {
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies)
    },
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry,
      formats: ["cjs", "es"]
    }
  },
  plugins: [
    {
      name: "packageJson",
      buildStart() {
        const packageJson: Partial<typeof pkg & { exports: any; main: string; types: string; module: string }> = { ...pkg };
        delete packageJson.private;
        delete packageJson.devDependencies;
        delete packageJson.scripts;
        packageJson.main = exportsMap["."].require;
        packageJson.module = exportsMap["."].default;
        packageJson.types = exportsMap["."].types;
        packageJson.exports = exportsMap;
        this.emitFile({
          fileName: "package.json",
          source: JSON.stringify(packageJson),
          type: "asset"
        });
      }
    },
    {
      name: "copy",
      async buildStart() {
        for (const fileName of ["README.md", "LICENSE"]) {
          this.emitFile({
            fileName,
            source: await readFile(fileName),
            type: "asset"
          });
        }
      }
    }
  ]
});
