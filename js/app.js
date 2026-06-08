/* ═══════════════════════════════════════
   OAK HILL GCSE TEACHING PLATFORM
   js/app.js — Application logic
═══════════════════════════════════════ */

/* ─── STATE ─── */
var currentSubject = 'media';
var currentBoard   = 'aqa';
var currentTopic   = 0;
var classroomTopic = 0;
var mockDuration   = 10;
var mockQCount     = 10;
var mockTimer      = null;
var mockSecondsLeft = 0;
var mockTotalSecs  = 0;
var mockQuestions  = [];
var writtenVisible = {};
var quizAnswered   = {};
var quizScore      = 0;
var quizTotal      = 0;
var glossCat       = 'all';
var progress       = {};
var currentGlossFilter = 'all';
var currentWrittenFilter = 'all';
var currentWrittenTopicFilter = 'all';
var currentQuizFilter = 'all';

/* ─── INIT ─── */
(function init() {
  loadFonts();
  loadProgress();
  setSubject('media', document.getElementById('btn-media'));
})();

function loadFonts() {
  var link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Bebas+Neue&display=swap';
  document.head.appendChild(link);
}

/* ─── SUBJECT SWITCHING ─── */
function setSubject(id, btn) {
  currentSubject = id;
  var S = SUBJECTS[id];

  /* accent colours */
  var map = {
    media:   ['#1D9E75','#E1F5EE','#085041'],
    photo:   ['#BA7517','#FAEEDA','#412402'],
    graphic: ['#534AB7','#EEEDFE','#26215C']
  };
  var c = map[id];
  document.documentElement.style.setProperty('--acc',   c[0]);
  document.documentElement.style.setProperty('--acc-l', c[1]);
  document.documentElement.style.setProperty('--acc-d', c[2]);

  /* header */
  document.getElementById('logo-sub').textContent = S.name;

  /* subject bar active state */
  document.querySelectorAll('.subj-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');

  /* set texts tab label */
  document.getElementById('set-texts-label').textContent = S.setTextsLabel;
  document.getElementById('set-texts-heading').textContent = S.setTextsHeading;

  /* board badge */
  updateBoardBadge();

  /* reset panel to Teach and rebuild */
  var allTabs = document.querySelectorAll('.tab-btn');
  allTabs.forEach(function(t){ t.classList.remove('active'); });
  allTabs[0].classList.add('active');

  document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('panel-teach').classList.add('active');

  currentTopic = 0;
  buildTopicGrid();
  setTopic(0, document.querySelector('.topic-card-btn'));
  renderBoardInfo();
  renderSetTexts();
  buildWrittenFilters();
  renderWritten();
  buildQuizFilters();
  renderQuiz();
  renderGloss();
  renderGlossFilters();
  renderWorksheets();
  renderLessons();
  renderTheory();
  renderBoards();
  renderProgress();
  updateScoreDisplay();

  /* classroom subject label */
  document.getElementById('classroom-subject').textContent = S.name;
}

/* ─── BOARD ─── */
function setBoard(v) {
  currentBoard = v;
  updateBoardBadge();
  renderBoardInfo();
  renderSetTexts();
}

function updateBoardBadge() {
  var b = SUBJECTS[currentSubject].boards[currentBoard];
  if (!b) return;
  document.getElementById('board-badge').textContent = b.name;
  document.getElementById('classroom-board-badge').textContent = b.name;
}

function renderBoardInfo() {
  var S = SUBJECTS[currentSubject];
  var b = S.boards[currentBoard];
  if (!b) return;
  setEl('teach-board-text', b.topicsNote);
  setEl('st-board-text', b.setTextsNote);
}

/* ─── TABS ─── */
function showPanel(id, btn) {
  document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.getElementById('view-label').textContent = {
    teach:'Teaching Hub', lessons:'Lessons & SoW', theory:'Theory',
    settexts: SUBJECTS[currentSubject].setTextsLabel,
    written:'Written Practice', quiz:'Quick Quiz', mock:'Mock Exam',
    glossary:'Glossary', boards:'Exam Boards', worksheets:'Worksheets', progress:'Progress'
  }[id] || id;
}

/* ─── TEACH PANEL ─── */
function buildTopicGrid() {
  var S   = SUBJECTS[currentSubject];
  var col = ['','ca','cp','cr','cb','cc'];
  var container = document.getElementById('topic-cards');
  container.innerHTML = '';
  S.topics.forEach(function(t, i) {
    var btn = document.createElement('button');
    btn.className = 'topic-card-btn' + (t.col ? ' ' + t.col : '');
    btn.innerHTML = '<i class="ti ' + t.icon + '"></i><div><h4>' + t.title + '</h4></div>';
    btn.onclick = (function(idx, el){ return function(){ setTopic(idx, el); }; })(i, btn);
    container.appendChild(btn);
  });
}

function setTopic(i, el) {
  currentTopic = i;
  var S = SUBJECTS[currentSubject];
  var t = S.topics[i];

  /* active state */
  document.querySelectorAll('.topic-card-btn').forEach(function(b){ b.classList.remove('active'); });
  if (el) el.classList.add('active');
  else {
    var btns = document.querySelectorAll('.topic-card-btn');
    if (btns[i]) btns[i].classList.add('active');
  }

  /* title */
  document.getElementById('topic-display-title').innerHTML =
    '<i class="ti ' + t.icon + '" style="color:var(--acc)"></i> ' + t.title;

  /* concepts */
  var body = document.getElementById('topic-display-body');
  body.innerHTML = t.concepts.map(function(c){
    return '<div class="key-concept">' +
      '<span class="ctag ' + c.tc + '">' + c.tag + '</span>' +
      '<p class="concept-text">' + c.text + '</p></div>';
  }).join('');

  /* examples */
  var ex = document.getElementById('topic-examples');
  ex.innerHTML = '<div class="examples-box">' +
    '<h4><i class="ti ti-star"></i> Exam examples</h4>' +
    t.examples.map(function(e){
      return '<div class="example-item"><div class="example-bullet"></div><span>' + e + '</span></div>';
    }).join('') + '</div>';

  /* resources */
  var res = document.getElementById('topic-resources');
  res.innerHTML = '<div class="resources-box"><h4><i class="ti ti-link"></i> Resources & links</h4>' +
    t.resources.map(function(r){
      return '<a class="resource-link" href="' + r.url + '" target="_blank" rel="noopener">' +
        '<i class="ti ' + r.icon + '"></i><span>' + r.label + '</span>' +
        '<span class="resource-tag">' + r.tag + '</span></a>';
    }).join('') + '</div>';

  /* update classroom */
  updateClassroomContent();
}

/* ─── SET TEXTS ─── */
function renderSetTexts() {
  var S  = SUBJECTS[currentSubject];
  var b  = S.boards[currentBoard];
  if (!b || !b.setTexts) { setEl('set-texts-grid', '<p style="color:var(--text2)">No set texts defined for this board.</p>'); return; }
  var html = b.setTexts.map(function(st){
    return '<div class="set-text-card">' +
      '<span class="ctag ' + st.tc + '">' + st.type + '</span>' +
      '<h4>' + st.title + '</h4>' +
      '<span class="st-year">' + st.year + '</span>' +
      '<p>' + st.desc + '</p>' +
      '<div class="analysis-points"><h5>Key analysis points</h5><ul>' +
      st.analysisPoints.map(function(ap){ return '<li>' + ap + '</li>'; }).join('') +
      '</ul></div>' +
      '<div class="st-focus">' + st.focus.map(function(f){ return '<span>' + f + '</span>'; }).join('') + '</div>' +
      '</div>';
  }).join('');
  setEl('set-texts-grid', html);
}

/* ─── LESSONS PANEL ─── */
function renderLessons() {
  var S = SUBJECTS[currentSubject];
  if (!S.lessons || S.lessons.length === 0) {
    setEl('lessons-grid', '<p style="color:var(--text2);padding:1rem">Lesson plans coming soon for this subject.</p>');
    return;
  }
  var tagColours = { 'AO1':'ctag-g','AO2':'ctag-a','AO3':'ctag-p','AO4':'ctag-b','AO1+AO2':'ctag-r','AO2+AO3':'ctag-c','AO2+AO3+AO4':'ctag-k','AO1, AO2':'ctag-r','AO2, AO3':'ctag-c' };
  var levelColours = { 'Beginner':'ctag-g','Intermediate':'ctag-a','Advanced':'ctag-r' };
  var html = S.lessons.map(function(l, i){
    var tc  = tagColours[l.ao]   || 'ctag-b';
    var lc  = levelColours[l.level] || 'ctag-b';
    return '<div class="lesson-card" onclick="openLessonDetail(' + i + ')">' +
      '<div class="lesson-num">Lesson ' + l.num + '</div>' +
      '<h3>' + l.title + '</h3>' +
      '<p>' + l.objective + '</p>' +
      '<div class="lesson-meta">' +
        '<span class="lesson-tag ctag ' + tc + '">' + l.ao + '</span>' +
        '<span class="lesson-tag ctag ' + lc + '">' + l.level + '</span>' +
        '<span class="lesson-tag ctag-b"><i class="ti ti-clock" style="font-size:11px"></i> ' + l.duration + '</span>' +
      '</div></div>';
  }).join('');
  setEl('lessons-grid', html);
}

