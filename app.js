/* ============================================
   INSTANT FIX — Main Application Logic
   Team: ShadowCoders | WEB NOVA 2026
   ============================================ */

/* ===========================
   MOCK USER DATABASE
   (In production: replace with real backend API)
   =========================== */
const mockDB = {
  users: [
    { id: 1, name: 'Rahul Sharma',  email: 'user@demo.com',  phone: '9876543210', password: 'user123',  role: 'user'  },
    { id: 2, name: 'Priya Mehta',   email: 'priya@demo.com', phone: '9123456789', password: 'priya123', role: 'user'  },
  ],
  admins: [
    { id: 101, name: 'Admin Alex',  email: 'admin@demo.com', phone: '9000000001', password: 'admin123', role: 'admin', secretKey: 'IFADMIN2026' },
  ]
};

/* ===========================
   AUTH STATE
   =========================== */
let authState = {
  role:    'user',   // 'user' | 'admin'
  mode:    'login',  // 'login' | 'signup'
  method:  'email',  // 'email' | 'phone'
  loggedIn: false,
  currentUser: null
};

/* ===========================
   AUTH UI CONTROLLERS
   =========================== */

/** Switch between User / Admin role tabs */
function setRole(role) {
  authState.role = role;

  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('role-' + role).classList.add('active');

  // Admin doesn't have signup — force login mode
  if (role === 'admin') {
    setMode('login');
    document.getElementById('mode-signup').style.display = 'none';
  } else {
    document.getElementById('mode-signup').style.display = '';
  }

  updateAuthTitle();
  showAdminKeyField();
}

/** Switch between Login / Signup modes */
function setMode(mode) {
  authState.mode = mode;

  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');

  const isSignup = mode === 'signup';

  document.getElementById('field-name').style.display       = isSignup ? 'block' : 'none';
  document.getElementById('field-confirm-pw').style.display = isSignup ? 'block' : 'none';
  document.getElementById('forgot-pw').style.display        = isSignup ? 'none'  : 'block';
  document.getElementById('auth-switch').innerHTML = isSignup
    ? 'Already have an account? <button onclick="setMode(\'login\')">Login</button>'
    : 'Don\'t have an account? <button onclick="setMode(\'signup\')">Sign Up</button>';

  document.getElementById('submit-text').textContent = isSignup ? 'Create Account' : 'Login';
  updateAuthTitle();
  clearAuthMsg();
}

/** Switch between Email / Phone login method */
function setMethod(method) {
  authState.method = method;

  document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('method-' + method).classList.add('active');

  document.getElementById('field-email').style.display = method === 'email' ? 'block' : 'none';
  document.getElementById('field-phone').style.display = method === 'phone' ? 'block' : 'none';
  clearAuthMsg();
}

/** Show admin secret key field only for admin role */
function showAdminKeyField() {
  document.getElementById('field-admin-key').style.display =
    authState.role === 'admin' ? 'block' : 'none';
}

/** Update title and subtitle based on current state */
function updateAuthTitle() {
  const roleLabel = authState.role === 'admin' ? 'Admin' : 'User';
  const isLogin   = authState.mode === 'login';

  document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Create Account';
  document.getElementById('auth-sub').textContent   =
    `${isLogin ? 'Login to' : 'Register as'} ${roleLabel}`;
}

