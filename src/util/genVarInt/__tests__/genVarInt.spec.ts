import {genVarInt as v1} from '../v1';
import {genVarInt as v2} from '../v2';
import {genVarInt as v3} from '../v3';
import {genVarInt as v4} from '../v4';
import {genVarInt as v5} from '../v5';
import {parseVarInt} from '../../parse';

const generators = [v1, v2, v3, v4, v5];

for (let i = 0; i < generators.length; i++) {
  const genVarInt = generators[i];
  describe(`genVarInt v${i + 1}`, () => {
    test('bytes', () => {
      expect(parseVarInt(genVarInt(0), 0)[0]).toBe(0);
      expect(parseVarInt(genVarInt(244), 0)[0]).toBe(244);
      expect(parseVarInt(genVarInt(244 * 0xFF), 0)[0]).toBe(244 * 0xFF);
      expect(parseVarInt(genVarInt(244 * 0xFFFF), 0)[0]).toBe(244 * 0xFFFF);
    });

    test('can generate and then parse variable length int', () => {
      const check = (num: number) => expect(parseVarInt(genVarInt(num), 0)[0]).toBe(num);
      check(0);
      check(1);
      check(2);
      check(3);
      check(126);
      check(127);
      check(128);
      check(129);
      check(254);
      check(255);
      check(256);
      check(257);
      check(1234);
      check(12345);
      check(123456);
      check(1234567);
      check(12345678);
      check(123456789);
      check(0xf);
      check(0xff);
      check(0xfff);
      check(0xffff);
      check(0xfffff);
      check(0xffffff);
      check(0xfffffff);
      check(0xa);
      check(0xaa);
      check(0xaaa);
      check(0xaaaa);
      check(0xaaaaa);
      check(0xaaaaaa);
      check(0xaaaaaaa);
    });

    test('loop through values', () => {
      const max = 3e6;
      for (let i = 0; i < max; i++) {
        if (i !== parseVarInt(genVarInt(i), 0)[0])
          throw Error(`Invalid parsing ${i}`);
      }
    });
  });
}
