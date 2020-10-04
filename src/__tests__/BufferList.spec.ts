import {BufferList} from '../BufferList';

it('can instantiate', () => {
  const list = new BufferList();
});

it('is zero length on start', () => {
  const list = new BufferList();
  expect(list.length).toBe(0);
});

it('throws when reading zero length list', () => {
  const list = new BufferList();
  expect(() => list.readUInt8(0)).toThrowError();
  expect(() => list.readUInt8(1)).toThrowError();
  expect(() => list.readUInt8(111)).toThrowError();
});

it('list is empty when it contains zero-length buffers', () => {
  const list = new BufferList();
  list.append(Buffer.from([]));
  expect(list.length).toBe(0);
  expect(() => list.readUInt8(0)).toThrowError();
  expect(() => list.readUInt8(1)).toThrowError();
  list.append(Buffer.from([]));
  expect(list.length).toBe(0);
  expect(() => list.readUInt8(0)).toThrowError();
  expect(() => list.readUInt8(1)).toThrowError();
});

it('can read from one-byte list', () => {
  const list = new BufferList();
  list.append(Buffer.from([1]));
  expect(list.length).toBe(1);
  expect(list.readUInt8(0)).toBe(1);
  expect(() => list.readUInt8(1)).toThrowError();
});

it('can read from a short list', () => {
  const list = new BufferList();
  list.append(Buffer.from([1, 2, 3]));
  expect(list.length).toBe(3);
  expect(list.readUInt8(0)).toBe(1);
  expect(list.readUInt8(1)).toBe(2);
  expect(list.readUInt8(2)).toBe(3);
  expect(() => list.readUInt8(4)).toThrowError();
  expect(() => list.readUInt8(5)).toThrowError();
  expect(() => list.readUInt8(-1)).toThrowError();
  expect(() => list.readUInt8(4.5)).toThrowError();
});

it('throws RangeError on out-of-bounds access', () => {
  const list = new BufferList();
  list.append(Buffer.from([1, 2, 3]));
  let error;
  try {
    list.readUInt8(3);
  } catch (err) {
    error = err;
  }
  expect(error).toBeInstanceOf(RangeError);
});

it('can read from second and third list items', () => {
  const list = new BufferList();
  list.append(Buffer.from([1]));
  list.append(Buffer.from([2]));
  list.append(Buffer.from([3]));
  expect(list.readUInt8(1)).toBe(2);
  expect(list.readUInt8(2)).toBe(3);
  expect(() => list.readUInt8(3)).toThrowError();
});

it('can consume bytes in single block', () => {
  const list = new BufferList();
  list.append(Buffer.from([1, 2, 3]));
  expect(list.readUInt8(0)).toBe(1);
  list.consume(1);
  expect(list.readUInt8(0)).toBe(2);
  list.consume(1);
  expect(list.readUInt8(0)).toBe(3);
});


it('can consume bytes in multiple blocks', () => {
  const list = new BufferList();
  list.append(Buffer.from([1]));
  list.append(Buffer.from([2]));
  list.append(Buffer.from([3]));
  expect(list.readUInt8(0)).toBe(1);
  list.consume(1);
  expect(list.readUInt8(0)).toBe(2);
  list.consume(1);
  expect(list.readUInt8(0)).toBe(3);
});

it('consuming out-of-bounds throws error', () => {
  const list = new BufferList();
  list.append(Buffer.from([1, 2, 3]));
  list.consume(1);
  list.consume(1);
  expect(() => list.consume(1)).toThrowError();
});

it('can read ui16', () => {
  const list = new BufferList();
  list.append(Buffer.from([0, 1]));
  expect(list.readUInt16BE(0)).toBe(1);
});

it('throws when reading i16 out of bounds', () => {
  const list = new BufferList();
  list.append(Buffer.from([0, 1]));
  expect(() => list.readUInt16BE(1)).toThrowError();
});

