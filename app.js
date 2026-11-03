'use strict';

const app = document.querySelector('#app');
const state = {
  name: '', answers: Array(QUESTIONS.length).fill(null),
  index: 0, phase: 'home', editing: false, result: null
};
const escapeHTML = value => String(value).replace(/[&<>"']/g, char =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';

function render(html) {
  app.innerHTML = html;
  app.classList.remove('screen-enter');
  void app.offsetWidth;
  app.classList.add('screen-enter');
  window.scrollTo({top:0, behavior:'instant'});
  app.focus({preventScroll:true});
}
function reset() {
  state.name = '';
  state.answers = Array(QUESTIONS.length).fill(null);
  state.index = 0;
  state.editing = false;
  state.result = null;
  document.querySelector('#restart-dialog').close();
  home();
}
function requestRestart() {
  if (state.name || state.answers.some(value => value !== null)) {
    document.querySelector('#restart-dialog').showModal();
  } else home();
}

function home() {
  state.phase = 'home';
  render(`<section class="home">
    <div class="home-intro">
      <p class="eyebrow"><span class="lime">SELF CHECK-IN</span> / 나를 보는 나의 기준</p>
      <h1>나는 나를<br><span>어떻게 볼까.</span></h1>
      <p class="intro-copy">내가 나에게 매기는 가치.<br>그리고 다른 사람의 말 앞에서 흔들리는 마음.<br>10개의 질문으로 지금의 나를 살펴보세요.</p>
      <form class="intake" id="name-form" novalidate>
        <label class="field-label" for="name">먼저, 이름을 알려주세요.</label>
        <input class="field-input" id="name" name="name" type="text" placeholder="이름을 입력해주세요" maxlength="24" required autocomplete="off" spellcheck="false" value="${escapeHTML(state.name)}" aria-describedby="name-error name-privacy">
        <p class="field-error" id="name-error" role="alert"></p>
        <button class="button button-primary" type="submit">나의 기록 시작하기 ${arrow}</button>
        <p class="micro" id="name-privacy">이름과 답변은 이 탭에서만 사용해요.<br>새로고침하거나 탭을 닫으면 사라집니다.</p>
      </form>
      <div class="session-facts"><span>10문항</span><span>약 3분</span><span>가입 없이</span></div>
    </div>
    <aside class="map-preview" aria-label="자기 가치 수준과 안정성 두 축을 보여주는 개념도. 실제 결과가 아닙니다.">
      <div class="preview-top"><span class="eyebrow">YOUR INNER COORDINATES</span><span class="preview-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
      <div class="preview-coordinate" aria-hidden="true"></div><div class="preview-orbit" aria-hidden="true"></div>
      <div class="preview-axis x" aria-hidden="true"></div><div class="preview-axis y" aria-hidden="true"></div>
      <span class="axis-tag y">안정성 ↑</span><span class="axis-tag x">자기 가치 →</span>
      <div class="preview-center"><strong>나의 좌표</strong><small>LEVEL × STABILITY</small></div><span class="orbit-dot" aria-hidden="true"></span>
      <div class="preview-bottom"><p>좋고 나쁨 대신,<br>두 개의 축으로 읽는 나.</p><span>개념도 · 실제 결과 아님<br>SELF-REPORTED PROFILE</span></div>
    </aside>
  </section>`);
  const input = document.querySelector('#name');
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    document.querySelector('#name-error').textContent = '';
  });
  document.querySelector('#name-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = input.value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
    if (!name || [...name].length > 24) {
      input.setAttribute('aria-invalid', 'true');
      document.querySelector('#name-error').textContent = '이름을 1–24자로 입력해주세요.';
      input.focus();
      return;
    }
    state.name = name;
    state.editing = false;
    question();
  });
}

