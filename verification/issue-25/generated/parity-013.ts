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

const expected0 = {"ok":true,"value":{"total":-26,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["40b5f8a5","0be16cc0","2def9668","e547a483"]}}} as const;
const actual0 = evaluate("11 - 37", {"kind":"GeneratorState","words":["40b5f8a5","0be16cc0","2def9668","e547a483"]} as const, 0);
type ExactParity0 = Assert<Equal<typeof actual0, typeof expected0>>;
if (!deepEqual(actual0, expected0)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"156\",\"seed\":[\"5b9c8fa3\",\"8779d877\",\"329bafcc\",\"ab2383dd\"],\"source\":\"11 - 37\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"40b5f8a5\",\"0be16cc0\",\"2def9668\",\"e547a483\"]},\"maximumAttempts\":0}" + "\nactual=" + JSON.stringify(actual0) + "\nexpected=" + JSON.stringify(expected0));
}

const expected1 = {"ok":true,"value":{"total":4,"rollTrace":[{"sideCount":88,"face":32},{"sideCount":17,"face":16},{"sideCount":17,"face":12}],"nextState":{"kind":"GeneratorState","words":["30284f71","075cda30","42f38a2d","86ea9a7d"]}}} as const;
const actual1 = evaluate("\t( d88 ) - 2d17\n", {"kind":"GeneratorState","words":["3ad2332a","90daf349","ea14ac71","3c4fcb37"]} as const, 1);
type ExactParity1 = Assert<Equal<typeof actual1, typeof expected1>>;
if (!deepEqual(actual1, expected1)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"157\",\"seed\":[\"8bab99fe\",\"ea109334\",\"f6bb8eef\",\"6ba386dc\"],\"source\":\"\\t( d88 ) - 2d17\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"3ad2332a\",\"90daf349\",\"ea14ac71\",\"3c4fcb37\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual1) + "\nexpected=" + JSON.stringify(expected1));
}

const expected2 = {"ok":true,"value":{"total":45,"rollTrace":[{"sideCount":49,"face":45}],"nextState":{"kind":"GeneratorState","words":["7990d671","1db77f72","98fc51d9","bb0e8c27"]}}} as const;
const actual2 = evaluate("1d49", {"kind":"GeneratorState","words":["fd67b7a0","f1ba78ab","116ab079","754d197a"]} as const, 1);
type ExactParity2 = Assert<Equal<typeof actual2, typeof expected2>>;
if (!deepEqual(actual2, expected2)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"158\",\"seed\":[\"6746a786\",\"c571f5fd\",\"820b2b5a\",\"0b6305aa\"],\"source\":\"1d49\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"fd67b7a0\",\"f1ba78ab\",\"116ab079\",\"754d197a\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual2) + "\nexpected=" + JSON.stringify(expected2));
}

const expected3 = {"ok":true,"value":{"total":-38,"rollTrace":[{"sideCount":64,"face":57},{"sideCount":64,"face":2},{"sideCount":95,"face":22},{"sideCount":95,"face":28}],"nextState":{"kind":"GeneratorState","words":["33e5c862","f51cc9d6","278300be","ee8d3e6d"]}}} as const;
const actual3 = evaluate("2d64 - ( 2d95 ) - 47", {"kind":"GeneratorState","words":["31272bc2","230fafc5","6ca04eb3","74d057d1"]} as const, 1);
type ExactParity3 = Assert<Equal<typeof actual3, typeof expected3>>;
if (!deepEqual(actual3, expected3)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"159\",\"seed\":[\"30651ca3\",\"edd79e3b\",\"dc0ed753\",\"da723001\"],\"source\":\"2d64 - ( 2d95 ) - 47\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"31272bc2\",\"230fafc5\",\"6ca04eb3\",\"74d057d1\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual3) + "\nexpected=" + JSON.stringify(expected3));
}

