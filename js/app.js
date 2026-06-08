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
  renderHelp();
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
    glossary:'Glossary', boards:'Exam Boards', help:'Teacher Help',
    worksheets:'Worksheets', progress:'Progress'
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

/* ─── HELP PANEL ─── */
function toggleHelpSection(id) {
  var body = document.getElementById('hbody-' + id);
  var chev = document.getElementById('hchev-' + id);
  var head = document.getElementById('hhead-' + id);
  if (!body) return;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.classList.toggle('open', !isOpen);
  if (head) head.classList.toggle('open', !isOpen);
}

function openHelpSection(id) {
  var bodies = document.querySelectorAll('.help-section-body');
  bodies.forEach(function(b) {
    b.classList.remove('open');
    var sid = b.id.replace('hbody-','');
    var c = document.getElementById('hchev-' + sid);
    var h = document.getElementById('hhead-' + sid);
    if (c) c.classList.remove('open');
    if (h) h.classList.remove('open');
  });
  var body = document.getElementById('hbody-' + id);
  var chev = document.getElementById('hchev-' + id);
  var head = document.getElementById('hhead-' + id);
  if (body) {
    body.classList.add('open');
    if (chev) chev.classList.add('open');
    if (head) head.classList.add('open');
    setTimeout(function(){ body.scrollIntoView({ behavior:'smooth', block:'start' }); }, 50);
  }
}

function helpSection(id, icon, iconStyle, title, subtitle, bodyHTML) {
  return '<div class="help-section" id="hsec-' + id + '">' +
    '<div class="help-section-header" id="hhead-' + id + '" onclick="toggleHelpSection(\'' + id + '\')">' +
      '<div class="help-section-icon" style="' + iconStyle + '"><i class="ti ' + icon + '"></i></div>' +
      '<div style="flex:1"><h3>' + title + '</h3><p>' + subtitle + '</p></div>' +
      '<i class="ti ti-chevron-down help-chevron" id="hchev-' + id + '"></i>' +
    '</div>' +
    '<div class="help-section-body" id="hbody-' + id + '">' + bodyHTML + '</div>' +
    '</div>';
}

function helpStep(num, title, desc, tip) {
  return '<div class="help-step"><div class="help-step-num">' + num + '</div>' +
    '<h4>' + title + '</h4><p>' + desc + '</p>' +
    (tip ? '<div class="step-tip"><i class="ti ti-info-circle"></i>' + tip + '</div>' : '') +
    '</div>';
}

function helpInfoCard(icon, title, desc) {
  return '<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:1rem">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:.5rem">' +
      '<i class="ti ' + icon + '" style="font-size:18px;color:var(--acc)"></i>' +
      '<strong style="font-size:13px;color:var(--text)">' + title + '</strong>' +
    '</div><p style="font-size:12.5px;color:var(--text2);line-height:1.55;margin:0">' + desc + '</p></div>';
}

function helpSenCard(icon, title, desc) {
  return '<div style="background:#EEF6FF;border:1px solid #B3D4F5;border-radius:var(--radius);padding:.85rem 1rem">' +
    '<div style="display:flex;align-items:center;gap:7px;margin-bottom:.4rem">' +
      '<i class="ti ' + icon + '" style="font-size:16px;color:#185FA5"></i>' +
      '<strong style="font-size:12.5px;color:#042C53">' + title + '</strong>' +
    '</div><p style="font-size:12px;color:#185FA5;line-height:1.5;margin:0">' + desc + '</p></div>';
}

