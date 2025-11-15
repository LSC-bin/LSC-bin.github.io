/**
 * Vitest 설정 파일
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// jest-dom matchers 추가
expect.extend(matchers);

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup();
  localStorage.clear();
});
