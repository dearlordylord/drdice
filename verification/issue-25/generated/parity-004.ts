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

const expected0 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":9,"dimension":"arithmetic-magnitude","limit":100,"actual":152,"partialTrace":[{"sideCount":63,"face":59},{"sideCount":80,"face":47},{"sideCount":80,"face":46}],"nextState":{"kind":"GeneratorState","words":["d2f8b5d1","394a4058","cc1cd425","64501264"]}}} as const;
const actual0 = evaluate("\t( d63 ) + 2d80\n", {"kind":"GeneratorState","words":["3b7fdc16","b2211572","f4b3a0ef","98df566b"]} as const, 3);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"48\",\"seed\":[\"f1bd8483\",\"649546b5\",\"44339214\",\"f8502cac\"],\"source\":\"\\t( d63 ) + 2d80\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"3b7fdc16\",\"b2211572\",\"f4b3a0ef\",\"98df566b\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":56,"rollTrace":[{"sideCount":28,"face":10},{"sideCount":28,"face":16},{"sideCount":32,"face":3},{"sideCount":43,"face":4},{"sideCount":43,"face":29}],"nextState":{"kind":"GeneratorState","words":["da908335","322f5e82","9b89448c","c209ae59"]}}} as const;
const actual1 = evaluate("2d28 - 1d32 + 2d43", {"kind":"GeneratorState","words":["28895dbf","bd58b6b3","fc95dfcf","33b4a1f9"]} as const, 3);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"49\",\"seed\":[\"76af4e07\",\"7293d7b0\",\"04dfa3c2\",\"e454e9b1\"],\"source\":\"2d28 - 1d32 + 2d43\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"28895dbf\",\"bd58b6b3\",\"fc95dfcf\",\"33b4a1f9\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["92a2fd89","162ad428","053b7e63","f5b61c14"]}}} as const;
const actual2 = evaluate("\t2d43 - 26 - ( 2d2 )\n", {"kind":"GeneratorState","words":["92a2fd89","162ad428","053b7e63","f5b61c14"]} as const, 0);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"50\",\"seed\":[\"07d13aa3\",\"302c16c1\",\"ec7998db\",\"33307a2a\"],\"source\":\"\\t2d43 - 26 - ( 2d2 )\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"92a2fd89\",\"162ad428\",\"053b7e63\",\"f5b61c14\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":-59,"rollTrace":[{"sideCount":63,"face":8},{"sideCount":63,"face":26},{"sideCount":87,"face":44}],"nextState":{"kind":"GeneratorState","words":["c1d882ae","a7fa8666","50a67dd8","01420772"]}}} as const;
const actual3 = evaluate("\t19 - 2d63 - 1d87\n", {"kind":"GeneratorState","words":["0fe75104","2d56a525","9caac8a9","f2fe9cba"]} as const, 3);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"51\",\"seed\":[\"2c4d3924\",\"e6566e90\",\"5b0b1112\",\"1c00fd46\"],\"source\":\"\\t19 - 2d63 - 1d87\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0fe75104\",\"2d56a525\",\"9caac8a9\",\"f2fe9cba\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":-7,"rollTrace":[{"sideCount":65,"face":10}],"nextState":{"kind":"GeneratorState","words":["cd0e760c","cac660d2","adef3dc0","10ac1331"]}}} as const;
const actual4 = evaluate("\t3 - d65\n", {"kind":"GeneratorState","words":["ab2c638e","d1db7912","b0317a4e","b7f96c90"]} as const, 5);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"52\",\"seed\":[\"aea025a0\",\"e89a65ea\",\"20c988d9\",\"2b86a630\"],\"source\":\"\\t3 - d65\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"ab2c638e\",\"d1db7912\",\"b0317a4e\",\"b7f96c90\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":3,"rollTrace":[{"sideCount":19,"face":4},{"sideCount":1,"face":1}],"nextState":{"kind":"GeneratorState","words":["73a9e594","817cdc78","f51ed9be","1ad5a5d9"]}}} as const;
const actual5 = evaluate("d19 - ( d1 )", {"kind":"GeneratorState","words":["a6cf357a","e850d358","d9ee6fe4","86155902"]} as const, 1);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"53\",\"seed\":[\"0d7cfe08\",\"c50b5d96\",\"7980938a\",\"15cd2832\"],\"source\":\"d19 - ( d1 )\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"a6cf357a\",\"e850d358\",\"d9ee6fe4\",\"86155902\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":6,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["bc8c0944","e297e784","64035679","b8ccf2ef"]}}} as const;
const actual6 = evaluate("\t31 - 1d89\n", {"kind":"GeneratorState","words":["bc8c0944","e297e784","64035679","b8ccf2ef"]} as const, 0);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"54\",\"seed\":[\"3d0b9424\",\"be694f83\",\"64b5edaf\",\"f90c44cf\"],\"source\":\"\\t31 - 1d89\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"bc8c0944\",\"e297e784\",\"64035679\",\"b8ccf2ef\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":32,"rollTrace":[{"sideCount":42,"face":41},{"sideCount":42,"face":7}],"nextState":{"kind":"GeneratorState","words":["b95be9e2","6da533d1","263132a8","aee04b53"]}}} as const;
const actual7 = evaluate("\t( 2d42 ) - 16\n", {"kind":"GeneratorState","words":["3d36b50e","606f723a","f32b344d","8e77f2df"]} as const, 1);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"55\",\"seed\":[\"3eed5d4e\",\"3dde2a6c\",\"eae91285\",\"df830df9\"],\"source\":\"\\t( 2d42 ) - 16\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"3d36b50e\",\"606f723a\",\"f32b344d\",\"8e77f2df\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":0,"dimension":"arithmetic-magnitude","limit":100,"actual":103,"partialTrace":[{"sideCount":69,"face":64},{"sideCount":69,"face":39}],"nextState":{"kind":"GeneratorState","words":["d4104b0d","2ffe7f04","f22e4760","aefc3886"]}}} as const;
const actual8 = evaluate("2d69", {"kind":"GeneratorState","words":["38b0082f","42d4f78e","c6540fc5","bea16b2b"]} as const, 1);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"56\",\"seed\":[\"35a0e89d\",\"3ed8c444\",\"ec5abaec\",\"dbeb8a8f\"],\"source\":\"2d69\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"38b0082f\",\"42d4f78e\",\"c6540fc5\",\"bea16b2b\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":0,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["581dff95","c9e87abb","0a0fb6a5","ca02d724"]}}} as const;
const actual9 = evaluate("d36", {"kind":"GeneratorState","words":["581dff95","c9e87abb","0a0fb6a5","ca02d724"]} as const, 0);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"57\",\"seed\":[\"64035cf5\",\"fc229c5b\",\"5a9cda6f\",\"fbfa0a67\"],\"source\":\"d36\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"581dff95\",\"c9e87abb\",\"0a0fb6a5\",\"ca02d724\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":false,"code":"resource-limit-exceeded","details":{"kind":"resource","code":"resource-limit-exceeded","offset":6,"dimension":"arithmetic-magnitude","limit":100,"actual":179,"partialTrace":[{"sideCount":25,"face":8},{"sideCount":99,"face":87},{"sideCount":99,"face":92}],"nextState":{"kind":"GeneratorState","words":["509fe967","155bf3ad","1729252a","2a604007"]}}} as const;
const actual10 = evaluate("d25 - 2d99 + d75", {"kind":"GeneratorState","words":["0391af33","6313ad3a","2c06d0cb","a10803b4"]} as const, 1);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"58\",\"seed\":[\"50584f35\",\"6e66beaa\",\"8fc7ec13\",\"3af31311\"],\"source\":\"d25 - 2d99 + d75\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"0391af33\",\"6313ad3a\",\"2c06d0cb\",\"a10803b4\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":false,"code":"sampling-attempts-exhausted","details":{"kind":"evaluation","code":"sampling-attempts-exhausted","offset":1,"maximumAttempts":0,"attempts":0,"partialTrace":[],"nextState":{"kind":"GeneratorState","words":["5fd0cf99","c9fc784d","a44df419","532a1104"]}}} as const;
const actual11 = evaluate("\t2d91 + 6 - 8\n", {"kind":"GeneratorState","words":["5fd0cf99","c9fc784d","a44df419","532a1104"]} as const, 0);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"59\",\"seed\":[\"3df1de2d\",\"c0bbdbd7\",\"c3eda0d7\",\"89181eac\"],\"source\":\"\\t2d91 + 6 - 8\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"5fd0cf99\",\"c9fc784d\",\"a44df419\",\"532a1104\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

