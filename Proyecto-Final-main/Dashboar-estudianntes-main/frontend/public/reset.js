// capturar token de la URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

document.getElementById('token').value = token;

console.log(token);


const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  const pass = form.password.value;
  const confirm = form.confirm.value;

  if (pass !== confirm) {
    e.preventDefault();
    alert('Las contraseñas no coinciden');
  }
});