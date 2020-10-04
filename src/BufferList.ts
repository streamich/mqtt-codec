export class BufferList {
  private list: Buffer[] = [];
  private offset: number = 0;
  public length: number = 0;

  public append(buf: Buffer) {
    const length = buf.length;
    if (!length) return;
    this.length += length;
    this.list.push(buf);
  }

  public consume(size: number) {
    this.offset += size;
    this.length -= size;
    while (this.offset >= this.list[0].length) {
      this.offset -= this.list[0].length;
      this.list.shift();
    }
  }

  public find(offset: number): [index: number, offset: number] {
    if (offset > this.length) throw new RangeError();
    offset += this.offset;
    for (let i = 0; i < this.list.length; i++) {
      const buf = this.list[i];
      if (buf.length > offset) return [i, offset];
      offset -= buf.length;
    }
    throw new RangeError();
  }

  public frame(start: number, end: number): [buf: Buffer, offset: number] {
    if (end > this.length) throw new RangeError();
    const size = end - start;
    const [i, offset] = this.find(start);
    let buf = this.list[i];
    let len = buf.length - offset;
    if (len >= size) return [buf, offset];
    const concat = [buf];
    let j = i;
    while (len < size) {
      j++;
      buf = this.list[j];
      len += buf.length;
      concat.push(buf);
    }
    const frame = Buffer.concat(concat);
    this.list.splice(i, concat.length, frame);
    return [frame, offset];
  }

  public slice(start: number, end: number): Buffer {
    if (start === end) return Buffer.from([]);
    const [buf, offset] = this.frame(start, end);
    return buf.slice(offset, offset + end - start);
  }

  public readUInt8(offset: number): number {
    const [i, pos] = this.find(offset);
    const buf = this.list[i];
    return buf.readUInt8(pos);
  }

  public readUInt16BE(offset: number): number {
    const [buf, pos] = this.frame(offset, offset + 2);
    return buf.readUInt16BE(pos);
  }

  public readUInt32BE(offset: number): number {
    const [buf, pos] = this.frame(offset, offset + 4);
    return buf.readUInt32BE(pos);
  }
}
