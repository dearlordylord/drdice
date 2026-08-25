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

const expected0 = {"ok":false,"code":"expected-expression","details":{"kind":"syntax","code":"expected-expression","offset":0,"found":"eof","expected":["dice","integer","("]}} as const;
const actual0 = evaluate("", {"kind":"GeneratorState","words":["e83c194b","b7818bc1","fb0d50b6","8369c2d9"]} as const, 3);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"0\",\"seed\":[\"00000001\",\"00000002\",\"00000003\",\"00000004\"],\"source\":\"\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"e83c194b\",\"b7818bc1\",\"fb0d50b6\",\"8369c2d9\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":false,"code":"expected-expression","details":{"kind":"syntax","code":"expected-expression","offset":3,"found":"eof","expected":["dice","integer","("]}} as const;
const actual1 = evaluate("   ", {"kind":"GeneratorState","words":["6989c8e0","c95fa225","804f9469","92032eb3"]} as const, 4);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"1\",\"seed\":[\"997014b1\",\"e7295102\",\"6c278746\",\"052e2d01\"],\"source\":\"   \",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6989c8e0\",\"c95fa225\",\"804f9469\",\"92032eb3\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":false,"code":"expected-die-sides","details":{"kind":"syntax","code":"expected-die-sides","offset":1,"found":"eof","expected":["positive-integer"]}} as const;
const actual2 = evaluate("d", {"kind":"GeneratorState","words":["0b995ae9","a1241c27","a1c5a4fa","f4dc5b8a"]} as const, 4);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"2\",\"seed\":[\"97997e9f\",\"b11295fa\",\"961921ac\",\"f7b3effa\"],\"source\":\"d\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0b995ae9\",\"a1241c27\",\"a1c5a4fa\",\"f4dc5b8a\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":false,"code":"leading-zero","details":{"kind":"syntax","code":"leading-zero","offset":0,"found":"1","expected":["canonical-integer"]}} as const;
const actual3 = evaluate("01", {"kind":"GeneratorState","words":["1524d8f1","63670060","d34fdf94","2b8ffb3a"]} as const, 1);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"3\",\"seed\":[\"4ab33f81\",\"85222d20\",\"d04fe103\",\"a19d71b4\"],\"source\":\"01\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1524d8f1\",\"63670060\",\"d34fdf94\",\"2b8ffb3a\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":false,"code":"side-count-zero","details":{"kind":"domain","code":"side-count-zero","offset":1,"subject":"side-count","value":"0"}} as const;
const actual4 = evaluate("d0", {"kind":"GeneratorState","words":["51a70540","482fac01","38cd040f","a14c07df"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"4\",\"seed\":[\"ee3ba56f\",\"c8570ca4\",\"11b090e5\",\"762a1753\"],\"source\":\"d0\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"51a70540\",\"482fac01\",\"38cd040f\",\"a14c07df\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":false,"code":"dice-count-zero","details":{"kind":"domain","code":"dice-count-zero","offset":0,"subject":"dice-count","value":"0"}} as const;
const actual5 = evaluate("0d6", {"kind":"GeneratorState","words":["c9a56595","34c2e1f5","2de75c55","26842d16"]} as const, 0);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"5\",\"seed\":[\"a1539180\",\"bf1cfe11\",\"3b0701be\",\"bd2528e6\"],\"source\":\"0d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"c9a56595\",\"34c2e1f5\",\"2de75c55\",\"26842d16\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"expected-closing-parenthesis","details":{"kind":"syntax","code":"expected-closing-parenthesis","offset":3,"found":"eof","expected":[")"]}} as const;
const actual6 = evaluate("(d6", {"kind":"GeneratorState","words":["a8fdb39e","5475c750","7c49d614","6e471c30"]} as const, 0);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"6\",\"seed\":[\"be3e13e3\",\"f40bf582\",\"ddc5eb3f\",\"74e556ae\"],\"source\":\"(d6\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"a8fdb39e\",\"5475c750\",\"7c49d614\",\"6e471c30\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":false,"code":"unexpected-token","details":{"kind":"syntax","code":"unexpected-token","offset":2,"found":")","expected":["EOF"]}} as const;
const actual7 = evaluate("d6)", {"kind":"GeneratorState","words":["8444d660","d7549024","2ce9a26b","d7660770"]} as const, 3);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"7\",\"seed\":[\"d9ee8d56\",\"00cd67f4\",\"2a458c4d\",\"e24054cb\"],\"source\":\"d6)\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8444d660\",\"d7549024\",\"2ce9a26b\",\"d7660770\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":1,"dimension":"supported-side-count","limit":100,"actual":101}} as const;
const actual8 = evaluate("d101", {"kind":"GeneratorState","words":["83f0fae2","953d727a","6460d7f8","24d5da6f"]} as const, 1);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"8\",\"seed\":[\"f642c79b\",\"788fe8a3\",\"36e287ae\",\"a4f9e005\"],\"source\":\"d101\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"83f0fae2\",\"953d727a\",\"6460d7f8\",\"24d5da6f\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":999}} as const;
const actual9 = evaluate("999", {"kind":"GeneratorState","words":["96a24454","3e9da581","420a3693","6bdf65f2"]} as const, 2);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"9\",\"seed\":[\"61cef880\",\"650a5a0f\",\"e73e086a\",\"e0583513\"],\"source\":\"999\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"96a24454\",\"3e9da581\",\"420a3693\",\"6bdf65f2\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":false,"code":"expected-expression","details":{"kind":"syntax","code":"expected-expression","offset":4,"found":"eof","expected":["dice","integer","("]}} as const;
const actual10 = evaluate("d6 +", {"kind":"GeneratorState","words":["ee7ac50a","a749dd75","023634e6","b8c00813"]} as const, 4);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"10\",\"seed\":[\"7da060ab\",\"47123651\",\"3adac11d\",\"3dd35c41\"],\"source\":\"d6 +\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"ee7ac50a\",\"a749dd75\",\"023634e6\",\"b8c00813\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"unexpected-token","details":{"kind":"syntax","code":"unexpected-token","offset":3,"found":"*","expected":["+","-","EOF"]}} as const;
const actual11 = evaluate("d6 * d4", {"kind":"GeneratorState","words":["cfefab7c","8ca4d9f6","1aaf13a2","b6116bf1"]} as const, 2);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"11\",\"seed\":[\"e7e1949a\",\"7b257a43\",\"59c37ed5\",\"f5217ef9\"],\"source\":\"d6 * d4\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"cfefab7c\",\"8ca4d9f6\",\"1aaf13a2\",\"b6116bf1\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

