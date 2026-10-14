import js from "@eslint/js";
import globals from "globals";

/** Globals the Foundry VTT client exposes to system code at runtime. */
const foundryGlobals = {
  game: "readonly",
  CONFIG: "readonly",
  Hooks: "readonly",
  foundry: "readonly",
  ui: "readonly",
  Roll: "readonly",
  ChatMessage: "readonly"
};

export default [
  {
    ignores: ["node_modules/", "dist/"]
  },
  js.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-console": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"]
    }
  },
  {
    files: ["module/**/*.mjs"],
    languageOptions: {
      globals: { ...globals.browser, ...foundryGlobals }
    }
  },
  {
    files: ["tests/**/*.mjs", "eslint.config.mjs"],
    languageOptions: {
      globals: globals.node
    }
  }
];
