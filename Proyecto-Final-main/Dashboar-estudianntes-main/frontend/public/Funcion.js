const btnRegister = document.querySelector('.btn-secundario');
const FormStep = document.querySelectorAll('.form-step');
const btn_prevent = document.querySelector('.prevent');
const loginForm = document.getElementById('formu');
const registerForm = document.getElementById('form-register');

let ForstepsNum = 0;

btnRegister.addEventListener('click', (e) => {
  e.preventDefault();
  ForstepsNum++;
  updateformssteps();
});

btn_prevent.addEventListener('click', (e) => {
  e.preventDefault();
  ForstepsNum--;
  updateformssteps();
});

function updateformssteps() {
  FormStep.forEach((form) => {
    if (form.classList.contains('Active')) {
      form.classList.remove('Active');
    }
  });

  FormStep[ForstepsNum].classList.add('Active');
}

const dirijir = document.getElementById('reset');

dirijir.addEventListener('click', (e) => {
  e.preventDefault();

  window.location.href = '/recuperar.html';
});

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return { __text: text };
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('correo').value;
  const password = document.getElementById('Password').value;
  const role = document.getElementById('role').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await parseJsonResponse(response);

  if (data.__text) {
    alert(data.__text || 'Error al iniciar sesión');
    return;
  }

  if (data.message) alert(data.message);
  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
    return;
  }

  if (!response.ok) {
    alert(data.message || 'No se pudo iniciar sesión');
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = registerForm.querySelector('[name="firstName"]').value;
  const lastName = registerForm.querySelector('[name="lastName"]').value;
  const email = registerForm.querySelector('[name="email"]').value;
  const password = registerForm.querySelector('[name="password"]').value;
  const role = registerForm.querySelector('[name="role"]').value;

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, role }),
  });

  const data = await parseJsonResponse(response);

  if (data.__text) {
    alert(data.__text || 'Error en el registro');
    return;
  }

  if (data.message) alert(data.message);
  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
    return;
  }

  if (!response.ok) {
    alert(data.message || 'No se pudo completar el registro');
  }
});
