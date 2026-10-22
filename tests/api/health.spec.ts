import { expect, test } from '@playwright/test';

test('[TP-DEMO-003] the health endpoint returns a successful status', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.status()).toBe(200);
  await expect(response).toBeOK();
  await expect(response.json()).resolves.toEqual({ status: 'ok' });
});
