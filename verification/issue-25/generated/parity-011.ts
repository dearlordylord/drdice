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

const expected0 = {"ok":true,"value":{"total":8,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["d220c2e9","24aef4e3","d5509e41","ce68e3c0"]}}} as const;
const actual0 = evaluate("12 + 31 - 35", {"kind":"GeneratorState","words":["d220c2e9","24aef4e3","d5509e41","ce68e3c0"]} as const, 1);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"132\",\"seed\":[\"9811f49b\",\"76da3c9a\",\"1865e3fe\",\"27544f93\"],\"source\":\"12 + 31 - 35\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"d220c2e9\",\"24aef4e3\",\"d5509e41\",\"ce68e3c0\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":50,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["f60851e8","bfbc5994","f8d240a5","15f8b27c"]}}} as const;
const actual1 = evaluate("50", {"kind":"GeneratorState","words":["f60851e8","bfbc5994","f8d240a5","15f8b27c"]} as const, 2);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"133\",\"seed\":[\"8c8a09db\",\"7b90ef63\",\"a9eb37fd\",\"2d8afe97\"],\"source\":\"50\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f60851e8\",\"bfbc5994\",\"f8d240a5\",\"15f8b27c\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":11,"rollTrace":[{"sideCount":25,"face":11}],"nextState":{"kind":"GeneratorState","words":["b1014010","367261a4","dcc23e98","0ff6df18"]}}} as const;
const actual2 = evaluate("1d25", {"kind":"GeneratorState","words":["5200becb","16fe273c","728cf853","f5ffd9e7"]} as const, 5);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"134\",\"seed\":[\"9950749a\",\"6fac901b\",\"485e574c\",\"d44554f7\"],\"source\":\"1d25\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5200becb\",\"16fe273c\",\"728cf853\",\"f5ffd9e7\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":45,"rollTrace":[{"sideCount":66,"face":28},{"sideCount":66,"face":13},{"sideCount":35,"face":4}],"nextState":{"kind":"GeneratorState","words":["de0f2f4b","59044b90","363a3d72","f37d5b1b"]}}} as const;
const actual3 = evaluate("2d66 + 1d35", {"kind":"GeneratorState","words":["ed2776ca","65d4e4b9","2b507903","9cb5b628"]} as const, 1);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"135\",\"seed\":[\"25465ab8\",\"2c349bb0\",\"571a4631\",\"e451523f\"],\"source\":\"2d66 + 1d35\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"ed2776ca\",\"65d4e4b9\",\"2b507903\",\"9cb5b628\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":19,"rollTrace":[{"sideCount":22,"face":17}],"nextState":{"kind":"GeneratorState","words":["ef27a0ca","508f474e","ad81539a","6c48b738"]}}} as const;
const actual4 = evaluate("1d22 + 2", {"kind":"GeneratorState","words":["082a29dc","1277bcd4","4ad2d246","f57a35c2"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"136\",\"seed\":[\"6496f9a2\",\"cffe6a13\",\"553d62ed\",\"d57775fd\"],\"source\":\"1d22 + 2\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"082a29dc\",\"1277bcd4\",\"4ad2d246\",\"f57a35c2\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":-14,"rollTrace":[{"sideCount":9,"face":4},{"sideCount":9,"face":2},{"sideCount":22,"face":19},{"sideCount":22,"face":1}],"nextState":{"kind":"GeneratorState","words":["211a13ac","daf0b14b","1722abfe","d8dac259"]}}} as const;
const actual5 = evaluate("\t2d9 - 2d22\n", {"kind":"GeneratorState","words":["634571fe","6f51ee1e","69787eac","cdc78a41"]} as const, 3);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"137\",\"seed\":[\"22156cfa\",\"7ec70cdf\",\"74c8cd51\",\"c139a7e0\"],\"source\":\"\\t2d9 - 2d22\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"634571fe\",\"6f51ee1e\",\"69787eac\",\"cdc78a41\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":96,"rollTrace":[{"sideCount":80,"face":29},{"sideCount":90,"face":35},{"sideCount":90,"face":28}],"nextState":{"kind":"GeneratorState","words":["59f9cb78","3134cfd0","7a61df63","6b45eabd"]}}} as const;
const actual6 = evaluate("\td80 + 4 + 2d90\n", {"kind":"GeneratorState","words":["595de55e","41dafdd5","ff6b5e9e","d71e39ed"]} as const, 1);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"138\",\"seed\":[\"298404c8\",\"8ab75886\",\"5552a2f5\",\"208c4c13\"],\"source\":\"\\td80 + 4 + 2d90\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"595de55e\",\"41dafdd5\",\"ff6b5e9e\",\"d71e39ed\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":3,"rollTrace":[{"sideCount":10,"face":3}],"nextState":{"kind":"GeneratorState","words":["4ccb503e","c3f4493b","4a77204a","7a49b587"]}}} as const;
const actual7 = evaluate("1d10", {"kind":"GeneratorState","words":["fc241908","a2958b71","9d45db42","127ac247"]} as const, 3);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"139\",\"seed\":[\"989478ce\",\"e63bd208\",\"13291a95\",\"3f0ff7a8\"],\"source\":\"1d10\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"fc241908\",\"a2958b71\",\"9d45db42\",\"127ac247\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":20,"rollTrace":[{"sideCount":29,"face":20}],"nextState":{"kind":"GeneratorState","words":["a865f8ff","11b49b61","51d6f113","af2dd16c"]}}} as const;
const actual8 = evaluate("( 1d29 )", {"kind":"GeneratorState","words":["85f01d45","bd7e8e72","293a0856","90eb6bc8"]} as const, 2);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"140\",\"seed\":[\"07d3806a\",\"8c018b25\",\"11cbc777\",\"4d876f45\"],\"source\":\"( 1d29 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"85f01d45\",\"bd7e8e72\",\"293a0856\",\"90eb6bc8\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":33,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["184b311d","b2fa0d56","82329250","e4bb2217"]}}} as const;
const actual9 = evaluate("17 + 16", {"kind":"GeneratorState","words":["184b311d","b2fa0d56","82329250","e4bb2217"]} as const, 0);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"141\",\"seed\":[\"119f9177\",\"9591154f\",\"502d74b3\",\"29d6162e\"],\"source\":\"17 + 16\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"184b311d\",\"b2fa0d56\",\"82329250\",\"e4bb2217\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":29,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["09166821","5feb5fb6","a1f8d3b0","1b922e92"]}}} as const;
const actual10 = evaluate("29", {"kind":"GeneratorState","words":["09166821","5feb5fb6","a1f8d3b0","1b922e92"]} as const, 5);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"142\",\"seed\":[\"334efed3\",\"7e09fbb9\",\"6ea19bc6\",\"e6f7d06a\"],\"source\":\"29\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"09166821\",\"5feb5fb6\",\"a1f8d3b0\",\"1b922e92\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":2,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["b7e1e708","fb7a0984","8883533e","044fbe51"]}}} as const;
const actual11 = evaluate("( 1d48 ) - 1d14", {"kind":"GeneratorState","words":["b7e1e708","fb7a0984","8883533e","044fbe51"]} as const, 0);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"143\",\"seed\":[\"8bd210a5\",\"f11c5c86\",\"2b1899c0\",\"3c303fd0\"],\"source\":\"( 1d48 ) - 1d14\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"b7e1e708\",\"fb7a0984\",\"8883533e\",\"044fbe51\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