function selectedText(value) {
  return value === null ? '어느 쪽에 더 가까운가요? 숫자를 선택해주세요.'
    : value === 'skip' ? '이 문항은 점수 계산에서 제외해요.'
    : value + ' / 10을 선택했어요.';
}
function question() {
  state.phase = 'question';
  const q = QUESTIONS[state.index];
  const selected = state.answers[state.index];
  render(`<section class="checkin">
    <div class="question-nav">
      <button class="back-link" id="previous"><span aria-hidden="true">←</span>${state.editing ? '결과로 돌아가기' : '이전으로'}</button>
      <span class="step-count" aria-label="${state.index + 1}번째 문항, 전체 10개"><strong>${String(state.index + 1).padStart(2,'0')}</strong> / 10</span>
    </div>
    <div class="steps" aria-hidden="true">${QUESTIONS.map((_,i) => `<i class="${i === state.index ? 'current' : state.answers[i] !== null ? 'done' : ''}"></i>`).join('')}</div>
    <p class="eyebrow">QUESTION ${String(state.index + 1).padStart(2,'0')}</p>
    <p class="question-name">${escapeHTML(state.name)}님, 최근 한 달의 경험을 떠올려보세요.</p>
    <h1 class="question-title" id="question-title">${escapeHTML(q.q)}</h1>
    <div class="answer-area">
      <fieldset class="scale-fieldset" aria-labelledby="question-title" aria-describedby="scale-instruction">
        <legend class="sr-only">양끝 사이에서 가까운 정도를 선택하세요.</legend>
        <div class="scale-endpoints" aria-hidden="true"><span>${escapeHTML(q.left)}</span><span>${escapeHTML(q.right)}</span></div>
        <div class="scale-options">${Array.from({length:10},(_,i) => `<label class="scale-option"><input type="radio" name="answer" value="${i+1}" ${selected===i+1 ? 'checked' : ''} aria-label="${i+1}단계${i===0 ? ', '+escapeHTML(q.left) : i===9 ? ', '+escapeHTML(q.right) : ''}"><span aria-hidden="true">${i+1}</span></label>`).join('')}</div>
        <p class="scale-caption" id="scale-instruction">왼쪽에 가까우면 1, 오른쪽에 가까우면 10</p>
        <label class="skip-option"><input type="radio" name="answer" value="skip" ${selected==='skip' ? 'checked' : ''}><span><i class="skip-circle" aria-hidden="true"></i>이런 경험이 없어요</span></label>
      </fieldset>
    </div>
    <div class="question-bottom"><p class="micro" id="selection-status" role="status">${selectedText(selected)}</p><button class="button button-primary" id="next" ${selected === null ? 'disabled' : ''}>${state.editing ? '결과 갱신하기' : state.index === QUESTIONS.length - 1 ? '나의 결과 보기' : '다음 질문'} <span aria-hidden="true">→</span></button></div>
  </section>`);
  document.querySelectorAll('input[name="answer"]').forEach(input => {
    input.addEventListener('change', () => {
      state.answers[state.index] = input.value === 'skip' ? 'skip' : Number(input.value);
      document.querySelector('#next').disabled = false;
      document.querySelector('#selection-status').textContent = selectedText(state.answers[state.index]);
    });
  });
  document.querySelector('#previous').onclick = () => {
    if (state.editing) return results();
    if (state.index > 0) { state.index -= 1; question(); }
    else home();
  };
  document.querySelector('#next').onclick = () => {
    if (state.answers[state.index] === null) return;
    if (state.editing || state.index === QUESTIONS.length - 1) results();
    else { state.index += 1; question(); }
  };
}

