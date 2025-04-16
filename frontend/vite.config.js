import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
export default defineConfig({
  plugins: [react()],
  server: {
    // https:
    // {
    //   key: fs.readFileSync(path.resolve(__dirname, "ssl/server.key")),
    //   cert: fs.readFileSync(path.resolve(__dirname, "ssl/server.cert")),
    // },
  },
});
