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

const expected0 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":3,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["54839d01","df144611","2846fa09","d8fd2aaa"]}}} as const;
const actual0 = evaluate("\t( d13 )\n", {"kind":"GeneratorState","words":["54839d01","df144611","2846fa09","d8fd2aaa"]} as const, 0);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"72\",\"seed\":[\"fc30ead8\",\"cc18d7cd\",\"0ac28b1d\",\"2f81df6d\"],\"source\":\"\\t( d13 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"54839d01\",\"df144611\",\"2846fa09\",\"d8fd2aaa\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":-33,"rollTrace":[{"sideCount":30,"face":24},{"sideCount":46,"face":13},{"sideCount":80,"face":61},{"sideCount":80,"face":9}],"nextState":{"kind":"GeneratorState","words":["155cb72d","86110520","417a6444","500b31fe"]}}} as const;
const actual1 = evaluate("\t1d30 + 1d46 - 2d80\n", {"kind":"GeneratorState","words":["922b99ff","ecc9c2d6","49b68e73","37e35094"]} as const, 3);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"73\",\"seed\":[\"f333366d\",\"2a254ed2\",\"fc16aa8d\",\"01a4dbee\"],\"source\":\"\\t1d30 + 1d46 - 2d80\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"922b99ff\",\"ecc9c2d6\",\"49b68e73\",\"37e35094\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":39,"rollTrace":[{"sideCount":10,"face":9},{"sideCount":61,"face":5},{"sideCount":61,"face":40}],"nextState":{"kind":"GeneratorState","words":["3af97301","11c9453e","47e08a1b","5710627c"]}}} as const;
const actual2 = evaluate("( d10 ) + 2d61 - 15", {"kind":"GeneratorState","words":["73bfda8d","52e9c904","f888a1ba","b10e57a8"]} as const, 3);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"74\",\"seed\":[\"fb238eb1\",\"d44892ab\",\"05afa505\",\"d0e0cdc2\"],\"source\":\"( d10 ) + 2d61 - 15\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"73bfda8d\",\"52e9c904\",\"f888a1ba\",\"b10e57a8\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":6,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["9a609766","54d01f5e","68337b8d","cb8df1de"]}}} as const;
const actual3 = evaluate("22 - 16", {"kind":"GeneratorState","words":["9a609766","54d01f5e","68337b8d","cb8df1de"]} as const, 5);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"75\",\"seed\":[\"ad48c1b5\",\"1ab95a4a\",\"0ff054f2\",\"a8acdee5\"],\"source\":\"22 - 16\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"9a609766\",\"54d01f5e\",\"68337b8d\",\"cb8df1de\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":2,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["39de5ff0","147ef776","c210bf3a","8e6d14ce"]}}} as const;
const actual4 = evaluate("( 2d39 ) - 2d6 + 2", {"kind":"GeneratorState","words":["39de5ff0","147ef776","c210bf3a","8e6d14ce"]} as const, 0);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"76\",\"seed\":[\"f0a0eb0b\",\"55fe408b\",\"2002a1fc\",\"f39e67a2\"],\"source\":\"( 2d39 ) - 2d6 + 2\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"39de5ff0\",\"147ef776\",\"c210bf3a\",\"8e6d14ce\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":11,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["d22d1990","3ab26e87","a128d238","3ec1de64"]}}} as const;
const actual5 = evaluate("\t11\n", {"kind":"GeneratorState","words":["d22d1990","3ab26e87","a128d238","3ec1de64"]} as const, 3);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"77\",\"seed\":[\"c305f46c\",\"cc811fa8\",\"01f96a52\",\"bad4bd6b\"],\"source\":\"\\t11\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"d22d1990\",\"3ab26e87\",\"a128d238\",\"3ec1de64\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["06cacbf0","b5c54b0c","e3cede1e","5129bad9"]}}} as const;
const actual6 = evaluate("\t2d38 + 2d53\n", {"kind":"GeneratorState","words":["06cacbf0","b5c54b0c","e3cede1e","5129bad9"]} as const, 0);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"78\",\"seed\":[\"ddd44c1e\",\"dea36095\",\"e482a06d\",\"a1645d6a\"],\"source\":\"\\t2d38 + 2d53\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"06cacbf0\",\"b5c54b0c\",\"e3cede1e\",\"5129bad9\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":119,"partialTrace":[{"sideCount":80,"face":54},{"sideCount":80,"face":65}],"nextState":{"kind":"GeneratorState","words":["dec3131c","23f96d32","70216edd","ede62d8a"]}}} as const;
const actual7 = evaluate("2d80", {"kind":"GeneratorState","words":["4ada0815","d04e14eb","0ef7c111","f50ab327"]} as const, 4);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"79\",\"seed\":[\"41068a54\",\"99c40c32\",\"100a4273\",\"50c5c471\"],\"source\":\"2d80\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"4ada0815\",\"d04e14eb\",\"0ef7c111\",\"f50ab327\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":11,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["c999d8fc","23821bf1","0ec6b22b","db982cf9"]}}} as const;
const actual8 = evaluate("11", {"kind":"GeneratorState","words":["c999d8fc","23821bf1","0ec6b22b","db982cf9"]} as const, 0);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"80\",\"seed\":[\"5290a7ec\",\"8bcd9f9a\",\"3fe6b325\",\"d9ce9b64\"],\"source\":\"11\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"c999d8fc\",\"23821bf1\",\"0ec6b22b\",\"db982cf9\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":64,"rollTrace":[{"sideCount":54,"face":49}],"nextState":{"kind":"GeneratorState","words":["9d402d70","dcb67aa2","159c5264","11ab583a"]}}} as const;
const actual9 = evaluate("\t15 + 1d54\n", {"kind":"GeneratorState","words":["9a02181b","0e63a4c6","48d7c67f","092191ad"]} as const, 3);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"81\",\"seed\":[\"b8c3f9c4\",\"38985d19\",\"5457f404\",\"f0330c8f\"],\"source\":\"\\t15 + 1d54\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"9a02181b\",\"0e63a4c6\",\"48d7c67f\",\"092191ad\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":94,"rollTrace":[{"sideCount":95,"face":31},{"sideCount":95,"face":63}],"nextState":{"kind":"GeneratorState","words":["1f9f7889","70f02afd","1e76ed3a","0bd3acc2"]}}} as const;
const actual10 = evaluate("\t( 2d95 )\n", {"kind":"GeneratorState","words":["f185887a","037a2a01","b6eaebbc","7521a087"]} as const, 5);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"82\",\"seed\":[\"65e4d9c6\",\"2550b3a8\",\"5790ed7a\",\"0dce84c5\"],\"source\":\"\\t( 2d95 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f185887a\",\"037a2a01\",\"b6eaebbc\",\"7521a087\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":20,"rollTrace":[{"sideCount":27,"face":17},{"sideCount":27,"face":24},{"sideCount":27,"face":21}],"nextState":{"kind":"GeneratorState","words":["0c7707f2","6a893d82","14c73368","e8146549"]}}} as const;
const actual11 = evaluate("2d27 - d27", {"kind":"GeneratorState","words":["ad66cd7e","aec7594f","49e354cd","aa2f8994"]} as const, 3);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"83\",\"seed\":[\"54cc7fb4\",\"bc68d709\",\"77bd2ded\",\"921c794d\"],\"source\":\"2d27 - d27\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"ad66cd7e\",\"aec7594f\",\"49e354cd\",\"aa2f8994\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

