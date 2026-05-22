/**
 * contact-form-handler.js
 *
 * Standalone form submission module. Swap the PROVIDER constant to switch
 * between Formspree, EmailJS, or a custom backend without touching script.js.
 *
 * Usage: imported/called by script.js — not loaded independently.
 */

'use strict';

const PROVIDER = 'formspree'; // 'formspree' | 'emailjs' | 'custom'

/* ── Formspree ────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

/* ── EmailJS (fill in your credentials) ──────────────── */
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

/* ── Custom backend ───────────────────────────────────── */
const CUSTOM_ENDPOINT = '/api/submit-booking';

/**
 * Send form data to the configured provider.
 * @param {object} payload - Key-value form data
 * @returns {Promise<void>}
 */
async function submitForm(payload) {
  switch (PROVIDER) {
    case 'formspree':
      return submitViaFormspree(payload);
    case 'emailjs':
      return submitViaEmailJS(payload);
    case 'custom':
      return submitViaCustomBackend(payload);
    default:
      throw new Error(`Unknown provider: ${PROVIDER}`);
  }
}

async function submitViaFormspree(payload) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Formspree error ${res.status}`);
  }
}

async function submitViaEmailJS(payload) {
  /* Requires the EmailJS SDK loaded in index.html:
     <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  */
  if (typeof emailjs === 'undefined') throw new Error('EmailJS SDK not loaded');
  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload, EMAILJS_PUBLIC_KEY);
}

async function submitViaCustomBackend(payload) {
  const res = await fetch(CUSTOM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
}

/* Export for use in script.js (or include as a module) */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { submitForm };
}
