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

const expected0 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["01871a77","2c4f8bca","a624f8fd","474f7dac"]}}} as const;
const actual0 = evaluate("2d55", {"kind":"GeneratorState","words":["01871a77","2c4f8bca","a624f8fd","474f7dac"]} as const, 0);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"180\",\"seed\":[\"81a94c50\",\"ac401061\",\"67c08fa7\",\"b0bec31d\"],\"source\":\"2d55\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"01871a77\",\"2c4f8bca\",\"a624f8fd\",\"474f7dac\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":14,"dimension":"arithmetic-magnitude","limit":100,"actual":117,"partialTrace":[{"sideCount":17,"face":7},{"sideCount":88,"face":71},{"sideCount":88,"face":46}],"nextState":{"kind":"GeneratorState","words":["5c8a34db","7aa4f58b","23986e1d","7036e410"]}}} as const;
const actual1 = evaluate("29 + 1d17 - ( 2d88 )", {"kind":"GeneratorState","words":["709de3bb","39184027","d21a7c10","be4e1a2d"]} as const, 4);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"181\",\"seed\":[\"4cdb414e\",\"baa0f5d7\",\"2752bc9a\",\"68f95bba\"],\"source\":\"29 + 1d17 - ( 2d88 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"709de3bb\",\"39184027\",\"d21a7c10\",\"be4e1a2d\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":40,"rollTrace":[{"sideCount":42,"face":35},{"sideCount":42,"face":24},{"sideCount":69,"face":33},{"sideCount":30,"face":11},{"sideCount":30,"face":3}],"nextState":{"kind":"GeneratorState","words":["39fca9b8","4d85b7ba","76cf6553","ce2cb52e"]}}} as const;
const actual2 = evaluate("( 2d42 ) - 1d69 + ( 2d30 )", {"kind":"GeneratorState","words":["643344b2","7e3f0e3b","619b8fb7","9821722d"]} as const, 2);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"182\",\"seed\":[\"fe680da4\",\"0442bb0a\",\"375981fb\",\"ebbaab48\"],\"source\":\"( 2d42 ) - 1d69 + ( 2d30 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"643344b2\",\"7e3f0e3b\",\"619b8fb7\",\"9821722d\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":7,"rollTrace":[{"sideCount":24,"face":7}],"nextState":{"kind":"GeneratorState","words":["95f93fbc","c66ba15a","1c69f6f4","94269507"]}}} as const;
const actual3 = evaluate("d24", {"kind":"GeneratorState","words":["350bbb6e","f0150bae","0375119a","50e78f7c"]} as const, 4);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"183\",\"seed\":[\"8f9b2eca\",\"a201668b\",\"54d87d83\",\"366e36d7\"],\"source\":\"d24\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"350bbb6e\",\"f0150bae\",\"0375119a\",\"50e78f7c\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":105,"partialTrace":[{"sideCount":61,"face":59},{"sideCount":61,"face":46}],"nextState":{"kind":"GeneratorState","words":["9afd0363","3626812f","891977fe","8a4d3612"]}}} as const;
const actual4 = evaluate("2d61 - 46", {"kind":"GeneratorState","words":["f6467226","04b51fea","6165391d","aa5f2709"]} as const, 3);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"184\",\"seed\":[\"b78ae924\",\"bf6d9213\",\"a8d16404\",\"0e6563ac\"],\"source\":\"2d61 - 46\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f6467226\",\"04b51fea\",\"6165391d\",\"aa5f2709\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":11,"dimension":"arithmetic-magnitude","limit":100,"actual":110,"partialTrace":[{"sideCount":40,"face":24},{"sideCount":40,"face":35},{"sideCount":38,"face":8},{"sideCount":38,"face":22}],"nextState":{"kind":"GeneratorState","words":["7459f70e","6e7ac5e5","0319e917","6a1b93c4"]}}} as const;
const actual5 = evaluate("\t2d40 + 21 + 2d38\n", {"kind":"GeneratorState","words":["83053835","05e204fd","37c5b1b7","772581ac"]} as const, 3);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"185\",\"seed\":[\"5a8a1861\",\"2940a0e2\",\"96c337cc\",\"f76335f1\"],\"source\":\"\\t2d40 + 21 + 2d38\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"83053835\",\"05e204fd\",\"37c5b1b7\",\"772581ac\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":11,"dimension":"arithmetic-magnitude","limit":100,"actual":115,"partialTrace":[{"sideCount":55,"face":25},{"sideCount":62,"face":45},{"sideCount":62,"face":34}],"nextState":{"kind":"GeneratorState","words":["0d7dfd88","8072a106","b00f7630","8c52c048"]}}} as const;
const actual6 = evaluate("\t1d55 + 11 + 2d62\n", {"kind":"GeneratorState","words":["1ba65141","743d4fa0","3d706437","4632aa77"]} as const, 1);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"186\",\"seed\":[\"15bea8cb\",\"d452bb98\",\"e71ebb08\",\"3f8bc5d7\"],\"source\":\"\\t1d55 + 11 + 2d62\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1ba65141\",\"743d4fa0\",\"3d706437\",\"4632aa77\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["b1c7f69b","f350e128","0b998f0c","aa9585eb"]}}} as const;
const actual7 = evaluate("\t1d28 + 2d12 + 1d70\n", {"kind":"GeneratorState","words":["b1c7f69b","f350e128","0b998f0c","aa9585eb"]} as const, 0);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"187\",\"seed\":[\"0da1e531\",\"11fc6bf2\",\"0cced3d3\",\"002fc9a9\"],\"source\":\"\\t1d28 + 2d12 + 1d70\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"b1c7f69b\",\"f350e128\",\"0b998f0c\",\"aa9585eb\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":45,"rollTrace":[{"sideCount":67,"face":8},{"sideCount":41,"face":2},{"sideCount":41,"face":21}],"nextState":{"kind":"GeneratorState","words":["fc8098d0","57d96820","d1651966","d3d55fbb"]}}} as const;
const actual8 = evaluate("\t30 - d67 + 2d41\n", {"kind":"GeneratorState","words":["8f27997c","f086c2ad","95fa678a","89e43e3a"]} as const, 1);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"188\",\"seed\":[\"4a9b88f5\",\"4b2393d7\",\"1274801b\",\"cc838520\"],\"source\":\"\\t30 - d67 + 2d41\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8f27997c\",\"f086c2ad\",\"95fa678a\",\"89e43e3a\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":38,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["1442e141","51723e51","a556e305","abfc6af7"]}}} as const;
const actual9 = evaluate("38", {"kind":"GeneratorState","words":["1442e141","51723e51","a556e305","abfc6af7"]} as const, 4);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"189\",\"seed\":[\"64be12aa\",\"7b8b3a3f\",\"85565f79\",\"99925c85\"],\"source\":\"38\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"1442e141\",\"51723e51\",\"a556e305\",\"abfc6af7\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":36,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["15cd1b49","539a53a9","51c12c2c","dc263716"]}}} as const;
const actual10 = evaluate("\t36\n", {"kind":"GeneratorState","words":["15cd1b49","539a53a9","51c12c2c","dc263716"]} as const, 0);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"190\",\"seed\":[\"67302384\",\"0b52d6a4\",\"6149b287\",\"b436586b\"],\"source\":\"\\t36\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"15cd1b49\",\"539a53a9\",\"51c12c2c\",\"dc263716\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":-23,"rollTrace":[{"sideCount":24,"face":8},{"sideCount":24,"face":17},{"sideCount":31,"face":30},{"sideCount":31,"face":18}],"nextState":{"kind":"GeneratorState","words":["bff5c122","57a5b697","3a34738c","943f4fbf"]}}} as const;
const actual11 = evaluate("\t2d24 - ( 2d31 )\n", {"kind":"GeneratorState","words":["142f2bf0","8b9c5da6","527f8f28","57a62fac"]} as const, 5);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"191\",\"seed\":[\"2b58f054\",\"9f1f355d\",\"4f219967\",\"fda5ab41\"],\"source\":\"\\t2d24 - ( 2d31 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"142f2bf0\",\"8b9c5da6\",\"527f8f28\",\"57a62fac\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