function openLessonDetail(i) {
  var S = SUBJECTS[currentSubject];
  var l = S.lessons[i];
  document.getElementById('lessons-grid').style.display = 'none';
  var det = document.getElementById('lesson-detail');
  det.style.display = 'block';
  var html = '<div class="lesson-plan-header">' +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">Lesson ' + l.num + '</div>' +
    '<h2>' + l.title + '</h2>' +
    '<p style="color:var(--text2);font-size:14px;margin-top:.5rem"><strong>Objective:</strong> ' + l.objective + '</p>' +
    '<div class="lesson-plan-meta">' +
      '<span><i class="ti ti-clock"></i> ' + l.duration + '</span>' +
      '<span><i class="ti ti-target"></i> ' + l.ao + '</span>' +
      '<span><i class="ti ti-stairs"></i> ' + l.level + '</span>' +
      '<span><i class="ti ti-book"></i> Topic: ' + l.topic + '</span>' +
    '</div></div>' +
    (l.sen ? '<div style="background:#EEF6FF;border:1px solid #5B9BD5;border-left:4px solid #5B9BD5;border-radius:8px;padding:12px 16px;margin-bottom:1rem;display:flex;gap:10px;align-items:flex-start">' +
      '<i class="ti ti-accessibility" style="font-size:20px;color:#185FA5;flex-shrink:0;margin-top:2px"></i>' +
      '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#185FA5;margin-bottom:4px">SEN Adaptations</div>' +
      '<p style="font-size:13px;color:#042C53;margin:0;line-height:1.55">' + l.sen + '</p></div></div>' : '');

  /* Activities */
  html += '<div class="lesson-section"><div class="lesson-section-title"><i class="ti ti-calendar-event"></i> Lesson activities</div>' +
    l.activities.map(function(a){
      return '<div class="lesson-activity"><span class="activity-time">' + a.time + '</span><span>' + a.desc + '</span></div>';
    }).join('') + '</div>';

  /* Resources */
  if (l.resources && l.resources.length) {
    html += '<div class="lesson-section"><div class="lesson-section-title"><i class="ti ti-tools"></i> Resources needed</div>' +
      l.resources.map(function(r){
        return '<div class="lesson-activity"><i class="ti ti-circle-check" style="color:var(--acc);font-size:16px;flex-shrink:0"></i><span>' + r + '</span></div>';
      }).join('') + '</div>';
  }

  /* Homework */
  if (l.homework) {
    html += '<div class="lesson-section"><div class="lesson-section-title"><i class="ti ti-home"></i> Homework task</div>' +
      '<div class="lesson-activity"><i class="ti ti-pencil" style="color:var(--acc);font-size:16px;flex-shrink:0"></i><span>' + l.homework + '</span></div>' +
      '</div>';
  }

  document.getElementById('lesson-detail-content').innerHTML = html;
}

function closeLessonDetail() {
  document.getElementById('lessons-grid').style.display = '';
  document.getElementById('lesson-detail').style.display = 'none';
}

/* ─── THEORY PANEL ─── */
function renderTheory() {
  var S = SUBJECTS[currentSubject];
  var nav = document.getElementById('theory-nav');
  nav.innerHTML = S.topics.map(function(t, i){
    return '<button class="theory-nav-btn' + (i === 0 ? ' active' : '') + '" onclick="showTheory(' + i + ',this)">' + t.title + '</button>';
  }).join('');
  showTheoryContent(0);
}