/** Toggle password visibility */
function togglePassword() {
  const inp = document.getElementById('inp-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  document.getElementById('pw-eye').textContent = inp.type === 'password' ? '👁' : '🙈';
}

/** Show auth message (error or success) */
function showAuthMsg(text, type) {
  const el = document.getElementById('auth-msg');
  el.textContent  = text;
  el.className    = 'auth-msg ' + type;
  el.style.display = 'block';
}

/** Clear auth message */
function clearAuthMsg() {
  const el = document.getElementById('auth-msg');
  el.style.display = 'none';
}

/* ===========================
   AUTH LOGIC
   =========================== */

/** Main handler for login / signup button */
function handleAuth() {
  clearAuthMsg();

  // Collect inputs
  const method    = authState.method;
  const identifier = method === 'email'
    ? document.getElementById('inp-email').value.trim().toLowerCase()
    : (document.getElementById('inp-countrycode').value +
       document.getElementById('inp-phone-auth').value.trim());
  const password  = document.getElementById('inp-password').value;

  // Basic validation
  if (!identifier) {
    showAuthMsg(`Please enter your ${method === 'email' ? 'email address' : 'phone number'}.`, 'error');
    return;
  }
  if (!password) {
    showAuthMsg('Please enter your password.', 'error');
    return;
  }

  // Loading state
  document.getElementById('submit-text').style.display  = 'none';
  document.getElementById('submit-loader').style.display = 'inline';

  setTimeout(() => {
    document.getElementById('submit-text').style.display  = 'inline';
    document.getElementById('submit-loader').style.display = 'none';

    if (authState.mode === 'login') {
      doLogin(identifier, password);
    } else {
      doSignup(identifier, password);
    }
  }, 900); // Simulate network delay
}

/** Handle Login */
function doLogin(identifier, password) {
  const db = authState.role === 'admin' ? mockDB.admins : mockDB.users;
  const method = authState.method;

  const user = db.find(u => {
    const matchId = method === 'email'
      ? u.email === identifier
      : ('+91' + u.phone === identifier || u.phone === identifier.replace(/^\+\d{2}/, ''));
    return matchId && u.password === password;
  });

  if (!user) {
    showAuthMsg('❌ Invalid credentials. Please check and try again.', 'error');
    return;
  }

  // Admin extra: check secret key
  if (authState.role === 'admin') {
    const secretKey = document.getElementById('inp-admin-key').value.trim();
    if (secretKey !== user.secretKey) {
      showAuthMsg('❌ Invalid admin secret key.', 'error');
      return;
    }
  }

  showAuthMsg('✅ Login successful! Redirecting...', 'success');
  setTimeout(() => launchApp(user), 800);
}

/** Handle Signup */
function doSignup(identifier, password) {
  const fullName  = document.getElementById('inp-fullname').value.trim();
  const confirmPw = document.getElementById('inp-confirm-pw').value;
  const method    = authState.method;

  if (!fullName) {
    showAuthMsg('Please enter your full name.', 'error');
    return;
  }
  if (password.length < 6) {
    showAuthMsg('Password must be at least 6 characters.', 'error');
    return;
  }
  if (password !== confirmPw) {
    showAuthMsg('❌ Passwords do not match.', 'error');
    return;
  }

  // Check duplicate
  const allUsers = [...mockDB.users];
  const exists   = allUsers.find(u =>
    method === 'email' ? u.email === identifier : u.phone === identifier
  );
  if (exists) {
    showAuthMsg('⚠️ An account with this ' + method + ' already exists. Please login.', 'error');
    return;
  }

  // Create new user (in memory)
  const newUser = {
    id:       mockDB.users.length + 100,
    name:     fullName,
    email:    method === 'email' ? identifier : '',
    phone:    method === 'phone' ? identifier : '',
    password: password,
    role:     'user'
  };
  mockDB.users.push(newUser);

  showAuthMsg('🎉 Account created successfully! Logging you in...', 'success');
  setTimeout(() => launchApp(newUser), 900);
}

/** Forgot password handler */
function forgotPassword() {
  showAuthMsg('📧 A password reset link has been sent to your registered email/phone.', 'success');
}

/* ===========================
   APP LAUNCH & SESSION
   =========================== */

/** After successful auth: hide gate, show app */
function launchApp(user) {
  authState.loggedIn   = true;
  authState.currentUser = user;

  // Update navbar
  document.getElementById('user-name-nav').textContent  = user.name.split(' ')[0];
  document.getElementById('user-avatar-nav').textContent = user.role === 'admin' ? '🛡️' : '👤';
  document.getElementById('um-role-badge').textContent   = 'Role: ' + (user.role === 'admin' ? 'Admin 🛡️' : 'User 👤');

  // Show admin dashboard button if admin
  if (user.role === 'admin') {
    document.getElementById('nav-admin-btn').style.display = 'inline-flex';
    document.getElementById('nav-track-btn').style.display = 'none';
  }

  // Swap views
  document.getElementById('auth-gate').style.display = 'none';
  document.getElementById('main-app').style.display  = 'block';

  // Admin → go to dashboard, User → go to home
  showPage(user.role === 'admin' ? 'admin' : 'home');
}

/** Logout: show auth gate again */
function logout() {
  authState.loggedIn    = false;
  authState.currentUser = null;

  document.getElementById('main-app').style.display  = 'none';
  document.getElementById('auth-gate').style.display = 'flex';
  document.getElementById('user-menu').classList.add('hidden');

  // Reset nav
  document.getElementById('nav-admin-btn').style.display = 'none';
  document.getElementById('nav-track-btn').style.display = '';

  // Reset form
  document.getElementById('inp-email').value    = '';
  document.getElementById('inp-password').value = '';
  clearAuthMsg();
}

/** Toggle user dropdown menu */
function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('hidden');
}
// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const pill = document.getElementById('user-pill');
  const menu = document.getElementById('user-menu');
  if (pill && menu && !pill.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

/* ===========================
   ADMIN QUICK ACTIONS
   =========================== */
function adminAction(type) {
  const messages = {
    broadcast:   '📢 Broadcast message sent to all users!',
    technician:  '➕ Technician registration form opened.',
    report:      '📄 Report exported successfully as CSV.',
    promo:       '🎁 New promo code INSTANT20 created!',
    maintenance: '🔧 Maintenance mode toggled.'
  };
  alert(messages[type] || 'Action completed.');
}

/* ===========================
   PAGE NAVIGATION
   =========================== */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'tracking') startCountdown();
}

