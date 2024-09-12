const login = document.getElementById("login");

const toastTrigger = document.getElementById("liveToastBtn"); // acionador
const toastLiveExample = document.getElementById("liveToast");

let validateEmail = false;

document.getElementById("email").addEventListener("blur", function () {
  const emailInput = this;

  setTimeout(() => {
    const emailValue = emailInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      showToast("E-mail inválido");
    } else {
      validateEmail = true;
    }
  }, 100);
});

function nextPage(){
  const emailInput = document.getElementById("email");
  const emailValue = emailInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
      showToast("E-mail inválido");
    } else {
      validateEmail = true;
    }

  if (validateEmail) {
    window.location.href = "./pages/dashboard.html";
  } else {
    showToast("E-mail inválido");
  }
}

document.getElementById('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const password = document.getElementById('senha').value;
  const rememberMe = document.getElementById('remember-password').checked;

  if (rememberMe) {
    localStorage.setItem('password', password);
} else {
    localStorage.removeItem('password');
}

  nextPage();
});

document.addEventListener('DOMContentLoaded', () => {
  const savedPassword = localStorage.getItem('password');

  if (savedPassword) {
      document.getElementById('senha').value = savedPassword;
      document.getElementById('remember-password').checked = true;
  }
});

function showToast(message) {
  const toastLiveExample = document.getElementById("liveToast");
  const toastBody = toastLiveExample.querySelector(".toast-body");
  toastBody.textContent = message;

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  toastBootstrap.show();
}
