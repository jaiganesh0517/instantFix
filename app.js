/* ============================================
   INSTANT FIX — Main Application Logic
   Team: ShadowCoders | WEB NOVA 2026
   ============================================ */

/* ===========================
   STATE MANAGEMENT
   =========================== */
const bookingState = {
  service:    '',
  urgency:    '',
  tech:       '',
  techPrice:  '',
  name:       '',
  address:    ''
};

let currentStep    = 1;
let countdownVal   = 12;
let countdownTimer = null;

/* ===========================
   PAGE NAVIGATION
   =========================== */

/**
 * Switch between Home, Booking, and Tracking pages
 * @param {string} id - page name: 'home' | 'booking' | 'tracking'
 */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'tracking') startCountdown();
}

/**
 * Open booking page with a service pre-selected
 * @param {string} service - service name e.g. 'Electrician'
 */
function openBooking(service) {
  showPage('booking');
  setTimeout(() => {
    const chips = document.querySelectorAll('#service-chips .chip');
    chips.forEach(chip => {
      if (chip.textContent.includes(service.split(' ')[0])) {
        chip.classList.add('selected');
        bookingState.service = service;
      }
    });
  }, 100);
}

/* ===========================
   BOOKING FLOW
   =========================== */

/**
 * Navigate to a specific booking step (1–4)
 * @param {number} n - step number
 */
function goToStep(n) {
  // Validation
  if (n === 2 && !bookingState.service) {
    alert('Please select a service first.');
    return;
  }

  // Hide all panels, show target
  document.querySelectorAll('[id^=bpanel-]').forEach(p => p.style.display = 'none');
  document.getElementById('bpanel-' + n).style.display = 'block';

  // Update progress indicators
  document.querySelectorAll('[id^=bstep-]').forEach((step, index) => {
    step.classList.remove('active', 'done');
    if (index + 1 < n) step.classList.add('done');
    if (index + 1 === n) step.classList.add('active');
  });

  currentStep = n;

  // Step-specific actions
  if (n === 3) simulateAIMatch();
  if (n === 4) fillSummary();

  window.scrollTo(0, 0);
}

/**
 * Simulate AI technician matching with a loading state
 */
function simulateAIMatch() {
  const loader = document.getElementById('ai-matching-state');
  const cards  = document.getElementById('tech-cards');

  loader.style.display = 'block';
  cards.style.display  = 'none';

  setTimeout(() => {
    loader.style.display = 'none';
    cards.style.display  = 'flex';
  }, 1800);
}

/**
 * Populate the booking summary from state
 */
function fillSummary() {
  const name    = document.getElementById('inp-name').value    || 'Customer';
  const address = document.getElementById('inp-address').value || 'Your Location';

  bookingState.name    = name;
  bookingState.address = address;

  document.getElementById('sum-service').textContent = bookingState.service   || '—';
  document.getElementById('sum-urgency').textContent = bookingState.urgency   || '—';
  document.getElementById('sum-tech').textContent    = bookingState.tech      || '—';
  document.getElementById('sum-addr').textContent    = address;

  const base = parseInt((bookingState.techPrice || '₹350').replace('₹', '')) + 49;
  document.getElementById('sum-total').textContent = '₹' + base;
}

/**
 * Confirm the booking and show the success screen
 */
function confirmBooking() {
  document.getElementById('booking-form-view').style.display = 'none';
  document.getElementById('confirm-screen').style.display    = 'block';

  // Mark all steps done
  document.querySelectorAll('[id^=bstep-]').forEach(step => {
    step.classList.remove('active');
    step.classList.add('done');
  });

  startCountdown();
}

/* ===========================
   SELECTION HELPERS
   =========================== */

/**
 * Select a chip (service selector)
 * @param {HTMLElement} el  - clicked chip element
 * @param {string}      group - 'service'
 */
function selectChip(el, group) {
  el.closest('.service-chips, .form-group')
    .querySelectorAll('.chip')
    .forEach(c => c.classList.remove('selected'));

  el.classList.add('selected');

  if (group === 'service') {
    bookingState.service = el.textContent.trim().split(' ').slice(1).join(' ');
  }
}