function openBooking(service) {
  showPage('booking');
  setTimeout(() => {
    document.querySelectorAll('#service-chips .chip').forEach(chip => {
      if (chip.textContent.includes(service.split(' ')[0])) {
        chip.classList.add('selected');
        bookingState.service = service;
      }
    });
  }, 100);
}

/* ===========================
   BOOKING STATE & FLOW
   =========================== */
const bookingState = {
  service: '', urgency: '', tech: '', techPrice: '', name: '', address: ''
};
let currentStep = 1;

function goToStep(n) {
  if (n === 2 && !bookingState.service) { alert('Please select a service first.'); return; }
  document.querySelectorAll('[id^=bpanel-]').forEach(p => p.style.display = 'none');
  document.getElementById('bpanel-' + n).style.display = 'block';
  document.querySelectorAll('[id^=bstep-]').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < n) s.classList.add('done');
    if (i + 1 === n) s.classList.add('active');
  });
  currentStep = n;
  if (n === 3) simulateAIMatch();
  if (n === 4) fillSummary();
  window.scrollTo(0, 0);
}

function simulateAIMatch() {
  document.getElementById('ai-matching-state').style.display = 'block';
  document.getElementById('tech-cards').style.display = 'none';
  setTimeout(() => {
    document.getElementById('ai-matching-state').style.display = 'none';
    document.getElementById('tech-cards').style.display = 'flex';
  }, 1800);
}

function fillSummary() {
  const name    = document.getElementById('inp-name').value    || authState.currentUser?.name || 'Customer';
  const address = document.getElementById('inp-address').value || 'Your Location';
  bookingState.name    = name;
  bookingState.address = address;
  document.getElementById('sum-service').textContent = bookingState.service   || '—';
  document.getElementById('sum-urgency').textContent = bookingState.urgency   || '—';
  document.getElementById('sum-tech').textContent    = bookingState.tech      || '—';
  document.getElementById('sum-addr').textContent    = address;
  const base = parseInt((bookingState.techPrice || '₹350').replace('₹', '')) + 49;
  document.getElementById('sum-total').textContent   = '₹' + base;
}