function renderHelp() {
  var S = SUBJECTS[currentSubject];
  var sequences = {
    media: {
      overview: 'The 10 Media Studies lessons are designed for 35-minute slots with SEN adaptations throughout. The sequence moves from accessible, familiar concepts through analytical frameworks and theory, building to timed exam practice. Teach in this order to build vocabulary and confidence progressively.',
      phases: [
        { label: 'Phase 1 — Foundation', colour: 'ctag-g',
          desc: 'Build core vocabulary. No theory names yet — just denotation, connotation and the four pillars. Students leave able to describe what they see and begin interpreting meaning.',
          lessons: [
            { num:1, title:'What is Media Studies?', tab:'Teach', tip:'Use the Teach panel on the projector. Let students pick media they actually use. Validate their existing knowledge — no wrong answers.' },
            { num:2, title:'What Can You See? Denotation', tab:'Teach + Worksheets', tip:'Print the Text Analysis Frame. Model denotation 3 times before asking students to try alone. Insist: no opinions yet.' },
            { num:3, title:'What Does It Mean? Connotation', tab:'Teach + Worksheets', tip:'Reuse the same images from Lesson 2 — familiarity reduces anxiety. The colour card activity is kinaesthetic and high-engagement.' }
          ]
        },
        { label: 'Phase 2 — Representation & Industry', colour: 'ctag-a',
          desc: 'Introduce the social and institutional dimensions of media. Frame these lessons carefully — they address sensitive territory around stereotypes and power.',
          lessons: [
            { num:4, title:'Who Is Being Shown? Representation', tab:'Teach + Theory', tip:'The card sort is lower-stakes than writing. Begin with oral contributions and build to written sentences using the provided frames.' },
            { num:5, title:'Who Made It and Why? Industries', tab:'Teach + Theory', tip:'The logo quiz is a great starter — every student knows these brands. Keep the BBC/commercial distinction simple: who pays? who decides?' }
          ]
        },
        { label: 'Phase 3 — Audiences & Theory', colour: 'ctag-p',
          desc: 'Build the theoretical language needed for the exam. Connect every theory to familiar examples before introducing the theorist\'s name — concept first, label second.',
          lessons: [
            { num:6, title:'Who Is Watching? Audiences', tab:'Teach + Theory', tip:'The hands-up survey is fast and engaging. Run the Quiz panel at the end filtered to Audiences for quick consolidation.' },
            { num:7, title:'Theories Made Simple — Todorov', tab:'Theory + Quiz', tip:'Story mountain before any theory language. Students map a film they know — THEN reveal the theorist\'s name. Works with Disney or superhero films.' },
            { num:8, title:'The Male Gaze', tab:'Theory + Set Texts', tip:'Frame this carefully at the start. Use Set Texts panel to connect to your board\'s prescribed texts. Traffic light response system removes writing pressure.' }
          ]
        },
        { label: 'Phase 4 — Application & Assessment', colour: 'ctag-r',
          desc: 'Apply all prior learning to a specific text, then practise exam technique in a low-stakes supported environment.',
          lessons: [
            { num:9, title:'Set Text Close-Up', tab:'Teach + Set Texts', tip:'Switch to your exam board\'s set text in Set Texts. Print the cover for students. Colour-coded annotation gives three simultaneous focuses without writing pressure.' },
            { num:10, title:'Mock Exam Practice', tab:'Written Practice + Mock Exam', tip:'Use Written Practice for short questions first. Show model answer on screen before students write. Normalise imperfection — this is training, not judgment.' }
          ]
        }
      ],
      ongoing: ['Project the Glossary panel when a term comes up during discussion — students can look it up in real time','Run a 5-question Quick Quiz at the end of any lesson as an exit activity, filtered to today\'s topic','Use Classroom Mode (top bar) to display topic concepts full-screen on the projector','Print worksheets from the Worksheets panel for any lesson needing a structured activity']
    },
    photo: {
      overview: 'The 9 Photography lessons move from course structure through technical skills, contextual studies, ethics and process, to ESA preparation. Technical skills are taught early and practised throughout. This order ensures students have technical confidence before beginning their personal project.',
      phases: [
        { label: 'Phase 1 — Understanding the Course', colour: 'ctag-g',
          desc: 'Demystify the GCSE before a camera is touched. Students who understand what is being assessed make better creative decisions throughout the course.',
          lessons: [
            { num:1, title:'What is Photography GCSE?', tab:'Teach + Lessons', tip:'The "which gets marks?" starter (all four images do) immediately corrects the misconception that only the final photo matters. Display the 4 AO poster on the projector.' }
          ]
        },
        { label: 'Phase 2 — Technical Foundations', colour: 'ctag-a',
          desc: 'Teach camera controls and compositional thinking before the personal project begins. Practical and hands-on — minimise reading and writing at this stage.',
          lessons: [
            { num:2, title:'The Exposure Triangle', tab:'Teach + Theory', tip:'Connect a camera to the projector if possible — change settings live. Students learn faster from seeing the effect than reading about it.' },
            { num:3, title:'Composition & the Decisive Moment', tab:'Teach + Worksheets', tip:'Get outside. Even 15 minutes in school grounds with smartphones produces better learning than 35 minutes indoors describing composition.' }
          ]
        },
        { label: 'Phase 3 — Contextual Studies', colour: 'ctag-p',
          desc: 'Introduce the photographers students need to reference in their portfolio (AO1). Teach analytical writing frameworks before students need to use them independently.',
          lessons: [
            { num:4, title:'Looking at Photographers — Dorothea Lange', tab:'Teach + Practitioners', tip:'Tell the story before showing the image — historical context makes the photograph land differently. Use the Practitioners panel on the projector.' },
            { num:5, title:'Photographic Genres', tab:'Teach + Practitioners', tip:'The card sort reveals students\' categorisation logic. You can correct misconceptions through discussion rather than direct correction.' },
            { num:6, title:'Annotating a Practitioner', tab:'Worksheets + Practitioners', tip:'Print the Practitioner Analysis Frame. The 5-step framework with a timer removes the blank-page problem. Collect for written feedback.' }
          ]
        },
        { label: 'Phase 4 — Ethics & Process', colour: 'ctag-b',
          desc: 'Prepare students to make thoughtful ethical choices in their own practice and document their process rigorously for AO3.',
          lessons: [
            { num:7, title:'Ethics in Photography', tab:'Theory', tip:'Discussion-led — keep writing minimal. The "apply to your own work" section connects directly to AO1 evidence in portfolios.' },
            { num:8, title:'Contact Sheets', tab:'Worksheets + Progress', tip:'The blank vs annotated comparison immediately shows the difference. Set a rule: one sentence minimum per image on every contact sheet from now on.' }
          ]
        },
        { label: 'Phase 5 — ESA Preparation', colour: 'ctag-r',
          desc: 'Prepare students for the Externally Set Assignment with confident exploration of the starting point — not premature commitment.',
          lessons: [
            { num:9, title:'ESA — Choosing Your Starting Point', tab:'Teach + Lessons', tip:'Address anxiety explicitly and early. The 8-minute mind-map explosion (quantity, no editing) is liberating. Small group sharing surfaces ideas students would not generate alone.' }
          ]
        }
      ],
      ongoing: ['Use the Practitioners panel to display photographers\' work on the projector during contextual discussions','Run the Quick Quiz at the end of any practical lesson to consolidate vocabulary','Use Classroom Mode to display AO definitions or compositional diagrams during practical sessions','Print Contact Sheet annotation frames from Worksheets for every shoot']
    },
    graphic: {
      overview: 'The 9 Graphic Communication lessons move from identifying design in the everyday world through typography, layout, colour, branding, practitioner research, the full design process and portfolio review. This order ensures students have vocabulary and a toolkit before beginning an extended project.',
      phases: [
        { label: 'Phase 1 — Seeing Design', colour: 'ctag-g',
          desc: 'Open students\' eyes to graphic design as a constant presence in their world. The goal is to shift perception — from passive consumer to active observer.',
          lessons: [
            { num:1, title:'What is Graphic Communication?', tab:'Teach + Practitioners', tip:'The logo quiz is a brilliant opener — no wrong answers, immediately engaging. Cereal box analysis generates 10+ design observations per pair with no writing pressure.' }
          ]
        },
        { label: 'Phase 2 — Typography & Layout', colour: 'ctag-a',
          desc: 'Build the two most fundamental graphic design skills. These underpin every subsequent design decision students make.',
          lessons: [
            { num:2, title:'Typefaces — Why Fonts Matter', tab:'Teach + Theory', tip:'The HORROR word in multiple fonts is immediately memorable. Provide the reference card — students should not need to memorise typeface categories.' },
            { num:3, title:'Layout — Making Things Clear', tab:'Teach + Theory + Worksheets', tip:'Print the "bad flyer" from Worksheets. The redesign task is practical, creative and immediately shows the power of hierarchy and white space.' },
            { num:4, title:'Colour in Design', tab:'Teach + Theory', tip:'The colour auction is playful. Keep CMYK vs RGB as a simple rule (print = CMYK, screen = RGB) — do not over-explain the colour theory.' }
          ]
        },
        { label: 'Phase 3 — Branding & Practitioners', colour: 'ctag-p',
          desc: 'Connect design principles to professional practice. Students learn to analyse existing work (AO1) and begin generating ideas of their own (AO2).',
          lessons: [
            { num:5, title:'Logo Design', tab:'Teach + Practitioners + Worksheets', tip:'The thumbnail challenge is the most important activity. Set a timer, insist on 12 thumbnails, explicitly forbid erasing. This teaches the professional design process better than any explanation.' },
            { num:6, title:'Looking at Designers — Saul Bass', tab:'Practitioners + Theory', tip:'The 5-step annotation with timed stages removes the blank-page problem. This is likely to be the first substantial AO1 evidence in sketchbooks — collect and give written feedback.' }
          ]
        },
        { label: 'Phase 4 — Design Process', colour: 'ctag-b',
          desc: 'Teach the full professional design process explicitly. Many students do not know what "doing design" actually involves — this makes it concrete and learnable.',
          lessons: [
            { num:7, title:'The Design Process', tab:'Teach + Worksheets + Theory', tip:'Display the process map on the projector throughout. Refer to it at each stage: "We are now in the ROUGH stage." Students who know where they are make better decisions.' },
            { num:8, title:'Grids and Alignment', tab:'Theory + Teach', tip:'Reveal the grid on a real magazine spread first — the moment students see the invisible structure is genuinely revelatory.' }
          ]
        },
        { label: 'Phase 5 — Portfolio Review', colour: 'ctag-r',
          desc: 'A structured self-assessment session to identify gaps before any assessment deadline.',
          lessons: [
            { num:9, title:'Portfolio Review', tab:'Progress + Lessons', tip:'The 45-second check-in per student requires efficient circulation — have a class list ready. Action cards stuck inside the sketchbook cover are a simple but effective accountability tool.' }
          ]
        }
      ],
      ongoing: ['Use the Practitioners panel to display designer work on the projector during contextual discussions','Run the Quick Quiz after lessons 2, 4 and 6 to consolidate vocabulary','Print thumbnailing grid and brand audit worksheets from the Worksheets panel','Use the Progress panel to track quiz performance and identify vocabulary gaps']
    }
  };

  var seq = sequences[currentSubject];
  if (!seq) { setEl('help-content','<p style="color:var(--text2)">Help not available.</p>'); return; }

  var tabDefs = [
    { icon:'ti-chalkboard',   label:'Teach',           desc:'Your main classroom display. Select a topic on the left to show concepts, examples and resource links. <strong>Put this on the projector</strong> during lesson input. The board info panel shows specification-specific notes for your selected exam board.' },
    { icon:'ti-calendar',     label:'Lessons',          desc:'Full 35-minute SEN-adapted lesson plans. Click any lesson card to see the full plan with timed activities, a <strong>blue SEN Adaptations panel</strong>, resources needed and homework. Lessons are numbered in the recommended delivery order.' },
    { icon:'ti-book-2',       label:'Theory',           desc:'Detailed theory notes with worked examples and exam tips for every topic. Use as a planning reference or display on the projector during input phases. Each topic tab shows all concepts with a worked example and an exam tip.' },
    { icon:'ti-film',         label:'Set Texts / Practitioners', desc:'Board-specific set texts (Media Studies) or key practitioners (Photography, Graphic Communication). <strong>Updates automatically</strong> when you change exam board in the header. Each card shows key analysis points and topic focus areas.' },
    { icon:'ti-writing',      label:'Written Practice', desc:'Extended written questions with full mark schemes and model answers. Filter by marks (2, 4, 8, 12, 20) or topic. Students write in the text area, then reveal the mark scheme. Use Shuffle to randomise order.' },
    { icon:'ti-help-circle',  label:'Quick Quiz',       desc:'Multiple-choice questions with instant feedback and explanations. Filter by topic for targeted revision. Session scores are tracked automatically — visible in the header and in the Progress panel. Use as a 5-minute starter or exit activity.' },
    { icon:'ti-clock',        label:'Mock Exam',        desc:'Timed mock exam with configurable duration (10–60 min) and question count (10–25). On submission, students receive a GCSE grade estimate (1–9), a percentage and a topic-by-topic breakdown. Results feed the Progress panel.' },
    { icon:'ti-vocabulary',   label:'Glossary',         desc:'Searchable key terminology with definitions, usage examples and category filters. Changes with subject. <strong>Project on screen</strong> when a term comes up in discussion. Students can search on a device during independent work.' },
    { icon:'ti-school',       label:'Exam Boards',      desc:'Detailed comparison of AQA, OCR and Eduqas for this subject — structure, weighting, strengths, challenges and SEN suitability. Includes a highlighted recommendation for Oak Hill School.' },
    { icon:'ti-printer',      label:'Worksheets',       desc:'Printable student activities including Key Terms Match-Up, Text Analysis Frame, Theory Application and Exam Question Practice. Preview then Ctrl+P to print. Worksheets auto-include the school name, subject, exam board and today\'s date.' },
    { icon:'ti-chart-pie',    label:'Progress',         desc:'Session-based tracking: total questions, correct answers, accuracy and a topic performance bar chart. Saved automatically in the browser. Use <strong>Clear session data</strong> at the start of a new term or class group.' },
    { icon:'ti-presentation', label:'Classroom Mode',   desc:'Full-screen dark overlay for the projector. Shows current topic concepts in large high-contrast text. Navigate topics with Previous / Next. Activate from the top subject bar. <strong>Click Exit or press Escape to return.</strong>' }
  ];

  var html = '';

  /* Hero */
  html += '<div class="help-hero">' +
    '<div class="help-hero-badge">Oak Hill Creative GCSEs — ' + S.name + '</div>' +
    '<h1>Teacher Guide</h1>' +
    '<p>How to use every part of this platform, how to deliver each lesson and the recommended teaching order for ' + S.name + ' GCSE.</p>' +
    '</div>';

  /* Quick start cards */
  html += '<div class="s-label" style="margin-bottom:.75rem">Jump to section</div><div class="help-quickstart">';
  var qsCards = [
    { icon:'ti-bolt',          title:'Getting started',    desc:'First steps with the app',         id:'hs-start' },
    { icon:'ti-layout-grid',   title:'All features',       desc:'What every tab does',               id:'hs-tabs' },
    { icon:'ti-presentation',  title:'Classroom use',      desc:'Projector & device tips',           id:'hs-classroom' },
    { icon:'ti-list-numbers',  title:'Lesson order',       desc:'Recommended teaching sequence',     id:'hs-sequence' },
    { icon:'ti-accessibility', title:'SEN guidance',       desc:'Built-in adaptations & support',   id:'hs-sen' },
    { icon:'ti-keyboard',      title:'Tips & shortcuts',   desc:'Save time every lesson',            id:'hs-tips' }
  ];
  html += qsCards.map(function(c){
    return '<button class="help-qs-card" onclick="openHelpSection(\'' + c.id + '\')">' +
      '<div class="help-qs-icon"><i class="ti ' + c.icon + '"></i></div>' +
      '<h4>' + c.title + '</h4><p>' + c.desc + '</p></button>';
  }).join('') + '</div>';

  /* Section 1 — Getting Started */
  html += helpSection('hs-start','ti-bolt','background:var(--green-l);color:var(--green)','Getting Started','Open the app, pick your subject and board, and you\'re ready to teach.',
    '<div class="help-sequence">' +
    helpStep(1,'Open index.html in any browser','The app runs entirely offline — no internet required once downloaded. Double-click <strong>oakhill/index.html</strong>. Use Chrome, Edge or Firefox for best results.') +
    helpStep(2,'Select your subject','Click <strong>Media Studies</strong>, <strong>Photography</strong> or <strong>Graphic Communication</strong> in the black bar at the top. Everything updates instantly — topics, lessons, quiz questions, set texts, glossary.','The subject bar also has Classroom Mode for projector display') +
    helpStep(3,'Set your exam board','Use the <strong>Exam Board dropdown</strong> in the top-right header. This updates the board info in Teach, the set texts and practitioner content. Change it any time — progress data is not affected.') +
    helpStep(4,'Start with the Lessons tab','The Lessons tab contains 35-minute lesson plans in recommended order. Open Lesson 1 and use it as your delivery guide for the first session.','Each lesson has a blue SEN Adaptations panel — read it before you teach') +
    helpStep(5,'Put the Teach panel on the projector','During classroom input, switch to Teach and select the relevant topic. Key concepts display clearly on screen. Use Classroom Mode (top bar) for a clean full-screen view.') +
    '</div>' +
    '<div class="help-tip info"><i class="ti ti-wifi-off"></i><div><strong>Works offline:</strong> Once downloaded and opened, the platform needs no internet. The only exception is external resource links — those open in a new tab and require a connection.</div></div>'
  );

  /* Section 2 — All Features */
  html += helpSection('hs-tabs','ti-layout-grid','background:var(--purple-l);color:var(--purple)','All Features — What Every Tab Does','A complete reference for every panel and what to use it for.',
    tabDefs.map(function(t){
      return '<div class="help-feature-row">' +
        '<div class="help-feature-label"><i class="ti ' + t.icon + '"></i>' + t.label + '</div>' +
        '<div class="help-feature-desc">' + t.desc + '</div></div>';
    }).join('')
  );

  /* Section 3 — Classroom Use */
  html += helpSection('hs-classroom','ti-presentation','background:#1A2235;color:#7EC8E3','Using the App in the Classroom','Projector display, student devices and different lesson formats.',
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem;margin-bottom:1rem">' +
    helpInfoCard('ti-device-desktop','Teacher projector only','The most common setup. Open the app on your laptop, connect to the projector, and navigate panels as you teach. Use Classroom Mode for concept display. Use Worksheets + print for student activities.') +
    helpInfoCard('ti-device-mobile','Student devices (BYOD)','Students open index.html on their own devices. The app is fully mobile-responsive. Quiz panel works well for independent practice — each student tracks their own score.') +
    helpInfoCard('ti-devices','Shared school computers','Copy the oakhill folder to the school network. Students open index.html from the shared drive. Progress tracking uses localStorage — each device tracks independently.') +
    '</div>' +
    '<div class="help-tip"><i class="ti ti-bulb"></i><div><strong>Best classroom workflow:</strong> Keep the app open on the projector throughout the lesson. Switch tabs as you move through phases — Teach (input) → Worksheets (activity) → Quiz (exit). Students see your navigation and learn the platform structure.</div></div>' +
    '<div class="help-tip info"><i class="ti ti-presentation"></i><div><strong>Classroom Mode tips:</strong> Activate before the lesson starts. Use Previous / Next to walk through topics. The dark background and large white text works well even in poorly blacked-out rooms.</div></div>'
  );

  /* Section 4 — Lesson Order */
  var phaseHTML = '<p style="font-size:13.5px;color:var(--text2);line-height:1.7;margin-bottom:1.25rem">' + seq.overview + '</p>';
  seq.phases.forEach(function(phase){
    phaseHTML += '<div style="margin-bottom:1.5rem">' +
      '<div style="margin-bottom:.6rem"><span class="ctag ' + phase.colour + '">' + phase.label + '</span></div>' +
      '<p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:.75rem">' + phase.desc + '</p>' +
      '<table class="help-lesson-table"><thead><tr><th>No.</th><th>Title</th><th>Use these tabs</th><th>Key delivery tip</th></tr></thead><tbody>' +
      phase.lessons.map(function(l){
        return '<tr><td>' + l.num + '</td><td>' + l.title + '</td>' +
          '<td><span style="font-size:12px;color:var(--acc);font-weight:600">' + l.tab + '</span></td>' +
          '<td>' + l.tip + '</td></tr>';
      }).join('') +
      '</tbody></table></div>';
  });
  phaseHTML += '<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.25rem">' +
    '<div class="s-label" style="margin-bottom:.5rem"><i class="ti ti-repeat"></i> Use throughout the whole course</div>' +
    '<ul style="padding-left:1.25rem;margin:0">' +
    seq.ongoing.map(function(o){ return '<li style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:.3rem">' + o + '</li>'; }).join('') +
    '</ul></div>';
  html += helpSection('hs-sequence','ti-list-numbers','background:var(--amber-l);color:var(--amber-d)','Recommended Lesson Order — ' + S.name,'Suggested teaching sequence with the app panels to use in each lesson.', phaseHTML);

  /* Section 5 — SEN Guidance */
  html += helpSection('hs-sen','ti-accessibility','background:#EEF6FF;color:#185FA5','SEN Guidance — How the Platform Supports All Learners','Built-in adaptations and how to get the most from them.',
    '<div class="help-tip success"><i class="ti ti-check"></i><div>Every lesson plan has a <strong>blue SEN Adaptations panel</strong> at the top of the lesson detail. It explains exactly what scaffolding is built into that lesson and why. Read it before you teach.</div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.75rem;margin:1rem 0">' +
    helpSenCard('ti-file-text','Writing frames throughout','Every lesson that requires written output provides sentence starters, completion frames or structured tables. Students never face a blank page.') +
    helpSenCard('ti-sort-ascending','One concept at a time','Lessons introduce a maximum of two new terms per session. Vocabulary is revisited before new terms are added.') +
    helpSenCard('ti-cards','Sorting before writing','Where possible, students sort, match or label before they write — reducing cognitive load and building confidence first.') +
    helpSenCard('ti-users','Pair work throughout','Activities default to pair or small-group work before individual tasks. Peer support is built into the lesson structure.') +
    helpSenCard('ti-clock','Short, timed tasks','Each activity within a lesson is 5–13 minutes maximum. Timers create gentle urgency and prevent students getting stuck.') +
    helpSenCard('ti-microphone','Oral contributions valued','Discussion and verbal responses are explicitly validated. Several lessons are primarily discussion-led with minimal writing.') +
    '</div>' +
    '<div class="help-tip"><i class="ti ti-bulb"></i><div><strong>Additional support:</strong> For students with very low literacy, the Quick Quiz (multiple choice) and sorting activities generate mark-able evidence with minimal writing. For high exam anxiety, the Mock Exam\'s "this is training, not a test" framing is built in — reinforce this verbally before starting.</div></div>'
  );

  /* Section 6 — Tips */
  html += helpSection('hs-tips','ti-keyboard','background:var(--surface2);color:var(--text)','Useful Tips & Shortcuts','Save time and get more from the platform every lesson.',
    '<div style="margin-bottom:1.25rem"><div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:.5rem">Browser shortcuts</div>' +
    '<div class="help-shortcut-grid">' +
    [['Ctrl+P / Cmd+P','Print current worksheet'],['Ctrl+D / Cmd+D','Bookmark the app'],['F11','Browser full-screen'],['Ctrl+R / Cmd+R','Reload/reset app'],['Ctrl++ / Cmd++','Zoom in for projector'],['Ctrl+- / Cmd+-','Zoom out']].map(function(s){
      return '<div class="help-shortcut"><span class="help-kbd">' + s[0] + '</span><span>' + s[1] + '</span></div>';
    }).join('') + '</div></div>' +
    '<div style="margin-bottom:1rem"><div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:.75rem">Time-saving workflows</div>' +
    [
      '<strong>Pre-lesson setup (2 min):</strong> Open the app, select subject, set board, go to Teach, select today\'s topic. Projector display is ready before students arrive.',
      '<strong>5-minute exit quiz:</strong> Switch to Quiz, filter by today\'s topic, students answer 5 questions. Score is tracked automatically — visible in the header.',
      '<strong>Print in advance:</strong> Open Worksheets, preview the needed sheet, Ctrl+P before the lesson. Worksheets include today\'s date automatically.',
      '<strong>End of term reset:</strong> Progress → Clear session data. Resets scores for a new class or term. Does not affect other computers or devices.',
      '<strong>Differentiating the Mock Exam:</strong> Set 10 questions / 20 minutes for lower-confidence students; 25 questions / 60 minutes for those ready for full simulation.',
      '<strong>Written Practice for SEN:</strong> Filter by 2-mark questions first. Show the mark scheme on the projector. Students self-assess with a green pen before attempting the next question.'
    ].map(function(t){
      return '<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<i class="ti ti-star" style="color:var(--acc);font-size:15px;flex-shrink:0;margin-top:2px"></i>' +
        '<p style="font-size:13px;color:var(--text2);line-height:1.6;margin:0">' + t + '</p></div>';
    }).join('') + '</div>' +
    '<div class="help-tip info"><i class="ti ti-refresh"></i><div><strong>Updating the platform:</strong> To install a new version, replace <strong>js/data.js</strong> in your oakhill folder — new content appears immediately. Only replace style.css and app.js if there are design or feature updates.</div></div>'
  );

  setEl('help-content', html);
}

