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

const expected0 = {"ok":false,"code":"invalid-state-shape","details":{"state":null,"partialTrace":[],"nextState":null}} as const;
const actual0 = evaluate("d6", null, 4);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"24\",\"seed\":[\"1b79ab9c\",\"ef4dafb9\",\"0deefe64\",\"9660f9d5\"],\"source\":\"d6\",\"state\":null,\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":false,"code":"invalid-state-zero","details":{"state":{"kind":"GeneratorState","words":["00000000","00000000","00000000","00000000"]},"partialTrace":[],"nextState":null}} as const;
const actual1 = evaluate("d6", {"kind":"GeneratorState","words":["00000000","00000000","00000000","00000000"]} as const, 5);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"25\",\"seed\":[\"a9a7b60d\",\"b3a10e7e\",\"dfbe6e69\",\"5c1bad50\"],\"source\":\"d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"00000000\",\"00000000\",\"00000000\",\"00000000\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":false,"code":"invalid-state-shape","details":{"state":{"kind":"GeneratorState","words":["00000001"]},"partialTrace":[],"nextState":null}} as const;
const actual2 = evaluate("d6", {"kind":"GeneratorState","words":["00000001"]} as const, 0);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"26\",\"seed\":[\"cd91a9cd\",\"eda6c6b9\",\"9b4e7c21\",\"cd84bec4\"],\"source\":\"d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"00000001\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":false,"code":"invalid-state-word","details":{"state":{"kind":"GeneratorState","words":["00000001","00000002","00000003","NOTAWORD"]},"partialTrace":[],"nextState":null}} as const;
const actual3 = evaluate("d6", {"kind":"GeneratorState","words":["00000001","00000002","00000003","NOTAWORD"]} as const, 3);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"27\",\"seed\":[\"e15fcc2e\",\"039a0823\",\"115764ec\",\"4499db29\"],\"source\":\"d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"00000001\",\"00000002\",\"00000003\",\"NOTAWORD\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":false,"code":"invalid-attempt-fuel","details":{"maximumAttempts":-1,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["77544e6e","027adfd3","d724de5a","75b43676"]}}} as const;
const actual4 = evaluate("d6", {"kind":"GeneratorState","words":["77544e6e","027adfd3","d724de5a","75b43676"]} as const, -1);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"28\",\"seed\":[\"45d9bba4\",\"270d5cb2\",\"1ff0051f\",\"f52ebc76\"],\"source\":\"d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"77544e6e\",\"027adfd3\",\"d724de5a\",\"75b43676\"]},\"maximumAttempts\":-1}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":false,"code":"invalid-attempt-fuel","details":{"maximumAttempts":1.5,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["6538c671","c7faf2fa","1b2b8ba5","39819eda"]}}} as const;
const actual5 = evaluate("d6", {"kind":"GeneratorState","words":["6538c671","c7faf2fa","1b2b8ba5","39819eda"]} as const, 1.5);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"29\",\"seed\":[\"bcff54f4\",\"9a5e0744\",\"0c63e9ff\",\"5ada1b71\"],\"source\":\"d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6538c671\",\"c7faf2fa\",\"1b2b8ba5\",\"39819eda\"]},\"maximumAttempts\":1.5}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"expected-expression","details":{"kind":"syntax","code":"expected-expression","offset":4,"found":"eof","expected":["dice","integer","("]}} as const;
const actual6 = evaluate("d6 +", null, 3);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"30\",\"seed\":[\"a22baf74\",\"2f6dd656\",\"214ccc25\",\"a1ce3861\"],\"source\":\"d6 +\",\"state\":null,\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":-61,"rollTrace":[{"sideCount":82,"face":57},{"sideCount":82,"face":40}],"nextState":{"kind":"GeneratorState","words":["510d7edb","04346819","6fc1cebf","9d7bc363"]}}} as const;
const actual7 = evaluate("36 - ( 2d82 )", {"kind":"GeneratorState","words":["86b61bcb","9ad1cdba","36473cd7","211907d2"]} as const, 5);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"31\",\"seed\":[\"399a03ec\",\"45105cff\",\"9f7cecb8\",\"5f96546d\"],\"source\":\"36 - ( 2d82 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"86b61bcb\",\"9ad1cdba\",\"36473cd7\",\"211907d2\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":-37,"rollTrace":[{"sideCount":16,"face":5},{"sideCount":36,"face":23},{"sideCount":36,"face":19}],"nextState":{"kind":"GeneratorState","words":["7edde426","6e9e627e","9a3baf31","f5f96662"]}}} as const;
const actual8 = evaluate("d16 - 2d36", {"kind":"GeneratorState","words":["67c16bb4","cc8033f8","08fe8938","95a5c8fb"]} as const, 2);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"32\",\"seed\":[\"e6580824\",\"0cc38aca\",\"cec474e7\",\"4b4e2dab\"],\"source\":\"d16 - 2d36\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"67c16bb4\",\"cc8033f8\",\"08fe8938\",\"95a5c8fb\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["1e9a9679","22abf204","09c5cbb4","4af25f0c"]}}} as const;
const actual9 = evaluate("2d92 - 2d50 - 2d39", {"kind":"GeneratorState","words":["1e9a9679","22abf204","09c5cbb4","4af25f0c"]} as const, 0);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"33\",\"seed\":[\"d11bf8fb\",\"6e9d30d9\",\"d848e7da\",\"52cb75e3\"],\"source\":\"2d92 - 2d50 - 2d39\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1e9a9679\",\"22abf204\",\"09c5cbb4\",\"4af25f0c\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":53,"rollTrace":[{"sideCount":58,"face":40},{"sideCount":58,"face":13}],"nextState":{"kind":"GeneratorState","words":["b50ed5f8","5db8d7a6","879b882f","1ce9b5d1"]}}} as const;
const actual10 = evaluate("\t2d58\n", {"kind":"GeneratorState","words":["18cf5bb4","440b4f68","f67c5955","53e95c12"]} as const, 1);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"34\",\"seed\":[\"2689d554\",\"984833e5\",\"58af431f\",\"a9539459\"],\"source\":\"\\t2d58\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"18cf5bb4\",\"440b4f68\",\"f67c5955\",\"53e95c12\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":2,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["b35b804c","9a1b0bf9","06c94837","dd1d6215"]}}} as const;
const actual11 = evaluate("( 2d61 ) - 34 - 27", {"kind":"GeneratorState","words":["b35b804c","9a1b0bf9","06c94837","dd1d6215"]} as const, 0);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"35\",\"seed\":[\"c061b027\",\"3ac049b5\",\"4d28f98e\",\"113b00c2\"],\"source\":\"( 2d61 ) - 34 - 27\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"b35b804c\",\"9a1b0bf9\",\"06c94837\",\"dd1d6215\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

