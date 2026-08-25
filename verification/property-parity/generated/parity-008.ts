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

const expected0 = {"ok":true,"value":{"total":2,"rollTrace":[{"sideCount":1,"face":1},{"sideCount":1,"face":1}],"nextState":{"kind":"GeneratorState","words":["55ea02fa","143a5621","9d3eb14e","2cdf283d"]}}} as const;
const actual0 = evaluate("2d1", {"kind":"GeneratorState","words":["0303c36b","6113b33e","0766493a","305fe94a"]} as const, 5);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"96\",\"seed\":[\"dc736eb8\",\"8522fb2a\",\"92bd1729\",\"3b5dcfa5\"],\"source\":\"2d1\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0303c36b\",\"6113b33e\",\"0766493a\",\"305fe94a\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":50,"rollTrace":[{"sideCount":3,"face":1}],"nextState":{"kind":"GeneratorState","words":["4b4d224c","2f040626","636e12bd","cdb47a5e"]}}} as const;
const actual1 = evaluate("\t13 + 36 + d3\n", {"kind":"GeneratorState","words":["009494c3","122f229b","3dbfb07e","59f69414"]} as const, 3);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"97\",\"seed\":[\"31a31871\",\"070f35c7\",\"d743069c\",\"458b77d4\"],\"source\":\"\\t13 + 36 + d3\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"009494c3\",\"122f229b\",\"3dbfb07e\",\"59f69414\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":150,"partialTrace":[{"sideCount":96,"face":54},{"sideCount":96,"face":96}],"nextState":{"kind":"GeneratorState","words":["b422002e","3d07d555","9ec39314","e01eec89"]}}} as const;
const actual2 = evaluate("2d96 - 12 - d3", {"kind":"GeneratorState","words":["d68b6deb","412c9aa6","adeb330c","b2b9f4be"]} as const, 2);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"98\",\"seed\":[\"4d57af70\",\"af8796ac\",\"f71538a5\",\"5037a405\"],\"source\":\"2d96 - 12 - d3\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"d68b6deb\",\"412c9aa6\",\"adeb330c\",\"b2b9f4be\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["dade34fe","c371288b","1515edbf","08464039"]}}} as const;
const actual3 = evaluate("2d82 - d2", {"kind":"GeneratorState","words":["dade34fe","c371288b","1515edbf","08464039"]} as const, 0);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"99\",\"seed\":[\"76710199\",\"9e035db8\",\"4330cb22\",\"10c06708\"],\"source\":\"2d82 - d2\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"dade34fe\",\"c371288b\",\"1515edbf\",\"08464039\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":-86,"rollTrace":[{"sideCount":63,"face":54},{"sideCount":63,"face":44},{"sideCount":9,"face":3}],"nextState":{"kind":"GeneratorState","words":["59162fc2","1e952dcf","43891e01","901bb045"]}}} as const;
const actual4 = evaluate("15 - 2d63 - d9", {"kind":"GeneratorState","words":["ef728a34","ea7b434f","f5d63e00","c3b7bbfa"]} as const, 5);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"100\",\"seed\":[\"c182a56b\",\"30de707c\",\"24e06d94\",\"030dde9d\"],\"source\":\"15 - 2d63 - d9\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"ef728a34\",\"ea7b434f\",\"f5d63e00\",\"c3b7bbfa\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":39,"rollTrace":[{"sideCount":8,"face":2},{"sideCount":8,"face":1},{"sideCount":8,"face":5},{"sideCount":8,"face":3}],"nextState":{"kind":"GeneratorState","words":["194f0dd0","b17bc2d6","e29d7fb9","bcd245dd"]}}} as const;
const actual5 = evaluate("2d8 - 2d8 + 44", {"kind":"GeneratorState","words":["a2430591","6f57b4b2","dbd5472b","3d3ba8df"]} as const, 1);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"101\",\"seed\":[\"a57078f4\",\"e7bb15a3\",\"24e9d3a4\",\"cd36c1aa\"],\"source\":\"2d8 - 2d8 + 44\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"a2430591\",\"6f57b4b2\",\"dbd5472b\",\"3d3ba8df\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":29,"rollTrace":[{"sideCount":98,"face":29}],"nextState":{"kind":"GeneratorState","words":["7c527103","9fa80f41","6cf296f1","650e73d4"]}}} as const;
const actual6 = evaluate("1d98", {"kind":"GeneratorState","words":["06ded0cd","a0a9f9b0","39df263c","da25587e"]} as const, 2);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"102\",\"seed\":[\"80a35797\",\"a069955f\",\"ca85bbfe\",\"c2b2e563\"],\"source\":\"1d98\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"06ded0cd\",\"a0a9f9b0\",\"39df263c\",\"da25587e\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["39a02a9e","194ff39e","57f3b32e","b535d35c"]}}} as const;
const actual7 = evaluate("\t1d43 + 2d3 - ( 2d13 )\n", {"kind":"GeneratorState","words":["39a02a9e","194ff39e","57f3b32e","b535d35c"]} as const, 0);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"103\",\"seed\":[\"222154a8\",\"1e3e4eb2\",\"2ae4cd86\",\"d9ded1ac\"],\"source\":\"\\t1d43 + 2d3 - ( 2d13 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"39a02a9e\",\"194ff39e\",\"57f3b32e\",\"b535d35c\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":68,"rollTrace":[{"sideCount":20,"face":13},{"sideCount":20,"face":6},{"sideCount":3,"face":1},{"sideCount":3,"face":2}],"nextState":{"kind":"GeneratorState","words":["5395a4c5","605ce6f2","ffd0da1d","f39949a8"]}}} as const;
const actual8 = evaluate("2d20 + 2d3 + 46", {"kind":"GeneratorState","words":["35723115","f0e7f944","6a6b35a0","664db40b"]} as const, 1);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"104\",\"seed\":[\"d0f5d4df\",\"27ae3ce8\",\"e65ad2d1\",\"3c1536f1\"],\"source\":\"2d20 + 2d3 + 46\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"35723115\",\"f0e7f944\",\"6a6b35a0\",\"664db40b\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["e348a384","c9bf5432","9f0cdb0d","da6d6dfb"]}}} as const;
const actual9 = evaluate("d60 - d75", {"kind":"GeneratorState","words":["e348a384","c9bf5432","9f0cdb0d","da6d6dfb"]} as const, 0);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"105\",\"seed\":[\"2bedab9f\",\"4d5e9ed0\",\"4e1ee3d2\",\"def9b6e0\"],\"source\":\"d60 - d75\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e348a384\",\"c9bf5432\",\"9f0cdb0d\",\"da6d6dfb\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":49,"rollTrace":[{"sideCount":2,"face":1},{"sideCount":2,"face":1},{"sideCount":77,"face":41},{"sideCount":32,"face":6}],"nextState":{"kind":"GeneratorState","words":["30ee83c9","10c3c7ff","a8dc09de","d07db3c4"]}}} as const;
const actual10 = evaluate("( 2d2 ) + 1d77 + d32", {"kind":"GeneratorState","words":["a7a41ff6","199e9f78","99efaf60","82baa476"]} as const, 5);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"106\",\"seed\":[\"e96444fc\",\"5e857421\",\"f024a801\",\"c1b3e8f3\"],\"source\":\"( 2d2 ) + 1d77 + d32\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"a7a41ff6\",\"199e9f78\",\"99efaf60\",\"82baa476\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":86,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["e92c9c3f","d259a103","6467d7b1","36525308"]}}} as const;
const actual11 = evaluate("37 + 49", {"kind":"GeneratorState","words":["e92c9c3f","d259a103","6467d7b1","36525308"]} as const, 2);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"107\",\"seed\":[\"0c6c4e64\",\"31b11a34\",\"4c05faaf\",\"995c03e7\"],\"source\":\"37 + 49\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e92c9c3f\",\"d259a103\",\"6467d7b1\",\"36525308\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

