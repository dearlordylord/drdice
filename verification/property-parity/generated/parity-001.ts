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

const expected0 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":4,"dimension":"nesting-depth","limit":4,"actual":5}} as const;
const actual0 = evaluate("(((((d6)))))", {"kind":"GeneratorState","words":["0c747f78","1b4463d5","6a657c83","cac2cd31"]} as const, 2);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"12\",\"seed\":[\"2748782e\",\"21f82d08\",\"af7edba4\",\"f5465581\"],\"source\":\"(((((d6)))))\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0c747f78\",\"1b4463d5\",\"6a657c83\",\"cac2cd31\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":8,"dimension":"die-sample-count","limit":8,"actual":9}} as const;
const actual1 = evaluate("3d6+3d6+3d6", {"kind":"GeneratorState","words":["3fe99ad2","4b5d0ef8","ac0942bf","5b48ec48"]} as const, 4);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"13\",\"seed\":[\"161ac974\",\"a9b9b32e\",\"645ba4c0\",\"08b63881\"],\"source\":\"3d6+3d6+3d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"3fe99ad2\",\"4b5d0ef8\",\"ac0942bf\",\"5b48ec48\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":5,"dimension":"arithmetic-magnitude","limit":100,"actual":101}} as const;
const actual2 = evaluate("100-1+2", {"kind":"GeneratorState","words":["63febf07","881e3ed3","6a466660","295482b0"]} as const, 3);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"14\",\"seed\":[\"30b1ef17\",\"a7323e7e\",\"ff4c4e00\",\"a702dd86\"],\"source\":\"100-1+2\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"63febf07\",\"881e3ed3\",\"6a466660\",\"295482b0\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":1,"rollTrace":[{"sideCount":1,"face":1}],"nextState":{"kind":"GeneratorState","words":["f6eb73ad","1e478275","ca1294dc","c596b3c0"]}}} as const;
const actual3 = evaluate("d1", {"kind":"GeneratorState","words":["8ef3c17b","6cdc44a9","fc6807a7","14c4f67f"]} as const, 1);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"15\",\"seed\":[\"96cc34a3\",\"1b53cd6f\",\"3d3d9e10\",\"5104f48f\"],\"source\":\"d1\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8ef3c17b\",\"6cdc44a9\",\"fc6807a7\",\"14c4f67f\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":78,"rollTrace":[{"sideCount":100,"face":78}],"nextState":{"kind":"GeneratorState","words":["c27faa05","deb7d521","baedb7a5","84f7e41d"]}}} as const;
const actual4 = evaluate("d100", {"kind":"GeneratorState","words":["41cf34f9","7a8f6a84","e5f78b5c","f93ff478"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"16\",\"seed\":[\"96b50c06\",\"d18f241c\",\"949b6dda\",\"dd2a780a\"],\"source\":\"d100\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"41cf34f9\",\"7a8f6a84\",\"e5f78b5c\",\"f93ff478\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":19,"rollTrace":[{"sideCount":6,"face":1},{"sideCount":6,"face":4},{"sideCount":6,"face":1},{"sideCount":6,"face":1}],"nextState":{"kind":"GeneratorState","words":["7e3b6812","d171a660","6cb953d6","92ae2995"]}}} as const;
const actual5 = evaluate("4d6 + 12", {"kind":"GeneratorState","words":["0bca4743","84b6c2c6","495b98dd","dc5c3ef4"]} as const, 2);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"17\",\"seed\":[\"de4b0232\",\"7faebbb4\",\"b3d594d8\",\"289c1b9f\"],\"source\":\"4d6 + 12\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0bca4743\",\"84b6c2c6\",\"495b98dd\",\"dc5c3ef4\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":10,"rollTrace":[{"sideCount":6,"face":6},{"sideCount":8,"face":4}],"nextState":{"kind":"GeneratorState","words":["33fea1d3","125329b3","39bc9616","5010fcb3"]}}} as const;
const actual6 = evaluate("((d6)) + d8", {"kind":"GeneratorState","words":["52c22e12","e92f747f","99e9afc8","1e79f9a1"]} as const, 5);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"18\",\"seed\":[\"d492e433\",\"8a8cc719\",\"5f922bee\",\"471335b9\"],\"source\":\"((d6)) + d8\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"52c22e12\",\"e92f747f\",\"99e9afc8\",\"1e79f9a1\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":-4,"rollTrace":[{"sideCount":6,"face":1},{"sideCount":6,"face":1},{"sideCount":6,"face":4}],"nextState":{"kind":"GeneratorState","words":["c9b5428d","c08e2831","2b04e908","9227cb75"]}}} as const;
const actual7 = evaluate("d6-d6-d6", {"kind":"GeneratorState","words":["ac6f14ef","cfd11893","877fa839","3cb281d6"]} as const, 1);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"19\",\"seed\":[\"84948b39\",\"ab8799c0\",\"4f49067f\",\"9f5ce63c\"],\"source\":\"d6-d6-d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"ac6f14ef\",\"cfd11893\",\"877fa839\",\"3cb281d6\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["e4d36a86","23b7b771","e3ef32a9","b1eac7a6"]}}} as const;
const actual8 = evaluate("2D20\t+\n3", {"kind":"GeneratorState","words":["e4d36a86","23b7b771","e3ef32a9","b1eac7a6"]} as const, 0);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"20\",\"seed\":[\"fa72fed7\",\"10a1cc63\",\"0c9aa655\",\"525565dd\"],\"source\":\"2D20\\t+\\n3\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e4d36a86\",\"23b7b771\",\"e3ef32a9\",\"b1eac7a6\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":8,"rollTrace":[{"sideCount":1,"face":1},{"sideCount":1,"face":1},{"sideCount":1,"face":1},{"sideCount":1,"face":1},{"sideCount":1,"face":1},{"sideCount":1,"face":1},{"sideCount":1,"face":1},{"sideCount":1,"face":1}],"nextState":{"kind":"GeneratorState","words":["69639a95","45ebd0bc","283a363e","9b3cc678"]}}} as const;
const actual9 = evaluate("8d1", {"kind":"GeneratorState","words":["50d7f4b7","2e27d28f","6b76b8c4","0a3aeeee"]} as const, 5);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"21\",\"seed\":[\"2339efea\",\"c650b188\",\"dc5aeeb8\",\"b03861be\"],\"source\":\"8d1\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"50d7f4b7\",\"2e27d28f\",\"6b76b8c4\",\"0a3aeeee\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"rejection-sampling-attempts","limit":5,"actual":6}} as const;
const actual10 = evaluate("d6 + 100", {"kind":"GeneratorState","words":["96f916a9","b7bd5605","a7d57b6e","02b55a21"]} as const, 6);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"22\",\"seed\":[\"3df00899\",\"a085ebe8\",\"a2e44794\",\"68cc817f\"],\"source\":\"d6 + 100\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"96f916a9\",\"b7bd5605\",\"a7d57b6e\",\"02b55a21\"]},\"maximumAttempts\":6}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"rejection-sampling-attempts","limit":5,"actual":1000000}} as const;
const actual11 = evaluate("45", {"kind":"GeneratorState","words":["fd4b51b9","fd072125","dd33c578","31de5333"]} as const, 1000000);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"23\",\"seed\":[\"e480bcce\",\"9039ad02\",\"16ae460e\",\"1392ce19\"],\"source\":\"45\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"fd4b51b9\",\"fd072125\",\"dd33c578\",\"31de5333\"]},\"maximumAttempts\":1000000}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

