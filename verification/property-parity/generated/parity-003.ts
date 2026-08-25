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

const expected0 = {"ok":true,"value":{"total":70,"rollTrace":[{"sideCount":51,"face":14},{"sideCount":72,"face":19}],"nextState":{"kind":"GeneratorState","words":["49691ade","ad43e146","85697b72","a3a17024"]}}} as const;
const actual0 = evaluate("37 + 1d51 + d72", {"kind":"GeneratorState","words":["8eab45a0","1379e3b6","281c5422","d02fc8e6"]} as const, 3);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"36\",\"seed\":[\"9b86d8b3\",\"5283879b\",\"6c6e22c3\",\"aef4cdd8\"],\"source\":\"37 + 1d51 + d72\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8eab45a0\",\"1379e3b6\",\"281c5422\",\"d02fc8e6\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":7,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["31472636","1a864859","a79ea0f2","c8342ab9"]}}} as const;
const actual1 = evaluate("\t7\n", {"kind":"GeneratorState","words":["31472636","1a864859","a79ea0f2","c8342ab9"]} as const, 4);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"37\",\"seed\":[\"5605c539\",\"3af0df68\",\"02a43326\",\"1cd69986\"],\"source\":\"\\t7\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"31472636\",\"1a864859\",\"a79ea0f2\",\"c8342ab9\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":72,"rollTrace":[{"sideCount":53,"face":27},{"sideCount":53,"face":43},{"sideCount":35,"face":23},{"sideCount":19,"face":9},{"sideCount":19,"face":16}],"nextState":{"kind":"GeneratorState","words":["193d0035","3442b73b","bea8155f","a632d5f6"]}}} as const;
const actual2 = evaluate("2d53 - d35 + 2d19", {"kind":"GeneratorState","words":["45dfbae6","b0932c62","9f7982f2","bd8373b8"]} as const, 3);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"38\",\"seed\":[\"cd752850\",\"679c918f\",\"400c6079\",\"4c67e978\"],\"source\":\"2d53 - d35 + 2d19\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"45dfbae6\",\"b0932c62\",\"9f7982f2\",\"bd8373b8\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":16,"rollTrace":[{"sideCount":84,"face":16}],"nextState":{"kind":"GeneratorState","words":["598ab82d","faf3d827","91145d5a","ab436baa"]}}} as const;
const actual3 = evaluate("( 1d84 )", {"kind":"GeneratorState","words":["2cdfd040","59197f7d","8f35771a","2c4c1710"]} as const, 1);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"39\",\"seed\":[\"b3bff42b\",\"ea6ce476\",\"aaa1ffe7\",\"3ef7fc69\"],\"source\":\"( 1d84 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"2cdfd040\",\"59197f7d\",\"8f35771a\",\"2c4c1710\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":15,"rollTrace":[{"sideCount":60,"face":14},{"sideCount":60,"face":1}],"nextState":{"kind":"GeneratorState","words":["7c7dd8ba","04dae185","c325393c","dc0c3dd9"]}}} as const;
const actual4 = evaluate("2d60", {"kind":"GeneratorState","words":["a0836b18","d80dc8b8","ea240919","bfc8fa9d"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"40\",\"seed\":[\"f8008e51\",\"d0918c34\",\"c3f8eb5f\",\"0cffe6d6\"],\"source\":\"2d60\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"a0836b18\",\"d80dc8b8\",\"ea240919\",\"bfc8fa9d\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":35,"rollTrace":[{"sideCount":64,"face":35}],"nextState":{"kind":"GeneratorState","words":["c8e62f66","dd542199","55552cf8","80f81648"]}}} as const;
const actual5 = evaluate("d64", {"kind":"GeneratorState","words":["01f63064","b79fcf61","6b3dde9c","7e8fd063"]} as const, 2);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"41\",\"seed\":[\"e9245df4\",\"31c77b99\",\"0832aca3\",\"e97aac70\"],\"source\":\"d64\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"01f63064\",\"b79fcf61\",\"6b3dde9c\",\"7e8fd063\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":10,"dimension":"arithmetic-magnitude","limit":100,"actual":109,"partialTrace":[{"sideCount":41,"face":41},{"sideCount":41,"face":34},{"sideCount":22,"face":14}],"nextState":{"kind":"GeneratorState","words":["3fa007cf","852ae43e","ab9ee022","d0fd1b49"]}}} as const;
const actual6 = evaluate("20 + 2d41 + ( d22 )", {"kind":"GeneratorState","words":["f3b579dc","06c8b2b4","267d933a","d41c2dc0"]} as const, 4);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"42\",\"seed\":[\"ba0e1cce\",\"4b6be0a5\",\"d894385a\",\"ac75a535\"],\"source\":\"20 + 2d41 + ( d22 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f3b579dc\",\"06c8b2b4\",\"267d933a\",\"d41c2dc0\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":69,"rollTrace":[{"sideCount":70,"face":63},{"sideCount":43,"face":5},{"sideCount":43,"face":1}],"nextState":{"kind":"GeneratorState","words":["4d78cc96","50d43b02","fada10c3","06edbefb"]}}} as const;
const actual7 = evaluate("d70 + 2d43", {"kind":"GeneratorState","words":["6d6d4f3a","b85ae34e","3f23c057","c9f67afb"]} as const, 2);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"43\",\"seed\":[\"1e2b83bd\",\"a5de86f3\",\"d51b5213\",\"5474da5f\"],\"source\":\"d70 + 2d43\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6d6d4f3a\",\"b85ae34e\",\"3f23c057\",\"c9f67afb\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":7,"dimension":"arithmetic-magnitude","limit":100,"actual":109,"partialTrace":[{"sideCount":51,"face":27},{"sideCount":98,"face":69},{"sideCount":98,"face":40}],"nextState":{"kind":"GeneratorState","words":["60e034d1","d15bdacc","0e7d158e","86a07d44"]}}} as const;
const actual8 = evaluate("\td51 - 2d98 + 2d95\n", {"kind":"GeneratorState","words":["61e9d272","1cc1518f","4a3f9def","5cfa8730"]} as const, 1);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"44\",\"seed\":[\"cdc5c1ee\",\"caff5952\",\"1b743eb8\",\"08cd6dc9\"],\"source\":\"\\td51 - 2d98 + 2d95\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"61e9d272\",\"1cc1518f\",\"4a3f9def\",\"5cfa8730\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":34,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["b8a8cdb3","73c9d48f","b4a85aa1","ab17221a"]}}} as const;
const actual9 = evaluate("34", {"kind":"GeneratorState","words":["b8a8cdb3","73c9d48f","b4a85aa1","ab17221a"]} as const, 0);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"45\",\"seed\":[\"2ac3ea22\",\"a777bdc1\",\"49390166\",\"4bab486c\"],\"source\":\"34\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"b8a8cdb3\",\"73c9d48f\",\"b4a85aa1\",\"ab17221a\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":67,"rollTrace":[{"sideCount":44,"face":32},{"sideCount":44,"face":35}],"nextState":{"kind":"GeneratorState","words":["5b66fbcb","1cb60724","fa82aedd","a58cd402"]}}} as const;
const actual10 = evaluate("( 2d44 )", {"kind":"GeneratorState","words":["975e50ac","52caa775","2517ac20","1ea6bd88"]} as const, 4);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"46\",\"seed\":[\"66f83f82\",\"4001afc6\",\"cad3f27a\",\"2701eeb4\"],\"source\":\"( 2d44 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"975e50ac\",\"52caa775\",\"2517ac20\",\"1ea6bd88\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["aed60017","5335451c","8599afb9","474abdc9"]}}} as const;
const actual11 = evaluate("\t2d74\n", {"kind":"GeneratorState","words":["aed60017","5335451c","8599afb9","474abdc9"]} as const, 0);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"47\",\"seed\":[\"c200f466\",\"4d071e20\",\"76aa6161\",\"6a4dd862\"],\"source\":\"\\t2d74\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"aed60017\",\"5335451c\",\"8599afb9\",\"474abdc9\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

