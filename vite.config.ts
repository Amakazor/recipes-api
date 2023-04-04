import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
    plugins: [
        ...VitePluginNode({
            adapter: ({ app, req, res }) => app(req, res),
            appPath: "./src/index.ts",
            tsCompiler: "swc",
        }),
    ],
});
