import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "storybook-static/**",
    "mocks/**",
  ]),
  {
    // React 19 / react-hooks 7.x new strict rules surface many legitimate
    // violations in legacy Kids/Teacher components that are slated for
    // rewrite in PROJECT.md Phase B (kids state to backend) and Phase G
    // (teacher dashboard to backend). Keep these visible (warn) but don't
    // block CI until those phases retire the offending files.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);

export default eslintConfig;
