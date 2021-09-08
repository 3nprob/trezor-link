import * as ProtoBuf from "protobufjs-old-fixed-webpack";

const { ByteBuffer } = ProtoBuf;

let patched = false;

// monkey-patching ProtoBuf,
// so that bytes are loaded and decoded from hexadecimal
// when we expect bytes and we get string
export function patch() {
  if (!patched) {
    // @ts-ignore
    ProtoBuf.Reflect.Message.Field.prototype.verifyValueOriginal =
      ProtoBuf.Reflect.Message.Field.prototype.verifyValue;

    // note: don't rewrite this function to arrow (value, skipRepeated) => ....
    // since I need `this` from the original context
    // @ts-ignore
    ProtoBuf.Reflect.Message.Field.prototype.verifyValue = function (
      value,
      skipRepeated
    ) {
      let newValue = value;
      if (this.type === ProtoBuf.TYPES.bytes) {
        if (value != null) {
          if (typeof value === `string`) {
            // @ts-ignore
            newValue = ByteBuffer.wrap(value, `hex`);
          }
        }
      }
      return this.verifyValueOriginal(newValue, skipRepeated);
    };
  }
  patched = true;
}
