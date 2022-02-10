import { URL, fileURLToPath } from "url";
export default {
    build: {
        outDir: "build",
        emptyOutDir: true,
        lib: {
            entry: fileURLToPath(new URL("index.js", import.meta.url)),
            formats: ["es"],
            fileName: () => "index.js"
        }
    }
};