function setEl(id, html) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ═══════════════════════════════════════
   NEW FEATURES — v5
   Lesson Timer · Print Lesson · Sticky Notes
   Exam Countdown · Differentiation · Speech-to-Text
═══════════════════════════════════════ */

/* ─── EXAM COUNTDOWN ─── */
var countdownInterval = null;

function openCountdownSetup() {
  var saved = getSavedCountdown();
  if (saved) {
    document.getElementById('exam-date-input').value = saved.date || '';
    document.getElementById('exam-label-input').value = saved.label || '';
  }
  document.getElementById('countdown-modal').style.display = 'flex';
}
function closeCountdownSetup() {
  document.getElementById('countdown-modal').style.display = 'none';
}
function saveCountdown() {
  var date  = document.getElementById('exam-date-input').value;
  var label = document.getElementById('exam-label-input').value || 'Exam';
  if (!date) { alert('Please select a date.'); return; }
  try { localStorage.setItem('oakhill_exam_countdown', JSON.stringify({ date, label })); } catch(e) {}
  closeCountdownSetup();
  startCountdownTick();
}
function clearCountdown() {
  try { localStorage.removeItem('oakhill_exam_countdown'); } catch(e) {}
  document.getElementById('countdown-display').textContent = 'Set exam date';
  var el = document.getElementById('exam-countdown');
  el.classList.remove('urgent','soon');
  closeCountdownSetup();
}
function getSavedCountdown() {
  try { var s = localStorage.getItem('oakhill_exam_countdown'); return s ? JSON.parse(s) : null; } catch(e) { return null; }
}
function startCountdownTick() {
  updateCountdownDisplay();
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdownDisplay, 60000);
}
function updateCountdownDisplay() {
  var saved = getSavedCountdown();
  if (!saved) return;
  var now   = new Date();
  var exam  = new Date(saved.date + 'T09:00:00');
  var diff  = exam - now;
  var el    = document.getElementById('exam-countdown');
  var disp  = document.getElementById('countdown-display');
  el.classList.remove('urgent','soon');
  if (diff < 0) {
    disp.textContent = saved.label + ' — done';
  } else {
    var days  = Math.ceil(diff / (1000 * 60 * 60 * 24));
    var weeks = Math.floor(days / 7);
    var rem   = days % 7;
    var txt   = saved.label + ': ';
    if (weeks > 0) txt += weeks + 'w ';
    if (rem > 0 || weeks === 0) txt += rem || days;
    txt += weeks > 0 ? 'd' : ' days';
    disp.textContent = txt;
    if (days <= 7)  el.classList.add('urgent');
    else if (days <= 28) el.classList.add('soon');
  }
}

