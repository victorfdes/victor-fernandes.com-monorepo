/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow the scopes used across this monorepo (plus any unscoped commit).
    "scope-enum": [
      1,
      "always",
      ["website", "ui", "eslint-config", "typescript-config", "ci", "deps", "release", "repo"],
    ],
  },
}