function confirmBooking() {
  document.getElementById('booking-form-view').style.display = 'none';
  document.getElementById('confirm-screen').style.display    = 'block';
  document.querySelectorAll('[id^=bstep-]').forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
  startCountdown();
}

/* ===========================
   SELECTORS
   =========================== */
function selectChip(el, group) {
  el.closest('.service-chips, .form-group').querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  if (group === 'service') bookingState.service = el.textContent.trim().split(' ').slice(1).join(' ');
}
function selectUrgency(el) {
  document.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  bookingState.urgency = el.querySelector('.ub-label').textContent;
}
function selectTech(el, name, price) {
  document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  bookingState.tech      = name;
  bookingState.techPrice = price;
}
function selectPM(el) {
  document.querySelectorAll('.pm-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

/* ===========================
   COUNTDOWN
   =========================== */
let countdownVal = 12, countdownTimer = null;
function startCountdown() {
  countdownVal = 12;
  clearInterval(countdownTimer);
  const el = document.getElementById('countdown');
  if (!el) return;
  countdownTimer = setInterval(() => {
    countdownVal--;
    el.textContent = countdownVal > 0 ? countdownVal + ' min' : 'Arriving now!';
    if (countdownVal <= 0) clearInterval(countdownTimer);
  }, 10000);
}

/* ===========================
   CHATBOT
   =========================== */
const chatResponses = {
  book:      ['Sure! Taking you to the booking page. 🚀', () => showPage('booking')],
  track:     ['Opening live tracking! 📍',               () => showPage('tracking')],
  services:  ['We offer: ⚡ Electrician, 🔧 Plumber, 🚗 Mechanic, 🚽 Toilet Cleaning, 📺 Appliance Repair, 🏠 House Cleaning — all 24/7!'],
  price:     ['Prices from ₹149. Electrician ₹199+, Plumber ₹149+, Mechanic ₹299+. Platform fee ₹49. 💰'],
  emergency: ['Yes! 24/7 emergency service. Select "Emergency" while booking. 🚨'],
  ai:        ['Our AI matches you in under 2 minutes using location, rating & urgency. 🤖'],
  default:   ['I can help you book, track, or answer questions about services & pricing! 😊']
};
function toggleChat() { document.getElementById('chat-window').classList.toggle('hidden'); }
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';
  addChatMsg(msg, 'user');
  setTimeout(() => botReply(msg), 600);
}
function chatQuick(msg) { addChatMsg(msg, 'user'); setTimeout(() => botReply(msg), 600); }
function addChatMsg(text, role) {
  const msgs = document.getElementById('chat-msgs');
  const div  = document.createElement('div');
  div.className   = 'msg ' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop  = msgs.scrollHeight;
}
function botReply(msg) {
  const l = msg.toLowerCase();
  let r = chatResponses.default[0], action = null;
  if      (l.includes('book')      || l.includes('service'))  { r = chatResponses.book[0];      action = chatResponses.book[1]; }
  else if (l.includes('track')     || l.includes('location')) { r = chatResponses.track[0];     action = chatResponses.track[1]; }
  else if (l.includes('services')  || l.includes('offer'))    { r = chatResponses.services[0]; }
  else if (l.includes('price')     || l.includes('cost'))     { r = chatResponses.price[0]; }
  else if (l.includes('emergency') || l.includes('urgent'))   { r = chatResponses.emergency[0]; }
  else if (l.includes('ai')        || l.includes('match'))    { r = chatResponses.ai[0]; }
  addChatMsg(r, 'bot');
  if (action) setTimeout(action, 1000);
}
