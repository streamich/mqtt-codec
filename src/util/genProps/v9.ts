import {Properties} from '../../types';
import {getPropsLen} from './getPropsLen';
import {writeProps} from './writeProps';

export const genProps = (props: Properties): Buffer => {
  const size = getPropsLen(props);
  const buf: Buffer = Buffer.allocUnsafe(size);
  return writeProps(props, buf, 0, size);
};
