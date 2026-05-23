'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initDateMin();
  initSmoothScroll();
  initPhoneFormat();
  initFormValidation();
});

/* Set inspection date minimum to tomorrow */
function initDateMin() {
  const dateInput = document.getElementById('inspectionDate');
  if (!dateInput) return;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

/* Smooth scroll offset for sticky header */
function initSmoothScroll() {
  const header = document.getElementById('stickyHeader');
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 64) + 8;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* Auto-format phone as (xxx) xxx-xxxx */
function initPhoneFormat() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    if (digits.length >= 7) {
      digits = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    } else if (digits.length >= 4) {
      digits = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      digits = `(${digits}`;
    }
    phoneInput.value = digits;
  });
}

/* =============================================
   Form validation
   ============================================= */
function initFormValidation() {
  const form = document.getElementById('ladderAssistForm');
  if (!form) return;

  /* Live validation on blur */
  form.querySelectorAll('input[required], select[required]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', handleSubmit);
}

function validateField(field) {
  const errEl = document.getElementById(`err-${field.id}`);
  let msg = '';

  if (field.required && !field.value.trim()) {
    msg = 'This field is required.';
  } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    msg = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && field.value && field.value.replace(/\D/g, '').length < 10) {
    msg = 'Please enter a valid 10-digit phone number.';
  }

  field.classList.toggle('is-invalid', !!msg);
  if (errEl) errEl.textContent = msg;
  return !msg;
}

function validateServiceRadio(form) {
  const checked = form.querySelector('input[name="service"]:checked');
  const errEl = document.getElementById('err-service');
  if (!checked) {
    if (errEl) errEl.textContent = 'Please select a service type.';
    return false;
  }
  if (errEl) errEl.textContent = '';
  return true;
}

function validateAll(form) {
  let valid = true;
  form.querySelectorAll('input[required], select[required]').forEach(field => {
    if (!validateField(field)) valid = false;
  });
  if (!validateServiceRadio(form)) valid = false;
  return valid;
}

/* =============================================
   Form submission
   ============================================= */
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;

  if (!validateAll(form)) {
    const firstError = form.querySelector('.is-invalid');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

  const payload = buildPayload(form);

  try {
    const res = await fetch('https://formspree.io/f/xvzyqrll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showSuccess(form);
    } else {
      throw new Error('Server rejected submission');
    }
  } catch (err) {
    console.error('Submission error:', err);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Request Service';
    const errorEl = document.getElementById('formError');
    if (errorEl) { errorEl.hidden = false; errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
}

function buildPayload(form) {
  const roofTypes = [...form.querySelectorAll('input[name="roofType"]:checked')].map(c => c.value);
  return {
    adjusterName:    form.adjusterName.value.trim(),
    carrier:         form.carrier.value,
    phone:           form.phone.value.trim(),
    email:           form.email.value.trim(),
    inspectionDate:  form.inspectionDate.value,
    timeWindow:      form.timeWindow.value,
    propertyAddress: form.propertyAddress.value.trim(),
    service:         (form.querySelector('input[name="service"]:checked') || {}).value || '',
    roofType:        roofTypes.join(', '),
    claimNumber:     (form.claimNumber ? form.claimNumber.value.trim() : ''),
    notes:           (form.notes ? form.notes.value.trim() : ''),
  };
}

function showSuccess(form) {
  form.style.display = 'none';
  const successEl = document.getElementById('formSuccess');
  successEl.hidden = false;
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