function showTheory(i, btn) {
  document.querySelectorAll('.theory-nav-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  showTheoryContent(i);
}

function showTheoryContent(i) {
  var S = SUBJECTS[currentSubject];
  var t = S.topics[i];
  var colMap = {'ctag-g':'#1D9E75','ctag-a':'#BA7517','ctag-p':'#534AB7','ctag-r':'#A32D2D','ctag-b':'#185FA5','ctag-c':'#993C1D','ctag-k':'#993556','ctag-t':'#0F6E56'};

  var html = '<div class="theory-block">';
  html += '<div class="theory-block-header">';
  html += '<div class="theory-block-icon"><i class="ti ' + t.icon + '"></i></div>';
  html += '<div><h3>' + t.title + '</h3><p>' + t.concepts[0].text.replace(/<[^>]+>/g,'').substring(0,150) + '…</p></div>';
  html += '</div>';

  /* Detailed concept breakdowns */
  t.concepts.forEach(function(c){
    var col = colMap[c.tc] || 'var(--acc)';
    html += '<div class="theory-section">';
    html += '<h4><span class="ctag ' + c.tc + '">' + c.tag + '</span></h4>';
    html += '<p>' + c.text + '</p>';
    html += '</div>';
  });

  /* Examples as styled blocks */
  if (t.examples && t.examples.length) {
    html += '<div class="theory-section"><h4><i class="ti ti-star" style="color:var(--amber)"></i> Worked examples</h4>';
    t.examples.forEach(function(e){
      html += '<div class="theory-example"><strong>Example:</strong> ' + e + '</div>';
    });
    html += '</div>';
  }

  /* Exam tip */
  html += '<div class="theory-exam-tip"><i class="ti ti-bulb"></i><div>';
  html += '<strong>Exam tip:</strong> When writing about ' + t.title.toLowerCase() + ', always use specific evidence from your set texts — not just general statements. Examiners reward detailed, text-based analysis.';
  html += '</div></div>';

  html += '</div>';
  setEl('theory-content', html);
}

/* ─── WRITTEN PRACTICE ─── */
function buildWrittenFilters() {
  var S = SUBJECTS[currentSubject];
  var topics = ['all'].concat(S.topics.map(function(t){ return t.title; }));
  var sel = document.getElementById('written-topic-filter');
  sel.innerHTML = topics.map(function(t){
    return '<option value="' + t + '">' + (t === 'all' ? 'All topics' : t) + '</option>';
  }).join('');
}

function filterWritten() {
  currentWrittenFilter      = document.getElementById('written-filter').value;
  currentWrittenTopicFilter = document.getElementById('written-topic-filter').value;
  renderWritten();
}

function shuffleWritten() {
  var S = SUBJECTS[currentSubject];
  if (!S.writtenQuestions || S.writtenQuestions.length === 0) return;
  S.writtenQuestions = S.writtenQuestions.sort(function(){ return Math.random() - 0.5; });
  renderWritten();
}

function renderWritten() {
  var S  = SUBJECTS[currentSubject];
  var qs = S.writtenQuestions || [];
  if (qs.length === 0) {
    setEl('written-area', '<p style="color:var(--text2);padding:1rem">Written questions coming soon for this subject.</p>');
    return;
  }
  var mf = currentWrittenFilter;
  var tf = currentWrittenTopicFilter;
  var filtered = qs.filter(function(q){
    var markOk  = (mf === 'all' || String(q.marks) === mf);
    var topicOk = (tf === 'all' || q.topic === tf);
    return markOk && topicOk;
  });
  if (filtered.length === 0) {
    setEl('written-area','<p style="color:var(--text2);padding:1rem">No questions match the selected filters.</p>');
    return;
  }
  var html = filtered.map(function(q, i){
    var key = 'w_' + i + '_' + currentSubject;
    return '<div class="written-question">' +
      '<div class="written-q-header">' +
        '<span class="marks-badge">[' + q.marks + ' marks]</span>' +
        '<span class="ctag ctag-b">' + q.topic + '</span>' +
      '</div>' +
      '<h4>' + q.question + '</h4>' +
      '<textarea class="student-answer-area" placeholder="Write your answer here… Use specific evidence from your set texts." rows="6" id="ans-' + key + '"></textarea>' +
      '<div class="btn-row">' +
        '<button class="btn-sm btn-accent" onclick="toggleMS(\'' + key + '\')">' +
          '<i class="ti ti-eye"></i> Mark scheme</button>' +
        '<button class="btn-sm" onclick="toggleMA(\'' + key + '\')">' +
          '<i class="ti ti-file-text"></i> Model answer</button>' +
        '<button class="btn-sm" onclick="clearWritten(\'' + key + '\')">' +
          '<i class="ti ti-trash"></i> Clear</button>' +
      '</div>' +
      '<div class="mark-scheme" id="ms-' + key + '">' +
        '<h5><i class="ti ti-check"></i> Mark scheme</h5><p>' + (q.markScheme||'').replace(/\n/g,'<br>') + '</p>' +
      '</div>' +
      '<div class="model-answer" id="ma-' + key + '">' +
        '<h5><i class="ti ti-file-text"></i> Model answer</h5><p>' + (q.modelAnswer||'').replace(/\n/g,'<br><br>') + '</p>' +
      '</div>' +
      '</div>';
  }).join('');
  setEl('written-area', html);
}

function toggleMS(key) {
  var el = document.getElementById('ms-' + key);
  if (el) el.classList.toggle('show');
}
function toggleMA(key) {
  var el = document.getElementById('ma-' + key);
  if (el) el.classList.toggle('show');
}
function clearWritten(key) {
  var ta = document.getElementById('ans-' + key);
  if (ta) ta.value = '';
}

/* ─── QUIZ ─── */
function buildQuizFilters() {
  var S = SUBJECTS[currentSubject];
  var topics = ['all'].concat(S.topics.map(function(t){ return t.title; }));
  var sel = document.getElementById('quiz-filter');
  sel.innerHTML = topics.map(function(t){
    return '<option value="' + t + '">' + (t === 'all' ? 'All topics' : t) + '</option>';
  }).join('');
}

function filterQuiz() {
  currentQuizFilter = document.getElementById('quiz-filter').value;
  quizAnswered = {};
  quizScore = 0;
  quizTotal = 0;
  renderQuiz();
  updateScore();
}

function resetQuiz() {
  quizAnswered = {};
  quizScore = 0;
  quizTotal = 0;
  document.getElementById('quiz-filter').value = 'all';
  currentQuizFilter = 'all';
  renderQuiz();
  updateScore();
}

function renderQuiz() {
  var S  = SUBJECTS[currentSubject];
  var qs = (S.questions || []).filter(function(q){
    return currentQuizFilter === 'all' || q.topic === currentQuizFilter;
  });
  quizTotal = qs.length;
  if (qs.length === 0) {
    setEl('quiz-area','<p style="color:var(--text2);padding:1rem">No questions for this filter.</p>');
    return;
  }
  var html = qs.map(function(q, i){
    var letters = ['A','B','C','D'];
    var isAnswered = quizAnswered['q_' + i] !== undefined;
    var userAns    = quizAnswered['q_' + i];
    return '<div class="q-card" id="qcard-' + i + '">' +
      '<div class="q-meta"><span>Q' + (i+1) + '</span>' +
        '<span class="q-topic-badge ctag ctag-b">' + q.topic + '</span>' +
      '</div>' +
      '<div class="q-text">' + q.q + '</div>' +
      '<div class="q-opts">' +
      q.opts.map(function(o, j){
        var cls = '';
        if (isAnswered) {
          if (j === q.a) cls = ' correct';
          else if (j === userAns && j !== q.a) cls = ' wrong';
        }
        return '<button class="q-opt' + cls + '" onclick="answerQuiz(' + i + ',' + j + ')"' +
          (isAnswered ? ' disabled' : '') + '>' +
          '<span class="opt-letter">' + letters[j] + '</span>' + o + '</button>';
      }).join('') +
      '</div>' +
      '<div class="q-feedback' + (isAnswered ? ' show ' + (userAns === q.a ? 'ok' : 'no') : '') + '">' +
        (isAnswered ? (userAns === q.a ? '✓ Correct! ' : '✗ Not quite. ') + (q.exp || '') : '') +
      '</div>' +
      '</div>';
  }).join('');
  setEl('quiz-area', html);
  updateScore();
}

function answerQuiz(qi, oi) {
  var S  = SUBJECTS[currentSubject];
  var qs = (S.questions || []).filter(function(q){
    return currentQuizFilter === 'all' || q.topic === currentQuizFilter;
  });
  if (quizAnswered['q_' + qi] !== undefined) return;
  quizAnswered['q_' + qi] = oi;
  var q = qs[qi];
  if (oi === q.a) quizScore++;

  /* track progress */
  trackProgress(q.topic, oi === q.a);

  /* re-render just this card */
  var letters = ['A','B','C','D'];
  var card = document.getElementById('qcard-' + qi);
  if (!card) { renderQuiz(); return; }

  var opts = card.querySelectorAll('.q-opt');
  opts.forEach(function(btn, j){
    btn.disabled = true;
    if (j === q.a) btn.classList.add('correct');
    else if (j === oi && j !== q.a) btn.classList.add('wrong');
    var letter = btn.querySelector('.opt-letter');
    if (letter) {
      if (j === q.a) { letter.style.background = '#1D9E75'; letter.style.borderColor = '#1D9E75'; letter.style.color = '#fff'; }
      else if (j === oi && j !== q.a) { letter.style.background = '#A32D2D'; letter.style.borderColor = '#A32D2D'; letter.style.color = '#fff'; }
    }
  });
  var feedback = card.querySelector('.q-feedback');
  if (feedback) {
    feedback.className = 'q-feedback show ' + (oi === q.a ? 'ok' : 'no');
    feedback.textContent = (oi === q.a ? '✓ Correct! ' : '✗ Not quite. ') + (q.exp || '');
  }
  updateScore();
}

function updateScore() {
  var answered = Object.keys(quizAnswered).length;
  document.getElementById('q-score-num').textContent = quizScore;
  document.getElementById('q-score-label').textContent = 'of ' + answered + ' answered correctly';
  document.getElementById('q-progress').textContent = answered + ' of ' + quizTotal + ' questions attempted';
  updateScoreDisplay();
}

function updateScoreDisplay() {
  var s = progress[currentSubject] || {};
  var correct = 0, total = 0;
  Object.keys(s).forEach(function(topic){
    correct += (s[topic].correct || 0);
    total   += (s[topic].total   || 0);
  });
  document.getElementById('score-display').textContent = correct + ' / ' + total;
}

/* ─── MOCK EXAM ─── */
function pickDur(el, mins) {
  mockDuration = mins;
  document.querySelectorAll('#dur-opts .mock-opt').forEach(function(o){ o.classList.remove('sel'); });
  el.classList.add('sel');
}

function pickQC(el, n) {
  mockQCount = n;
  document.querySelectorAll('#qc-opts .mock-opt').forEach(function(o){ o.classList.remove('sel'); });
  el.classList.add('sel');
}

function startMock() {
  var S = SUBJECTS[currentSubject];
  var allQ = S.questions || [];
  if (allQ.length === 0) {
    alert('No questions available for this subject yet.');
    return;
  }
  var shuffled = allQ.slice().sort(function(){ return Math.random() - 0.5; });
  mockQuestions = shuffled.slice(0, Math.min(mockQCount, shuffled.length));

  /* Render questions */
  var letters = ['A','B','C','D'];
  var html = mockQuestions.map(function(q, i){
    return '<div class="q-card" id="mq-' + i + '">' +
      '<div class="q-meta"><span>Q' + (i+1) + ' of ' + mockQuestions.length + '</span>' +
        '<span class="q-topic-badge ctag ctag-b">' + q.topic + '</span>' +
      '</div>' +
      '<div class="q-text">' + q.q + '</div>' +
      '<div class="q-opts" id="mopts-' + i + '">' +
      q.opts.map(function(o, j){
        return '<button class="q-opt" id="mopt-' + i + '-' + j + '" onclick="selectMockAnswer(' + i + ',' + j + ')">' +
          '<span class="opt-letter">' + letters[j] + '</span>' + o + '</button>';
      }).join('') +
      '</div></div>';
  }).join('');
  setEl('mock-questions', html);

  /* Timer */
  mockTotalSecs   = mockDuration * 60;
  mockSecondsLeft = mockTotalSecs;
  updateTimerDisplay();
  setEl('mock-q-num', 'Q 1/' + mockQuestions.length);
  setEl('mock-answered', '0 answered');

  if (mockTimer) clearInterval(mockTimer);
  mockTimer = setInterval(function(){
    mockSecondsLeft--;
    updateTimerDisplay();
    if (mockSecondsLeft <= 0) {
      clearInterval(mockTimer);
      submitMock();
    }
  }, 1000);

  document.getElementById('mock-setup').style.display = 'none';
  document.getElementById('mock-exam').style.display = 'block';
  document.getElementById('mock-results').style.display = 'none';
}

var mockSelectedAnswers = {};

function selectMockAnswer(qi, oi) {
  /* Deselect previous */
  var prev = mockSelectedAnswers[qi];
  if (prev !== undefined) {
    var prevBtn = document.getElementById('mopt-' + qi + '-' + prev);
    if (prevBtn) { prevBtn.style.background = ''; prevBtn.style.borderColor = ''; prevBtn.style.color = ''; }
  }
  mockSelectedAnswers[qi] = oi;
  var btn = document.getElementById('mopt-' + qi + '-' + oi);
  if (btn) { btn.style.background = 'var(--acc-l)'; btn.style.borderColor = 'var(--acc)'; btn.style.color = 'var(--acc-d)'; }

  var answered = Object.keys(mockSelectedAnswers).length;
  setEl('mock-answered', answered + ' answered');
}

function updateTimerDisplay() {
  var m = Math.floor(mockSecondsLeft / 60);
  var s = mockSecondsLeft % 60;
  var str = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  var el = document.getElementById('timer-display');
  var fill = document.getElementById('timer-fill');
  if (el) {
    el.textContent = str;
    if (mockSecondsLeft < 60) { el.classList.add('warn'); if (fill) fill.classList.add('warn'); }
  }
  if (fill && mockTotalSecs > 0) {
    fill.style.width = (mockSecondsLeft / mockTotalSecs * 100) + '%';
  }
}

function submitMock() {
  if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
  var correct = 0;
  var topicScores = {};
  mockQuestions.forEach(function(q, i){
    if (!topicScores[q.topic]) topicScores[q.topic] = {correct:0,total:0};
    topicScores[q.topic].total++;
    if (mockSelectedAnswers[i] === q.a) {
      correct++;
      topicScores[q.topic].correct++;
    }
  });

  /* Grade boundaries (approximate GCSE) */
  var pct = (correct / mockQuestions.length) * 100;
  var grade, colour;
  if      (pct >= 85) { grade = '9'; colour = '#1D9E75'; }
  else if (pct >= 75) { grade = '8'; colour = '#2EB37C'; }
  else if (pct >= 65) { grade = '7'; colour = '#0F6E56'; }
  else if (pct >= 55) { grade = '6'; colour = '#BA7517'; }
  else if (pct >= 45) { grade = '5'; colour = '#D4930E'; }
  else if (pct >= 35) { grade = '4'; colour = '#B35A12'; }
  else if (pct >= 25) { grade = '3'; colour = '#A32D2D'; }
  else if (pct >= 15) { grade = '2'; colour = '#7A1E1E'; }
  else                { grade = '1'; colour = '#501313'; }

  var msgs = {
    '9':'Outstanding! Exceptional performance — you are working well above expected standard.',
    '8':'Excellent work. Consistent, high-quality responses across topics.',
    '7':'Very good. Strong understanding — work on the weaker topics to push higher.',
    '6':'Good performance. A few gaps to address but solid foundation.',
    '5':'Satisfactory. Some strong areas — focus revision on the lower-scoring topics.',
    '4':'Approaching the pass mark. Targeted revision needed.',
    '3':'Below expected standard. Key concepts need consolidation.',
    '2':'Significant gaps. Revisit core topics with your teacher.',
    '1':'Foundation stage. Focus on the basic concepts first.'
  };

  var gc = document.getElementById('grade-circle');
  gc.textContent = grade;
  gc.style.color = colour;
  gc.style.borderColor = colour;
  gc.style.background = colour + '15';

  setEl('grade-msg', msgs[grade] || '');

  setEl('grade-row',
    '<div class="grade-stat"><div class="val">' + correct + '/' + mockQuestions.length + '</div><div class="lbl">Correct</div></div>' +
    '<div class="grade-stat"><div class="val">' + Math.round(pct) + '%</div><div class="lbl">Percentage</div></div>' +
    '<div class="grade-stat"><div class="val">Grade ' + grade + '</div><div class="lbl">GCSE estimate</div></div>'
  );

  /* Topic breakdown */
  var breakdown = '<div class="content-box" style="margin-top:1rem"><h3>Topic breakdown</h3>' +
    Object.keys(topicScores).map(function(topic){
      var ts = topicScores[topic];
      var p  = Math.round(ts.correct / ts.total * 100);
      var col = p >= 70 ? '#1D9E75' : p >= 50 ? '#BA7517' : '#A32D2D';
      trackProgress(topic, false, ts.correct, ts.total);
      return '<div class="progress-topic-bar">' +
        '<span class="progress-topic-name">' + topic + '</span>' +
        '<div class="progress-bar-track"><div class="progress-bar-fill" style="width:' + p + '%;background:' + col + '"></div></div>' +
        '<span class="progress-pct">' + ts.correct + '/' + ts.total + '</span>' +
        '</div>';
    }).join('') + '</div>';
  setEl('results-breakdown', breakdown);

  document.getElementById('mock-exam').style.display = 'none';
  document.getElementById('mock-results').style.display = 'block';
  renderProgress();
}

function resetMock() {
  mockSelectedAnswers = {};
  document.getElementById('mock-setup').style.display = 'block';
  document.getElementById('mock-exam').style.display = 'none';
  document.getElementById('mock-results').style.display = 'none';
  if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
}

function printResults() {
  window.print();
}

/* ─── GLOSSARY ─── */
function renderGlossFilters() {
  var S    = SUBJECTS[currentSubject];
  var cats = ['all'].concat([...new Set((S.glossary || []).map(function(g){ return g.cat; }))]);
  var html = cats.map(function(c){
    return '<button class="gloss-filter' + (c === currentGlossFilter ? ' active' : '') +
      '" onclick="setGlossCat(\'' + c + '\')">' + (c === 'all' ? 'All' : c) + '</button>';
  }).join('');
  setEl('gloss-filters', html);
}

function setGlossCat(cat) {
  currentGlossFilter = cat;
  renderGlossFilters();
  renderGloss();
}

function renderGloss() {
  var S      = SUBJECTS[currentSubject];
  var terms  = S.glossary || [];
  var search = (document.getElementById('gloss-search').value || '').toLowerCase();
  var cat    = currentGlossFilter;
  var catColours = {'Language':'ctag-g','Industry':'ctag-p','Theory':'ctag-a','Audience':'ctag-r','Representation':'ctag-b',
    'Technical':'ctag-a','Portfolio':'ctag-b','Layout':'ctag-p','Typography':'ctag-r','Branding':'ctag-g','Process':'ctag-c',
    'Theory':'ctag-a'};

  var filtered = terms.filter(function(g){
    var catOk    = (cat === 'all' || g.cat === cat);
    var searchOk = !search ||
      g.term.toLowerCase().includes(search) ||
      g.def.toLowerCase().includes(search) ||
      (g.eg && g.eg.toLowerCase().includes(search));
    return catOk && searchOk;
  });

  if (filtered.length === 0) {
    setEl('gloss-list','<p style="color:var(--text2);padding:1rem">No matching terms found.</p>');
    return;
  }

  var html = filtered.map(function(g){
    var cc = catColours[g.cat] || 'ctag-b';
    return '<div class="gloss-item">' +
      '<span class="gloss-cat-badge ctag ' + cc + '">' + g.cat + '</span>' +
      '<div>' +
        '<div class="gloss-term">' + g.term + '</div>' +
        '<div class="gloss-def">' + g.def + '</div>' +
        (g.eg ? '<div class="gloss-eg"><i class="ti ti-quote" style="font-size:12px"></i> ' + g.eg + '</div>' : '') +
      '</div></div>';
  }).join('');
  setEl('gloss-list', html);
}

/* ─── WORKSHEETS ─── */
function renderWorksheets() {
  var S   = SUBJECTS[currentSubject];
  var wss = getWorksheets(S);
  var html = wss.map(function(ws, i){
    return '<div class="worksheet-card" onclick="openWorksheet(' + i + ')">' +
      '<div class="worksheet-icon"><i class="ti ' + ws.icon + '"></i></div>' +
      '<h4>' + ws.title + '</h4>' +
      '<p>' + ws.desc + '</p>' +
      '</div>';
  }).join('');
  setEl('worksheets-grid', html);
}

function getWorksheets(S) {
  var base = [
    { title: 'Key Terms Match-Up', icon: 'ti-vocabulary', desc: 'Match key terms to their definitions. Suitable for starter or consolidation activity.' },
    { title: 'Text Analysis Frame', icon: 'ti-file-text', desc: 'Structured analysis worksheet: media language, representation, industry, audience.' },
    { title: 'Theory Application', icon: 'ti-bulb', desc: 'Apply a key theory to a media text using a structured framework.' },
    { title: 'Exam Question Practice', icon: 'ti-writing', desc: 'Exam-style questions with planning space and self-assessment grid.' },
    { title: 'Case Study Notes', icon: 'ti-notes', desc: 'Template for structured notes on a set text or practitioner.' },
    { title: 'Peer Feedback Sheet', icon: 'ti-users', desc: 'Structured peer assessment template with two stars and a wish.' }
  ];
  if (S.name === 'Photography') {
    base.push({ title: 'Contact Sheet Annotation', icon: 'ti-photo', desc: 'Template for annotating contact sheets with selection reasoning and next steps.' });
    base.push({ title: 'Practitioner Analysis Frame', icon: 'ti-aperture', desc: 'Structured analysis of a photographer: technique, composition, concept, context.' });
  }
  if (S.name === 'Graphic Communication') {
    base.push({ title: 'Design Process Record', icon: 'ti-compass', desc: 'Document your design process from brief analysis through to final evaluation.' });
    base.push({ title: 'Brand Audit Worksheet', icon: 'ti-badge', desc: 'Analyse an existing brand identity: logo, colour, typography, consistency.' });
  }
  return base;
}

function openWorksheet(i) {
  var S  = SUBJECTS[currentSubject];
  var ws = getWorksheets(S)[i];
  document.getElementById('worksheets-grid').style.display = 'none';
  document.getElementById('worksheet-preview').style.display = 'block';
  setEl('worksheet-content', buildWorksheetHTML(ws, S));
}

function buildWorksheetHTML(ws, S) {
  var today = new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'});
  var html = '<div class="ws-header">' +
    '<div class="ws-school">Oak Hill School — ' + S.name + ' GCSE</div>' +
    '<div class="ws-title">' + ws.title + '</div>' +
    '<div class="ws-sub">Exam Board: ' + SUBJECTS[currentSubject].boards[currentBoard].name + ' &nbsp;|&nbsp; Date: ' + today + '</div>' +
    '</div>';

  html += '<div class="ws-student-info">' +
    '<div class="ws-field">Name: ___________________________</div>' +
    '<div class="ws-field">Class / Set: _____________________</div>' +
    '</div>';

  /* Worksheet-specific content */
  if (ws.title === 'Key Terms Match-Up') {
    var terms = (S.glossary || []).slice(0,8);
    html += '<div class="ws-section"><h3><i class="ti ti-vocabulary"></i> Part A — Match the term to its definition</h3>';
    html += '<p style="font-size:13px;color:var(--text2);margin-bottom:1rem">Draw a line connecting each term on the left to its correct definition on the right.</p>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem">';
    html += '<div>' + terms.map(function(t,i){
      return '<div class="ws-question"><p>' + (i+1) + '. <strong>' + t.term + '</strong></p></div>';
    }).join('') + '</div>';
    var shuffled = terms.slice().sort(function(){return Math.random()-0.5;});
    html += '<div>' + shuffled.map(function(t,i){
      return '<div class="ws-question"><p>' + String.fromCharCode(65+i) + '. ' + t.def.substring(0,80) + '…</p></div>';
    }).join('') + '</div>';
    html += '</div></div>';

    html += '<div class="ws-section"><h3><i class="ti ti-pencil"></i> Part B — Use THREE terms in your own sentences</h3>' +
      [1,2,3].map(function(n){
        return '<div class="ws-question"><p>' + n + '. _______________:</p>' +
          '<div class="ws-lines">' + [1,2].map(function(){ return '<div class="ws-line"></div>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
  }

  else if (ws.title === 'Text Analysis Frame') {
    var areas = ['Media Language', 'Representation', 'Media Industries', 'Audiences'];
    if (S.name === 'Photography') areas = ['Technique / Composition', 'Concept / Idea', 'Historical / Social Context', 'Personal Response'];
    if (S.name === 'Graphic Communication') areas = ['Typography / Layout', 'Visual Language & Colour', 'Design Process & Context', 'Audience & Purpose'];
    html += '<div class="ws-section"><h3><i class="ti ti-file-text"></i> Text / Product being analysed</h3>' +
      '<div class="ws-question"><div class="ws-lines"><div class="ws-line"></div></div></div></div>';
    areas.forEach(function(area){
      html += '<div class="ws-section"><h3><i class="ti ti-arrow-right"></i> ' + area + '</h3><div class="ws-question">' +
        '<div class="ws-lines">' + [1,2,3,4].map(function(){ return '<div class="ws-line"></div>'; }).join('') + '</div></div></div>';
    });
  }

  else if (ws.title === 'Theory Application') {
    var theories = S.name === 'Media Studies'
      ? ['Stuart Hall (Representation)','Laura Mulvey (Male Gaze)','Blumler & Katz (Uses & Gratifications)','Todorov (Narrative Theory)']
      : S.name === 'Photography'
      ? ['Decisive moment (Cartier-Bresson)','Male gaze (Mulvey)','Documentary ethics (Susan Sontag)','Pictorialism vs Straight Photography']
      : ['Form follows function (Bauhaus)','Gestalt principles','Visual hierarchy','Brand consistency'];
    html += '<div class="ws-section"><h3>Text being analysed:</h3><div class="ws-question"><div class="ws-lines"><div class="ws-line"></div></div></div></div>';
    html += '<div class="ws-section"><h3>Theory chosen:</h3><div class="ws-question"><div class="ws-lines"><div class="ws-line"></div></div></div></div>';
    html += '<div class="ws-section"><h3>Explain the theory in your own words:</h3><div class="ws-question"><div class="ws-lines">' +
      [1,2,3].map(function(){ return '<div class="ws-line"></div>'; }).join('') + '</div></div></div>';
    html += '<div class="ws-section"><h3>Apply the theory to your chosen text — use specific evidence:</h3><div class="ws-question"><div class="ws-lines">' +
      [1,2,3,4,5].map(function(){ return '<div class="ws-line"></div>'; }).join('') + '</div></div></div>';
    html += '<div class="ws-section"><h3>Evaluation — how useful is this theory?</h3><div class="ws-question"><div class="ws-lines">' +
      [1,2,3].map(function(){ return '<div class="ws-line"></div>'; }).join('') + '</div></div></div>';
  }

  else if (ws.title === 'Exam Question Practice') {
    var qs = (S.writtenQuestions || []).slice(0, 2);
    qs.forEach(function(q, i){
      html += '<div class="ws-section"><h3>Question ' + (i+1) + ' [' + q.marks + ' marks]</h3>' +
        '<div class="ws-question"><p><strong>' + q.question + '</strong></p>' +
        '<div class="ws-lines">' + Array(Math.max(q.marks, 4)).fill('<div class="ws-line"></div>').join('') + '</div></div>' +
        '<div class="ws-question"><p><strong>Self-assessment:</strong> How many marks do you think you earned? ____/'+q.marks+'</p>' +
        '<p>What would you add to improve your answer?</p>' +
        '<div class="ws-lines"><div class="ws-line"></div><div class="ws-line"></div></div></div></div>';
    });
  }

  else {
    /* Generic worksheet */
    html += '<div class="ws-section"><h3><i class="ti ti-pencil"></i> ' + ws.title + '</h3>';
    html += '<p style="font-size:13px;color:var(--text2);margin-bottom:1rem">' + ws.desc + '</p>';
    for (var k = 0; k < 6; k++) {
      html += '<div class="ws-question"><p>' + (k+1) + '.&nbsp;</p><div class="ws-lines">' +
        [1,2,3].map(function(){ return '<div class="ws-line"></div>'; }).join('') + '</div></div>';
    }
    html += '</div>';
  }

  html += '<div style="margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border);font-size:11px;color:var(--text3);display:flex;justify-content:space-between">' +
    '<span>Oak Hill School — ' + S.name + ' GCSE</span><span>' + today + '</span></div>';

  return html;
}

function closeWorksheet() {
  document.getElementById('worksheets-grid').style.display = '';
  document.getElementById('worksheet-preview').style.display = 'none';
}

/* ─── PROGRESS ─── */
function trackProgress(topic, correct, c, t) {
  if (!progress[currentSubject]) progress[currentSubject] = {};
  if (!progress[currentSubject][topic]) progress[currentSubject][topic] = {correct:0,total:0};
  if (c !== undefined && t !== undefined) {
    progress[currentSubject][topic].correct += c;
    progress[currentSubject][topic].total   += t;
  } else {
    progress[currentSubject][topic].total++;
    if (correct) progress[currentSubject][topic].correct++;
  }
  saveProgress();
}

function saveProgress() {
  try { localStorage.setItem('oakhill_progress', JSON.stringify(progress)); } catch(e) {}
}

function loadProgress() {
  try {
    var p = localStorage.getItem('oakhill_progress');
    if (p) progress = JSON.parse(p);
  } catch(e) {}
}

function clearProgress() {
  if (!confirm('Clear all session progress data?')) return;
  progress = {};
  try { localStorage.removeItem('oakhill_progress'); } catch(e) {}
  quizScore = 0;
  quizAnswered = {};
  renderProgress();
  updateScoreDisplay();
}

function renderProgress() {
  var S      = SUBJECTS[currentSubject];
  var subProg = progress[currentSubject] || {};
  var totalCorrect = 0, totalQ = 0;
  Object.values(subProg).forEach(function(t){
    totalCorrect += (t.correct || 0);
    totalQ       += (t.total   || 0);
  });
  var pct = totalQ > 0 ? Math.round(totalCorrect / totalQ * 100) : 0;

  var overview = '<div class="progress-stat"><div class="p-val" style="color:var(--acc)">' + totalQ + '</div><div class="p-lbl">Questions attempted</div></div>' +
    '<div class="progress-stat"><div class="p-val" style="color:var(--green)">' + totalCorrect + '</div><div class="p-lbl">Correct answers</div></div>' +
    '<div class="progress-stat"><div class="p-val" style="color:var(--acc)">' + pct + '%</div><div class="p-lbl">Overall accuracy</div></div>' +
    '<div class="progress-stat"><div class="p-val" style="color:var(--amber)">' + Object.keys(subProg).length + '</div><div class="p-lbl">Topics attempted</div></div>';
  setEl('progress-overview', overview);

  if (totalQ === 0) {
    setEl('progress-details','<div class="content-box"><p style="color:var(--text3)">No session data yet. Complete some quiz or mock exam questions to see your progress here.</p></div>');
    return;
  }

  var details = '<div class="content-box"><h3>Performance by topic</h3>' +
    S.topics.map(function(t){
      var tp   = subProg[t.title] || {correct:0,total:0};
      var p    = tp.total > 0 ? Math.round(tp.correct / tp.total * 100) : 0;
      var cls  = p >= 70 ? '' : p >= 50 ? ' mid' : ' low';
      return '<div class="progress-topic-bar">' +
        '<span class="progress-topic-name">' + t.title + '</span>' +
        '<div class="progress-bar-track"><div class="progress-bar-fill' + cls + '" style="width:' + p + '%"></div></div>' +
        '<span class="progress-pct">' + (tp.total > 0 ? p + '%' : '—') + '</span>' +
        '</div>';
    }).join('') + '</div>';
  setEl('progress-details', details);
}

/* ─── CLASSROOM MODE ─── */
function toggleClassroom() {
  var overlay = document.getElementById('classroom-overlay');
  var isOpen  = overlay.style.display !== 'none' && overlay.style.display !== '';
  overlay.style.display = isOpen ? 'none' : 'grid';
  if (!isOpen) updateClassroomContent();
}

function updateClassroomContent() {
  var S = SUBJECTS[currentSubject];
  var t = S.topics[currentTopic];
  if (!t) return;
  document.getElementById('classroom-topic').textContent = t.title;
  var html = t.concepts.map(function(c){
    return '<div class="classroom-concept">' +
      '<div><span class="classroom-concept-tag">' + c.tag + '</span></div>' +
      '<div class="classroom-concept-text">' + c.text + '</div>' +
      '</div>';
  }).join('');
  setEl('classroom-content', html);
  var S2 = SUBJECTS[currentSubject];
  document.getElementById('classroom-progress').textContent =
    'Topic ' + (currentTopic + 1) + ' of ' + S2.topics.length;
}

function classroomPrev() {
  var S = SUBJECTS[currentSubject];
  currentTopic = Math.max(0, currentTopic - 1);
  var btns = document.querySelectorAll('.topic-card-btn');
  if (btns[currentTopic]) setTopic(currentTopic, btns[currentTopic]);
  else setTopic(currentTopic, null);
}

function classroomNext() {
  var S = SUBJECTS[currentSubject];
  currentTopic = Math.min(S.topics.length - 1, currentTopic + 1);
  var btns = document.querySelectorAll('.topic-card-btn');
  if (btns[currentTopic]) setTopic(currentTopic, btns[currentTopic]);
  else setTopic(currentTopic, null);
}

/* ─── BOARDS COMPARISON ─── */
function renderBoards() {
  var S = SUBJECTS[currentSubject];
  var subjectName = S.name;

  var data = {
    media: {
      intro: 'All three major exam boards offer a strong GCSE Media Studies qualification. The core content — Media Language, Representation, Industries, Audiences — is very similar across all three. The key differences lie in assessment structure, set text selection and the weighting of the coursework component.',
      recommendation: {
        board: 'Eduqas',
        reasons: [
          'Eduqas (the WJEC subsidiary for England) is widely regarded as the most teacher-friendly board for Media Studies in alternative provision and SEN settings.',
          'The set texts feel culturally relevant and contemporary — students engage well with I, Daniel Blake, This Is America and His Dark Materials.',
          'The coursework component (30%) gives SEN students a chance to demonstrate genuine creativity and analytical thinking without the entire grade resting on exam performance.',
          'Eduqas provides excellent free teaching resources, including detailed schemes of work, sample student responses and mark schemes — reducing teacher workload significantly.',
          'The examination questions are clearly structured with shorter, scaffolded questions before the extended response — well suited to students who benefit from a stepped approach.'
        ],
        caveat: 'If your students are particularly strong writers and your school has existing links with AQA for other subjects, AQA is also a solid choice. OCR suits schools that want more flexibility in set text selection.'
      },
      boards: [
        {
          name: 'AQA', id: 'aqa', tc: 'ctag-g',
          code: '8572',
          structure: [
            { component: 'Component 1', title: 'Exploring the Media', weight: '35%', format: 'Written exam — 1hr 30min. Section A: unseen media language analysis. Section B: representation question on unseen text. Section C: media industries and audiences using set texts.' },
            { component: 'Component 2', title: 'Understanding Media Forms & Products', weight: '35%', format: 'Written exam — 1hr 30min. In-depth study of set texts across TV, music video, magazines, newspapers, video games and online.' },
            { component: 'Component 3', title: 'NEA — Creating Media', weight: '30%', format: 'Non-exam assessment: students create a media product and write a Statement of Intent (approx. 500 words). Marked by the teacher, moderated by AQA.' }
          ],
          strengths: ['Very well-resourced — huge amount of freely available teaching materials, mark schemes and past papers online', 'Widely used across England — easy to find CPD, teacher networks and shared resources', 'NEA gives students creative freedom; Statement of Intent rewards analytical writing', 'Clear, well-structured mark schemes that are straightforward to apply'],
          challenges: ['Set texts can feel dated quickly — AQA refreshes them every two years but choices are sometimes less culturally relevant to inner-city or diverse student cohorts', 'Two long written exams (3 hours total) — significant demand on students who find extended writing difficult', 'The unseen analysis in Component 1 requires strong exam confidence — less scaffolded than Eduqas'],
          senNote: 'The NEA component is a significant strength for SEN students — it rewards process and creativity. However, the two heavy written exams mean students need strong writing stamina.',
          website: 'https://www.aqa.org.uk/subjects/media-studies/gcse/media-studies-8572'
        },
        {
          name: 'OCR', id: 'ocr', tc: 'ctag-p',
          code: 'J200',
          structure: [
            { component: 'Component 1', title: 'Exploring Media Language & Representation', weight: '40%', format: 'Written exam — 1hr 30min. Media language analysis of unseen products + representation questions.' },
            { component: 'Component 2', title: 'Exploring Media Industries & Audiences', weight: '30%', format: 'Written exam — 1hr. Industries and audiences questions using set texts.' },
            { component: 'Component 3', title: 'Production Portfolio', weight: '30%', format: 'Students create a media product responding to a brief set by OCR. Production + evaluation report.' }
          ],
          strengths: ['Production brief is set by OCR — removes teacher burden of designing a valid brief; also provides authenticity', 'Two exams with different lengths (90 min + 60 min) may suit some students better than two equal-length papers', 'Good range of set texts with some more recent and culturally diverse options than AQA', 'Strong support materials via the OCR Media Studies community and Teach Cambridge portal'],
          challenges: ['The externally set production brief can occasionally feel restrictive — less creative freedom than AQA NEA', 'OCR has a smaller teacher community in England than AQA — slightly fewer shared resources available', 'Component 1 (40% of the grade) is a heavy single exam — high-stakes for students who struggle with written assessments'],
          senNote: 'The split exam structure (90 min + 60 min) is slightly more manageable than two equal 90-minute papers. The externally set production brief provides clear structure which some SEN students find helpful.',
          website: 'https://www.ocr.org.uk/qualifications/gcse/media-studies-j200-from-2017/'
        },
        {
          name: 'Eduqas', id: 'eduqas', tc: 'ctag-b',
          code: 'C680QS',
          structure: [
            { component: 'Component 1', title: 'Exploring the Media', weight: '40%', format: 'Written exam — 1hr 30min. Stepped questions from shorter analysis through to extended response. Section A: media language. Section B: representation. Section C: media in the online age.' },
            { component: 'Component 2', title: 'Understanding Media Forms and Products', weight: '30%', format: 'Written exam — 1hr. Set text questions on TV drama, magazines, newspapers and music video.' },
            { component: 'Component 3', title: 'Creating Media', weight: '30%', format: 'Non-exam assessment: create a media product + a Statement of Intent OR evaluative analysis (approx. 1,500 words). Flexible briefs.' }
          ],
          strengths: ['Stepped exam questions (short → medium → extended) are better suited to students who benefit from scaffolded assessment — never a cold "write 20 marks" from the start', 'Eduqas provides the most comprehensive free teaching resources of the three boards — detailed schemes of work, annotated student samples and filmed teacher CPD', 'Set texts in recent cycles have been notably relevant and engaging for diverse student cohorts (I, Daniel Blake; This Is America; His Dark Materials)', 'NEA flexibility allows students to choose a media form that plays to their strengths', 'Strong presence in Wales and growing in England — dedicated Eduqas teacher community events'],
          challenges: ['Slightly less brand recognition than AQA in some English secondary settings — a minor practical consideration if students\' future schools/sixth forms use AQA', 'Fewer past papers available than AQA (shorter history in England) — though specimen papers and sample questions are thorough', 'The evaluative analysis option in Component 3 requires strong written reflection — some SEN students may need significant support with this element'],
          senNote: 'Strongest fit for SEN and alternative provision settings. Stepped exam questions, engaging set texts, excellent free resources and flexible NEA briefs all reduce barriers to access without reducing rigour.',
          website: 'https://www.eduqas.co.uk/qualifications/media-studies-gcse/'
        }
      ]
    },
    photo: {
      intro: 'GCSE Photography is offered by AQA, OCR and Eduqas. The qualification is 60% coursework portfolio and 40% Externally Set Assignment (ESA) across all boards — the structure is very similar. Differences lie in how the ESA is administered, how broadly or narrowly the AOs are interpreted in marking, and the quality of teacher support materials.',
      recommendation: {
        board: 'AQA',
        reasons: [
          'AQA Photography has the largest uptake of the three boards in England and therefore the deepest bank of freely available teacher resources, past papers and sample portfolios.',
          'AQA\'s mark scheme interpretation is well-established and understood — teachers in the Art & Design department will likely have strong existing experience with it.',
          'The ESA starting points are consistently broad and open-ended — well suited to SEN students who benefit from personal, self-directed responses.',
          'AQA provides excellent CPD events for Photography teachers and has a well-maintained online resource hub.',
          'If your department already uses AQA for other Art & Design qualifications (Art, Graphics), keeping Photography on AQA simplifies moderation and teacher workload.'
        ],
        caveat: 'If your school uses Eduqas for other subjects, Eduqas Photography is equally strong — the qualification structure is almost identical. The choice between AQA and Eduqas for Photography is genuinely close and may simply come down to which board your department has the strongest relationship with.'
      },
      boards: [
        {
          name: 'AQA', id: 'aqa', tc: 'ctag-a',
          code: '7206/C',
          structure: [
            { component: 'Portfolio', title: 'Personal Portfolio', weight: '60%', format: '96 marks. A sustained body of coursework responding to a self-chosen theme. Must show evidence of all 4 AOs throughout.' },
            { component: 'ESA', title: 'Externally Set Assignment', weight: '40%', format: '64 marks. AQA sets starting points in January. Preparation period (research, experiments) + 10-hour supervised session.' }
          ],
          strengths: ['Largest community of Photography teachers — excellent shared resources, Facebook groups, teacher networks', 'ESA starting points are reliably broad and open-ended — genuine creative freedom', 'Strong online student exemplar bank to support marking calibration', 'Well-established moderation process with clear guidance'],
          challenges: ['AQA Photography can feel very open-ended — some SEN students may need more structured guidance to produce a coherent portfolio without feeling overwhelmed', 'The 10-hour ESA session is intense — requires careful preparation and planning support'],
          senNote: 'Suits students who have an intrinsic interest in photography and can self-direct. Strong teacher scaffolding needed during the portfolio phase. ESA starting points can be interpreted very accessibly.',
          website: 'https://www.aqa.org.uk/subjects/art-and-design/gcse/art-and-design-8206/specification'
        },
        {
          name: 'OCR', id: 'ocr', tc: 'ctag-p',
          code: 'J171/06',
          structure: [
            { component: 'Portfolio', title: 'Personal Portfolio', weight: '60%', format: '96 marks. Sustained investigation responding to a chosen theme. All 4 AOs evidenced.' },
            { component: 'ESA', title: 'Externally Set Assignment', weight: '40%', format: '64 marks. OCR sets a theme. Students respond through preparation and a supervised session.' }
          ],
          strengths: ['OCR provides clear guidance on contextual studies — helpful for building AO1 evidence systematically', 'Good quality mark scheme exemplars with detailed commentary', 'The OCR Art & Design community has active teacher support forums'],
          challenges: ['Smaller uptake than AQA — fewer freely available resources, exemplar portfolios and peer discussions', 'Some teachers report OCR moderation can be less predictable in borderline cases'],
          senNote: 'A solid option, particularly if your school uses OCR for other Art & Design subjects. The structured AO guidance can help SEN students understand what is expected.',
          website: 'https://www.ocr.org.uk/qualifications/gcse/art-and-design-j171-from-2016/'
        },
        {
          name: 'Eduqas', id: 'eduqas', tc: 'ctag-b',
          code: 'C120P',
          structure: [
            { component: 'Portfolio', title: 'Personal Portfolio', weight: '60%', format: '96 marks. Sustained coursework body showing all 4 AOs. Strong emphasis on personal visual language.' },
            { component: 'ESA', title: 'Externally Set Assignment', weight: '40%', format: '64 marks. Eduqas sets broad themes. Preparation period + supervised session.' }
          ],
          strengths: ['Eduqas ESA themes have consistently been broad, inspiring and accessible — good for diverse student interests', 'Excellent free teacher resources including annotated sample work at multiple grade boundaries', 'Strong emphasis on personal visual language in marking — rewards genuine student voice'],
          challenges: ['Smaller teacher community in England — fewer local CPD events and peer networks than AQA', 'Fewer past papers and less exam legacy to draw on for teacher calibration'],
          senNote: 'Eduqas\'s emphasis on personal response and visual language can be liberating for SEN students who might feel constrained by more rigid frameworks. Strong free resources reduce teacher workload.',
          website: 'https://www.eduqas.co.uk/qualifications/art-and-design-gcse/'
        }
      ]
    },
    graphic: {
      intro: 'GCSE Graphic Communication (or Art & Design: Graphic Communication) is also structured around 60% coursework and 40% ESA across all three boards. The subject rewards both technical design skills and conceptual thinking. Board differences are mainly in the quality of teacher support, the breadth of set briefs, and how broadly contextual investigation is interpreted.',
      recommendation: {
        board: 'AQA',
        reasons: [
          'AQA Graphic Communication has the largest teacher community and resource base of the three boards in England.',
          'AQA\'s approach to Graphic Communication is broad — covering typography, identity, packaging, environmental and digital design — giving creative and academically diverse students equal opportunity to excel.',
          'The ESA starting points for AQA Graphics have consistently allowed students to pursue personally meaningful design problems.',
          'AQA provides detailed teacher guidance on how to support students with the design process — useful for SEN settings where explicit process scaffolding is essential.',
          'If your school already uses AQA for Photography or other Art & Design qualifications, the moderation process is streamlined.'
        ],
        caveat: 'Eduqas Graphic Communication is increasingly popular and their free resources are excellent — worth serious consideration, particularly if your school is already using Eduqas for Media Studies.'
      },
      boards: [
        {
          name: 'AQA', id: 'aqa', tc: 'ctag-p',
          code: '7206/D',
          structure: [
            { component: 'Portfolio', title: 'Personal Portfolio', weight: '60%', format: '96 marks. Sustained design project demonstrating all 4 AOs — from initial research through to resolved final outcomes.' },
            { component: 'ESA', title: 'Externally Set Assignment', weight: '40%', format: '64 marks. AQA sets design-focused starting points. Preparation period + 10-hour supervised session.' }
          ],
          strengths: ['Widest range of AQA Graphic Communication teaching materials, exemplar portfolios and teacher communities', 'Broad interpretation of what counts as "Graphic Communication" — rewards diverse approaches', 'Clear mark scheme guidance on each AO at multiple grade boundaries', 'Strong CPD events for Graphic Communication teachers'],
          challenges: ['The 10-hour ESA can be very demanding for students who haven\'t fully resolved their design concept during preparation', 'Open-ended portfolio can be difficult for students who need more explicit structure'],
          senNote: 'The design process (brief → research → thumbnail → develop → refine) gives SEN students a clear scaffold if the teacher explicitly teaches it as a stage-by-stage process. The creative freedom can be either motivating or overwhelming depending on the student.',
          website: 'https://www.aqa.org.uk/subjects/art-and-design/gcse/art-and-design-8206/specification'
        },
        {
          name: 'OCR', id: 'ocr', tc: 'ctag-g',
          code: 'J171/05',
          structure: [
            { component: 'Portfolio', title: 'Personal Portfolio', weight: '60%', format: '96 marks. Design investigation and development demonstrating all 4 AOs.' },
            { component: 'ESA', title: 'Externally Set Assignment', weight: '40%', format: '64 marks. OCR-set brief with preparation period and supervised session.' }
          ],
          strengths: ['OCR Graphic Communication brief has historically had a strong emphasis on commercial-style design problems — motivating for students who like "real" briefs', 'Good guidance on assessing design process (AO2 and AO3) which can benefit students whose final outcomes are weaker than their development work'],
          challenges: ['Smaller community and fewer freely shared resources than AQA', 'Less flexibility in what counts as a valid graphic communication response'],
          senNote: 'The commercial design brief approach can be highly motivating for students who engage well with a clear client/audience. Less suitable if students need maximum creative freedom.',
          website: 'https://www.ocr.org.uk/qualifications/gcse/art-and-design-j171-from-2016/'
        },
        {
          name: 'Eduqas', id: 'eduqas', tc: 'ctag-b',
          code: 'C120GC',
          structure: [
            { component: 'Portfolio', title: 'Personal Portfolio', weight: '60%', format: '96 marks. Sustained design project across the AOs. Strong emphasis on personal design language and contextual investigation.' },
            { component: 'ESA', title: 'Externally Set Assignment', weight: '40%', format: '64 marks. Broad Eduqas themes with preparation and supervised session.' }
          ],
          strengths: ['Eduqas free resources for Graphic Communication are excellent and comprehensive — detailed annotation guidance, sample work and teacher notes', 'ESA themes tend to be conceptually interesting and accessible to a wide range of students', 'Strong emphasis on personal design voice — rewards students who develop a distinctive approach'],
          challenges: ['Smaller England teacher community than AQA — fewer local CPD events', 'If your school uses AQA for Photography, mixing boards across Art & Design subjects adds administrative complexity'],
          senNote: 'Eduqas\'s excellent free resources significantly reduce teacher preparation time — a real advantage for busy teachers in alternative provision settings. The emphasis on personal voice can be empowering for SEN students.',
          website: 'https://www.eduqas.co.uk/qualifications/art-and-design-gcse/'
        }
      ]
    }
  };

  var sub = data[currentSubject];
  if (!sub) { setEl('boards-content', '<p style="color:var(--text2)">Board comparison not available for this subject.</p>'); return; }

  var html = '';

  /* Recommendation box */
  var rec = sub.recommendation;
  html += '<div style="background:var(--acc-l);border:2px solid var(--acc);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:1.5rem">' +
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:.75rem">' +
      '<i class="ti ti-star" style="font-size:22px;color:var(--acc)"></i>' +
      '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--acc-d)">Recommended for Oak Hill</div>' +
      '<div style="font-size:20px;font-weight:700;color:var(--acc-d)">' + rec.board + '</div></div></div>' +
    '<ul style="margin:0 0 .75rem 1.25rem">' +
      rec.reasons.map(function(r){ return '<li style="font-size:13.5px;color:var(--acc-d);line-height:1.6;margin-bottom:.4rem">' + r + '</li>'; }).join('') +
    '</ul>' +
    '<p style="font-size:12px;color:var(--acc-d);background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 12px;margin:0;font-style:italic">' +
      '<strong>Note:</strong> ' + rec.caveat + '</p>' +
    '</div>';

  /* Intro */
  html += '<div class="content-box" style="margin-bottom:1.25rem"><p style="font-size:14px;color:var(--text2);line-height:1.7;margin:0">' + sub.intro + '</p></div>';

  /* Board cards */
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem">';
  sub.boards.forEach(function(b) {
    var isRec = b.name === rec.board;
    html += '<div style="background:var(--surface);border:' + (isRec ? '2px solid var(--acc)' : '1px solid var(--border)') + ';border-radius:var(--radius-lg);padding:1.25rem;box-shadow:var(--shadow-sm)">';

    /* Header */
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">';
    html += '<span class="ctag ' + b.tc + '" style="font-size:14px;padding:5px 12px">' + b.name + '</span>';
    html += '<div><div style="font-size:11px;color:var(--text3);font-weight:500">Code: ' + b.code + '</div>';
    if (isRec) html += '<div style="font-size:11px;font-weight:700;color:var(--acc)">⭐ Recommended</div>';
    html += '</div>' +
      '<a href="' + b.website + '" target="_blank" rel="noopener" style="margin-left:auto;font-size:11px;color:var(--text3);text-decoration:none;display:flex;align-items:center;gap:4px"><i class="ti ti-external-link"></i> Spec</a>';
    html += '</div>';

    /* Assessment structure */
    html += '<div style="margin-bottom:1rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:.5rem">Assessment structure</div>';
    b.structure.forEach(function(s){
      html += '<div style="background:var(--surface2);border-radius:6px;padding:8px 10px;margin-bottom:6px">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">' +
          '<span style="font-size:11px;font-weight:700;color:var(--text)">' + s.component + ': ' + s.title + '</span>' +
          '<span class="ctag ctag-g" style="margin-left:auto">' + s.weight + '</span>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--text2);margin:0;line-height:1.5">' + s.format + '</p>' +
        '</div>';
    });
    html += '</div>';

    /* Strengths */
    html += '<div style="margin-bottom:.75rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#1D9E75;margin-bottom:.4rem"><i class="ti ti-check"></i> Strengths</div><ul style="margin:0 0 0 1rem;padding:0">' +
      b.strengths.map(function(s){ return '<li style="font-size:12.5px;color:var(--text2);line-height:1.55;margin-bottom:.25rem">' + s + '</li>'; }).join('') +
      '</ul></div>';

    /* Challenges */
    html += '<div style="margin-bottom:.75rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#A32D2D;margin-bottom:.4rem"><i class="ti ti-alert-triangle"></i> Challenges</div><ul style="margin:0 0 0 1rem;padding:0">' +
      b.challenges.map(function(c){ return '<li style="font-size:12.5px;color:var(--text2);line-height:1.55;margin-bottom:.25rem">' + c + '</li>'; }).join('') +
      '</ul></div>';

    /* SEN note */
    html += '<div style="background:#EEF6FF;border:1px solid #5B9BD5;border-left:3px solid #185FA5;border-radius:6px;padding:8px 10px;font-size:12px;color:#042C53;line-height:1.55">' +
      '<strong style="display:block;margin-bottom:3px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#185FA5"><i class="ti ti-accessibility"></i> SEN suitability</strong>' + b.senNote + '</div>';

    html += '</div>';
  });
  html += '</div>';

  setEl('boards-content', html);
}

MEDIA_LESSONS

function setEl(id, html) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
