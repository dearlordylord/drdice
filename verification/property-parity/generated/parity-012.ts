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

const expected0 = {"ok":true,"value":{"total":45,"rollTrace":[{"sideCount":47,"face":1},{"sideCount":47,"face":23},{"sideCount":40,"face":21}],"nextState":{"kind":"GeneratorState","words":["eb8f92c3","a726332a","ce787621","9f2dca3c"]}}} as const;
const actual0 = evaluate("( 2d47 ) + d40", {"kind":"GeneratorState","words":["5e80af29","0071e707","b003ac7e","24b6f222"]} as const, 5);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
type NoAnyParity0 = Assert<Equal<ContainsAny<typeof actual0>, false>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"144\",\"seed\":[\"b55110a2\",\"7fe67b00\",\"a0424b23\",\"cdeda9b0\"],\"source\":\"( 2d47 ) + d40\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5e80af29\",\"0071e707\",\"b003ac7e\",\"24b6f222\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":82,"rollTrace":[{"sideCount":42,"face":38},{"sideCount":42,"face":18}],"nextState":{"kind":"GeneratorState","words":["c7e00233","fae24d93","7e05297a","ff45d9c0"]}}} as const;
const actual1 = evaluate("26 + 2d42", {"kind":"GeneratorState","words":["35aad823","7a3f911b","de1fffd1","b06aa3b0"]} as const, 2);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
type NoAnyParity1 = Assert<Equal<ContainsAny<typeof actual1>, false>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"145\",\"seed\":[\"f2fab93b\",\"1e6cf175\",\"88003bd4\",\"60257149\"],\"source\":\"26 + 2d42\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"35aad823\",\"7a3f911b\",\"de1fffd1\",\"b06aa3b0\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":29,"rollTrace":[{"sideCount":43,"face":29}],"nextState":{"kind":"GeneratorState","words":["b5055189","2f2c91c2","eae3fcdd","22af2816"]}}} as const;
const actual2 = evaluate("d43", {"kind":"GeneratorState","words":["b7c1046c","1769531f","8f84c6b1","15ad06fa"]} as const, 3);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
type NoAnyParity2 = Assert<Equal<ContainsAny<typeof actual2>, false>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"146\",\"seed\":[\"ef48720b\",\"c025336f\",\"af54e92b\",\"7c439273\"],\"source\":\"d43\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"b7c1046c\",\"1769531f\",\"8f84c6b1\",\"15ad06fa\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":45,"rollTrace":[{"sideCount":47,"face":45}],"nextState":{"kind":"GeneratorState","words":["63a2aa0f","765631e3","d5e29323","31565b05"]}}} as const;
const actual3 = evaluate("1d47", {"kind":"GeneratorState","words":["030480c4","41f122c0","34a393e7","2157080b"]} as const, 5);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
type NoAnyParity3 = Assert<Equal<ContainsAny<typeof actual3>, false>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"147\",\"seed\":[\"1e5d5cf4\",\"0db344b5\",\"c19f12c7\",\"5b3b87a4\"],\"source\":\"1d47\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"030480c4\",\"41f122c0\",\"34a393e7\",\"2157080b\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":17,"rollTrace":[{"sideCount":43,"face":3},{"sideCount":43,"face":28},{"sideCount":20,"face":2},{"sideCount":20,"face":12}],"nextState":{"kind":"GeneratorState","words":["4d49f7c0","49ac45fb","1acecf14","265ac4e8"]}}} as const;
const actual4 = evaluate("2d43 - ( 2d20 )", {"kind":"GeneratorState","words":["16ad9971","876aac9c","4e594c69","656b1e12"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
type NoAnyParity4 = Assert<Equal<ContainsAny<typeof actual4>, false>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"148\",\"seed\":[\"5a416219\",\"b64d5a18\",\"bcc4c77f\",\"a14d982a\"],\"source\":\"2d43 - ( 2d20 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"16ad9971\",\"876aac9c\",\"4e594c69\",\"656b1e12\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":-13,"rollTrace":[{"sideCount":68,"face":56},{"sideCount":91,"face":27},{"sideCount":91,"face":9}],"nextState":{"kind":"GeneratorState","words":["2948b5aa","4f8e6031","4f48be32","8f36bfc9"]}}} as const;
const actual5 = evaluate("7 - d68 + ( 2d91 )", {"kind":"GeneratorState","words":["7f9b1ffe","3bee3199","98d4852b","4e8ef5fd"]} as const, 1);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
type NoAnyParity5 = Assert<Equal<ContainsAny<typeof actual5>, false>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"149\",\"seed\":[\"0836122b\",\"8411f552\",\"edc6e9ef\",\"2f9923d2\"],\"source\":\"7 - d68 + ( 2d91 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"7f9b1ffe\",\"3bee3199\",\"98d4852b\",\"4e8ef5fd\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":56,"rollTrace":[{"sideCount":46,"face":18}],"nextState":{"kind":"GeneratorState","words":["deb05674","68b74762","0a223d54","4401a541"]}}} as const;
const actual6 = evaluate("\td46 + 38\n", {"kind":"GeneratorState","words":["7698d640","10b91636","0e968714","b8919602"]} as const, 4);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
type NoAnyParity6 = Assert<Equal<ContainsAny<typeof actual6>, false>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"150\",\"seed\":[\"216bd1e2\",\"31a03569\",\"d6acd30f\",\"d56fb849\"],\"source\":\"\\td46 + 38\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"7698d640\",\"10b91636\",\"0e968714\",\"b8919602\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":21,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["8cc790da","636000b4","59693613","17859846"]}}} as const;
const actual7 = evaluate("\t21\n", {"kind":"GeneratorState","words":["8cc790da","636000b4","59693613","17859846"]} as const, 3);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
type NoAnyParity7 = Assert<Equal<ContainsAny<typeof actual7>, false>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"151\",\"seed\":[\"b1535b67\",\"9dc51978\",\"e3aac7ad\",\"d0b87a42\"],\"source\":\"\\t21\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8cc790da\",\"636000b4\",\"59693613\",\"17859846\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":82,"rollTrace":[{"sideCount":21,"face":19},{"sideCount":21,"face":4},{"sideCount":68,"face":59}],"nextState":{"kind":"GeneratorState","words":["9953a6fd","b5a80667","956a91a2","e2bb7c54"]}}} as const;
const actual8 = evaluate("\t( 2d21 ) + ( d68 ) + 0\n", {"kind":"GeneratorState","words":["6d0d9fd9","1c441cfe","6f159ed2","37cd7e1c"]} as const, 4);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
type NoAnyParity8 = Assert<Equal<ContainsAny<typeof actual8>, false>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"152\",\"seed\":[\"b3b0c788\",\"c373d728\",\"8b47f783\",\"c3420658\"],\"source\":\"\\t( 2d21 ) + ( d68 ) + 0\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6d0d9fd9\",\"1c441cfe\",\"6f159ed2\",\"37cd7e1c\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["18b3b8a1","b5418293","e9f90df9","b701ee17"]}}} as const;
const actual9 = evaluate("\td10 - 1d60 - 2d91\n", {"kind":"GeneratorState","words":["18b3b8a1","b5418293","e9f90df9","b701ee17"]} as const, 0);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
type NoAnyParity9 = Assert<Equal<ContainsAny<typeof actual9>, false>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"153\",\"seed\":[\"67716f38\",\"185f0413\",\"e37e17dd\",\"113144ff\"],\"source\":\"\\td10 - 1d60 - 2d91\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"18b3b8a1\",\"b5418293\",\"e9f90df9\",\"b701ee17\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":36,"rollTrace":[{"sideCount":30,"face":28}],"nextState":{"kind":"GeneratorState","words":["b9f6f97b","dfc0e754","bf1cee5f","39d0d649"]}}} as const;
const actual10 = evaluate("8 + d30", {"kind":"GeneratorState","words":["70d1c361","a4e21f0b","0bf33b3e","6dc52511"]} as const, 4);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
type NoAnyParity10 = Assert<Equal<ContainsAny<typeof actual10>, false>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"154\",\"seed\":[\"5d7fe673\",\"978b03cb\",\"09b11e72\",\"659622ed\"],\"source\":\"8 + d30\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"70d1c361\",\"a4e21f0b\",\"0bf33b3e\",\"6dc52511\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":128,"partialTrace":[{"sideCount":94,"face":74},{"sideCount":94,"face":54}],"nextState":{"kind":"GeneratorState","words":["3f0b9ec8","a0ce49f8","bab78066","fb4d6a09"]}}} as const;
const actual11 = evaluate("2d94 + ( 2d13 )", {"kind":"GeneratorState","words":["f85b22d6","39f3849d","fe3a53d5","bf9c512e"]} as const, 2);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
type NoAnyParity11 = Assert<Equal<ContainsAny<typeof actual11>, false>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"155\",\"seed\":[\"d46f8582\",\"bf252a4d\",\"57fc681b\",\"8513c9e4\"],\"source\":\"2d94 + ( 2d13 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f85b22d6\",\"39f3849d\",\"fe3a53d5\",\"bf9c512e\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