function bandText(value, axis) {
  if (value === null) return '응답 부족';
  const index = getBand(value).index;
  return axis === 'stability' ? ['흔들림이 큰 편','중간','비교적 일정한 편'][index]
    : ['낮은 편','중간','높은 편'][index];
}
function interpretation(r) {
  const levelCopy = r.level === null
    ? '자기 가치 수준은 응답이 부족해 표시하지 않았어요.'
    : [
      '이번 응답에서는 나를 긍정적으로 받아들이는 정도가 낮은 쪽에 가까웠어요.',
      '이번 응답에서는 나를 긍정적으로 받아들이는 정도가 가운데 구간에 놓였어요.',
      '이번 응답에서는 나를 긍정적으로 받아들이는 정도가 높은 쪽에 가까웠어요.'
    ][getBand(r.level).index];
  const stabilityCopy = r.stability === null
    ? '안정성은 응답이 부족해 표시하지 않았어요.'
    : [
      '주변의 평가나 상황에 따라 나 자신을 보는 마음도 달라지는 쪽으로 답했어요.',
      '나 자신을 보는 마음의 변동은 가운데 구간으로 나타났어요.',
      '주변의 평가나 상황이 달라져도 나 자신을 보는 마음은 비교적 일정한 쪽으로 답했어요.'
    ][getBand(r.stability).index];
  return levelCopy + ' ' + stabilityCopy;
}
function scoreCard(axis, value, count) {
  const label = axis === 'level' ? '자기 가치 수준' : '자기평가 안정성';
  return `<section class="score-card ${axis === 'stability' ? 'violet' : ''}" data-axis="${axis === 'level' ? 'X' : 'Y'}" aria-label="${label} ${value === null ? '응답 부족' : value+'점, '+bandText(value,axis)}">
    <p class="score-title"><b>${axis === 'level' ? 'X' : 'Y'}</b>${label}</p>
    <div class="score-main"><strong>${value === null ? '—' : value}</strong><small>/ 100</small><span class="score-band">${bandText(value, axis)}</span></div>
    <div class="score-track" aria-hidden="true">${value === null ? '' : `<i style="left:${value}%"></i>`}</div>
    <div class="score-ticks" aria-hidden="true"><span>0</span><span>33</span><span>66</span><span>100</span></div>
    <p class="score-description">${value === null ? '이 축에서 3개 이상 답하면 표시돼요.' : axis === 'level' ? '높을수록 나를 긍정적으로 보는 응답' : '높을수록 변화가 적다고 보는 응답'} · ${count}/5 응답</p>
  </section>`;
}
function resultMap(r) {
  const point = r.sufficient
    ? `<span class="map-point" style="left:${r.level}%;bottom:${r.stability}%"><span class="map-point-label" style="${r.level>80 ? 'left:auto;right:0;transform:none;' : r.level<20 ? 'left:0;transform:none;' : ''}">나의 응답 · ${r.level}, ${r.stability}</span></span>`
    : '<div class="map-empty">두 축에 각각 3개 이상 답하면<br>나의 좌표가 표시돼요.</div>';
  return `<section class="chart-panel">
    <div class="panel-heading"><h2>지금, 나의 좌표</h2><span>SELF-REPORTED</span></div>
    <div class="result-map" role="img" aria-label="${r.sufficient ? '자기 가치 수준 '+r.level+'점, 자기평가 안정성 '+r.stability+'점의 좌표' : '응답 부족으로 좌표를 표시하지 않았습니다.'}">
      <div class="quadrant-lines" aria-hidden="true"></div>
      <span class="map-label top">Y · 자기평가 안정성 ↑</span><span class="map-label bottom">X · 자기 가치 수준 →</span>
      <span class="map-end zero">0</span><span class="map-end hundred-x">100</span><span class="map-end hundred-y">100</span>${point}
    </div>
    <div class="map-foot"><span>답변 ${r.answeredCount}개 · 경험 없음 ${r.skippedCount}개</span><span>백분위가 아닌 응답 환산값</span></div>
  </section>`;
}
function results() {
  state.result = calculate(state.answers);
  state.phase = 'results';
  state.editing = false;
  const r = state.result;
  render(`<section class="results">
    <div class="report-heading"><div><p class="eyebrow"><span class="lime">YOUR CHECK-IN</span> / 나의 응답 리포트</p><h1><span class="person-name">${escapeHTML(state.name)}</span>님이 바라본<br>지금의 나.</h1></div><p class="micro">최근 한 달에 대한 자기보고 결과예요.<br>두 점수는 각각 읽어주세요.</p></div>
    <div class="report-grid">${resultMap(r)}<div class="score-stack">${scoreCard('level',r.level,r.levelCount)}${scoreCard('stability',r.stability,r.stabilityCount)}</div></div>
    <section class="interpretation"><h2>이렇게 읽어볼 수 있어요.</h2><div><p>${interpretation(r)}</p><p class="micro">이 질문은 검증 전 자체 제작 문항이에요. 표시 구간은 임의 기준이며 메타인지 능력, 과대·과소평가, 갈등 가능성을 판정하지 않아요.</p></div></section>
    <div class="report-lower"><div><details class="review-details"><summary>내가 남긴 답변 <span class="sr-only">펼치기</span></summary>${QUESTIONS.map((q,i) => `<article class="answer-review"><p><span class="review-number">${String(i+1).padStart(2,'0')}</span>${escapeHTML(q.q)}</p><small>${escapeHTML(q.left)} ↔ ${escapeHTML(q.right)}</small><small>${state.answers[i] === 'skip' ? '경험 없음 · 점수 계산에서 제외' : state.answers[i]+' / 10 선택'}</small><button class="review-edit" data-edit="${i}">${i+1}번 답변 수정</button></article>`).join('')}</details><p class="micro">경험 없음은 중간값으로 처리하지 않아요.<br>표시 방식은 상단의 ?에서 확인할 수 있어요.</p></div>
    <section class="save-panel"><p class="eyebrow lime">KEEP YOUR CHECK-IN</p><h2>이 기록을 가져가세요.</h2><p class="micro">메일 앱에 요약 결과를 채우거나,<br>문항별 답변을 파일로 저장할 수 있어요.</p><form id="mail-form"><label class="field-label" for="email">결과를 받을 이메일</label><input class="field-input" id="email" type="email" required maxlength="254" placeholder="you@example.com" autocomplete="off"><div class="button-row"><button class="button button-primary" type="submit">메일 앱에서 작성 ↗</button><button class="button button-secondary" type="button" id="download">결과 파일 저장 ↓</button></div></form><p class="status" id="save-status" role="status"></p><p class="micro">메일 앱에서 직접 전송해야 해요. 이름·이메일·결과는 이 사이트에 저장하지 않아요.</p></section></div>
    <div class="restart-row"><button id="restart">새로운 기록 시작하기</button></div>
  </section>`);
  document.querySelectorAll('[data-edit]').forEach(button => {
    button.onclick = () => { state.index = Number(button.dataset.edit); state.editing = true; question(); };
  });
  document.querySelector('#restart').onclick = requestRestart;
  document.querySelector('#download').onclick = downloadReport;
  document.querySelector('#mail-form').onsubmit = event => {
    event.preventDefault();
    const email = document.querySelector('#email').value.trim();
    const uri = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent(state.name+'님의 SELF / SENSE 결과') + '&body=' + encodeURIComponent(report(false));
    const link = document.createElement('a');
    link.href = uri;
    link.click();
    document.querySelector('#save-status').textContent = '메일 앱 열기를 요청했어요. 앱에서 내용을 확인하고 보내기를 눌러주세요. 앱이 열리지 않으면 결과 파일을 이용해주세요.';
  };
}
function report(includeAnswers = true) {
  const r = state.result;
  const format = (value,axis) => value === null ? '응답 부족' : value+'/100 · '+bandText(value,axis);
  let text = 'SELF / SENSE · 나의 응답 리포트\n\n이름: '+state.name+
    '\n자기 가치 수준 (X): '+format(r.level,'level')+
    '\n자기평가 안정성 (Y): '+format(r.stability,'stability')+
    '\n유효 응답: '+r.answeredCount+'개 / 경험 없음: '+r.skippedCount+'개'+
    '\n\n'+interpretation(r)+
    '\n\n최근 한 달을 돌아본 자기보고 응답을 0–100으로 환산한 값입니다. 각 축 3개 이상 응답해야 점수를 표시합니다. 표시 구간 0–33 / 34–66 / 67–100은 임의 기준이며, 백분위나 진단 기준이 아닙니다. 검증 전 자체 제작 문항으로 메타인지 능력·과대과소평가·갈등 가능성을 판정하지 않습니다.'+
    '\n\nhttps://sejunek.github.io/New/';
  if (includeAnswers) text += '\n\n문항별 응답\n'+QUESTIONS.map((q,i) => '\n'+q.id+'. '+q.q+'\n'+q.left+' ↔ '+q.right+'\n응답: '+(state.answers[i]==='skip'?'경험 없음':state.answers[i]+'/10')).join('\n');
  return text;
}
function downloadReport() {
  const url = URL.createObjectURL(new Blob(['\ufeff'+report(true)], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'self-sense-result.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#save-status').textContent = '결과 파일 다운로드를 요청했어요. 기기의 다운로드 항목에서 확인해주세요.';
}

document.querySelector('#home-button').onclick = requestRestart;
document.querySelector('#method').onclick = () => document.querySelector('#info').showModal();
document.querySelectorAll('[data-close]').forEach(button => {
  button.onclick = () => document.getElementById(button.dataset.close).close();
});
document.querySelector('#confirm-restart').onclick = reset;
home();
