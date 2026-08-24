/**
 * The implementation surface is declaration-only. Semantic operations are
 * added behind this curated root by the PRNG implementation slices.
 */
export type PackageMetadata = {
  readonly name: "@drdice/prng";
  readonly version: "0.1.0";
  readonly declarationOnly: true;
};