/* ─── STICKY NOTES ─── */
var stickyMicRecogniser = null;
var stickyMicActive = false;

function toggleStickyPanel() {
  var panel = document.getElementById('sticky-panel');
  var btn   = document.querySelector('.header-icon-btn');
  var isOpen = panel.style.display !== 'none' && panel.style.display !== '';
  panel.style.display = isOpen ? 'none' : 'flex';
  if (btn) btn.classList.toggle('active', !isOpen);
  if (!isOpen) {
    var saved = '';
    try { saved = localStorage.getItem('oakhill_sticky') || ''; } catch(e) {}
    var ta = document.getElementById('sticky-textarea');
    if (ta) { ta.value = saved; updateStickyWordCount(); }
  }
}
function saveStickyNote() {
  var ta = document.getElementById('sticky-textarea');
  if (!ta) return;
  try { localStorage.setItem('oakhill_sticky', ta.value); } catch(e) {}
  updateStickyWordCount();
}
function updateStickyWordCount() {
  var ta = document.getElementById('sticky-textarea');
  var wc = document.getElementById('sticky-word-count');
  if (!ta || !wc) return;
  var words = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
  wc.textContent = words + ' word' + (words !== 1 ? 's' : '');
}
function clearStickyNote() {
  if (!confirm('Clear all teacher notes?')) return;
  var ta = document.getElementById('sticky-textarea');
  if (ta) ta.value = '';
  try { localStorage.removeItem('oakhill_sticky'); } catch(e) {}
  updateStickyWordCount();
}
function printStickyNote() {
  var ta = document.getElementById('sticky-textarea');
  if (!ta || !ta.value.trim()) { alert('No notes to print.'); return; }
  var win = window.open('','_blank');
  win.document.write('<html><head><title>Teacher Notes — Oak Hill</title>' +
    '<style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:700px;margin:0 auto}' +
    'h2{font-size:18px;border-bottom:2px solid #1D9E75;padding-bottom:.5rem}' +
    'pre{font-family:inherit;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#333}' +
    'footer{margin-top:2rem;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:.5rem}</style>' +
    '</head><body><h2>Teacher Notes — Oak Hill Creative GCSEs</h2>' +
    '<pre>' + ta.value.replace(/</g,'&lt;') + '</pre>' +
    '<footer>Printed ' + new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</footer>' +
    '</body></html>');
  win.document.close();
  win.print();
}

