# @repo/typescript-config

Shared strict TypeScript base config.

```jsonc
// tsconfig.json
{ "extends": "@repo/typescript-config/base.json" }
```

`base.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`,
`isolatedModules`, and bundler module resolution.
