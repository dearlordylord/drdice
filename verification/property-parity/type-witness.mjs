export const TYPE_WITNESS_SOURCE = `type Equal<Left, Right> =
  [Left] extends [Right] ? [Right] extends [Left] ? true : false : false;
type IsAny<Value> = 0 extends (1 & Value) ? true : false;
type ContainsAny<Value> =
  IsAny<Value> extends true ? true
    : Value extends readonly unknown[] ? ContainsAny<Value[number]>
      : Value extends object
        ? true extends { [Key in keyof Value]: ContainsAny<Value[Key]> }[keyof Value] ? true : false
        : false;
type Assert<Value extends true> = Value;`;
