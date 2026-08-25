/* GENERATED FILE. Run pnpm generate:property-parity; do not edit by hand. */
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

const expected0 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":174,"partialTrace":[{"sideCount":97,"face":81},{"sideCount":97,"face":93}],"nextState":{"kind":"GeneratorState","words":["551fa9dd","98df470d","2528d723","8a77b0ab"]}}} as const;
const actual0 = evaluate("2d97", {"kind":"GeneratorState","words":["1b6004fb","0b69ec26","726624f3","50670ff6"]} as const, 5);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"168\",\"seed\":[\"c785737d\",\"54b61688\",\"5a8ceadb\",\"3d2acf30\"],\"source\":\"2d97\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1b6004fb\",\"0b69ec26\",\"726624f3\",\"50670ff6\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":27,"rollTrace":[{"sideCount":39,"face":27}],"nextState":{"kind":"GeneratorState","words":["2532a1c2","ff58b103","4f373fb1","d0e30023"]}}} as const;
const actual1 = evaluate("d39", {"kind":"GeneratorState","words":["2148bda2","c5baeab2","1baae613","c1c0f6d2"]} as const, 5);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"169\",\"seed\":[\"ae49c85b\",\"7f1e9cba\",\"3db8d53e\",\"c4ffd091\"],\"source\":\"d39\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"2148bda2\",\"c5baeab2\",\"1baae613\",\"c1c0f6d2\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":-8,"rollTrace":[{"sideCount":50,"face":19},{"sideCount":2,"face":2},{"sideCount":2,"face":1}],"nextState":{"kind":"GeneratorState","words":["668348c5","b1884021","93d43dfc","911e9a79"]}}} as const;
const actual2 = evaluate("d50 + 2d2 - 30", {"kind":"GeneratorState","words":["8907da69","21861ef7","563281a9","00e9f3b4"]} as const, 5);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"170\",\"seed\":[\"072ecfab\",\"05a3d806\",\"aac7cdb7\",\"3d5185ef\"],\"source\":\"d50 + 2d2 - 30\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8907da69\",\"21861ef7\",\"563281a9\",\"00e9f3b4\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":46,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["447cc297","67bfe8b9","01fa4ca4","9344bdbb"]}}} as const;
const actual3 = evaluate("46", {"kind":"GeneratorState","words":["447cc297","67bfe8b9","01fa4ca4","9344bdbb"]} as const, 2);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"171\",\"seed\":[\"0c524183\",\"c82275f2\",\"5512a13c\",\"27911566\"],\"source\":\"46\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"447cc297\",\"67bfe8b9\",\"01fa4ca4\",\"9344bdbb\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":14,"rollTrace":[{"sideCount":64,"face":22},{"sideCount":10,"face":8}],"nextState":{"kind":"GeneratorState","words":["13bf8ed1","e356b6f6","3a0c2f8e","36a60796"]}}} as const;
const actual4 = evaluate("( d64 ) - 1d10", {"kind":"GeneratorState","words":["567e33c6","d66a22e7","499c7859","616d4b30"]} as const, 5);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"172\",\"seed\":[\"473d707e\",\"cf6a5807\",\"0935bc72\",\"69cfc6cf\"],\"source\":\"( d64 ) - 1d10\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"567e33c6\",\"d66a22e7\",\"499c7859\",\"616d4b30\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":83,"rollTrace":[{"sideCount":75,"face":51},{"sideCount":75,"face":48},{"sideCount":26,"face":16}],"nextState":{"kind":"GeneratorState","words":["c23c9108","bdb9c256","3ed69ff2","9823d187"]}}} as const;
const actual5 = evaluate("\t2d75 - d26\n", {"kind":"GeneratorState","words":["f1d4727d","23709e34","0decf36d","1bac0fd9"]} as const, 5);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"173\",\"seed\":[\"1ebf6dd9\",\"9382bf3b\",\"48d21c29\",\"61b009c2\"],\"source\":\"\\t2d75 - d26\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f1d4727d\",\"23709e34\",\"0decf36d\",\"1bac0fd9\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":72,"rollTrace":[{"sideCount":57,"face":26},{"sideCount":57,"face":46}],"nextState":{"kind":"GeneratorState","words":["584977e5","2c589328","014a6f46","0e1922e4"]}}} as const;
const actual6 = evaluate("( 2d57 )", {"kind":"GeneratorState","words":["6d920ebd","df7bf5e9","3bbbdb3a","b6214f95"]} as const, 5);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"174\",\"seed\":[\"45257c1f\",\"be7bc0cc\",\"0a265c5d\",\"f41e0deb\"],\"source\":\"( 2d57 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"6d920ebd\",\"df7bf5e9\",\"3bbbdb3a\",\"b6214f95\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":60,"rollTrace":[{"sideCount":81,"face":60}],"nextState":{"kind":"GeneratorState","words":["2e3a98a1","65577f1c","43c1b286","2e37a18b"]}}} as const;
const actual7 = evaluate("\t( 1d81 )\n", {"kind":"GeneratorState","words":["1f5f5e55","ed65f99a","976dd8d3","dc003f6e"]} as const, 1);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"175\",\"seed\":[\"4eabccab\",\"d0e851b4\",\"810927bb\",\"1a3cbdc4\"],\"source\":\"\\t( 1d81 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1f5f5e55\",\"ed65f99a\",\"976dd8d3\",\"dc003f6e\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["3d43d389","ce2b36c0","4e3b6050","0d0f4f71"]}}} as const;
const actual8 = evaluate("2d50 - 2d54", {"kind":"GeneratorState","words":["3d43d389","ce2b36c0","4e3b6050","0d0f4f71"]} as const, 0);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"176\",\"seed\":[\"7de0ef3c\",\"60ecb8df\",\"091347a4\",\"5d191db7\"],\"source\":\"2d50 - 2d54\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"3d43d389\",\"ce2b36c0\",\"4e3b6050\",\"0d0f4f71\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":-4,"rollTrace":[{"sideCount":19,"face":14},{"sideCount":19,"face":9},{"sideCount":59,"face":25},{"sideCount":59,"face":24},{"sideCount":99,"face":76}],"nextState":{"kind":"GeneratorState","words":["5f3b02d1","a3cc8a1d","6294ed79","2e02308c"]}}} as const;
const actual9 = evaluate("\t2d19 + 2d59 - ( d99 )\n", {"kind":"GeneratorState","words":["c7920e4a","571b2d1b","7f58253c","d6e8d9d4"]} as const, 2);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"177\",\"seed\":[\"ba493456\",\"04b4fcd7\",\"fee47940\",\"48447566\"],\"source\":\"\\t2d19 + 2d59 - ( d99 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"c7920e4a\",\"571b2d1b\",\"7f58253c\",\"d6e8d9d4\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":59,"rollTrace":[{"sideCount":30,"face":7},{"sideCount":30,"face":18},{"sideCount":26,"face":13},{"sideCount":26,"face":21}],"nextState":{"kind":"GeneratorState","words":["f0681952","f09e1070","e49822a0","481a1bcb"]}}} as const;
const actual10 = evaluate("2d30 + 2d26", {"kind":"GeneratorState","words":["c575225e","30e5f272","0c1837bf","689e0e3f"]} as const, 3);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"178\",\"seed\":[\"0e26df1a\",\"6d7b4af8\",\"80ad55aa\",\"69181466\"],\"source\":\"2d30 + 2d26\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"c575225e\",\"30e5f272\",\"0c1837bf\",\"689e0e3f\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":2,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["f7b703a1","a8fa795b","44375718","6324d8bd"]}}} as const;
const actual11 = evaluate("( 1d75 ) + 32", {"kind":"GeneratorState","words":["f7b703a1","a8fa795b","44375718","6324d8bd"]} as const, 0);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"179\",\"seed\":[\"f1fcceaa\",\"6d1eed7e\",\"a69fd1e6\",\"c8c4c957\"],\"source\":\"( 1d75 ) + 32\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f7b703a1\",\"a8fa795b\",\"44375718\",\"6324d8bd\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

