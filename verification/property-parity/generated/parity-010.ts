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

const expected0 = {"ok":true,"value":{"total":64,"rollTrace":[{"sideCount":57,"face":32},{"sideCount":29,"face":28},{"sideCount":29,"face":19},{"sideCount":32,"face":15}],"nextState":{"kind":"GeneratorState","words":["504a4452","a81528fb","c9ffdcad","d9c80fd6"]}}} as const;
const actual0 = evaluate("1d57 + 2d29 - 1d32", {"kind":"GeneratorState","words":["7e06d4e8","88d25789","e2f40448","c626c340"]} as const, 1);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"120\",\"seed\":[\"10fff14d\",\"3412e2e6\",\"618ccee1\",\"f242cbe9\"],\"source\":\"1d57 + 2d29 - 1d32\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"7e06d4e8\",\"88d25789\",\"e2f40448\",\"c626c340\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["596765a2","8867a707","dc8a5c75","19e440e9"]}}} as const;
const actual1 = evaluate("\t1d39 - 1d81\n", {"kind":"GeneratorState","words":["596765a2","8867a707","dc8a5c75","19e440e9"]} as const, 0);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"121\",\"seed\":[\"78f1f394\",\"96e94a75\",\"4b510166\",\"04c36fd8\"],\"source\":\"\\t1d39 - 1d81\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"596765a2\",\"8867a707\",\"dc8a5c75\",\"19e440e9\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":37,"rollTrace":[{"sideCount":8,"face":1},{"sideCount":8,"face":6}],"nextState":{"kind":"GeneratorState","words":["daa4eb00","ab96602b","e40274da","2bcdf9f8"]}}} as const;
const actual2 = evaluate("10 + 34 - 2d8", {"kind":"GeneratorState","words":["0c71fd2e","4b82da94","fb8ad14b","a252b505"]} as const, 5);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"122\",\"seed\":[\"5e1d4448\",\"2413df42\",\"a08da75f\",\"98afe0ec\"],\"source\":\"10 + 34 - 2d8\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0c71fd2e\",\"4b82da94\",\"fb8ad14b\",\"a252b505\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":88,"rollTrace":[{"sideCount":48,"face":23},{"sideCount":48,"face":20}],"nextState":{"kind":"GeneratorState","words":["33530a94","25d646b1","de28dd8f","c1c8682f"]}}} as const;
const actual3 = evaluate("1 + 44 + 2d48", {"kind":"GeneratorState","words":["f0d8ca82","7d372528","17df0894","bb44dc33"]} as const, 2);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"123\",\"seed\":[\"e40b1606\",\"5fb93903\",\"6bb5ccaf\",\"9628f25f\"],\"source\":\"1 + 44 + 2d48\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f0d8ca82\",\"7d372528\",\"17df0894\",\"bb44dc33\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":18,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["72386d59","fad53d8d","89e0d1e2","dc87cb18"]}}} as const;
const actual4 = evaluate("18", {"kind":"GeneratorState","words":["72386d59","fad53d8d","89e0d1e2","dc87cb18"]} as const, 4);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"124\",\"seed\":[\"a0a5b71b\",\"de9d5b38\",\"cab65965\",\"32c5cca8\"],\"source\":\"18\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"72386d59\",\"fad53d8d\",\"89e0d1e2\",\"dc87cb18\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":-32,"rollTrace":[{"sideCount":19,"face":8},{"sideCount":19,"face":8},{"sideCount":37,"face":15},{"sideCount":37,"face":31}],"nextState":{"kind":"GeneratorState","words":["74b3d73f","c87a5b82","259564ca","297a23b5"]}}} as const;
const actual5 = evaluate("2d19 - 2 - 2d37", {"kind":"GeneratorState","words":["5b989656","260e3118","ce89b4ed","1335f7af"]} as const, 1);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"125\",\"seed\":[\"8621de82\",\"03c9cf3a\",\"7ffcd78d\",\"44ada46b\"],\"source\":\"2d19 - 2 - 2d37\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5b989656\",\"260e3118\",\"ce89b4ed\",\"1335f7af\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":51,"rollTrace":[{"sideCount":57,"face":41},{"sideCount":53,"face":34}],"nextState":{"kind":"GeneratorState","words":["479fb901","5105d267","58664612","830d4d74"]}}} as const;
const actual6 = evaluate("\td57 + 44 - 1d53\n", {"kind":"GeneratorState","words":["129cf94b","ff2394cf","da2013f1","04b0b52c"]} as const, 2);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"126\",\"seed\":[\"59bed114\",\"f01e0b9a\",\"1cc736ac\",\"b84bbf05\"],\"source\":\"\\td57 + 44 - 1d53\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"129cf94b\",\"ff2394cf\",\"da2013f1\",\"04b0b52c\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":125,"partialTrace":[{"sideCount":95,"face":91},{"sideCount":95,"face":34}],"nextState":{"kind":"GeneratorState","words":["4805db44","fe3892b3","47f51981","c36cae90"]}}} as const;
const actual7 = evaluate("2d95 - 35 - ( 2d40 )", {"kind":"GeneratorState","words":["cef437a1","afe5e062","ff0238f1","fb0c6112"]} as const, 5);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"127\",\"seed\":[\"0bea1f40\",\"48455361\",\"a7094cd5\",\"5ce6d81c\"],\"source\":\"2d95 - 35 - ( 2d40 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"cef437a1\",\"afe5e062\",\"ff0238f1\",\"fb0c6112\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":-71,"rollTrace":[{"sideCount":97,"face":97}],"nextState":{"kind":"GeneratorState","words":["181cc44c","58ac0a87","15ecdd1d","41986037"]}}} as const;
const actual8 = evaluate("\t26 - d97\n", {"kind":"GeneratorState","words":["1ef4f740","4287e39a","04df1e5d","446fd096"]} as const, 3);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"128\",\"seed\":[\"ded41542\",\"d3f314fc\",\"9cf5450a\",\"bed7fb20\"],\"source\":\"\\t26 - d97\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1ef4f740\",\"4287e39a\",\"04df1e5d\",\"446fd096\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":-62,"rollTrace":[{"sideCount":81,"face":66},{"sideCount":81,"face":30}],"nextState":{"kind":"GeneratorState","words":["792c0bf3","3e6d0df7","372fa7c4","4b4bd744"]}}} as const;
const actual9 = evaluate("29 + 5 - 2d81", {"kind":"GeneratorState","words":["388fe8fd","72ee937e","f6bbb7b0","dbc4190a"]} as const, 2);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"129\",\"seed\":[\"fe3b2dc3\",\"ebe30042\",\"f68bb357\",\"9cc377c7\"],\"source\":\"29 + 5 - 2d81\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"388fe8fd\",\"72ee937e\",\"f6bbb7b0\",\"dbc4190a\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":74,"rollTrace":[{"sideCount":70,"face":39},{"sideCount":70,"face":18},{"sideCount":28,"face":27},{"sideCount":30,"face":17},{"sideCount":30,"face":27}],"nextState":{"kind":"GeneratorState","words":["17386cf9","5538e72c","0ba45476","ae43f4a7"]}}} as const;
const actual10 = evaluate("\t( 2d70 ) - d28 + 2d30\n", {"kind":"GeneratorState","words":["e49ee69a","61e1449c","bb734ba8","239bf9be"]} as const, 4);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"130\",\"seed\":[\"e617459d\",\"da38bb2f\",\"66fa8da1\",\"de9876c6\"],\"source\":\"\\t( 2d70 ) - d28 + 2d30\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e49ee69a\",\"61e1449c\",\"bb734ba8\",\"239bf9be\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":61,"rollTrace":[{"sideCount":45,"face":45},{"sideCount":45,"face":16}],"nextState":{"kind":"GeneratorState","words":["995e15a5","f68ea8df","a726af6e","3df8c8b8"]}}} as const;
const actual11 = evaluate("2d45", {"kind":"GeneratorState","words":["db49a627","c75fc463","8b7507f5","924fc8f8"]} as const, 1);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"131\",\"seed\":[\"9ff3bfd6\",\"e9287192\",\"045201ff\",\"c9d5bae9\"],\"source\":\"2d45\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"db49a627\",\"c75fc463\",\"8b7507f5\",\"924fc8f8\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