function toggleStickyMic() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
    return;
  }
  if (stickyMicActive) {
    if (stickyMicRecogniser) stickyMicRecogniser.stop();
    setStickyMicState(false);
    return;
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  stickyMicRecogniser = new SR();
  stickyMicRecogniser.lang = 'en-GB';
  stickyMicRecogniser.continuous = true;
  stickyMicRecogniser.interimResults = true;
  var ta = document.getElementById('sticky-textarea');
  var baseText = ta ? ta.value : '';
  stickyMicRecogniser.onstart = function() { setStickyMicState(true); };
  stickyMicRecogniser.onend   = function() { setStickyMicState(false); };
  stickyMicRecogniser.onerror = function(e) {
    setStickyMicState(false);
    if (e.error !== 'no-speech') document.getElementById('sticky-mic-status').textContent = 'Error: ' + e.error;
  };
  stickyMicRecogniser.onresult = function(e) {
    var interim = '', final = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    if (ta) {
      baseText += final;
      ta.value = baseText + interim;
      saveStickyNote();
    }
  };
  stickyMicRecogniser.start();
}
function setStickyMicState(on) {
  stickyMicActive = on;
  var btn = document.getElementById('sticky-mic');
  var st  = document.getElementById('sticky-mic-status');
  if (btn) btn.classList.toggle('listening', on);
  if (st)  st.textContent = on ? '🔴 Listening — speak now' : 'Click mic to dictate';
}

