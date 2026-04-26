'use strict';

const myForm         = document.getElementById('myForm');
const submitBtn      = document.getElementById('submitBtn');
const submitText     = document.getElementById('submitText');
const submitSpinner  = document.getElementById('submitSpinner');
const serverError    = document.getElementById('serverError');
const serverErrorMsg = document.getElementById('serverErrorMsg');

function showServerError(msg) {
  serverErrorMsg.textContent = msg;
  serverError.style.display  = 'flex';
  serverError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideServerError() {
  serverError.style.display  = 'none';
  serverErrorMsg.textContent = '';
}

function setLoading(loading) {
  submitBtn.disabled          = loading;
  submitText.style.display    = loading ? 'none'   : 'inline';
  submitSpinner.style.display = loading ? 'inline' : 'none';
}

myForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  let errorFlag = false;

  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const mailInp       = emailInput.value.trim();
  const passInp       = passwordInput.value.trim();
  const mailErr       = document.getElementById('mailErr');
  const passErr       = document.getElementById('passErr');

  // Reset errors
  mailErr.textContent = '';
  mailErr.classList.remove('show');
  passErr.textContent = '';
  passErr.classList.remove('show');
  emailInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');
  hideServerError();

  // Validate
  if (mailInp.length === 0) {
    mailErr.textContent = "Can't be left empty";
    mailErr.classList.add('show');
    emailInput.classList.add('input-error');
    errorFlag = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailInp)) {
    mailErr.textContent = 'Enter a valid email';
    mailErr.classList.add('show');
    emailInput.classList.add('input-error');
    errorFlag = true;
  }

  if (passInp.length === 0) {
    passErr.textContent = "Can't be left empty";
    passErr.classList.add('show');
    passwordInput.classList.add('input-error');
    errorFlag = true;
  } else if (passInp.length < 6) {
    passErr.textContent = 'Password must be at least 6 characters';
    passErr.classList.add('show');
    passwordInput.classList.add('input-error');
    errorFlag = true;
  }

  if (errorFlag) return;

  setLoading(true);

  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: mailInp, password: passInp })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        showServerError(data.errors.map(e => e.msg).join(' · '));
      } else {
        showServerError(data.message || 'Login failed. Please try again.');
      }
      setLoading(false);
      return;
    }

    // ✅ Redirect based on role
    if (data.user?.role === 'admin') {
      window.location.href = '/user/admin';
    } else {
      window.location.href = '/user/dashboard';
    }

  } catch (err) {
    showServerError('Network error. Please check your connection and try again.');
    setLoading(false);
  }
});
