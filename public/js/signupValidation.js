const myForm = document.getElementById('myForm');

myForm.addEventListener('submit', (e) => {
  let errorFlag = false;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');

  const mailInp = emailInput.value.trim();
  const passInp = passwordInput.value.trim();
  const firstNameVal = firstNameInput.value.trim();
  const lastNameVal = lastNameInput.value.trim();

  const mailErr = document.getElementById('mailErr');
  const passErr = document.getElementById('passErr');
  const fnameErr = document.getElementById('fnameErr');
  const lnameErr = document.getElementById('lnameErr');

  // reset errors
  mailErr.textContent = "";
  mailErr.classList.remove("show");
  passErr.textContent = "";
  passErr.classList.remove("show");
  fnameErr.textContent = "";
  fnameErr.classList.remove("show");
  lnameErr.textContent = "";
  lnameErr.classList.remove("show");

  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  firstNameInput.classList.remove("input-error");
  lastNameInput.classList.remove("input-error");

  // first name
  if (firstNameVal.length === 0) {
    fnameErr.textContent = "Can't be left empty";
    fnameErr.classList.add("show");
    firstNameInput.classList.add("input-error");
    errorFlag = true;
  }

  // last name
  if (lastNameVal.length === 0) {
    lnameErr.textContent = "Can't be left empty";
    lnameErr.classList.add("show");
    lastNameInput.classList.add("input-error");
    errorFlag = true;
  }

  // email
  if (mailInp.length === 0) {
    mailErr.textContent = "Can't be left empty";
    mailErr.classList.add("show");
    emailInput.classList.add("input-error");
    errorFlag = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailInp)) {
    mailErr.textContent = "Enter valid email";
    mailErr.classList.add("show");
    emailInput.classList.add("input-error");
    errorFlag = true;
  }

  // password
  if (passInp.length === 0) {
    passErr.textContent = "Can't be left empty";
    passErr.classList.add("show");
    passwordInput.classList.add("input-error");
    errorFlag = true;
  } else if (passInp.length < 8) {
    passErr.textContent = "Password must be at least 8 characters";
    passErr.classList.add("show");
    passwordInput.classList.add("input-error");
    errorFlag = true;
  }

  if (errorFlag) {
    e.preventDefault();
  }
});