/* ─── GLOBAL SPEECH-TO-TEXT (for text areas in Written Practice) ─── */
var globalMicRecogniser  = null;
var globalMicTargetId    = null;
var globalMicBaseText    = '';
var globalMicActive      = false;

function startFieldMic(targetId) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition requires Chrome or Edge browser.'); return;
  }
  if (globalMicActive && globalMicTargetId === targetId) {
    stopGlobalMic(); return;
  }
  if (globalMicActive) stopGlobalMic();

  globalMicTargetId = targetId;
  var ta = document.getElementById(targetId);
  globalMicBaseText = ta ? ta.value : '';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  globalMicRecogniser = new SR();
  globalMicRecogniser.lang = 'en-GB';
  globalMicRecogniser.continuous = true;
  globalMicRecogniser.interimResults = true;

  globalMicRecogniser.onstart = function() {
    globalMicActive = true;
    showSttToast('🔴 Listening — speak your answer…');
    var btn = document.getElementById('micbtn-' + targetId);
    if (btn) btn.classList.add('listening');
  };
  globalMicRecogniser.onend = function() {
    globalMicActive = false;
    hideSttToast();
    var btn = document.getElementById('micbtn-' + targetId);
    if (btn) btn.classList.remove('listening');
  };
  globalMicRecogniser.onerror = function(e) {
    globalMicActive = false;
    hideSttToast();
    var btn = document.getElementById('micbtn-' + targetId);
    if (btn) btn.classList.remove('listening');
    if (e.error !== 'no-speech') showSttToast('Error: ' + e.error, 2000);
  };
  globalMicRecogniser.onresult = function(e) {
    var interim = '', final = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    globalMicBaseText += final;
    var ta2 = document.getElementById(globalMicTargetId);
    if (ta2) ta2.value = globalMicBaseText + interim;
  };
  globalMicRecogniser.start();
}

function stopGlobalMic() {
  if (globalMicRecogniser) try { globalMicRecogniser.stop(); } catch(e) {}
  globalMicActive = false;
  hideSttToast();
  if (globalMicTargetId) {
    var btn = document.getElementById('micbtn-' + globalMicTargetId);
    if (btn) btn.classList.remove('listening');
  }
}
function showSttToast(msg, autohide) {
  var t = document.getElementById('stt-toast');
  var s = document.getElementById('stt-toast-text');
  if (t) t.style.display = 'flex';
  if (s) s.textContent = msg;
  if (autohide) setTimeout(hideSttToast, autohide);
}
function hideSttToast() {
  var t = document.getElementById('stt-toast');
  if (t) t.style.display = 'none';
}

/* ─── LESSON TIMER ─── */
var ltwTimer      = null;
var ltwPaused     = true;
var ltwSecondsLeft = 0;
var ltwTotalSecs  = 0;
var ltwActivities = [];
var ltwCurrent    = 0;
var ltwActSecs    = 0;
var ltwActTotal   = 0;

function openLessonTimer(lessonIndex) {
  var S = SUBJECTS[currentSubject];
  var l = S.lessons[lessonIndex];
  if (!l || !l.activities || l.activities.length === 0) return;

  /* Parse activities into timed segments */
  ltwActivities = l.activities.map(function(a) {
    var mins = 5; /* default */
    var m = a.time.match(/(\d+)-(\d+)/);
    if (m) mins = parseInt(m[2]) - parseInt(m[1]);
    return { label: a.time, desc: a.desc, secs: Math.max(mins, 1) * 60 };
  });

  ltwCurrent = 0;
  ltwPaused  = true;
  setLtwActivity(0);
  buildLtwDots();

  document.getElementById('lesson-timer-widget').style.display = 'block';
  updateLtwPlayBtn();
}

function setLtwActivity(idx) {
  if (idx < 0 || idx >= ltwActivities.length) return;
  ltwCurrent = idx;
  var act = ltwActivities[idx];
  ltwActTotal   = act.secs;
  ltwActSecs    = act.secs;
  setEl('ltw-activity-label', act.label);
  setEl('ltw-activity-desc', act.desc.substring(0, 120) + (act.desc.length > 120 ? '…' : ''));
  updateLtwDisplay();
  buildLtwDots();
  if (!ltwPaused) {
    clearInterval(ltwTimer);
    ltwTimer = setInterval(ltwTick, 1000);
  }
}

