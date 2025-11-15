import {
  collection,
  doc,
  getFirestore,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type WithFieldValue,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { z } from 'zod'

import { logger } from '../logger'
import { getFirebaseApp } from './app'

let firestoreInstance: Firestore | null = null

const getDb = (): Firestore => {
  if (firestoreInstance) {
    return firestoreInstance
  }

  firestoreInstance = getFirestore(getFirebaseApp())
  return firestoreInstance
}

/**
 * Zod 스키마를 사용하여 타입 안전한 Firestore 변환기를 생성합니다.
 * @param schema - Zod 스키마 (선택사항, 제공되지 않으면 타입 단언만 사용)
 * @returns Firestore 변환기
 */
export const createConverter = <T extends DocumentData>(
  schema?: z.ZodSchema<T>,
) => ({
  toFirestore(data: WithFieldValue<T>): DocumentData {
    // toFirestore는 데이터를 Firestore 형식으로 변환
    // Zod 검증은 선택적으로 수행 (성능 고려)
    if (schema && import.meta.env.DEV) {
      const result = schema.safeParse(data)
      if (!result.success) {
        logger.warn('Firestore toFirestore validation failed', {
          errors: result.error.format(),
          data,
        })
      }
    }
    return data as DocumentData
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): T {
    const data = snapshot.data()
    
    // 스키마가 제공된 경우 런타임 검증 수행
    if (schema) {
      const result = schema.safeParse(data)
      if (!result.success) {
        logger.error('Firestore fromFirestore validation failed', {
          documentId: snapshot.id,
          path: snapshot.ref.path,
          errors: result.error.format(),
          rawData: data,
        })
        // 개발 환경에서는 에러를 throw하여 문제를 즉시 발견
        if (import.meta.env.DEV) {
          throw new Error(
            `Invalid data in Firestore document ${snapshot.ref.path}: ${result.error.message}`,
          )
        }
        // 프로덕션에서는 기본값 반환 (앱 크래시 방지)
        // 스키마의 기본값이나 부분 파싱 결과 사용
        const partialResult = schema.partial().safeParse(data)
        if (partialResult.success) {
          return partialResult.data as T
        }
      } else {
        return result.data
      }
    }
    
    // 스키마가 없거나 검증 실패 시 타입 단언 (하위 호환성)
    return data as T
  },
})

export const getCollection = <T extends DocumentData>(
  path: string,
): CollectionReference<T> => {
  return collection(getDb(), path).withConverter(createConverter<T>())
}

export const getDocument = <T extends DocumentData>(
  path: string,
  schema?: z.ZodSchema<T>,
): DocumentReference<T> => {
  return doc(getDb(), path).withConverter(createConverter<T>(schema))
}

export const firestore = {
  getDb,
  getCollection,
  getDocument,
}


