// Type declaration for the plain-JS marketplace plugin, so vite.config.ts
// stays fully typed without pulling the ESM server code into the TS build.
import type { Plugin } from "vite";

export function marketplaceApiPlugin(): Plugin;