function ltwTick() {
  if (ltwPaused) return;
  ltwActSecs--;
  updateLtwDisplay();
  if (ltwActSecs <= 0) {
    if (ltwCurrent < ltwActivities.length - 1) {
      clearInterval(ltwTimer);
      /* Brief flash before next */
      document.getElementById('ltw-clock').classList.add('danger');
      setTimeout(function() {
        document.getElementById('ltw-clock').classList.remove('danger');
        setLtwActivity(ltwCurrent + 1);
        if (!ltwPaused) ltwTimer = setInterval(ltwTick, 1000);
      }, 800);
    } else {
      clearInterval(ltwTimer);
      ltwPaused = true;
      setEl('ltw-activity-label', 'Lesson complete!');
      setEl('ltw-activity-desc', '🎉 All activities done. Well done!');
      updateLtwPlayBtn();
    }
  }
}

function updateLtwDisplay() {
  var m = Math.floor(ltwActSecs / 60);
  var s = ltwActSecs % 60;
  var str = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  var el   = document.getElementById('ltw-clock');
  var fill = document.getElementById('ltw-bar-fill');
  if (el) {
    el.textContent = str;
    el.className = 'ltw-clock';
    if (ltwActSecs <= 60)  el.classList.add('danger');
    else if (ltwActSecs <= 120) el.classList.add('warn');
  }
  if (fill && ltwActTotal > 0) {
    var pct = (ltwActSecs / ltwActTotal) * 100;
    fill.style.width = pct + '%';
    fill.className = 'ltw-bar-fill';
    if (ltwActSecs <= 60)       fill.classList.add('danger');
    else if (ltwActSecs <= 120) fill.classList.add('warn');
  }
}

function buildLtwDots() {
  var html = ltwActivities.map(function(a, i) {
    var cls = i < ltwCurrent ? 'ltw-dot done' : i === ltwCurrent ? 'ltw-dot active' : 'ltw-dot';
    return '<div class="' + cls + '" onclick="ltwJump(' + i + ')" title="' + a.label + '"></div>';
  }).join('');
  setEl('ltw-dots', html);
}

function ltwToggle() {
  ltwPaused = !ltwPaused;
  if (!ltwPaused) {
    ltwTimer = setInterval(ltwTick, 1000);
  } else {
    clearInterval(ltwTimer);
  }
  updateLtwPlayBtn();
}
function updateLtwPlayBtn() {
  var btn = document.getElementById('ltw-play-btn');
  if (btn) btn.innerHTML = ltwPaused ? '<i class="ti ti-player-play"></i>' : '<i class="ti ti-player-pause"></i>';
}
function ltwNext() {
  clearInterval(ltwTimer);
  if (ltwCurrent < ltwActivities.length - 1) {
    setLtwActivity(ltwCurrent + 1);
    if (!ltwPaused) ltwTimer = setInterval(ltwTick, 1000);
  }
}
function ltwPrev() {
  clearInterval(ltwTimer);
  if (ltwCurrent > 0) {
    setLtwActivity(ltwCurrent - 1);
    if (!ltwPaused) ltwTimer = setInterval(ltwTick, 1000);
  }
}
function ltwJump(idx) {
  clearInterval(ltwTimer);
  setLtwActivity(idx);
  if (!ltwPaused) ltwTimer = setInterval(ltwTick, 1000);
}
function ltwRestart() {
  clearInterval(ltwTimer);
  setLtwActivity(ltwCurrent);
  if (!ltwPaused) ltwTimer = setInterval(ltwTick, 1000);
}
function closeLessonTimer() {
  clearInterval(ltwTimer);
  ltwPaused = true;
  document.getElementById('lesson-timer-widget').style.display = 'none';
}

/* ─── PRINT LESSON ─── */
var printLessonIndex = -1;

function openPrintLesson(idx) {
  printLessonIndex = idx;
  var S = SUBJECTS[currentSubject];
  var l = S.lessons[idx];
  if (!l) return;

  var today = new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'});
  var html = '<div class="print-lesson-view">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">' +
      '<div>' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--acc);margin-bottom:3px">Oak Hill School — ' + S.name + ' GCSE — ' + SUBJECTS[currentSubject].boards[currentBoard].name + '</div>' +
        '<h2 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px">Lesson ' + l.num + ': ' + l.title + '</h2>' +
        '<div class="plv-meta" style="display:flex;gap:12px;flex-wrap:wrap;color:var(--text2);font-size:13px">' +
          '<span><strong>Duration:</strong> ' + l.duration + '</span>' +
          '<span><strong>Topic:</strong> ' + l.topic + '</span>' +
          '<span><strong>AO:</strong> ' + l.ao + '</span>' +
          '<span><strong>Level:</strong> ' + l.level + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text3)">' + today + '</div>' +
    '</div>';

  html += '<div style="background:var(--surface2);border-radius:8px;padding:.75rem 1rem;margin-bottom:1rem;font-size:13.5px;color:var(--text2)"><strong>Objective:</strong> ' + l.objective + '</div>';

  if (l.sen) {
    html += '<div style="background:#EEF6FF;border:1px solid #5B9BD5;border-left:4px solid #185FA5;border-radius:6px;padding:10px 14px;margin-bottom:1rem;font-size:13px;color:#042C53">' +
      '<strong style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#185FA5;margin-bottom:4px">SEN Adaptations</strong>' + l.sen + '</div>';
  }

  html += '<div style="margin-bottom:1rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:.5rem">Lesson Activities</div>';
  l.activities.forEach(function(a) {
    html += '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<span style="font-size:12px;font-weight:700;color:var(--acc);white-space:nowrap;flex-shrink:0;width:80px">' + a.time + '</span>' +
      '<span style="font-size:13px;color:var(--text2);line-height:1.55">' + a.desc + '</span>' +
    '</div>';
  });
  html += '</div>';

  if (l.resources && l.resources.length) {
    html += '<div style="margin-bottom:1rem"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:.5rem">Resources Needed</div>' +
      '<ul style="padding-left:1.25rem;margin:0">' +
      l.resources.map(function(r){ return '<li style="font-size:13px;color:var(--text2);margin-bottom:3px">' + r + '</li>'; }).join('') +
      '</ul></div>';
  }

  if (l.homework) {
    html += '<div style="background:var(--amber-l);border:1px solid var(--amber);border-radius:6px;padding:.75rem 1rem;font-size:13px;color:var(--amber-d)">' +
      '<strong>Homework:</strong> ' + l.homework + '</div>';
  }

  html += '</div>';

  setEl('print-lesson-content', html);
  document.getElementById('print-lesson-modal').style.display = 'flex';
}

