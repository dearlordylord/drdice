/**
 * The implementation surface is declaration-only. Semantic operations are
 * added behind this curated root by the Dice implementation slices.
 */
export type PackageMetadata = {
  readonly name: "@drdice/dice";
  readonly version: "0.1.0";
  readonly declarationOnly: true;
};
