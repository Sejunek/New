const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { QUESTIONS } = require('../questions.js');
const { calculate, getBand } = require('../score.js');

function alternating(level, stability) {
  return QUESTIONS.map(question => question.axis === 'level' ? level : stability);
}

assert.equal(QUESTIONS.length, 10);
assert.deepEqual(QUESTIONS.map(question => question.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
assert.ok(QUESTIONS.every((question, index) => question.axis === (index % 2 ? 'stability' : 'level')));
assert.deepEqual(calculate(alternating(1, 10)), {
  level: 0, stability: 0,
  levelCount: 5, stabilityCount: 5, answeredCount: 10, skippedCount: 0, sufficient: true
});
assert.deepEqual(calculate(alternating(10, 1)), {
  level: 100, stability: 100,
  levelCount: 5, stabilityCount: 5, answeredCount: 10, skippedCount: 0, sufficient: true
});

// The same raw choice has opposite directions on the two axes.
assert.equal(calculate(Array(10).fill(7)).level, 67);
assert.equal(calculate(Array(10).fill(7)).stability, 33);

// Missing experience is excluded from both numerator and denominator.
const partial = calculate([1, 10, 10, 1, 10, 1, 'skip', 'skip', 'skip', 'skip']);
assert.equal(partial.level, 67);
assert.equal(partial.stability, 67);
assert.equal(partial.levelCount, 3);
assert.equal(partial.stabilityCount, 3);
assert.equal(partial.answeredCount, 6);
assert.equal(partial.skippedCount, 4);
assert.equal(partial.sufficient, true);

// Each axis independently requires at least three actual answers.
const insufficient = calculate([10, 1, 10, 1, 10, 'skip', 'skip', 'skip', 'skip', 'skip']);
assert.equal(insufficient.level, 100);
assert.equal(insufficient.stability, null);
assert.equal(insufficient.levelCount, 3);
assert.equal(insufficient.stabilityCount, 2);
assert.equal(insufficient.sufficient, false);
assert.deepEqual(calculate(Array(10).fill('skip')), {
  level: null, stability: null,
  levelCount: 0, stabilityCount: 0, answeredCount: 0, skippedCount: 10, sufficient: false
});

// Custom question order must respect the axis on each item.
assert.deepEqual(calculate(alternating(10, 1).reverse(), [...QUESTIONS].reverse()), calculate(alternating(10, 1)));
for (const invalid of [null, undefined, 0, 11, 1.5, NaN, Infinity, '5', true, {}, '']) {
  const answers = alternating(10, 1);
  answers[3] = invalid;
  assert.throws(() => calculate(answers), TypeError);
}
assert.throws(() => calculate(Array(10)), TypeError);
assert.throws(() => calculate([1, 2]), TypeError);
assert.throws(() => calculate(null), TypeError);
assert.throws(() => calculate([], []), TypeError);
assert.throws(() => calculate([1], [{ axis: 'other' }]), TypeError);
for (const [value, index] of [[0, 0], [33, 0], [34, 1], [66, 1], [67, 2], [100, 2]]) {
  assert.equal(getBand(value).index, index);
}
for (const invalid of [null, undefined, -1, 101, NaN, Infinity, '50']) {
  assert.throws(() => getBand(invalid), TypeError);
}

// Deployed classic scripts must work without CommonJS or a bundler.
const browser = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../questions.js'), 'utf8'), browser);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../score.js'), 'utf8'), browser);
assert.equal(vm.runInContext('QUESTIONS.length', browser), 10);
assert.equal(vm.runInContext('calculate([10,1,10,1,10,1,10,1,10,1]).stability', browser), 100);
assert.equal(vm.runInContext('getBand(67).index', browser), 2);
console.log('Self-report scoring checks passed.');
