/**
 * HTML Sanitization 유틸리티
 * XSS 공격 방지를 위한 입력값 정제
 */

import DOMPurify from 'dompurify';

/**
 * 텍스트 입력 sanitize (HTML 태그 제거)
 */
function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * 사용자 입력값 sanitize (일반 텍스트)
 * 현재 사용 중인 함수
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  return sanitizeText(input)
    .trim()
    .substring(0, maxLength);
}