it('can read ui16 from adjacent buffers', () => {
  const list = new BufferList();
  list.append(Buffer.from([0, 0]));
  list.append(Buffer.from([1, 0]));
  expect(list.readUInt16BE(0)).toBe(0);
  expect(list.readUInt16BE(1)).toBe(1);
  expect(list.readUInt16BE(2)).toBe(256);
  list.consume(1);
  expect(list.readUInt16BE(0)).toBe(1);
  list.consume(1);
  expect(list.readUInt16BE(0)).toBe(256);
  list.consume(1);
  expect(() => list.consume(1)).toThrowError();
});

it('can read ui32 from adjacent buffers', () => {
  const list = new BufferList();
  list.append(Buffer.from([0, 0, 0]));
  list.append(Buffer.from([1, 1, 1]));
  expect(list.readUInt32BE(0)).toBe(1);
  expect(list.readUInt32BE(1)).toBe(257);
  expect(list.readUInt32BE(2)).toBe(65793);
  list.consume(1);
  expect(list.readUInt32BE(0)).toBe(257);
  expect(list.readUInt32BE(1)).toBe(65793);
  list.consume(1);
  expect(list.readUInt32BE(0)).toBe(65793);
});

it('can create slices from a single buffer', () => {
  const list = new BufferList();
  list.append(Buffer.from([1, 2, 3, 4, 5]));
  expect(list.slice(0, 2)).toEqual(Buffer.from([1, 2]));
  expect(list.slice(1, 1 + 3)).toEqual(Buffer.from([2, 3, 4]));
  expect(list.slice(2, 2 + 1)).toEqual(Buffer.from([3]));
});

it('can create slices from adjacent buffers', () => {
  const list = new BufferList();
  list.append(Buffer.from([1, 2, 3]));
  list.append(Buffer.from([4, 5, 6]));
  expect(list.slice(0, 2)).toEqual(Buffer.from([1, 2]));
  expect(list.slice(1, 1 + 3)).toEqual(Buffer.from([2, 3, 4]));
  expect(list.slice(2, 2 + 1)).toEqual(Buffer.from([3]));
  expect(list.slice(2, 2 + 3)).toEqual(Buffer.from([3, 4, 5]));
  expect(list.slice(0, 2)).toEqual(Buffer.from([1, 2]));
  expect(list.slice(1, 1 + 3)).toEqual(Buffer.from([2, 3, 4]));
  expect(list.slice(2, 2 + 1)).toEqual(Buffer.from([3]));

  const list2 = new BufferList();
  list2.append(Buffer.from([1, 2, 3]));
  list2.append(Buffer.from([4, 5, 6]));
  expect(list2.slice(0, 6)).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]));
  expect(list2.slice(1, 6)).toEqual(Buffer.from([2, 3, 4, 5, 6]));
  expect(list2.slice(2, 6)).toEqual(Buffer.from([3, 4, 5, 6]));
  expect(list2.slice(3, 6)).toEqual(Buffer.from([4, 5, 6]));
  expect(list2.slice(4, 6)).toEqual(Buffer.from([5, 6]));
  expect(list2.slice(5, 6)).toEqual(Buffer.from([6]));
  expect(list2.slice(6, 6)).toEqual(Buffer.from([]));

  expect(list.slice(0, 6)).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]));
  expect(list.slice(0, 5)).toEqual(Buffer.from([1, 2, 3, 4, 5]));
  expect(list.slice(0, 4)).toEqual(Buffer.from([1, 2, 3, 4]));
  expect(list.slice(0, 3)).toEqual(Buffer.from([1, 2, 3]));
  expect(list.slice(0, 2)).toEqual(Buffer.from([1, 2]));
  expect(list.slice(0, 1)).toEqual(Buffer.from([1]));
  expect(list.slice(0, 0)).toEqual(Buffer.from([]));

  expect(list.slice(0, 6)).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]));
  expect(list.slice(1, 5)).toEqual(Buffer.from([2, 3, 4, 5]));
  expect(list.slice(2, 4)).toEqual(Buffer.from([3, 4]));
  expect(list.slice(3, 3)).toEqual(Buffer.from([]));
});
