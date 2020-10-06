export const genVarInt = (num: number): Buffer => {
  const maxLength = 4;
  const bytes: number[] = [];
  let digit = 0;
  let pos = 0;

  do {
    digit = num % 128 | 0
    num = num / 128 | 0
    if (num > 0) digit = digit | 0x80

    bytes.push(digit);
  } while (num > 0 && pos < maxLength)

  if (num > 0) {
    pos = 0
  }

  return Buffer.from(bytes);
};
