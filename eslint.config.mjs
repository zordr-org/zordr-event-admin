import boundariesPlugin from "eslint-plugin-boundaries";
import nextPlugin from "@next/eslint-plugin-next";

import parser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      "@next/next": nextPlugin,
      boundaries: boundariesPlugin,
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "boundaries/dependencies": [
        2,
        {
          default: "allow",
          policies: [
            {
              from: { element: { type: ["components", "lib", "hooks", "types", "config", "providers"] } },
              disallow: [{ to: { element: { type: ["app", "features"] } } }],
              message: "Shared modules cannot depend on app or feature-specific code."
            },
            {
              from: { element: { type: "features" } },
              disallow: [{ to: { element: { type: "app" } } }],
              message: "Features cannot depend on app code."
            }
          ]
        }
      ]
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true
        }
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**/*" },
        { type: "features", pattern: "src/features/*/**/*", capture: ["featureName"] },
        { type: "components", pattern: "src/components/**/*" },
        { type: "lib", pattern: "src/lib/**/*" },
        { type: "types", pattern: "src/types/**/*" },
        { type: "hooks", pattern: "src/hooks/**/*" },
        { type: "config", pattern: "src/config/**/*" },
        { type: "providers", pattern: "src/providers/**/*" }
      ]
    }
  }
];
