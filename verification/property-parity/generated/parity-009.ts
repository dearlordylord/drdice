/* GENERATED FILE. Run pnpm generate:property-parity; do not edit by hand. */
import { evaluate } from "@drdice/dice";

type Equal<Left, Right> =
  [Left] extends [Right] ? [Right] extends [Left] ? true : false : false;
type IsAny<Value> = 0 extends (1 & Value) ? true : false;
type ContainsAny<Value> =
  IsAny<Value> extends true ? true
    : Value extends readonly unknown[] ? ContainsAny<Value[number]>
      : Value extends object
        ? true extends { [Key in keyof Value]: ContainsAny<Value[Key]> }[keyof Value] ? true : false
        : false;
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

const expected0 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":11,"dimension":"arithmetic-magnitude","limit":100,"actual":112,"partialTrace":[{"sideCount":13,"face":9},{"sideCount":13,"face":2},{"sideCount":77,"face":56},{"sideCount":77,"face":56}],"nextState":{"kind":"GeneratorState","words":["1340e114","bc5a366d","b59c2b61","f05417d6"]}}} as const;
const actual0 = evaluate("( 2d13 ) + 2d77 + d29", {"kind":"GeneratorState","words":["0d4e9550","f2d723e5","a2738c6e","d09a74ab"]} as const, 2);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"108\",\"seed\":[\"2c78414d\",\"ae6f9fc5\",\"ef7530ce\",\"64f65b78\"],\"source\":\"( 2d13 ) + 2d77 + d29\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0d4e9550\",\"f2d723e5\",\"a2738c6e\",\"d09a74ab\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":-15,"rollTrace":[{"sideCount":34,"face":15},{"sideCount":98,"face":30}],"nextState":{"kind":"GeneratorState","words":["a8ca47ed","c975e724","9eae5955","19896039"]}}} as const;
const actual1 = evaluate("d34 - d98", {"kind":"GeneratorState","words":["045bbecc","302b5be5","a513b958","9b9993e8"]} as const, 3);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"109\",\"seed\":[\"7f79e991\",\"0b36fe34\",\"4af29dcc\",\"30293c49\"],\"source\":\"d34 - d98\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"045bbecc\",\"302b5be5\",\"a513b958\",\"9b9993e8\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":28,"rollTrace":[{"sideCount":34,"face":28}],"nextState":{"kind":"GeneratorState","words":["5b815ba9","acbaef79","91c6d4ec","2b3d1e09"]}}} as const;
const actual2 = evaluate("d34", {"kind":"GeneratorState","words":["9aa43c0a","835f1195","b541c2e6","427a7636"]} as const, 5);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"110\",\"seed\":[\"caa64f68\",\"6a22976d\",\"212a4a4a\",\"6404f11b\"],\"source\":\"d34\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"9aa43c0a\",\"835f1195\",\"b541c2e6\",\"427a7636\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":9,"rollTrace":[{"sideCount":9,"face":9}],"nextState":{"kind":"GeneratorState","words":["c31cc8e1","b7627274","41750269","d69fad63"]}}} as const;
const actual3 = evaluate("\t( d9 )\n", {"kind":"GeneratorState","words":["6f661b14","f0834a1d","2887237d","5cf999e8"]} as const, 1);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"111\",\"seed\":[\"25368a50\",\"7be2fdae\",\"aeb2df25\",\"5f96b44e\"],\"source\":\"\\t( d9 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6f661b14\",\"f0834a1d\",\"2887237d\",\"5cf999e8\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":20,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["c1d63f7d","2acebc9c","df749be9","8f4d6d0b"]}}} as const;
const actual4 = evaluate("20", {"kind":"GeneratorState","words":["c1d63f7d","2acebc9c","df749be9","8f4d6d0b"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"112\",\"seed\":[\"fff5da6d\",\"d3b35e11\",\"b6556709\",\"4c3d0033\"],\"source\":\"20\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"c1d63f7d\",\"2acebc9c\",\"df749be9\",\"8f4d6d0b\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["82ab333d","6652d8f0","fc6b4c41","c93f80a4"]}}} as const;
const actual5 = evaluate("1d99", {"kind":"GeneratorState","words":["82ab333d","6652d8f0","fc6b4c41","c93f80a4"]} as const, 0);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"113\",\"seed\":[\"b680fb28\",\"9550549a\",\"67a8341b\",\"4447f54e\"],\"source\":\"1d99\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"82ab333d\",\"6652d8f0\",\"fc6b4c41\",\"c93f80a4\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":-9,"rollTrace":[{"sideCount":12,"face":12},{"sideCount":12,"face":8},{"sideCount":41,"face":6},{"sideCount":41,"face":16},{"sideCount":54,"face":7}],"nextState":{"kind":"GeneratorState","words":["3f2a7c5a","101b65ef","fae766b7","f1469183"]}}} as const;
const actual6 = evaluate("2d12 - 2d41 - 1d54", {"kind":"GeneratorState","words":["e7f21d2d","9d3bb5dc","3ed5ba0d","6230386e"]} as const, 3);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"114\",\"seed\":[\"03d084ab\",\"7bf84c29\",\"3dd7f7f7\",\"a607ba03\"],\"source\":\"2d12 - 2d41 - 1d54\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e7f21d2d\",\"9d3bb5dc\",\"3ed5ba0d\",\"6230386e\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":5,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["1c43b334","68252bde","31e4ab8c","5b66fd57"]}}} as const;
const actual7 = evaluate("10 + d72", {"kind":"GeneratorState","words":["1c43b334","68252bde","31e4ab8c","5b66fd57"]} as const, 0);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"115\",\"seed\":[\"04f7a0eb\",\"edbdab5e\",\"421ea195\",\"53a51ae3\"],\"source\":\"10 + d72\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1c43b334\",\"68252bde\",\"31e4ab8c\",\"5b66fd57\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":-21,"rollTrace":[{"sideCount":36,"face":7},{"sideCount":36,"face":4}],"nextState":{"kind":"GeneratorState","words":["eff1d1a6","1122ad7d","d1e9a044","0caa5be1"]}}} as const;
const actual8 = evaluate("( 2d36 ) - 32", {"kind":"GeneratorState","words":["dd8a8670","4161c990","36de30d9","0f3b0b0d"]} as const, 4);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"116\",\"seed\":[\"ecda6fa0\",\"84e9d9d7\",\"45bfa1fe\",\"81871efe\"],\"source\":\"( 2d36 ) - 32\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"dd8a8670\",\"4161c990\",\"36de30d9\",\"0f3b0b0d\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":5,"dimension":"arithmetic-magnitude","limit":100,"actual":130,"partialTrace":[{"sideCount":78,"face":50},{"sideCount":78,"face":15},{"sideCount":81,"face":47},{"sideCount":81,"face":18}],"nextState":{"kind":"GeneratorState","words":["083a6ad0","db08205d","65d0316d","7cefdacd"]}}} as const;
const actual9 = evaluate("2d78 + 2d81", {"kind":"GeneratorState","words":["80736c3e","3a4b9fc9","e1944b51","4ba7c548"]} as const, 5);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"117\",\"seed\":[\"2b159a4b\",\"93ca7ac5\",\"4ec4250c\",\"86ddc7fe\"],\"source\":\"2d78 + 2d81\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"80736c3e\",\"3a4b9fc9\",\"e1944b51\",\"4ba7c548\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":43,"rollTrace":[{"sideCount":63,"face":8},{"sideCount":63,"face":62}],"nextState":{"kind":"GeneratorState","words":["bc631c80","697aa336","62565b8a","4b7af59a"]}}} as const;
const actual10 = evaluate("11 - 38 + 2d63", {"kind":"GeneratorState","words":["f3761f43","c45100e8","670a9f17","380d6c75"]} as const, 2);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"118\",\"seed\":[\"fc3ce001\",\"67a2f3ff\",\"027ced31\",\"648ad95c\"],\"source\":\"11 - 38 + 2d63\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f3761f43\",\"c45100e8\",\"670a9f17\",\"380d6c75\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":-16,"rollTrace":[{"sideCount":67,"face":51}],"nextState":{"kind":"GeneratorState","words":["ad6edf7e","d0c63124","fafab94d","db507e3c"]}}} as const;
const actual11 = evaluate("\t35 - 1d67\n", {"kind":"GeneratorState","words":["6af5b571","3a885a69","80bbde3c","fd133066"]} as const, 4);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"119\",\"seed\":[\"98c1a025\",\"346f9ea7\",\"30d8b23a\",\"f563cfd5\"],\"source\":\"\\t35 - 1d67\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6af5b571\",\"3a885a69\",\"80bbde3c\",\"fd133066\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

