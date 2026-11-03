const SCORE_QUESTIONS = typeof module !== 'undefined' && module.exports
  ? require('./questions.js').QUESTIONS
  : QUESTIONS;

/**
 * Separate self-reported self-esteem level and stability scores.
 * These are descriptive scores for this draft, not validated clinical norms.
 * A skipped item never counts as a midpoint or a zero.
 */
function calculate(answers, questions = SCORE_QUESTIONS) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new TypeError('문항 목록이 필요합니다.');
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new TypeError('응답 수가 문항 수와 일치해야 합니다.');
  }

  const sums = { level: 0, stability: 0 };
  const counts = { level: 0, stability: 0 };
  let skippedCount = 0;

  for (let i = 0; i < questions.length; i += 1) {
    const axis = questions[i] && questions[i].axis;
    if (axis !== 'level' && axis !== 'stability') {
      throw new TypeError('문항의 측정 축이 올바르지 않습니다.');
    }

    const value = answers[i];
    if (value === null) {
      throw new TypeError('모든 문항에 응답하거나 경험 없음을 선택해주세요.');
    }
    if (value === 'skip') {
      skippedCount += 1;
      continue;
    }
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      throw new TypeError('응답은 1부터 10 사이의 정수 또는 경험 없음이어야 합니다.');
    }

    sums[axis] += axis === 'level' ? value - 1 : 10 - value;
    counts[axis] += 1;
  }

  const axisScore = axis => counts[axis] >= 3
    ? Math.round(sums[axis] / counts[axis] / 9 * 100)
    : null;

  return {
    level: axisScore('level'),
    stability: axisScore('stability'),
    levelCount: counts.level,
    stabilityCount: counts.stability,
    answeredCount: counts.level + counts.stability,
    skippedCount,
    sufficient: counts.level >= 3 && counts.stability >= 3
  };
}

function getBand(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new TypeError('점수는 0부터 100 사이여야 합니다.');
  }
  const index = value <= 33 ? 0 : value <= 66 ? 1 : 2;
  return { index, label: ['낮은 편', '중간', '높은 편'][index] };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculate, getBand };
}
