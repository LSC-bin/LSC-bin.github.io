/**
 * WordCloud 유틸리티
 * WordCloud2.js를 React에서 사용하기 위한 래퍼
 */

// WordCloud2.js 타입 정의
declare global {
  interface Window {
    WordCloud: (element: HTMLElement | HTMLCanvasElement, options: WordCloudOptions) => void
  }
}

export interface WordCloudOptions {
  list: Array<[string, number]>
  gridSize?: number
  weightFactor?: number | ((size: number) => number)
  fontFamily?: string
  color?: string | ((word: string, weight: number, fontSize?: number, distance?: number, theta?: number) => string)
  rotateRatio?: number
  rotationSteps?: number
  backgroundColor?: string
  minSize?: number
  shuffle?: boolean
  shape?: 'circle' | 'cardioid' | 'diamond' | 'square' | 'triangle-forward' | 'triangle' | 'pentagon' | 'star'
  ellipticity?: number
  shrinkToFit?: boolean
  drawOutOfBound?: boolean
}

/**
 * WordCloud 렌더링 함수
 */
export const renderWordCloud = (
  canvas: HTMLCanvasElement,
  words: Array<[string, number]>,
  options?: Partial<WordCloudOptions>,
): void => {
  if (!window.WordCloud) {
    // logger는 브라우저 환경에서만 사용 가능하므로 console 사용
    if (import.meta.env.DEV) {
      console.warn('[WordCloud] WordCloud2.js가 로드되지 않았습니다.')
    }
    return
  }

  if (!words || words.length === 0) {
    // 빈 상태 표시
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#64748B'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('채팅을 시작하면 WordCloud가 표시됩니다', canvas.width / 2, canvas.height / 2)
    }
    return
  }

  const defaultOptions: WordCloudOptions = {
    list: words,
    gridSize: options?.gridSize ?? 8,
    weightFactor: options?.weightFactor ?? ((size: number) => Math.pow(size, 2.3) / 1024),
    fontFamily: options?.fontFamily ?? 'Noto Sans KR, sans-serif',
    color: options?.color ?? ((word: string, weight: number) => {
      // 빈도수에 따라 색상 변경
      const colors = [
        '#64748B', // 회색
        '#475569',
        '#3B82F6', // 파랑
        '#2563EB',
        '#10B981', // 초록
        '#059669',
        '#F59E0B', // 주황
        '#EF4444', // 빨강
      ]
      const index = Math.min(Math.floor(weight / 2), colors.length - 1)
      return colors[index]
    }),
    rotateRatio: options?.rotateRatio ?? 0.3,
    rotationSteps: options?.rotationSteps ?? 2,
    backgroundColor: options?.backgroundColor ?? 'transparent',
    minSize: options?.minSize ?? 8,
    shuffle: options?.shuffle ?? false,
    shape: options?.shape ?? 'circle',
    ellipticity: options?.ellipticity ?? 0.65,
    shrinkToFit: options?.shrinkToFit ?? true,
    drawOutOfBound: options?.drawOutOfBound ?? false,
  }

  try {
    window.WordCloud(canvas, defaultOptions)
  } catch (error) {
    // logger는 브라우저 환경에서만 사용 가능하므로 console 사용
    if (import.meta.env.DEV) {
      console.error('[WordCloud] 렌더링 실패:', error)
    }
  }
}

/**
 * 채팅 메시지에서 단어 추출 및 빈도 계산
 */
export const extractWordsFromMessages = (
  messages: Array<{ text: string }>,
  maxWords: number = 30,
): Array<[string, number]> => {
  if (!messages || messages.length === 0) {
    return []
  }

  // 모든 메시지 텍스트 합치기
  const allText = messages.map((msg) => msg.text).join(' ')

  // 단어 분리 (한글, 영문, 숫자 포함)
  const words = allText.split(/\s+/).filter((word) => word.length > 1)

  // 한글 불용어 제거
  const stopWords = ['것', '이', '가', '을', '를', '에', '의', '은', '는', '도', '로', '으로', '와', '과', '그', '저']

  // 단어 빈도 계산
  const wordCount: Record<string, number> = {}
  words.forEach((w) => {
    const cleanWord = w.trim().replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, '')
    if (cleanWord.length >= 2 && !stopWords.includes(cleanWord)) {
      const lowerW = cleanWord.toLowerCase()
      wordCount[lowerW] = (wordCount[lowerW] || 0) + 1
    }
  })

  // 빈도수 순으로 정렬하고 상위 N개만 선택
  const wordList = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([word, count]) => [word, count] as [string, number])

  return wordList
}

