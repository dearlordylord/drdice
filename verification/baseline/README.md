# Issue #16 scaffold baseline

`scaffold.json` records cold TypeScript 7 checks of the declaration-only
workspace scaffold under both supported checker policies. The artifact is a
small literal type assertion that imports each package only through its root.
The normal fixture gate also regenerates its committed declarations and checks
the resulting assertions with a dedicated TypeScript 7 project.

The blocking compiler is pinned to `typescript@7.0.2`. The workspace also pins
`@typescript/typescript6@6.0.2`; its checks are advisory and are never used to
pass the blocking budget gate. Re-run `pnpm check:budgets:one-checker` and
`pnpm check:budgets:four-checker` when changing package declarations or checker
configuration, then update the baseline only with reviewed measurements.