function closePrintLesson() {
  document.getElementById('print-lesson-modal').style.display = 'none';
}

function doPrintLesson() {
  var content = document.getElementById('print-lesson-content').innerHTML;
  var win = window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><title>Lesson Plan — Oak Hill</title>' +
    '<style>*{box-sizing:border-box;margin:0;padding:0}' +
    'body{font-family:system-ui,-apple-system,sans-serif;padding:2rem;color:#111;max-width:800px;margin:0 auto}' +
    'strong{font-weight:600}' +
    '@media print{body{padding:1rem}}' +
    '</style></head><body>' + content + '</body></html>');
  win.document.close();
  setTimeout(function(){ win.print(); }, 300);
}

/* ─── DIFFERENTIATION LEVELS ─── */
/* Assign levels to questions in data */
var diffLevels = { foundation: 'f', core: 'c', extension: 'e' };
var currentDiffFilter = 'all';

function getDiffLevel(q) {
  /* Assign based on marks or topic complexity */
  if (q.marks) {
    if (q.marks <= 2) return 'f';
    if (q.marks <= 8) return 'c';
    return 'e';
  }
  /* For quiz questions — rotate through based on index */
  return 'c';
}

function buildDiffBar(containerId, onchange) {
  var html = '<div class="diff-filter-bar">' +
    '<label><i class="ti ti-adjustments" style="font-size:13px"></i> Level:</label>' +
    ['all','f','c','e'].map(function(v) {
      var labels = { all:'All', f:'Foundation', c:'Core', e:'Extension' };
      var cls    = 'diff-pill' + (currentDiffFilter === v ? ' active-' + v : '');
      return '<button class="' + cls + '" onclick="setDiffFilter(\'' + v + '\',\'' + containerId + '\')">' + labels[v] + '</button>';
    }).join('') +
    '</div>';
  return html;
}

function setDiffFilter(val, panel) {
  currentDiffFilter = val;
  if (panel === 'quiz')    { filterQuiz(); }
  if (panel === 'written') { filterWritten(); }
}

/* ─── PATCH renderWritten to add mic buttons and diff filter ─── */
var _origRenderWritten = renderWritten;
renderWritten = function() {
  var S  = SUBJECTS[currentSubject];
  var qs = S.writtenQuestions || [];
  if (qs.length === 0) {
    setEl('written-area','<p style="color:var(--text2);padding:1rem">Written questions coming soon.</p>'); return;
  }
  var mf = currentWrittenFilter;
  var tf = currentWrittenTopicFilter;
  var filtered = qs.filter(function(q) {
    var markOk  = (mf === 'all' || String(q.marks) === mf);
    var topicOk = (tf === 'all' || q.topic === tf);
    var diffOk  = (currentDiffFilter === 'all' || getDiffLevel(q) === currentDiffFilter);
    return markOk && topicOk && diffOk;
  });

  /* Prepend diff bar */
  var diffBar = buildDiffBar('written', 'written');

  if (filtered.length === 0) {
    setEl('written-area', diffBar + '<p style="color:var(--text2);padding:1rem">No questions match.</p>'); return;
  }

  var html = diffBar + filtered.map(function(q, i) {
    var key  = 'w_' + i + '_' + currentSubject;
    var dlvl = getDiffLevel(q);
    var dmap = { f:'Foundation', c:'Core', e:'Extension' };
    var dclr = { f:'ctag-g', c:'ctag-b', e:'ctag-p' };
    return '<div class="written-question">' +
      '<div class="written-q-header">' +
        '<span class="marks-badge">[' + q.marks + ' marks]</span>' +
        '<span class="ctag ctag-b">' + q.topic + '</span>' +
        '<span class="ctag ' + dclr[dlvl] + '">' + dmap[dlvl] + '</span>' +
      '</div>' +
      '<h4>' + q.question + '</h4>' +
      '<div class="stt-field-wrap">' +
        '<textarea class="student-answer-area" placeholder="Write or dictate your answer…" rows="6" id="ans-' + key + '"></textarea>' +
        '<button class="stt-field-btn" id="micbtn-ans-' + key + '" onclick="startFieldMic(\'ans-' + key + '\')" title="Dictate answer"><i class="ti ti-microphone"></i></button>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button class="btn-sm btn-accent" onclick="toggleMS(\'' + key + '\')"><i class="ti ti-eye"></i> Mark scheme</button>' +
        '<button class="btn-sm" onclick="toggleMA(\'' + key + '\')"><i class="ti ti-file-text"></i> Model answer</button>' +
        '<button class="btn-sm" onclick="clearWritten(\'' + key + '\')"><i class="ti ti-trash"></i> Clear</button>' +
      '</div>' +
      '<div class="mark-scheme" id="ms-' + key + '"><h5><i class="ti ti-check"></i> Mark scheme</h5><p>' + (q.markScheme||'').replace(/\n/g,'<br>') + '</p></div>' +
      '<div class="model-answer" id="ma-' + key + '"><h5><i class="ti ti-file-text"></i> Model answer</h5><p>' + (q.modelAnswer||'').replace(/\n/g,'<br><br>') + '</p></div>' +
      '</div>';
  }).join('');
  setEl('written-area', html);
};

/* ─── PATCH openLessonDetail to add Timer + Print buttons ─── */
var _origOpenLessonDetail = openLessonDetail;
openLessonDetail = function(i) {
  _origOpenLessonDetail(i);
  /* Append action buttons to back-btn row */
  var backBtn = document.querySelector('.lesson-detail .back-btn');
  if (backBtn && backBtn.parentNode) {
    /* Add timer and print buttons after the back button */
    var timerBtn = document.createElement('button');
    timerBtn.className = 'print-lesson-btn';
    timerBtn.innerHTML = '<i class="ti ti-clock"></i> Start timer';
    timerBtn.onclick = function(){ openLessonTimer(i); };

    var printBtn = document.createElement('button');
    printBtn.className = 'print-lesson-btn';
    printBtn.innerHTML = '<i class="ti ti-printer"></i> Print plan';
    printBtn.onclick = function(){ openPrintLesson(i); };

    backBtn.parentNode.appendChild(timerBtn);
    backBtn.parentNode.appendChild(printBtn);
  }
};

/* ─── INIT NEW FEATURES ─── */
(function initNewFeatures() {
  /* Load sticky note */
  try {
    var saved = localStorage.getItem('oakhill_sticky');
    if (saved) { /* loaded when panel opens */ }
  } catch(e) {}
  /* Start countdown if saved */
  startCountdownTick();
})();
