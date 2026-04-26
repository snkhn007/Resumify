/* =============================================================
   signupValidation.js — Updated to include role field
   ============================================================= */

'use strict';

const myForm        = document.getElementById('myForm');
const submitBtn     = document.getElementById('submitBtn');
const submitText    = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const serverError   = document.getElementById('serverError');
const serverErrorMsg= document.getElementById('serverErrorMsg');
const pendingBanner = document.getElementById('pendingBanner');
const roleSelect    = document.getElementById('role');
const recruiterNote = document.getElementById('recruiterNote');

/* Show recruiter note when recruiter is selected */
if (roleSelect) {
  roleSelect.addEventListener('change', () => {
    if (recruiterNote) {
      recruiterNote.style.display = roleSelect.value === 'recruiter' ? 'flex' : 'none';
    }
  });
}

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

  const firstNameInput = document.getElementById('first-name');
  const lastNameInput  = document.getElementById('last-name');
  const emailInput     = document.getElementById('email');
  const passwordInput  = document.getElementById('password');

  const firstNameVal = firstNameInput.value.trim();
  const lastNameVal  = lastNameInput.value.trim();
  const mailInp      = emailInput.value.trim();
  const passInp      = passwordInput.value.trim();
  const roleVal      = roleSelect ? roleSelect.value : 'jobseeker';

  const fnameErr = document.getElementById('fnameErr');
  const lnameErr = document.getElementById('lnameErr');
  const mailErr  = document.getElementById('mailErr');
  const passErr  = document.getElementById('passErr');

  // Reset errors
  [fnameErr, lnameErr, mailErr, passErr].forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  [firstNameInput, lastNameInput, emailInput, passwordInput].forEach(el =>
    el.classList.remove('input-error')
  );
  hideServerError();

  // Validate
  if (firstNameVal.length === 0) {
    fnameErr.textContent = "Can't be left empty";
    fnameErr.classList.add('show');
    firstNameInput.classList.add('input-error');
    errorFlag = true;
  } else if (firstNameVal.length < 3) {
    fnameErr.textContent = 'First name must be at least 3 characters';
    fnameErr.classList.add('show');
    firstNameInput.classList.add('input-error');
    errorFlag = true;
  }

  if (lastNameVal.length === 0) {
    lnameErr.textContent = "Can't be left empty";
    lnameErr.classList.add('show');
    lastNameInput.classList.add('input-error');
    errorFlag = true;
  } else if (lastNameVal.length < 3) {
    lnameErr.textContent = 'Last name must be at least 3 characters';
    lnameErr.classList.add('show');
    lastNameInput.classList.add('input-error');
    errorFlag = true;
  }

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
  } else if (passInp.length < 8) {
    passErr.textContent = 'Password must be at least 8 characters';
    passErr.classList.add('show');
    passwordInput.classList.add('input-error');
    errorFlag = true;
  }

  if (errorFlag) return;

  setLoading(true);

  try {
    const res  = await fetch('/api/auth/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        firstName: firstNameVal,
        lastName:  lastNameVal,
        email:     mailInp,
        password:  passInp,
        role:      roleVal          // ← role sent to backend
      })
    });

    const data = await res.json();

    if (res.status === 403 && data.message?.includes('pending')) {
      // Recruiter pending — show banner instead of redirecting
      myForm.style.display            = 'none';
      if (pendingBanner) pendingBanner.style.display = 'flex';
      setLoading(false);
      return;
    }

    if (!res.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        showServerError(data.errors.map(e => e.msg).join(' · '));
      } else {
        showServerError(data.message || 'Signup failed. Please try again.');
      }
      setLoading(false);
      return;
    }

    window.location.href = '/user/dashboard';

  } catch (err) {
    showServerError('Network error. Please check your connection and try again.');
    setLoading(false);
  }
});
