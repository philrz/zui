import { createTransformStream, zq } from './zq';
import { getPath } from '@brimdata/sample-data';
import { createReadStream } from 'fs';

if (process.env['GITHUB_ACTIONS'] === 'true') {
  jest.setTimeout(30_000);
}

test('zq with a bad zed ', async () => {
  const path = getPath('prs.json');
  const promise = zq({
    query: 'over this | isNull(*) | head 10',
    as: 'zjson',
    input: createReadStream(path),
  });

  await expect(promise).rejects.toThrowError('error parsing Zed');
});
