import { expect, test } from '@playwright/test';
import TestApp from '../helpers/test-app';
import { getPath } from 'zui-test-data';

test.describe('Pool Loads', () => {
  const app = new TestApp('Pool Loads');

  test.beforeAll(async () => {
    await app.init();
  });

  test.afterAll(async () => {
    await app.shutdown();
  });

  test('bad data displays an error message', async () => {
    await app.dropFile(getPath('soccer-ball.png'));
    app.sleep(5);
    await app.attached(/Format Detection Error/i);
    app.sleep(5);
    expect(app.locate('button', 'Load').isDisabled);
  });
});
