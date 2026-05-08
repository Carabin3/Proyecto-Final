const params = new URLSearchParams(window.location.search);
const idDesdeUrl = params.get('id');

const form = document.getElementById('form');
const idEstudianteInput = document.getElementById('id_estudiante');

if (idEstudianteInput) {
  idEstudianteInput.value = idDesdeUrl || '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const programa_academico = form.programa_academico.value;
  const id_estudiante = idEstudianteInput ? idEstudianteInput.value : '';

  if (!id_estudiante) {
    alert('Falta el identificador en la URL (?id=…). Vuelve a iniciar sesión.');
    return;
  }

  if (!programa_academico) {
    alert('Selecciona un programa académico');
    return;
  }

  const response = await fetch('/completar-estudiante', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ programa_academico, id_estudiante }),
  });

  const contentType = response.headers.get('content-type');
  let data = {};
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    alert(text || 'Error al guardar');
    return;
  }

  if (data.message) alert(data.message);
  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
    return;
  }

  if (!response.ok) {
    alert(data.message || 'No se pudo guardar el programa');
  }
});
