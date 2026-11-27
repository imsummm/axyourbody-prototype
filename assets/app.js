/* AX YOUR BODY 프로토타입 공용 조작 스크립트.
 * - 화면의 누를 수 있는 요소는 data-action="<이름>"으로 이 파일의 A 객체 처리 코드와 이어진다.
 * - 다른 화면으로 가는 것은 실제 경로 링크(../m5/ 같은 형식)다. 모바일은 m*, 데스크톱은 d*로만 간다.
 * - 상태는 이 기기의 localStorage에 'ax-' 키로 둔다. 서버·외부 API·실제 소리는 없다.
 */
(function () {
  'use strict';

  /* ---------- 공용 도구 ---------- */
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('ax-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem('ax-' + k, JSON.stringify(v)); } catch (e) { /* 저장이 막힌 브라우저에서는 화면 안에서만 바뀐다 */ }
    }
  };
  var m = location.pathname.match(/\/([md])(\d+)\/?(?:index\.html)?$/) || [];
  var KIND = m[1] || 'm';
  var NUM = +(m[2] || 0);
  var params = new URLSearchParams(location.search);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function words(s) { return (s || '').split(/\s+/).filter(Boolean); }
  function swap(el, add, remove) {
    words(remove).forEach(function (c) { el.classList.remove(c); });
    words(add).forEach(function (c) { el.classList.add(c); });
  }
  function screenUrl(n, q) { return '../' + KIND + n + '/' + (q || ''); }
  function go(n, q) { location.href = screenUrl(n, q); }
  // 8 플레이어에서 나갈 때는 방문 기록에서 8을 빼서, 9·5의 뒤로가 플레이어를 다시 열지 않게 한다.
  function leaveTo(n, q) { location.replace(screenUrl(n, q)); }
  function text(el, s) { if (el) el.textContent = s; }
  function valueOf(el) { return el.getAttribute('data-value') || el.textContent.trim(); }

  var toastTimer;
  function toast(msg) {
    var t = $('#ax-toast');
    if (!t) {
      t = document.createElement('p');
      t.id = 'ax-toast';
      t.setAttribute('role', 'status');
      t.className = 'fixed left-1/2 -translate-x-1/2 bottom-16 mb-4 z-50 max-w-[440px] px-4 py-3 rounded-md bg-ink text-white text-body-sm text-center hidden';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add('hidden'); }, 2400);
  }

  /* 칩 묶음: 감싸는 요소에 data-group="저장 키", data-on="고른 칩 클래스", data-off="안 고른 칩 클래스" */
  function paint(group, chosen) {
    var multi = group.hasAttribute('data-multi');
    $$('[data-action~="pick"]', group).forEach(function (b) {
      var on = multi ? chosen.indexOf(valueOf(b)) > -1 : valueOf(b) === chosen;
      b.setAttribute('aria-pressed', String(on));
      swap(b, on ? group.getAttribute('data-on') : group.getAttribute('data-off'), on ? group.getAttribute('data-off') : group.getAttribute('data-on'));
    });
  }
  function groupValue(group) {
    var multi = group.hasAttribute('data-multi');
    var vals = $$('[data-action~="pick"][aria-pressed="true"]', group).map(valueOf);
    return multi ? vals : (vals[0] || '');
  }
  function restoreGroups() {
    $$('[data-group]').forEach(function (g) {
      var key = g.getAttribute('data-group');
      var saved = g.hasAttribute('data-keep') ? store.get(key, null) : null;
      if (saved !== null) paint(g, saved);
      else paint(g, groupValue(g));
      changed(g, false);
    });
  }
  var ON_CHANGE = {};
  function changed(group, byUser) {
    // data-label="요소 id": 고른 칩의 data-name(없으면 값)을 요약 글자로 보여 준다.
    var lab = document.getElementById(group.getAttribute('data-label'));
    if (lab) {
      var b = $('[data-action~="pick"][aria-pressed="true"]', group);
      if (b) lab.textContent = b.getAttribute('data-name') || valueOf(b);
    }
    var f = ON_CHANGE[group.getAttribute('data-group')];
    if (f) f(groupValue(group), group, byUser);
  }

  /* ---------- 조작 이름 → 처리 코드 ---------- */
  var A = {
    // FLOW:nav — 메뉴·설정·로고는 실제 화면 경로 링크다. 뒤로·닫기는 이전 화면, 이전 화면이 없으면 data-to 화면으로.
    'back': function (el, e) {
      if (e) e.preventDefault();
      var to = el.getAttribute('data-to');
      var fromSite = document.referrer && document.referrer.indexOf(location.origin) === 0;
      if (fromSite && history.length > 1) history.back();
      else if (to) go(to);
    },
    // FLOW:today-start — 1의 "오늘 할 운동" 카드는 7(?r=core 루틴 자세히)로, "+ 먹은 것"은 4(빠른 기록)로 가는 링크다. 7의 시작하기가 8로 잇는다.
    'go': function (el) { go(el.getAttribute('data-to'), el.getAttribute('data-query') || ''); },

    // FLOW:today-chips — 1·2·3의 어젯밤 잠·오늘 몸 상태 칩. data-keep 묶음이라 고르면 ax-p<화면>-sleep/-body에 저장되고 다시 열면 복원된다.
    // 칩 하나 고르기(묶음 안 한 개) 또는 여러 개 고르기(data-multi). data-keep이면 저장한다.
    'pick': function (el) {
      var g = el.closest('[data-group]');
      if (!g) return;
      if (g.hasAttribute('data-multi')) {
        var cur = groupValue(g), v = valueOf(el), i = cur.indexOf(v);
        if (i > -1) cur.splice(i, 1); else cur.push(v);
        paint(g, cur);
      } else {
        paint(g, valueOf(el));
      }
      if (g.hasAttribute('data-keep')) store.set(g.getAttribute('data-group'), groupValue(g));
      changed(g, true);
      // data-saved="요소 id": 저장했다는 글자를 잠깐 보여 준다(m3 원래 동작).
      var sv = document.getElementById(g.getAttribute('data-saved'));
      if (sv) { sv.classList.remove('opacity-0'); setTimeout(function () { sv.classList.add('opacity-0'); }, 1500); }
    },

    // 시트·서랍·창 열고 닫기: data-target="요소 id"
    'open': function (el) {
      var t = document.getElementById(el.getAttribute('data-target'));
      if (t) { t.classList.remove('hidden'); var f = $('input,button', t); if (f) f.focus(); }
    },
    'close': function (el) {
      var t = document.getElementById(el.getAttribute('data-target'));
      if (t) t.classList.add('hidden');
    },
    'toast': function (el) { toast(el.getAttribute('data-msg')); },
    'scroll': function (el, e) {
      if (e) e.preventDefault();
      var t = document.getElementById(el.getAttribute('data-target'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // 7 바로 시작(버튼일 때) → 8, 같은 루틴
    'start': function () { var f = params.get('from'); go(8, '?r=' + RID + (f ? '&from=' + f : '')); },
    // 7 할 운동에 추가 → ax-plan. 5의 할 운동 목록에 보인다.
    'add-plan': function () {
      addPlan({ id: 'add-' + RID, day: '', when: '이번 주', name: ROUTINE.name, min: ROUTINE.min, r: RID });
      text($('#rt-add-text'), '할 운동에 넣었어요');
      toast('이번 주 할 운동에 넣었어요. 운동 탭에서 볼 수 있어요');
    },
    // 7 미리보기: 소리·영상 없이 동작 이름을 1.5초씩 차례로 보여 준다. 다시 누르면 멈춘다.
    'preview': function (el) {
      var badge = $('#rt-preview-text');
      var icon = $('use', el);
      if (previewTimer) {
        clearInterval(previewTimer); previewTimer = null;
        text(badge, '미리보기 1분'); if (icon) icon.setAttribute('href', '../assets/icons.svg#i-play');
        el.setAttribute('aria-label', '동작 미리보기 재생');
        return;
      }
      var i = 0;
      function show() { text(badge, (i + 1) + '/' + ROUTINE.moves.length + ' · ' + ROUTINE.moves[i][0]); }
      show();
      if (icon) icon.setAttribute('href', '../assets/icons.svg#i-pause');
      el.setAttribute('aria-label', '미리보기 멈춤');
      previewTimer = setInterval(function () {
        i += 1;
        if (i >= ROUTINE.moves.length) { A['preview'](el); return; }
        show();
      }, 1500);
    },
    // 6 저장 표시 켜고 끄기
    'bookmark': function (el, e) {
      if (e) e.preventDefault();
      var r = el.getAttribute('data-r'), saved = savedList(), i = saved.indexOf(r);
      if (i > -1) saved.splice(i, 1); else saved.push(r);
      store.set('saved', saved);
      paintBookmarks();
      applyLibrary();
      toast(i > -1 ? '저장을 뺐어요' : '저장했어요. "저장됨"에서 다시 볼 수 있어요');
    },
    'reset-library': function () {
      $$('[data-group^="lib-"]').forEach(function (g) { paint(g, g.getAttribute('data-default') || '전체'); changed(g, true); });
    },
    // 5 거르기
    'apply-filter': function () { applyWeekly(); },
    'filter-check': function () {
      WF.checks = $$('input[data-action~="filter-check"]:checked').map(function (c) { return c.getAttribute('data-value'); });
      applyWeekly();
    },
    'reset-filter': function () {
      $$('[data-group^="wk-"]').forEach(function (g) {
        paint(g, g.hasAttribute('data-multi') ? [] : (g.getAttribute('data-default') || '전체'));
        changed(g, true);
      });
      $$('input[data-action~="filter-check"]').forEach(function (c) { c.checked = true; });
      WF.checks = null;
      applyWeekly();
    },
    // 8 플레이어 조작
    'pause': function () {
      P.paused = !P.paused;
      text($('#pause-text'), P.paused ? '이어서 하기' : '일시정지');
      var u = $('#pause-icon use'); if (u) u.setAttribute('href', '../assets/icons.svg#' + (P.paused ? 'i-play' : 'i-pause'));
    },
    'prev': function () { jump(P.i - 1); },
    'next': function () { P.skipped = true; if (P.i >= ROUTINE.moves.length - 1) finish(); else jump(P.i + 1); },
    'stop': function () {
      clearInterval(P.timer);
      if (P.done > 0) addLog('여기까지 했어요', P.done);
      leaveTo(5);
    },
    // 음성 안내 켜짐 ↔ 꺼짐 표시(소리는 내지 않음). ax-voice에 저장되어 7·8이 같이 쓴다.
    'voice': function () {
      store.set('voice', !voiceOn());
      paintVoice();
      toast(voiceOn() ? '음성 안내를 켰어요' : '음성 안내를 껐어요. 화면 글자로 안내해요');
    }
  };

  /* ---------- 화면별 처리 ---------- */
  // 루틴 자료: 1·3·5·6 화면 카드에 이미 나오는 루틴 네 개. 7(루틴 자세히)·8(플레이어)·9(다 했어요)가 ?r=<id>로 읽는다.
  var ROUTINES = {
    neck: { name: '목·어깨 풀기 스트레칭', min: 20, img: null,
      desc: '거북목·어깨 결림에 맞아요. 앉아서 굳은 목 앞쪽을 늘리고 어깨를 내려 줘요. 아프기 직전까지만 늘리고, 숨은 참지 않아요.',
      breath: ['4초 들이쉬고 · 6초 내쉬기', '목을 젖힐 때 들이쉬고, 제자리로 돌아오며 길게 내쉬어요. 머리 무게를 손에 맡기고 억지로 당기지 않아요.'],
      meta: '20분 · 동작 8개 · 의자·바닥·벽 하나면 돼요 · 뛰는 동작 없음',
      moves: [['턱 당기기', '목 뒤를 길게 세워요', 1, '천천히 숨을 내쉬며 턱을 목 쪽으로 가볍게 당겨요. 뒷목이 길게 늘어나는 느낌이면 돼요.'], ['목 옆 늘리기', '어깨 위 근육을 좌우로 늘려요', 2], ['어깨 돌리기', '앞뒤로 크게 원을 그려요', 2],
        ['가슴 열기', '말린 어깨를 뒤로 펴요', 3], ['날개뼈 모으기', '등 가운데를 조여 등을 펴요', 3], ['고양이 자세', '등을 둥글게 말았다 펴요', 3],
        ['벽 천사', '벽에 팔을 대고 올렸다 내려요', 3], ['숨 고르기', '눈을 감고 천천히 숨 쉬며 마쳐요', 3]] },
    core: { name: '코어·자세 루틴', min: 25, img: ['back-alignment.jpg', '모래색 매트 위에서 등을 곧게 펴는 동작'],
      desc: '오래 앉아 굳은 허리와 코어를 깨워요. 구부정한 등을 세우는 힘을 길러요. 허리가 뜨지 않게 배에 힘을 주고, 숨은 참지 않아요.',
      breath: ['버틸 때 길게 내쉬기', '힘을 줄 때 내쉬고 풀 때 들이쉬어요. 허리가 뜨지 않게 배에 힘을 준 채로 숨은 참지 않아요.'],
      meta: '25분 · 동작 7개 · 매트 하나면 돼요 · 뛰는 동작 없음',
      moves: [['고양이 자세', '등을 둥글게 말았다 펴며 몸을 데워요', 3], ['데드버그', '누워서 팔다리를 번갈아 뻗어요', 4], ['버드독', '네발 자세에서 팔과 다리를 뻗어요', 4],
        ['무릎 대고 플랭크', '배에 힘을 주고 몸을 곧게 버텨요', 3], ['브리지', '엉덩이를 들어 허리 아래를 받쳐요', 4], ['옆으로 누워 다리 들기', '골반 옆 근육을 깨워요', 4],
        ['숨 고르기', '누워서 천천히 숨 쉬며 마쳐요', 3]] },
    foam: { name: '폼롤러 등 풀기', min: 15, img: ['foam-roller.jpg', '베이지 러그 위에 놓인 폼롤러'],
      desc: '날개뼈 사이 뭉침을 풀어요. 아픈 곳에서는 멈춰서 숨을 길게 내쉬고, 뼈 위는 굴리지 않아요.',
      breath: ['뭉친 곳에서 6초 내쉬기', '아픈 곳에 머물 때 길게 내쉬면 힘이 풀려요. 굴릴 때는 편하게 숨 쉬어요.'],
      meta: '15분 · 동작 5개 · 폼롤러와 매트가 있으면 돼요',
      moves: [['등 위쪽 굴리기', '날개뼈 아래에 대고 천천히 굴려요', 3], ['날개뼈 사이 누르기', '팔을 모으고 뭉친 곳에 머물러요', 3],
        ['옆구리 굴리기', '옆으로 누워 겨드랑이 아래를 풀어요', 3], ['종아리 굴리기', '오래 앉아 굳은 종아리를 풀어요', 3], ['숨 고르기', '폼롤러 위에 누워 가슴을 열고 마쳐요', 3]] },
    desk: { name: '책상 앞 스트레칭', min: 10, img: ['desk-stretch.jpg', '나무 책상 앞에 앉아 손목과 어깨를 늘리는 사람'],
      desc: '야근 중에도 자리에서 할 수 있어요. 의자에 앉은 채로 목·어깨·손목을 풀어요.',
      breath: ['4초 들이쉬고 · 6초 내쉬기', '늘릴 때 내쉬고 돌아올 때 들이쉬어요. 어깨가 귀 쪽으로 올라가지 않게 내려 둬요.'],
      meta: '10분 · 동작 6개 · 의자 하나면 돼요 · 일어서지 않아도 돼요',
      moves: [['턱 당기기', '목 뒤를 길게 세워요', 1], ['손목 늘리기', '손바닥을 앞뒤로 젖혀요', 2], ['어깨 으쓱 내리기', '올렸다가 툭 떨어뜨려요', 2],
        ['앉아서 몸통 돌리기', '등받이를 잡고 좌우로 돌려요', 2], ['의자 잡고 가슴 열기', '뒤로 손을 모아 가슴을 펴요', 2], ['숨 고르기', '눈을 감고 천천히 숨 쉬며 마쳐요', 1]] }
  };
  var RID = ROUTINES[params.get('r')] ? params.get('r') : 'neck';
  var ROUTINE = ROUTINES[RID];

  // FLOW:routine-detail — 7: ?r=로 고른 루틴의 이름·설명·동작 순서를 그린다. 바로 시작 → 8(같은 ?r=), 할 운동에 추가 → ax-plan → 5, 미리보기는 동작 이름을 차례로 보여 준다.
  function renderRoutine() {
    text($('#rt-title'), ROUTINE.name);
    text($('#rt-desc'), ROUTINE.desc);
    text($('#rt-meta'), ROUTINE.meta);
    text($('#rt-breath-head'), ROUTINE.breath[0]);
    text($('#rt-breath'), ROUTINE.breath[1]);
    text($('#rt-count'), ROUTINE.moves.length + '개 · ' + ROUTINE.min + '분');
    var img = $('#rt-img');
    if (img && ROUTINE.img) { img.src = '../assets/img/' + ROUTINE.img[0]; img.alt = ROUTINE.img[1]; }
    var list = $('#rt-moves');
    if (list) {
      var tpl = list.firstElementChild.cloneNode(true);
      tpl.classList.add('border-b');
      while (list.firstChild) list.removeChild(list.firstChild);
      ROUTINE.moves.forEach(function (mv, i) {
        var li = tpl.cloneNode(true);
        text($('[data-f="no"]', li), String(i + 1));
        text($('[data-f="name"]', li), mv[0]);
        text($('[data-f="sub"]', li), mv[1]);
        text($('[data-f="min"]', li), mv[2] + '분');
        if (!list.hasAttribute('data-lines') || i === ROUTINE.moves.length - 1) li.classList.remove('border-b');
        list.appendChild(li);
      });
    }
    var start = $('#rt-start');
    var from = +(params.get('from') || 0);
    if (start && start.tagName === 'A') start.setAttribute('href', screenUrl(8, '?r=' + RID + (from ? '&from=' + from : '')));
    if (from) text($('#rt-meta'), ROUTINE.meta + ' · ' + from + '분까지 했어요. 시작하면 그다음부터 이어져요');
    var planned = store.get('plan', []).some(function (p) { return p.id === 'add-' + RID; });
    if (planned) text($('#rt-add-text'), '할 운동에 넣었어요');
    document.title = 'AX YOUR BODY · 운동 · ' + ROUTINE.name;
  }

  var previewTimer = null;
  function voiceOn() { return store.get('voice', true); }
  function paintVoice() {
    $$('[data-action~="voice"]').forEach(function (b) {
      var on = voiceOn();
      b.setAttribute('aria-pressed', String(on));
      var t = $('[data-voice-text]', b) || b;
      t.textContent = on ? b.getAttribute('data-text-on') : b.getAttribute('data-text-off');
    });
  }

  // 할 운동 계획: ax-plan = [{id, day, when, name, min, r}]. 5(이번 주 운동)의 "할 운동" 목록이 이것을 보여 준다.
  function addPlan(item) {
    var plan = store.get('plan', []).filter(function (p) { return p.id !== item.id; });
    plan.push(item);
    store.set('plan', plan);
  }

  // FLOW:sunday — 2 다시 시작: 시작하기 → 8(?r=neck), 나중에 → 1, "다음 주 하루 고르기" 요일을 고르면 그날 할 운동으로 ax-plan에 넣고 5에 보인다.
  ON_CHANGE['p2-nextday'] = function (day, g, byUser) {
    var b = $('[aria-pressed="true"]', g);
    if (!b) { text($('#next-day-label'), '아직 고르지 않았어요'); return; }
    var full = b.getAttribute('data-name');
    text($('#next-day-label'), full + ' · 목·어깨 풀기 20분');
    if (!byUser) return;
    addPlan({ id: 'sunday-pick', day: day, when: '다음 주 ' + full, name: '목·어깨 풀기 스트레칭', min: 20, r: 'neck' });
    toast('다음 주 ' + full + '에 목·어깨 풀기 20분을 넣어 뒀어요');
  };

  // FLOW:busy-week — 3 "이번 주 바쁜가요?" 답을 ax-p3-busy에 저장. "예"면 오늘 할 운동을 책상 앞 스트레칭 10분(?r=desk)으로 바꾸고, "아니요"면 코어·자세 25분 그대로.
  ON_CHANGE['p3-busy'] = function (v, g, byUser) {
    var busy = v === '예';
    text($('#today-name'), busy ? '책상 앞 스트레칭 · 10분' : '코어·자세 루틴 · 25분');
    text($('#today-desc'), busy ? '야근 중에도 자리에서 할 수 있어요' : '오래 앉아 굳은 허리와 코어를 깨워요');
    var link = $('#today-link');
    if (link) link.setAttribute('href', screenUrl(7, busy ? '?r=desk' : '?r=core'));
    if (v) text($('#week-note'), busy ? '이번 주 남은 운동은 10분짜리로 바꿨어요' : '오늘과 금요일 할 운동은 그대로예요');
    if (!byUser) return;
    if (busy) addPlan({ id: 'busy-fri', day: '금', when: '금요일', name: '책상 앞 스트레칭', min: 10, r: 'desk', note: '바쁜 주라 코어·자세 20분 대신' });
    else store.set('plan', store.get('plan', []).filter(function (p) { return p.id !== 'busy-fri'; }));
  };


  // 운동 기록: ax-log = [{r, name, min, status:'했어요'|'여기까지 했어요', doneSec, at}]. 5(이번 주 운동)·9(다 했어요)가 읽는다.
  function addLog(status, doneSec) {
    var log = store.get('log', []);
    log.push({ r: RID, name: ROUTINE.name, min: ROUTINE.min, status: status, doneSec: doneSec, at: new Date().toISOString() });
    store.set('log', log);
    // "했어요"이면 7에서 이번 주 할 운동으로 넣은 같은 루틴(add-<id>)만 목록에서 뺀다.
    // 2에서 고른 다음 주 요일(sunday-pick)이나 3의 금요일(busy-fri)처럼 날을 정한 계획은 그대로 둔다.
    if (status === '했어요') store.set('plan', store.get('plan', []).filter(function (x) { return x.id !== 'add-' + RID; }));
  }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(sec) { return two(Math.floor(sec / 60)) + ':' + two(sec % 60); }
  function minSec(sec) { return Math.floor(sec / 60) + '분 ' + two(sec % 60) + '초'; }

  // FLOW:player — 8: 1/N 동작부터 시작. 동작 남은 시간과 전체 남은 시간이 함께 줄고, 00:00이 되면 다음 동작으로 넘어간다.
  // 일시정지 ↔ 이어서 하기, 이전·다음은 동작 번호·진행 막대·다음 동작 카드를 바꾼다. 음성 켜짐 ↔ 꺼짐은 표시만(소리 없음).
  // 끝까지 하면 "했어요"로 기록하고 9로, 닫기·그만하기는 "여기까지 했어요"로 기록하고 5로 간다. ?fast=30이면 30배 빠르게(확인용).
  var P = { i: 0, left: 0, done: 0, paused: false, timer: null, skipped: false };
  function moveSec(k) { return ROUTINE.moves[k][2] * 60; }
  function totalLeft() {
    var t = P.left;
    for (var k = P.i + 1; k < ROUTINE.moves.length; k++) t += moveSec(k);
    return t;
  }
  function paintPlayer() {
    var n = ROUTINE.moves.length, mv = ROUTINE.moves[P.i], nx = ROUTINE.moves[P.i + 1];
    text($('#pl-title'), ROUTINE.name + ' · ' + ROUTINE.min + '분');
    text($('#pl-step'), (P.i + 1) + ' / ' + n + ' 동작');
    text($('#pl-move'), mv[0]);
    text($('#pl-guide'), mv[3] || (mv[1] + '. 아프기 직전까지만 하고, 숨은 참지 않아요.'));
    text($('#pl-timer'), mmss(P.left));
    text($('#pl-total'), '전체 ' + minSec(totalLeft()) + ' 남음');
    text($('#pl-next'), nx ? nx[0] : '마지막 동작이에요');
    text($('#pl-next-min'), nx ? nx[2] + '분' : '');
    text($('#pl-count'), n + '개 · ' + ROUTINE.min + '분');
    var bar = $('#pl-bar');
    if (bar) {
      bar.style.gridTemplateColumns = 'repeat(' + n + ', minmax(0, 1fr))';
      bar.setAttribute('aria-label', '진행 ' + (P.i + 1) + ' / ' + n);
      while (bar.children.length < n) bar.appendChild(document.createElement('span'));
      while (bar.children.length > n) bar.removeChild(bar.lastChild);
      Array.prototype.forEach.call(bar.children, function (sp, k) { sp.className = 'h-1 rounded-full ' + (k <= P.i ? 'bg-ink' : 'bg-hairline'); });
    }
    var list = $('#pl-list');
    if (list) {
      while (list.firstChild) list.removeChild(list.firstChild);
      ROUTINE.moves.forEach(function (m2, k) {
        var li = document.createElement('li');
        var now = k === P.i;
        li.className = 'py-2 px-3 flex justify-between ' + (now ? 'rounded-md bg-ink text-white' : (k < P.i ? 'text-mute' : 'text-ink'));
        if (now) li.setAttribute('aria-current', 'step');
        var a = document.createElement('span'); a.textContent = (k + 1) + ' · ' + m2[0];
        var b = document.createElement('span'); b.textContent = m2[2] + '분'; if (!now) b.className = 'text-mute';
        li.appendChild(a); li.appendChild(b); list.appendChild(li);
      });
    }
    $$('[data-action~="prev"]').forEach(function (b) { b.disabled = P.i === 0; });
  }
  function jump(k) {
    P.i = Math.max(0, Math.min(ROUTINE.moves.length - 1, k));
    P.left = moveSec(P.i);
    paintPlayer();
  }
  // 끝까지 진행했으면 "했어요" → 9. 다음 버튼으로 건너뛴 동작이 있으면 "여기까지 했어요" → 5.
  function finish() {
    clearInterval(P.timer);
    if (P.skipped) { addLog('여기까지 했어요', P.done); leaveTo(5); return; }
    addLog('했어요', P.done);
    leaveTo(9, '?r=' + RID);
  }
  function startPlayer() {
    if (ROUTINE.img && $('#pl-img')) { $('#pl-img').src = '../assets/img/' + ROUTINE.img[0]; $('#pl-img').alt = ROUTINE.img[1]; }
    document.title = 'AX YOUR BODY · 운동 · ' + ROUTINE.name + ' 하는 중';
    var speed = Math.max(1, Math.min(120, +(params.get('fast') || 1)));
    jump(0);
    // ?from=분: 그 시간까지 한 것으로 치고 다음 순간부터 이어서 한다(6·7의 "이어서 하기").
    var skip = Math.max(0, Math.min(ROUTINE.min - 1, +(params.get('from') || 0))) * 60;
    while (skip > 0) {
      var step = Math.min(skip, P.left);
      P.left -= step; P.done += step; skip -= step;
      if (P.left <= 0) { P.i += 1; P.left = moveSec(P.i); }
    }
    paintPlayer();
    P.timer = setInterval(function () {
      if (P.paused) return;
      for (var t = 0; t < speed; t++) {
        P.done += 1;
        P.left -= 1;
        if (P.left <= 0) {
          if (P.i >= ROUTINE.moves.length - 1) { P.left = 0; paintPlayer(); finish(); return; }
          P.i += 1; P.left = moveSec(P.i);
        }
      }
      paintPlayer();
    }, 1000);
  }


  // FLOW:done — 9: 방금 기록한 운동(ax-log 마지막 줄)의 이름과 한 시간을 보여 준다. 어땠는지·뻐근한 곳 답은 그 기록 줄의 feel·sore로 저장되어 6에 보인다. 확인 → 1(오늘로) 또는 5(이번 주 운동).
  function initDone() {
    var log = store.get('log', []);
    var last = log[log.length - 1];
    if (last && params.get('r')) {
      text($('#dn-name'), last.name + ' · ' + minSec(last.doneSec));
      if (last.r !== 'neck') text($('#dn-note'), '이번 주 운동에 "' + last.status + '"로 남겼어요.');
    }
    $$('[data-group="done-feel"],[data-group="done-sore"]').forEach(function (g) {
      paint(g, (last && last[g.getAttribute('data-group') === 'done-feel' ? 'feel' : 'sore']) || '');
    });
    paintNextDay();
  }


  // FLOW:weekly — 5: 8에서 남긴 기록(ax-log)을 "11/1 일(오늘)" 줄로 목록 위에 더하고, 이번 주 횟수와 일요일 점에 반영한다.
  // ax-plan의 할 운동도 목록 끝에 "할 운동" 줄로 보인다. 위쪽 탭은 5↔6 링크, "+ 할 운동 추가"는 6(따라 할 운동)으로 가서 7에서 넣는다.
  // 거르기: 장소·했는지(모바일은 시트에서 고르고 "이 조건으로 보기"), 데스크톱은 기간·장소·종류·했는지를 바로 적용한다.
  var KIND_OF = { neck: '스트레칭', core: '코어', foam: '폼롤러', desk: '스트레칭' };
  var CHIP = { '했어요': 'bg-ink text-white', '여기까지 했어요': 'bg-stone text-ink', '못 했어요': 'bg-card text-mute', '할 운동': 'bg-canvas text-ink border border-stone' };
  var WF = { place: '전체', status: '전체', kind: [], checks: null };
  function weeklyRow(tpl, o) {
    var a = tpl.cloneNode(true);
    a.setAttribute('href', screenUrl(7, '?r=' + o.r));
    a.removeAttribute('data-path');
    a.setAttribute('data-status', o.status);
    a.setAttribute('data-place', '집');
    a.setAttribute('data-kind', KIND_OF[o.r] || '스트레칭');
    a.classList.add('border-b', 'border-hairline');
    text($('[data-f="title"]', a), o.title);
    text($('[data-f="sub"]', a), o.sub);
    text($('[data-f="mon"]', a), o.mon);
    text($('[data-f="day"]', a), o.day);
    var chip = $('[data-f="chip"]', a);
    if (chip) { chip.className = chip.getAttribute('data-base') + ' ' + CHIP[o.status]; chip.textContent = o.status; }
    return a;
  }
  function initWeekly() {
    var list = $('#wk-list');
    if (!list) return;
    var tpl = list.firstElementChild;
    var log = store.get('log', []), plan = store.get('plan', []);
    var datePrefix = KIND === 'm' ? '11/1 일 · ' : '';
    log.forEach(function (l) {
      var mins = l.status === '했어요' ? l.min + '분' : l.min + '분 중 ' + Math.max(1, Math.ceil(l.doneSec / 60)) + '분';
      list.insertBefore(weeklyRow(tpl, { r: l.r, status: l.status, title: datePrefix + l.name + ' ' + mins, sub: '오늘 · 이 기기에서 남긴 기록', mon: '11월', day: '1' }), list.firstElementChild);
    });
    plan.forEach(function (p) {
      list.appendChild(weeklyRow(tpl, { r: p.r, status: '할 운동', title: (KIND === 'm' ? p.when + ' · ' : '') + p.name + ' ' + p.min + '분', sub: p.note || (KIND === 'm' ? '할 운동으로 넣어 둔 것' : p.when + ' · 할 운동으로 넣어 둔 것'), mon: p.when.indexOf('다음 주') === 0 ? '다음 주' : '이번 주', day: p.day || '·' }));
    });
    var last = list.lastElementChild;
    $$('#wk-list > a').forEach(function (a) { a.classList.toggle('border-b', a !== last); });
    var done = log.filter(function (l) { return l.status === '했어요'; }).length;
    if (log.length) {
      text($('#wk-count'), '이번 주 ' + (2 + done) + '번 했어요');
      text($('#wk-sub'), '오늘 남긴 기록 ' + log.length + '개를 더했어요.');
    }
    var sun = $('#wk-sun');
    if (sun && done) {
      while (sun.firstChild) sun.removeChild(sun.firstChild);
      sun.textContent = String(1 + done);
      sun.classList.add('flex', 'items-center', 'justify-center', 'text-caption');
      sun.setAttribute('aria-label', '했어요 ' + (1 + done) + '번');
      text($('#wk-sun-cap'), '했어요 ' + (1 + done) + '번');
    }
    paintNextDay();
    applyWeekly();
  }
  function applyWeekly() {
    var shown = 0;
    $$('#wk-list > a').forEach(function (r) {
      var st = r.getAttribute('data-status');
      var ok = (WF.place === '전체' || r.getAttribute('data-place') === WF.place) &&
        (WF.status === '전체' || st === WF.status) &&
        (!WF.kind.length || WF.kind.indexOf(r.getAttribute('data-kind')) > -1) &&
        (!WF.checks || st === '할 운동' || WF.checks.indexOf(st) > -1);
      r.classList.toggle('hidden', !ok);
      if (ok) shown += 1;
    });
    var empty = $('#wk-empty');
    if (empty) empty.classList.toggle('hidden', shown > 0);
  }
  function liveWeekly() { if (!$('#filter-sheet')) applyWeekly(); }
  ON_CHANGE['wk-place'] = function (v) { WF.place = v || '전체'; liveWeekly(); };
  ON_CHANGE['wk-status'] = function (v) { WF.status = v || '전체'; liveWeekly(); };
  ON_CHANGE['wk-kind'] = function (v) { WF.kind = v; liveWeekly(); };
  ON_CHANGE['wk-period'] = function (v) {
    var range = { '이번 주': '10/26 ~ 11/1 · 일요일 밤', '이번 달': '10월 1일 ~ 11/1 · 이 기기 기록은 이번 주부터 있어요', '전체': '전체 기간 · 이 기기 기록은 이번 주부터 있어요' };
    text($('#wk-range'), range[v] || range['이번 주']);
  };

  function saveDoneAnswer(field) {
    return function (v, g, byUser) {
      if (!byUser) return;
      var log = store.get('log', []);
      if (!log.length) return;
      log[log.length - 1][field] = v;
      store.set('log', log);
    };
  }
  ON_CHANGE['done-feel'] = saveDoneAnswer('feel');
  ON_CHANGE['done-sore'] = saveDoneAnswer('sore');

  // 2·5·9: 2에서 고른 다음 주 요일을 보여 준다.
  function paintNextDay() {
    var el = $('#next-day-label');
    if (!el || NUM === 2) return;
    var day = store.get('p2-nextday', '');
    var names = { '월': '월요일', '화': '화요일', '수': '수요일', '목': '목요일', '금': '금요일' };
    text(el, day ? names[day] + ' · 목·어깨 풀기 20분' : '아직 고르지 않았어요');
    if (!day) text($('#next-day-note'), '오늘 화면의 "다음 주 하루 고르기"에서 고를 수 있어요.');
  }


  // FLOW:library — 6: 주제 칩(거북목·어깨 결림·체력·저장됨)과 데스크톱 거르기(시간·부위·형식)가 카드를 실제로 거른다.
  // 저장 표시는 ax-saved에 저장되고 "저장됨" 칩이 저장한 것만 보여 준다. 카드를 누르면 그 루틴의 7로 간다. 9에서 고른 답이 "지난 운동 뒤 답"으로 보인다.
  var LF = { topic: '거북목·어깨 결림', time: '전체', part: '전체', format: '전체' };
  function savedList() { return store.get('saved', ['foam']); }
  function paintBookmarks() {
    var saved = savedList();
    $$('[data-action~="bookmark"]').forEach(function (b) {
      var on = saved.indexOf(b.getAttribute('data-r')) > -1;
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', (on ? '저장됨: ' : '저장: ') + b.getAttribute('data-name'));
      b.classList.toggle('text-ink', on); b.classList.toggle('text-mute', !on);
      var svg = $('svg', b); if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none');
    });
  }
  function timeOk(min) {
    return LF.time === '전체' || (LF.time === '10분 이하' && min <= 10) || (LF.time === '15~20분' && min >= 15 && min <= 20) || (LF.time === '25분 이상' && min >= 25);
  }
  function applyLibrary() {
    var saved = savedList(), shown = 0, others = 0;
    $$('[data-lib]').forEach(function (c) {
      var r = c.getAttribute('data-lib');
      var ok = (LF.topic === '저장됨' ? saved.indexOf(r) > -1 : words(c.getAttribute('data-topic').replace(/ /g, '_').replace(/,/g, ' ')).indexOf(LF.topic.replace(/ /g, '_')) > -1) &&
        timeOk(+c.getAttribute('data-min')) &&
        (LF.part === '전체' || c.getAttribute('data-part') === LF.part) &&
        (LF.format === '전체' || c.getAttribute('data-format').split(',').indexOf(LF.format) > -1);
      c.classList.toggle('hidden', !ok);
      if (ok) { shown += 1; if (!c.hasAttribute('data-featured')) others += 1; }
    });
    text($('#lib-others'), '다른 운동 ' + others + '개');
    var oh = $('#lib-others'); if (oh) oh.classList.toggle('hidden', others === 0);
    text($('#lib-sub'), (LF.topic === '저장됨' ? '저장한 운동' : LF.topic + ' 주제') + ' ' + shown + '개 · 모두 집에서 매트나 의자로 할 수 있어요');
    var empty = $('#lib-empty'); if (empty) empty.classList.toggle('hidden', shown > 0);
  }
  ON_CHANGE['lib-topic'] = function (v) { LF.topic = v || '거북목·어깨 결림'; applyLibrary(); };
  ON_CHANGE['lib-time'] = function (v) { LF.time = v || '전체'; applyLibrary(); };
  ON_CHANGE['lib-part'] = function (v) { LF.part = v || '전체'; applyLibrary(); };
  ON_CHANGE['lib-format'] = function (v) { LF.format = v || '전체'; applyLibrary(); };
  function initLibrary() {
    paintBookmarks();
    var log = store.get('log', []), withAnswer = null;
    for (var k = log.length - 1; k >= 0; k--) { if (log[k].feel || log[k].sore) { withAnswer = log[k]; break; } }
    var el = $('#lib-last');
    if (el && withAnswer) {
      var sore = withAnswer.sore && withAnswer.sore !== '없어요' ? ' · 아직 뻐근한 곳: ' + withAnswer.sore : '';
      el.textContent = '지난 운동 뒤 답 · ' + withAnswer.name + ': ' + (withAnswer.feel || '답 없음') + sore;
      el.classList.remove('hidden');
    }
    applyLibrary();
  }

  /* ---------- 이벤트 연결 ---------- */
  function run(el, e) {
    words(el.getAttribute('data-action')).forEach(function (n) { if (A[n]) A[n](el, e); });
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    run(el, e);
  });
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.matches && el.matches('input[data-action]:not([type=checkbox]),textarea[data-action]')) run(el, e);
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.matches && el.matches('select[data-action],input[type=checkbox][data-action]')) run(el, e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('[data-sheet]:not(.hidden)').forEach(function (s) { s.classList.add('hidden'); });
  });

  restoreGroups();
  paintVoice();
  if (NUM === 7) renderRoutine();
  if (NUM === 8) startPlayer();
  if (NUM === 9) initDone();
  if (NUM === 5) initWeekly();
  if (NUM === 6) initLibrary();
})();
