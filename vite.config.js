import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* global process */

export default defineConfig({
  base: process.env.VERCEL ? "/" : "/minutiae/",
  plugins: [react(), tailwindcss()],
});