/**
 * Select urgency level
 * @param {HTMLElement} el   - clicked button
 * @param {string}      type - 'normal' | 'urgent' | 'emergency'
 */
function selectUrgency(el, type) {
  document.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  bookingState.urgency = el.querySelector('.ub-label').textContent;
}

/**
 * Select a technician
 * @param {HTMLElement} el    - clicked card
 * @param {string}      name  - technician name
 * @param {string}      price - estimated price string e.g. '₹350'
 */
function selectTech(el, name, price) {
  document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  bookingState.tech      = name;
  bookingState.techPrice = price;
}

/**
 * Select a payment method
 * @param {HTMLElement} el - clicked button
 */
function selectPM(el) {
  document.querySelectorAll('.pm-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

/* ===========================
   LIVE ETA COUNTDOWN
   =========================== */

/**
 * Start the ETA countdown timer (decrements every 10s for demo purposes)
 */
function startCountdown() {
  countdownVal = 12;
  clearInterval(countdownTimer);

  const el = document.getElementById('countdown');
  if (!el) return;

  countdownTimer = setInterval(() => {
    countdownVal--;
    el.textContent = countdownVal + ' min';
    if (countdownVal <= 0) {
      clearInterval(countdownTimer);
      el.textContent = 'Arriving now!';
    }
  }, 10000);
}

/* ===========================
   CHATBOT
   =========================== */

/** Bot response map: keyword → [reply, null, optionalAction] */
const chatResponses = {
  book:      ['Sure! Let me take you to the booking page. 🚀', null, () => showPage('booking')],
  track:     ['Taking you to live tracking! 📍',               null, () => showPage('tracking')],
  services:  ['We offer: ⚡ Electrician, 🔧 Plumber, 🚗 Car Mechanic, 🚽 Toilet Cleaning, 📺 Appliance Repair, 🏠 House Cleaning. All with 24/7 support!'],
  price:     ['Our prices are transparent! Electrician from ₹199, Plumber from ₹149, Car Mechanic from ₹299. Platform fee is just ₹49. 💰'],
  emergency: ['Yes! We provide 24/7 emergency services. Select "Emergency" while booking and we\'ll dispatch the nearest available professional immediately! 🚨'],
  ai:        ['Our AI matches you with the best professional based on your location, service type, urgency, and ratings. It takes under 2 minutes! 🤖'],
  default:   ['Great question! I can help you book a service, track your technician, or tell you about our services and pricing. What would you like to know? 😊']
};

/** Toggle chatbot window open/close */
function toggleChat() {
  document.getElementById('chat-window').classList.toggle('hidden');
}

/** Send message from input field */
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg) return;

  input.value = '';
  addChatMsg(msg, 'user');
  setTimeout(() => botReply(msg), 600);
}

/** Send a quick-reply chip message */
function chatQuick(msg) {
  addChatMsg(msg, 'user');
  setTimeout(() => botReply(msg), 600);
}

/**
 * Append a message bubble to the chat window
 * @param {string} text - message text
 * @param {string} role - 'bot' | 'user'
 */
function addChatMsg(text, role) {
  const msgs = document.getElementById('chat-msgs');
  const div  = document.createElement('div');
  div.className   = 'msg ' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/**
 * Generate and display a bot reply based on keyword matching
 * @param {string} msg - user message
 */
function botReply(msg) {
  const lower  = msg.toLowerCase();
  let reply    = chatResponses.default[0];
  let action   = null;

  if      (lower.includes('book')      || lower.includes('service'))  { reply = chatResponses.book[0];      action = chatResponses.book[2]; }
  else if (lower.includes('track')     || lower.includes('location')) { reply = chatResponses.track[0];     action = chatResponses.track[2]; }
  else if (lower.includes('services')  || lower.includes('offer'))    { reply = chatResponses.services[0]; }
  else if (lower.includes('price')     || lower.includes('cost')
                                        || lower.includes('fee'))     { reply = chatResponses.price[0]; }
  else if (lower.includes('emergency') || lower.includes('urgent'))   { reply = chatResponses.emergency[0]; }
  else if (lower.includes('ai')        || lower.includes('match'))    { reply = chatResponses.ai[0]; }

  addChatMsg(reply, 'bot');
  if (action) setTimeout(action, 1000);
}
