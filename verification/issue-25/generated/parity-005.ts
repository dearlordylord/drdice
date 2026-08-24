/* GENERATED FILE. Run pnpm generate:issue25; do not edit by hand. */
import { evaluate } from "@drdice/dice";

type Equal<Left, Right> =
  [Left] extends [Right] ? [Right] extends [Left] ? true : false : false;
type Assert<Value extends true> = Value;
const deepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) return false;
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key) => Object.prototype.hasOwnProperty.call(rightRecord, key) && deepEqual(leftRecord[key], rightRecord[key]));
};

const expected0 = {"ok":true,"value":{"total":-15,"rollTrace":[{"sideCount":51,"face":35}],"nextState":{"kind":"GeneratorState","words":["b8a7d077","07da0579","d37e3013","247a3f65"]}}} as const;
const actual0 = evaluate("d51 - 19 - 31", {"kind":"GeneratorState","words":["54035f30","1966e16a","4abfbb23","f5c26e2d"]} as const, 5);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"60\",\"seed\":[\"cc5892ed\",\"1eaee00f\",\"97434a58\",\"3f0e9edc\"],\"source\":\"d51 - 19 - 31\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"54035f30\",\"1966e16a\",\"4abfbb23\",\"f5c26e2d\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":-86,"rollTrace":[{"sideCount":10,"face":8},{"sideCount":64,"face":1},{"sideCount":64,"face":1},{"sideCount":69,"face":53},{"sideCount":69,"face":39}],"nextState":{"kind":"GeneratorState","words":["d59f5949","0156e175","b70bf0c0","699af9ce"]}}} as const;
const actual1 = evaluate("d10 - 2d64 - 2d69", {"kind":"GeneratorState","words":["3b4f1145","4f216c1f","74e6de62","89e6c60f"]} as const, 1);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"61\",\"seed\":[\"4c8d9805\",\"0e25bfa3\",\"83e1ea2b\",\"6a3e7a59\"],\"source\":\"d10 - 2d64 - 2d69\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"3b4f1145\",\"4f216c1f\",\"74e6de62\",\"89e6c60f\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":86,"rollTrace":[{"sideCount":37,"face":19},{"sideCount":37,"face":2},{"sideCount":88,"face":65}],"nextState":{"kind":"GeneratorState","words":["37dacbe6","564ba13d","9266385b","491a6f43"]}}} as const;
const actual2 = evaluate("\t2d37 + ( d88 )\n", {"kind":"GeneratorState","words":["11d2ff82","e99ce603","177d7c17","e299ace4"]} as const, 4);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"62\",\"seed\":[\"249c6f3b\",\"86102b46\",\"ec6df5ba\",\"09890637\"],\"source\":\"\\t2d37 + ( d88 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"11d2ff82\",\"e99ce603\",\"177d7c17\",\"e299ace4\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":24,"rollTrace":[{"sideCount":63,"face":25}],"nextState":{"kind":"GeneratorState","words":["79760c69","440ef0b2","ed83cb73","1119fc42"]}}} as const;
const actual3 = evaluate("49 - d63", {"kind":"GeneratorState","words":["f1342f56","54feb9c1","e1c46625","dcbc9afe"]} as const, 3);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"63\",\"seed\":[\"59436fad\",\"a26c6b36\",\"ce5d2ad3\",\"0be89550\"],\"source\":\"49 - d63\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f1342f56\",\"54feb9c1\",\"e1c46625\",\"dcbc9afe\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["72d4d4d3","26763463","bf89b81c","f0a26620"]}}} as const;
const actual4 = evaluate("d57 - ( d64 ) + ( d53 )", {"kind":"GeneratorState","words":["72d4d4d3","26763463","bf89b81c","f0a26620"]} as const, 0);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"64\",\"seed\":[\"0e7da059\",\"f4ad7122\",\"0baa90a6\",\"6e71f359\"],\"source\":\"d57 - ( d64 ) + ( d53 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"72d4d4d3\",\"26763463\",\"bf89b81c\",\"f0a26620\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":18,"rollTrace":[{"sideCount":35,"face":30}],"nextState":{"kind":"GeneratorState","words":["913a3fba","845c6acc","e160fc76","9666d618"]}}} as const;
const actual5 = evaluate("\t49 - 1 - d35\n", {"kind":"GeneratorState","words":["5228f360","96f9e2ba","408d7b16","55eb2e60"]} as const, 4);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"65\",\"seed\":[\"930234f4\",\"6607197a\",\"202b662e\",\"d13e8b79\"],\"source\":\"\\t49 - 1 - d35\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5228f360\",\"96f9e2ba\",\"408d7b16\",\"55eb2e60\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":2,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["9d620f4e","6d65c36f","17a77c4f","1506a9a1"]}}} as const;
const actual6 = evaluate("( 1d15 ) - d48 + 1d66", {"kind":"GeneratorState","words":["9d620f4e","6d65c36f","17a77c4f","1506a9a1"]} as const, 0);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"66\",\"seed\":[\"03e4ac2d\",\"5a49a4bd\",\"b5184992\",\"3960a767\"],\"source\":\"( 1d15 ) - d48 + 1d66\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"9d620f4e\",\"6d65c36f\",\"17a77c4f\",\"1506a9a1\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":14,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["859cc4a6","4e28da3e","784e86cc","66e9dba1"]}}} as const;
const actual7 = evaluate("14", {"kind":"GeneratorState","words":["859cc4a6","4e28da3e","784e86cc","66e9dba1"]} as const, 5);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"67\",\"seed\":[\"d76d6407\",\"065a87d1\",\"82b11ca1\",\"8588ea53\"],\"source\":\"14\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"859cc4a6\",\"4e28da3e\",\"784e86cc\",\"66e9dba1\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":3,"dimension":"arithmetic-magnitude","limit":100,"actual":160,"partialTrace":[{"sideCount":91,"face":83},{"sideCount":91,"face":77}],"nextState":{"kind":"GeneratorState","words":["07c88e8f","52372619","e33e88db","69c8b695"]}}} as const;
const actual8 = evaluate("\t( 2d91 ) + d53 + 2d79\n", {"kind":"GeneratorState","words":["affec9bb","64719180","c2d372f9","1eeaefa2"]} as const, 2);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"68\",\"seed\":[\"80a8e00c\",\"098ce558\",\"31d256ab\",\"1be66e28\"],\"source\":\"\\t( 2d91 ) + d53 + 2d79\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"affec9bb\",\"64719180\",\"c2d372f9\",\"1eeaefa2\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":96,"rollTrace":[{"sideCount":87,"face":16},{"sideCount":87,"face":35},{"sideCount":80,"face":45}],"nextState":{"kind":"GeneratorState","words":["0e2e8071","87a21fd6","c328e945","3b558bb1"]}}} as const;
const actual9 = evaluate("2d87 + ( d80 )", {"kind":"GeneratorState","words":["2c7441f8","bd4913c4","5d248b2a","ad78196b"]} as const, 4);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"69\",\"seed\":[\"16788278\",\"c0c7ad03\",\"999d21b0\",\"88ccd3c5\"],\"source\":\"2d87 + ( d80 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"2c7441f8\",\"bd4913c4\",\"5d248b2a\",\"ad78196b\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":52,"rollTrace":[{"sideCount":49,"face":11},{"sideCount":49,"face":16}],"nextState":{"kind":"GeneratorState","words":["b6720ece","14de0d99","b7f143a1","64510be7"]}}} as const;
const actual10 = evaluate("25 + 2d49", {"kind":"GeneratorState","words":["49b1b319","ca8a6576","8668e857","49a55280"]} as const, 4);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"70\",\"seed\":[\"952b0ca7\",\"634d49f8\",\"8437b4e1\",\"27de1b34\"],\"source\":\"25 + 2d49\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"49b1b319\",\"ca8a6576\",\"8668e857\",\"49a55280\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":56,"rollTrace":[{"sideCount":70,"face":14},{"sideCount":70,"face":61},{"sideCount":13,"face":7}],"nextState":{"kind":"GeneratorState","words":["5697e42f","63436ee7","96b57203","5ffa82cd"]}}} as const;
const actual11 = evaluate("2d70 - ( d13 ) - 12", {"kind":"GeneratorState","words":["1a002b3d","c4fb8d1e","5a0fe3bb","a745c3d9"]} as const, 3);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"71\",\"seed\":[\"3b91ef28\",\"c8e96e52\",\"4148c4a3\",\"624d81ed\"],\"source\":\"2d70 - ( d13 ) - 12\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1a002b3d\",\"c4fb8d1e\",\"5a0fe3bb\",\"a745c3d9\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

