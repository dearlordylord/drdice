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

const expected0 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":6,"dimension":"arithmetic-magnitude","limit":100,"actual":119,"partialTrace":[{"sideCount":94,"face":42},{"sideCount":60,"face":46},{"sideCount":60,"face":31}],"nextState":{"kind":"GeneratorState","words":["5c11b552","579f1ce3","cd836b2a","f7e4041a"]}}} as const;
const actual0 = evaluate("\t1d94 + 2d60 - d9\n", {"kind":"GeneratorState","words":["342229ed","abb40d38","6b2813e4","69efbc24"]} as const, 5);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"84\",\"seed\":[\"0a99e41c\",\"f5559d31\",\"98805748\",\"df4ad1fc\"],\"source\":\"\\t1d94 + 2d60 - d9\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"342229ed\",\"abb40d38\",\"6b2813e4\",\"69efbc24\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":22,"rollTrace":[{"sideCount":78,"face":1},{"sideCount":78,"face":21}],"nextState":{"kind":"GeneratorState","words":["559d8415","5c30e944","9ecac5a4","1099b634"]}}} as const;
const actual1 = evaluate("2d78", {"kind":"GeneratorState","words":["69d7e31c","504fb067","bcbbbf9b","aa87c458"]} as const, 4);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"85\",\"seed\":[\"7c9ed801\",\"544bd20e\",\"ef4aa46b\",\"c334a888\"],\"source\":\"2d78\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"69d7e31c\",\"504fb067\",\"bcbbbf9b\",\"aa87c458\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":36,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["e105a36d","d4c80528","2762c28a","44ef4062"]}}} as const;
const actual2 = evaluate("36", {"kind":"GeneratorState","words":["e105a36d","d4c80528","2762c28a","44ef4062"]} as const, 5);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"86\",\"seed\":[\"a072ab19\",\"572fc3b1\",\"446f37bd\",\"f18018d1\"],\"source\":\"36\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e105a36d\",\"d4c80528\",\"2762c28a\",\"44ef4062\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["0bf78d2b","f17857d6","1b2436fd","14cce14e"]}}} as const;
const actual3 = evaluate("\td42 + d64 + d4\n", {"kind":"GeneratorState","words":["0bf78d2b","f17857d6","1b2436fd","14cce14e"]} as const, 0);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"87\",\"seed\":[\"b87c68e7\",\"9972d8b7\",\"8eef6925\",\"1ab4e0c0\"],\"source\":\"\\td42 + d64 + d4\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0bf78d2b\",\"f17857d6\",\"1b2436fd\",\"14cce14e\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":-51,"rollTrace":[{"sideCount":3,"face":2},{"sideCount":3,"face":2},{"sideCount":100,"face":55}],"nextState":{"kind":"GeneratorState","words":["0b496eb8","aff2bbe8","d0c4cf19","be9ca896"]}}} as const;
const actual4 = evaluate("2d3 - d100", {"kind":"GeneratorState","words":["1cabdb7f","88bada54","c9648dee","2104e58e"]} as const, 1);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"88\",\"seed\":[\"229481ce\",\"e70e0b98\",\"e9de0c66\",\"2209d1af\"],\"source\":\"2d3 - d100\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1cabdb7f\",\"88bada54\",\"c9648dee\",\"2104e58e\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":36,"rollTrace":[{"sideCount":48,"face":36}],"nextState":{"kind":"GeneratorState","words":["3645aa02","2f4152ed","a26d8838","21020287"]}}} as const;
const actual5 = evaluate("d48", {"kind":"GeneratorState","words":["66a18a42","17cd70d5","5e2da87a","47295095"]} as const, 1);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"89\",\"seed\":[\"3d6e9f5e\",\"3e202b9c\",\"51257095\",\"19c24ece\"],\"source\":\"d48\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"66a18a42\",\"17cd70d5\",\"5e2da87a\",\"47295095\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["03cc91c7","2af60da0","d8c0ce96","0f4e81b2"]}}} as const;
const actual6 = evaluate("1d27 + d44 + 2d37", {"kind":"GeneratorState","words":["03cc91c7","2af60da0","d8c0ce96","0f4e81b2"]} as const, 0);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"90\",\"seed\":[\"90db6596\",\"7152afe2\",\"b1714b15\",\"9a67449c\"],\"source\":\"1d27 + d44 + 2d37\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"03cc91c7\",\"2af60da0\",\"d8c0ce96\",\"0f4e81b2\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":-24,"rollTrace":[{"sideCount":29,"face":4},{"sideCount":100,"face":24},{"sideCount":100,"face":28},{"sideCount":78,"face":47},{"sideCount":78,"face":33}],"nextState":{"kind":"GeneratorState","words":["ef7ce6da","00b226a1","9381de34","7a406595"]}}} as const;
const actual7 = evaluate("\t1d29 + 2d100 - 2d78\n", {"kind":"GeneratorState","words":["5804d9a3","15bd0818","cfe813b5","3646f2d3"]} as const, 5);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"91\",\"seed\":[\"f2fa59d3\",\"81ccc353\",\"2d735f80\",\"96ece4e1\"],\"source\":\"\\t1d29 + 2d100 - 2d78\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5804d9a3\",\"15bd0818\",\"cfe813b5\",\"3646f2d3\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":-46,"rollTrace":[{"sideCount":30,"face":7},{"sideCount":30,"face":25}],"nextState":{"kind":"GeneratorState","words":["cf0a36ad","874f9142","f76a2b6a","8f60d2e2"]}}} as const;
const actual8 = evaluate("8 - 2d30 - 22", {"kind":"GeneratorState","words":["55022eb7","bb57a1f5","7da4656a","7d0e55f5"]} as const, 5);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"92\",\"seed\":[\"445998c9\",\"9f50ee49\",\"d1a86fa5\",\"57c890eb\"],\"source\":\"8 - 2d30 - 22\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"55022eb7\",\"bb57a1f5\",\"7da4656a\",\"7d0e55f5\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":85,"rollTrace":[{"sideCount":67,"face":56},{"sideCount":67,"face":3},{"sideCount":4,"face":3},{"sideCount":4,"face":4},{"sideCount":54,"face":33}],"nextState":{"kind":"GeneratorState","words":["491dba7d","0c525d21","196ee24f","6b8190bb"]}}} as const;
const actual9 = evaluate("2d67 - 2d4 + 1d54", {"kind":"GeneratorState","words":["5319be06","068d8086","91e96810","43f74fc5"]} as const, 5);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"93\",\"seed\":[\"766b3ff5\",\"232770df\",\"6aa23e61\",\"80af1216\"],\"source\":\"2d67 - 2d4 + 1d54\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5319be06\",\"068d8086\",\"91e96810\",\"43f74fc5\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":2,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["0b3bd96e","bb3a4584","c493cfbc","952ac551"]}}} as const;
const actual10 = evaluate("( 2d20 ) - 2d13", {"kind":"GeneratorState","words":["0b3bd96e","bb3a4584","c493cfbc","952ac551"]} as const, 0);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"94\",\"seed\":[\"649ed2ff\",\"66ecde7f\",\"594b5d2e\",\"6f3e0f79\"],\"source\":\"( 2d20 ) - 2d13\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0b3bd96e\",\"bb3a4584\",\"c493cfbc\",\"952ac551\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":75,"rollTrace":[{"sideCount":77,"face":39}],"nextState":{"kind":"GeneratorState","words":["109d6535","e16991c6","7dad5894","5c102882"]}}} as const;
const actual11 = evaluate("d77 + 3 + 33", {"kind":"GeneratorState","words":["00d6e730","a01e6d52","41a11ba4","b055ef57"]} as const, 4);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"95\",\"seed\":[\"cba8c73f\",\"baa69d98\",\"4ba08b52\",\"039620d7\"],\"source\":\"d77 + 3 + 33\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"00d6e730\",\"a01e6d52\",\"41a11ba4\",\"b055ef57\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

