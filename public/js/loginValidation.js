const myForm = document.getElementById('myForm');

myForm.addEventListener('submit', (e) => {
    let errorFlag = false;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const mailInp = emailInput.value.trim();
    const passInp = passwordInput.value.trim();

    const mailErr = document.getElementById('mailErr');
    const passErr = document.getElementById('passErr');

    mailErr.textContent = "";
    mailErr.classList.remove("show");
    passErr.textContent = "";
    passErr.classList.remove("show");

    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");

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