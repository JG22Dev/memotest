const d = new DOM();
const btnIniciar = d.id('iniciar');
const btnVolver = d.id('volver');
const tablero = d.query('main ul');

let nombreJugador = '';
let intentos = 0;
let totalPares = 4;
let seleccionadas = [];
let active = true;
let tiempo = 0;
let cronometro = null;
let juegoEnCurso = false; // 🛡 bloqueo para evitar múltiples inicios

btnIniciar.addEventListener('click', () => {
  if (juegoEnCurso) return; // 🛑 si ya se está iniciando, no hacer nada

  juegoEnCurso = true;
  btnIniciar.disabled = true;

  if (!nombreJugador) {
    mostrarModalInicio(() => {
      btnIniciar.disabled = false;
      juegoEnCurso = false;
    });
  } else {
    iniciarJuego();
  }
});

btnVolver.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarModalVolver();
});

// MODAL de configuración inicial
function mostrarModalInicio(onCancel) {
  Swal.fire({
    title: 'Bienvenido al juego',
    html: `
      <input id="inputNombre" class="swal2-input" placeholder="Tu nombre (mín 3 letras)" maxlength="30">
      <br><br><label for="sliderPares">Cantidad de pares: <span id="sliderValor">4</span></label>
      <br><input type="range" id="sliderPares" min="2" max="8" value="4" oninput="document.getElementById('sliderValor').textContent = this.value">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Comenzar',
    preConfirm: () => {
      const nombre = document.getElementById('inputNombre').value.trim();
      const pares = parseInt(document.getElementById('sliderPares').value);

      if (!nombre || nombre.length < 3) {
        Swal.showValidationMessage('El nombre debe tener al menos 3 letras.');
        return false;
      }
      if (nombre.length > 30) {
        Swal.showValidationMessage('El nombre no puede superar los 30 caracteres.');
        return false;
      }

      return { nombre, pares };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      nombreJugador = result.value.nombre;
      totalPares = result.value.pares;
      iniciarJuego();
    } else {
      if (typeof onCancel === 'function') {
        onCancel(); // 🔓 se canceló, reactivar botón
      }
    }
  });
}

// MODAL para volver
function mostrarModalVolver() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Si volvés al inicio perderás el progreso actual.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, volver',
    cancelButtonText: 'No, seguir jugando'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '../index.html';
    }
  });
}

// INICIAR JUEGO
function iniciarJuego() {
  tablero.innerHTML = '';
  intentos = 0;
  tiempo = 0;
  seleccionadas = [];
  active = false;
  clearInterval(cronometro);
  cronometro = null;

  btnIniciar.disabled = true;
  btnIniciar.innerText = `${nombreJugador} vas 0 intentos en 0s`;

  const cartas = [];

  for (let i = 1; i <= totalPares; i++) {
    cartas.push({ tipo: 'pregunta', nombre: `imagen${i}.png` });
    cartas.push({ tipo: 'respuesta', nombre: `imagen${i}.png` });
  }

  cartas.sort(() => Math.random() - 0.5);

  let flipped = '';
  let flippedElem = null;
  const cartasLi = [];

  cartas.forEach((carta) => {
    const li = document.createElement('li');
    const carpeta = carta.tipo === 'pregunta' ? 'preguntas' : 'respuestas';

    const imgReal = document.createElement('img');
    imgReal.src = `../cardIrab/${carpeta}/${carta.nombre}`;
    Object.assign(imgReal.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      objectFit: 'cover',
      visibility: 'visible'
    });

    const imgTapada = document.createElement('img');
    imgTapada.src = '../cardIrab/tapada.png';
    Object.assign(imgTapada.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      objectFit: 'cover',
      visibility: 'hidden'
    });

    li.appendChild(imgTapada);
    li.appendChild(imgReal);
    tablero.appendChild(li);

    cartasLi.push({ li, imgTapada, imgReal, carta });
  });

  // MOSTRAR CARTAS DURANTE 3 SEGUNDOS
  setTimeout(() => {
    cartasLi.forEach(({ li, imgTapada, imgReal, carta }) => {
      imgReal.style.visibility = 'hidden';
      imgTapada.style.visibility = 'visible';

      li.onclick = () => {
        if (!active || li.classList.contains('fija') || li.classList.contains('seleccionado')) return;

        active = false;
        li.classList.add('seleccionado');

        imgTapada.style.visibility = 'hidden';
        imgReal.style.visibility = 'visible';

        if (!flipped) {
          flipped = carta.nombre;
          flippedElem = li;
          active = true;
        } else {
          intentos++;
          const nombre1 = flipped.split('.')[0];
          const nombre2 = carta.nombre.split('.')[0];

          const minutos = Math.floor(tiempo / 60);
          const segundos = tiempo % 60;
          btnIniciar.innerText = `${nombreJugador} vas ${intentos} intentos en ${minutos}m ${segundos}s`;

          if (nombre1 === nombre2) {
            li.classList.replace('seleccionado', 'fija');
            flippedElem.classList.replace('seleccionado', 'fija');
            flipped = '';
            flippedElem = null;

            const aciertos = d.queryAll('.fija').length;
            if (aciertos === totalPares * 2) {
              clearInterval(cronometro);
              setTimeout(() => gameOver(), 300);
            }
            active = true;
          } else {
            setTimeout(() => {
              imgTapada.style.visibility = 'visible';
              imgReal.style.visibility = 'hidden';

              const imgBack = flippedElem.querySelector('img:last-child');
              imgBack.style.visibility = 'hidden';
              flippedElem.querySelector('img:first-child').style.visibility = 'visible';

              flippedElem.classList.remove('seleccionado');
              li.classList.remove('seleccionado');
              flipped = '';
              flippedElem = null;
              active = true;
            }, 1000);
          }
        }
      };
    });

    // Activar juego y cronómetro
    active = true;
    cronometro = setInterval(() => {
      tiempo++;
      const minutos = Math.floor(tiempo / 60);
      const segundos = tiempo % 60;
      btnIniciar.innerText = `${nombreJugador} vas ${intentos} intentos en ${minutos}m ${segundos}s`;
    }, 1000);
  }, 3000);
}

// MODAL FINAL
function gameOver() {
  Swal.fire({
    title: `🎉 ¡Ganaste, ${nombreJugador}!`,
    text: `Lo hiciste en ${intentos} intentos.`,
    icon: 'success',
    showCancelButton: true,
    confirmButtonText: 'Volver a jugar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    juegoEnCurso = false;

    if (result.isConfirmed) {
      iniciarJuego();
    } else {
      nombreJugador = '';
      btnIniciar.disabled = false;
      btnIniciar.innerText = 'Iniciar Juego';
    }
  });
}