const expected4 = {"ok":true,"value":{"total":47,"rollTrace":[],"nextState":{"kind":"GeneratorState","words":["c8e2a64a","e5356298","06907708","98200695"]}}} as const;
const actual4 = evaluate("\t50 - 35 + 32\n", {"kind":"GeneratorState","words":["c8e2a64a","e5356298","06907708","98200695"]} as const, 1);
type ExactParity4 = Assert<Equal<typeof actual4, typeof expected4>>;
if (!deepEqual(actual4, expected4)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"160\",\"seed\":[\"35cdd442\",\"67ffafe0\",\"d27f3ac1\",\"91c70a12\"],\"source\":\"\\t50 - 35 + 32\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"c8e2a64a\",\"e5356298\",\"06907708\",\"98200695\"]},\"maximumAttempts\":1}" + "\nactual=" + JSON.stringify(actual4) + "\nexpected=" + JSON.stringify(expected4));
}

const expected5 = {"ok":true,"value":{"total":-41,"rollTrace":[{"sideCount":32,"face":3},{"sideCount":91,"face":21},{"sideCount":91,"face":23}],"nextState":{"kind":"GeneratorState","words":["7194ede4","e780e09f","689a318d","d338c903"]}}} as const;
const actual5 = evaluate("\t( 1d32 ) - 2d91\n", {"kind":"GeneratorState","words":["f69510c0","c3ded4bd","e6796a1f","25cc9fd2"]} as const, 5);
type ExactParity5 = Assert<Equal<typeof actual5, typeof expected5>>;
if (!deepEqual(actual5, expected5)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"161\",\"seed\":[\"d438fe08\",\"b4cae574\",\"e4e63986\",\"590be5cd\"],\"source\":\"\\t( 1d32 ) - 2d91\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f69510c0\",\"c3ded4bd\",\"e6796a1f\",\"25cc9fd2\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual5) + "\nexpected=" + JSON.stringify(expected5));
}

const expected6 = {"ok":true,"value":{"total":1,"rollTrace":[{"sideCount":34,"face":12},{"sideCount":34,"face":9},{"sideCount":22,"face":3},{"sideCount":22,"face":17}],"nextState":{"kind":"GeneratorState","words":["eb5a4217","f838342e","4767bcc3","d3fbba01"]}}} as const;
const actual6 = evaluate("2d34 - 2d22", {"kind":"GeneratorState","words":["8febb58c","0887da56","7cb86852","362d8cc2"]} as const, 4);
type ExactParity6 = Assert<Equal<typeof actual6, typeof expected6>>;
if (!deepEqual(actual6, expected6)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"162\",\"seed\":[\"cab11830\",\"df5af18b\",\"ac11f6fe\",\"cb018cb9\"],\"source\":\"2d34 - 2d22\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"8febb58c\",\"0887da56\",\"7cb86852\",\"362d8cc2\"]},\"maximumAttempts\":4}" + "\nactual=" + JSON.stringify(actual6) + "\nexpected=" + JSON.stringify(expected6));
}

const expected7 = {"ok":true,"value":{"total":47,"rollTrace":[{"sideCount":59,"face":32},{"sideCount":59,"face":31},{"sideCount":8,"face":4},{"sideCount":8,"face":4}],"nextState":{"kind":"GeneratorState","words":["0eee0608","20d68074","35a92d4c","b27b140e"]}}} as const;
const actual7 = evaluate("( 2d59 ) + 2d8 - 24", {"kind":"GeneratorState","words":["f1a46a09","b19f3ee4","bee962cd","69dd5717"]} as const, 2);
type ExactParity7 = Assert<Equal<typeof actual7, typeof expected7>>;
if (!deepEqual(actual7, expected7)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"163\",\"seed\":[\"2166d3c1\",\"98cf478e\",\"77e94db1\",\"95b7115e\"],\"source\":\"( 2d59 ) + 2d8 - 24\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f1a46a09\",\"b19f3ee4\",\"bee962cd\",\"69dd5717\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual7) + "\nexpected=" + JSON.stringify(expected7));
}

