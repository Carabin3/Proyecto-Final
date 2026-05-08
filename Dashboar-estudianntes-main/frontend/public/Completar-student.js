// 1. capturar id desde la URL
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// 2. asignarlo al input hidden
document.getElementById('id_usuario').value = id;

// 3. (opcional) validar form
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  const programa = form.programa.value;

  if (!programa) {
    e.preventDefault();
    alert('Selecciona un programa');
  }
});