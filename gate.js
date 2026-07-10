/* =====================================================================
   Datapilot access gate (shared) — team password, verified by backend.
   Include on every page BEFORE the page's main <script>:

     <script src="./gate.js"></script>

   Provides:
     dpKey()        -> the stored team password ('' if none)
     dpQ()          -> '&key=...' suffix for GET requests ('' if none)
     dpAuthFailed() -> clears the stored key and re-shows the login
                       screen (call it when the backend answers
                       { error: 'unauthorized' })

   The backend must have the matching guard (checkKey_ + ping action).
   While the APP_KEY script property is not set server-side, the gate
   accepts any password (rollout-safe).
   ===================================================================== */
(function () {
  var AUTH_URL = "https://script.google.com/a/macros/datapilot.fr/s/AKfycbyUhfW211pozOYRKOJBZM9vCcRLxDhmsm3OShM1F_1SV2HWaqpg253ekKdu75xZYiWR/exec";
  var STORE = 'dp_key';

  window.dpKey = function () {
    try { return localStorage.getItem(STORE) || ''; } catch (e) { return ''; }
  };
  window.dpQ = function () {
    var k = window.dpKey();
    return k ? '&key=' + encodeURIComponent(k) : '';
  };
  window.dpAuthFailed = function () {
    try { localStorage.removeItem(STORE); } catch (e) {}
    whenBodyReady(function () { showGate(''); });
  };

  function whenBodyReady(fn) {
    if (document.body) { fn(); return; }
    document.addEventListener('DOMContentLoaded', fn);
  }

  var overlay = null;
  function setErr(m) {
    var el = document.getElementById('dp-gate-err');
    if (el) el.textContent = m || '';
  }
  function showGate(msg) {
    if (overlay) { overlay.style.display = 'flex'; setErr(msg); return; }
    overlay = document.createElement('div');
    overlay.id = 'dp-gate';
    overlay.innerHTML =
      '<style>' +
      '#dp-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
      'background:linear-gradient(135deg,#0F2A3D 0%,#081826 100%);font-family:Poppins,-apple-system,BlinkMacSystemFont,sans-serif;padding:16px}' +
      '#dp-gate .gcard{background:#fff;border-radius:16px;padding:36px 32px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center}' +
      '#dp-gate .eyebrow{font-size:10px;letter-spacing:3px;color:#F5A623;font-weight:700;text-transform:uppercase;margin-bottom:6px}' +
      '#dp-gate h2{margin:0 0 6px;color:#0F2A3D;font-size:20px;font-weight:700}' +
      '#dp-gate p{margin:0 0 20px;color:#6B7280;font-size:13px}' +
      '#dp-gate input{width:100%;padding:12px 14px;border:1px solid #EAE6DA;border-radius:9px;font-size:14px;font-family:inherit;text-align:center;letter-spacing:2px;box-sizing:border-box}' +
      '#dp-gate input:focus{outline:none;border-color:#3FA6B8;box-shadow:0 0 0 3px rgba(63,166,184,.15)}' +
      '#dp-gate button{width:100%;margin-top:12px;padding:12px;border:0;border-radius:9px;background:#F5A623;color:#0F2A3D;font-weight:700;font-size:13px;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;font-family:inherit}' +
      '#dp-gate button:hover{background:#E5961F}' +
      '#dp-gate button:disabled{background:#E5E7EB;color:#9CA3AF;cursor:wait}' +
      '#dp-gate .err{min-height:18px;margin-top:10px;font-size:12px;color:#DC2626;font-weight:500}' +
      '#dp-gate .hint{margin-top:14px;font-size:11px;color:#9CA3AF;font-style:italic}' +
      '</style>' +
      '<div class="gcard">' +
      '<div class="eyebrow">Datapilot</div>' +
      '<h2>Internal tools</h2>' +
      '<p>Team access only. Enter the team password to continue.</p>' +
      '<input id="dp-gate-pw" type="password" placeholder="Team password" autocomplete="current-password">' +
      '<button id="dp-gate-btn" type="button">Enter</button>' +
      '<div class="err" id="dp-gate-err"></div>' +
      '<div class="hint">Ask your project lead for the password.</div>' +
      '</div>';
    document.body.appendChild(overlay);
    setErr(msg);
    var pw = document.getElementById('dp-gate-pw');
    var btn = document.getElementById('dp-gate-btn');
    function tryLogin() {
      var val = pw.value.trim();
      if (!val) { setErr('Type the team password.'); return; }
      btn.disabled = true; btn.textContent = 'Checking\u2026'; setErr('');
      fetch(AUTH_URL + '?action=ping&key=' + encodeURIComponent(val))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok) {
            try { localStorage.setItem(STORE, val); } catch (e) {}
            location.reload();
          } else {
            setErr('Wrong password.');
            btn.disabled = false; btn.textContent = 'Enter';
          }
        })
        .catch(function () {
          setErr('Network error - try again.');
          btn.disabled = false; btn.textContent = 'Enter';
        });
    }
    btn.addEventListener('click', tryLogin);
    pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
    setTimeout(function () { pw.focus(); }, 50);
  }

  if (!window.dpKey()) {
    whenBodyReady(function () { showGate(''); });
  }
})();
