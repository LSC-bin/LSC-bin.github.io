import { logger } from './logger'

export type ErrorContext = {
  component?: string
  action?: string
  metadata?: Record<string, unknown>
}

/**
 * 에러를 안전하게 처리하고 로깅합니다.
 * 프로덕션 환경에서는 민감한 정보를 제거합니다.
 */
export const handleError = (error: unknown, context?: ErrorContext): void => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  // 프로덕션 환경에서는 스택 트레이스를 제거
  const sanitizedError = import.meta.env.PROD
    ? {
        message: errorMessage,
        // 스택 트레이스는 개발 환경에서만
      }
    : {
        message: errorMessage,
        stack: errorStack,
      }

  logger.error('Application error', {
    error: sanitizedError,
    context: context?.component,
    action: context?.action,
    ...context?.metadata,
  })
}

/**
 * Firebase 에러 코드를 한국어 메시지로 변환
 */
const getFirebaseErrorMessage = (code: string): string => {
  const errorMap: Record<string, string> = {
    // 인증 에러
    'auth/user-not-found': '사용자를 찾을 수 없습니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'auth/operation-not-allowed': '이 작업은 허용되지 않습니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    
    // Firestore 에러
    'permission-denied': '이 작업을 수행할 권한이 없습니다.',
    'not-found': '요청한 데이터를 찾을 수 없습니다.',
    'already-exists': '이미 존재하는 데이터입니다.',
    'resource-exhausted': '서버 리소스가 부족합니다. 잠시 후 다시 시도해주세요.',
    'failed-precondition': '작업을 수행하기 위한 조건이 충족되지 않았습니다.',
    'aborted': '작업이 취소되었습니다.',
    'out-of-range': '요청 범위를 벗어났습니다.',
    'unimplemented': '아직 구현되지 않은 기능입니다.',
    'internal': '서버 내부 오류가 발생했습니다.',
    'unavailable': '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
    'deadline-exceeded': '요청 시간이 초과되었습니다.',
    'unauthenticated': '인증이 필요합니다.',
    'cancelled': '작업이 취소되었습니다.',
  }
  
  return errorMap[code] || '알 수 없는 오류가 발생했습니다.'
}

/**
 * 사용자에게 표시할 친화적인 에러 메시지를 생성합니다.
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    const errorCode = (error as { code?: string }).code

    // Firebase 에러 코드가 있는 경우
    if (errorCode && typeof errorCode === 'string') {
      const friendlyMessage = getFirebaseErrorMessage(errorCode)
      if (friendlyMessage !== '알 수 없는 오류가 발생했습니다.') {
        return friendlyMessage
      }
    }

    // 네트워크 에러
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return '네트워크 연결을 확인해주세요.'
    }

    // 권한 에러
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return '이 작업을 수행할 권한이 없습니다.'
    }

    // Firebase 인증 에러 (코드가 없는 경우)
    if (message.includes('auth')) {
      if (message.includes('user-not-found')) {
        return '사용자를 찾을 수 없습니다.'
      }
      if (message.includes('wrong-password') || message.includes('invalid-credential')) {
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      }
      if (message.includes('email-already-in-use')) {
        return '이미 사용 중인 이메일입니다.'
      }
      if (message.includes('weak-password')) {
        return '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.'
      }
      return '인증 중 오류가 발생했습니다.'
    }

    // Firestore 에러
    if (message.includes('firestore') || message.includes('firebase')) {
      if (message.includes('permission')) {
        return '이 작업을 수행할 권한이 없습니다.'
      }
      if (message.includes('not-found')) {
        return '요청한 데이터를 찾을 수 없습니다.'
      }
      return '데이터를 불러오는 중 오류가 발생했습니다.'
    }

    // 타임아웃 에러
    if (message.includes('timeout') || message.includes('deadline')) {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    }

    // 일반적인 에러
    return '작업을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.'
  }

  return '알 수 없는 오류가 발생했습니다.'
}

