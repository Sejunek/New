const QUESTIONS = [
  { id: 1, axis: 'level', q: '요즘의 나를 전체적으로 보면?', left: '마음에 들지 않는 편', right: '마음에 드는 편' },
  { id: 2, axis: 'stability', q: '좋은 평가를 받은 날, 나라는 사람에 대한 생각은?', left: '평소와 비슷하다', right: '눈에 띄게 좋아진다' },
  { id: 3, axis: 'level', q: '잘하는 일이나 성과를 잠시 빼고 나를 보면?', left: '별로 남는 것이 없는 느낌', right: '그래도 괜찮은 사람이라는 느낌' },
  { id: 4, axis: 'stability', q: '일 하나를 망친 뒤, 평소 내 장점들은?', left: '여전히 떠오른다', right: '함께 희미해진다' },
  { id: 5, axis: 'level', q: '부족한 점까지 포함한 지금의 나는?', left: '받아들이기 어렵다', right: '받아들일 만하다' },
  { id: 6, axis: 'stability', q: '비슷하게 시작한 친구가 앞서갔다. 그 뒤 나를 보면?', left: '전과 비슷하다', right: '전보다 작아 보인다' },
  { id: 7, axis: 'level', q: '다른 사람들과 비교할 때, 한 사람으로서의 내 가치는?', left: '그들보다 낮게 느껴진다', right: '그들과 동등하게 느껴진다' },
  { id: 8, axis: 'stability', q: '별다른 일이 없는 날에도, 나를 괜찮게 보는 정도는?', left: '대체로 일정하다', right: '날마다 차이가 크다' },
  { id: 9, axis: 'level', q: '평소 내가 나를 대하는 마음은?', left: '못마땅함에 가깝다', right: '존중에 가깝다' },
  { id: 10, axis: 'stability', q: '내 행동을 지적받은 뒤, 아쉬운 마음은?', left: '그 행동에 머문다', right: '나 전체로 번진다' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS };
}
