/**
 * 로그인 플로우 E2E 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('로그인 플로우', () => {
  test('관리자 로그인 성공', async ({ page }) => {
    await page.goto('/');

    // 로그인 폼 확인
    await expect(page.getByLabel('사용자명')).toBeVisible();
    await expect(page.getByLabel('역할')).toBeVisible();

    // 로그인 정보 입력
    await page.getByLabel('사용자명').fill('testuser');
    await page.getByLabel('역할').selectOption('admin');

    // 로그인 버튼 클릭
    await page.getByRole('button', { name: '로그인' }).click();

    // 리다이렉트 확인
    await expect(page).toHaveURL(/.*class-select/);
  });

  test('유효하지 않은 입력값으로 로그인 실패', async ({ page }) => {
    await page.goto('/');

    // 빈 사용자명으로 로그인 시도
    await page.getByRole('button', { name: '로그인' }).click();

    // 에러 메시지 확인
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

