import {parseProps as v1} from '../v1';
import {genProps} from '../../genProps';
import {allProps} from '../../../__tests__/util';

const versions = [v1];
const buf = genProps(allProps);

for (let i = 0; i < versions.length; i++) {
  const version = versions[i];
  describe(`parseProps v${i + 1}`, () => {
    test('can parse all property types', () => {
      const props = version(buf, 0)[0];
      expect(props).toEqual(allProps);
    });
  });
}
