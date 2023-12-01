import { test, expect } from '@playwright/test';
import { getPath } from 'zui-test-data';
import TestApp from '../helpers/test-app';

test.describe('Query tests', () => {
  const app = new TestApp('Query tests');

  test.beforeAll(async () => {
    await app.init();
    await app.createPool([getPath('sample.tsv')]);
    await app.click('button', 'Query Pool');
  });

  test.afterAll(async () => {
    await app.shutdown();
  });

  test('session queries are the default and ordered properly in history', async () => {
    await app.query('1');
    await app.query('2');
    await app.query('3');
    const history = await app.mainWin.locator(
      '[aria-label="history-pane"] [role="treeitem"]'
    );
    const entries = await history.evaluateAll<string[], HTMLElement>((nodes) =>
      nodes.map((n) => n.innerText.trim().replaceAll(/\s+/g, ' '))
    );
    const expected = [
      "from 'sample.tsv' | 3 now",
      "from 'sample.tsv' | 2 now",
      "from 'sample.tsv' | 1 now",
    ];
    expect(entries).toEqual(expected);
  });

  test("named queries' creation, modification, update/save, proper outdated status display", async () => {
    const titleBar = app.mainWin.getByTestId('title-bar');
    // creation
    await titleBar.getByRole('button', { name: 'Save' }).click();
    await titleBar
      .locator('[placeholder="Query name\\.\\.\\."]')
      .fill('Test Query Name');
    await titleBar.getByRole('button', { name: 'Create' }).click();
    await expect(
      app.mainWin.getByRole('heading', { name: 'Test Query Name' })
    ).toBeVisible();
    await expect(
      await titleBar.getByRole('button', { name: 'Test Query Name' })
    ).toBeVisible();

    // modification
    await app.query('4');
    await expect(
      await titleBar.getByRole('button', { name: 'Test Query Name *' })
    ).toBeVisible();

    // update
    await titleBar.getByRole('button', { name: 'Update' }).click();
    await expect(
      await titleBar.getByRole('button', { name: 'Test Query Name' })
    ).toBeVisible();

    // outdated display
    await app.mainWin
      .locator('div[aria-label="history-pane"] p >> nth=2')
      .click();
    await expect(
      await app.mainWin.locator('text=Test Query Name Outdated')
    ).toBeVisible();
  });

  test('named query, save as => new named query', async () => {
    const titleBar = app.mainWin.getByTestId('title-bar');
    await app.click('button', 'Save As');
    await titleBar
      .locator('[placeholder="Query name\\.\\.\\."]')
      .fill('Another Test Query');

    await app.setEditor('another test query zed value');
    await titleBar.getByRole('button', { name: 'Create' }).click();
    await titleBar.getByText(/Another Test Query/).waitFor();
  });
});