const expected8 = {"ok":true,"value":{"total":62,"rollTrace":[{"sideCount":43,"face":23},{"sideCount":1,"face":1}],"nextState":{"kind":"GeneratorState","words":["1b6391e6","6dfab738","00677ef3","0a6900fb"]}}} as const;
const actual8 = evaluate("\t1d43 + 38 + d1\n", {"kind":"GeneratorState","words":["596414a4","c6d797fe","b691dc91","9bb15f9c"]} as const, 3);
type ExactParity8 = Assert<Equal<typeof actual8, typeof expected8>>;
if (!deepEqual(actual8, expected8)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"164\",\"seed\":[\"75b00045\",\"c2abc9b9\",\"c80a3a97\",\"644b3a5b\"],\"source\":\"\\t1d43 + 38 + d1\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"596414a4\",\"c6d797fe\",\"b691dc91\",\"9bb15f9c\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual8) + "\nexpected=" + JSON.stringify(expected8));
}

const expected9 = {"ok":true,"value":{"total":35,"rollTrace":[{"sideCount":85,"face":14}],"nextState":{"kind":"GeneratorState","words":["f35116fb","3a9dfa03","c9da57f6","eca2f168"]}}} as const;
const actual9 = evaluate("\t49 - d85\n", {"kind":"GeneratorState","words":["de4c82a5","63c847f5","87193f53","4ed5d3ab"]} as const, 5);
type ExactParity9 = Assert<Equal<typeof actual9, typeof expected9>>;
if (!deepEqual(actual9, expected9)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"165\",\"seed\":[\"92f682dc\",\"170952ca\",\"97518022\",\"4de7e288\"],\"source\":\"\\t49 - d85\\n\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"de4c82a5\",\"63c847f5\",\"87193f53\",\"4ed5d3ab\"]},\"maximumAttempts\":5}" + "\nactual=" + JSON.stringify(actual9) + "\nexpected=" + JSON.stringify(expected9));
}

const expected10 = {"ok":true,"value":{"total":19,"rollTrace":[{"sideCount":48,"face":19}],"nextState":{"kind":"GeneratorState","words":["db4957e9","603a7abf","1e543f89","70cbdae6"]}}} as const;
const actual10 = evaluate("1d48", {"kind":"GeneratorState","words":["87874e92","063c2936","e1811d1b","5af2304d"]} as const, 2);
type ExactParity10 = Assert<Equal<typeof actual10, typeof expected10>>;
if (!deepEqual(actual10, expected10)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"166\",\"seed\":[\"b81f224a\",\"d69fc041\",\"fc69164a\",\"0aa71a5a\"],\"source\":\"1d48\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"87874e92\",\"063c2936\",\"e1811d1b\",\"5af2304d\"]},\"maximumAttempts\":2}" + "\nactual=" + JSON.stringify(actual10) + "\nexpected=" + JSON.stringify(expected10));
}

const expected11 = {"ok":true,"value":{"total":8,"rollTrace":[{"sideCount":27,"face":17},{"sideCount":22,"face":22}],"nextState":{"kind":"GeneratorState","words":["74feeba7","29a314a3","e4e7109b","ba5b7b78"]}}} as const;
const actual11 = evaluate("13 + d27 - d22", {"kind":"GeneratorState","words":["f116f7af","2e8e626b","4a34e1fc","c471350c"]} as const, 3);
type ExactParity11 = Assert<Equal<typeof actual11, typeof expected11>>;
if (!deepEqual(actual11, expected11)) {
  throw new Error("property parity failure: " + "{\"generatorSeed\":39656677,\"replayPath\":\"167\",\"seed\":[\"78b5b231\",\"108d5c48\",\"db84388a\",\"ce3f8ec0\"],\"source\":\"13 + d27 - d22\",\"state\":{\"kind\":\"GeneratorState\",\"words\":[\"f116f7af\",\"2e8e626b\",\"4a34e1fc\",\"c471350c\"]},\"maximumAttempts\":3}" + "\nactual=" + JSON.stringify(actual11) + "\nexpected=" + JSON.stringify(expected11));
}

