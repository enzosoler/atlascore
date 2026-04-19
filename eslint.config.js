import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnusedImports from "eslint-plugin-unused-imports";

// V2 migration guardrail — block new imports from src/redesign/v2.
// The v2 codebase is being replaced by v3. The only files that are
// expected to reference v2 are:
//   - src/redesign/v2/**       (v2 can import itself)
//   - src/App.jsx              (route wiring during migration)
//   - explicit migration-debt allowlist (shrinks as v2 cross-deps are lifted)
// Anything else importing from v2 is a regression.
const V2_IMPORT_ALLOWLIST = [
  "src/App.jsx",
];

export default [
  {
    files: [
      "src/components/**/*.{js,mjs,cjs,jsx}",
      "src/pages/**/*.{js,mjs,cjs,jsx}",
      "src/Layout.jsx",
    ],
    ignores: ["src/lib/**/*", "src/components/ui/**/*"],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "toast-close"] },
      ],
      "react-hooks/rules-of-hooks": "error",
    },
  },
  {
    // V2 import guardrail — applies to every source file under src/
    // except v2 itself and the allowlist above.
    files: ["src/**/*.{js,mjs,cjs,jsx}"],
    ignores: ["src/redesign/v2/**", ...V2_IMPORT_ALLOWLIST],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/redesign/v2/*", "**/redesign/v2/*"],
              message:
                "Do not import from src/redesign/v2. The v2 codebase is being migrated to v3. If you need a shared utility, extract it out of v2 (into src/redesign/shared/ or src/lib/) first, then import from there.",
            },
          ],
        },
      ],
    },
  },
];
