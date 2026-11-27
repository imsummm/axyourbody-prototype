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
    }
  };

  /* ---------- 화면별 처리 ---------- */
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
  ON_CHANGE['p3-busy'] = function (v) {
    var busy = v === '예';
    text($('#today-name'), busy ? '책상 앞 스트레칭 · 10분' : '코어·자세 루틴 · 25분');
    text($('#today-desc'), busy ? '야근 중에도 자리에서 할 수 있어요' : '오래 앉아 굳은 허리와 코어를 깨워요');
    var link = $('#today-link');
    if (link) link.setAttribute('href', screenUrl(7, busy ? '?r=desk' : '?r=core'));
    if (v) text($('#week-note'), busy ? '이번 주 남은 운동은 10분짜리로 바꿨어요' : '오늘과 금요일 할 운동은 그대로예요');
  };

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
})();
