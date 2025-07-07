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

btnIniciar.addEventListener('click', () => {
  if (!nombreJugador) {
    mostrarModalInicio(); // primer inicio
  } else {
    iniciarJuego(); // reinicio con el mismo nombre
  }
});

btnVolver.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarModalVolver();
});

// MODAL de SweetAlert para nombre y pares
function mostrarModalInicio() {
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
    }
  });
}

// MODAL para volver atrás
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

// FUNCIÓN PRINCIPAL DEL JUEGO
function iniciarJuego() {
  tablero.innerHTML = '';
  intentos = 0;
  tiempo = 0;
  seleccionadas = [];
  active = false;
  clearInterval(cronometro);

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

    // Imagen real (destapada al inicio)
    const imgReal = document.createElement('img');
    imgReal.src = `../cardVacunas/${carpeta}/${carta.nombre}`;
    imgReal.style.position = 'absolute';
    imgReal.style.top = '0';
    imgReal.style.left = '0';
    imgReal.style.width = '100%';
    imgReal.style.height = '100%';
    imgReal.style.objectFit = 'cover';
    imgReal.style.visibility = 'visible';

    // Imagen tapada (oculta al principio)
    const imgTapada = document.createElement('img');
    imgTapada.src = '../cardVacunas/tapada.png';
    imgTapada.style.position = 'absolute';
    imgTapada.style.top = '0';
    imgTapada.style.left = '0';
    imgTapada.style.width = '100%';
    imgTapada.style.height = '100%';
    imgTapada.style.objectFit = 'cover';
    imgTapada.style.visibility = 'hidden';

    li.appendChild(imgTapada);
    li.appendChild(imgReal);
    tablero.appendChild(li);

    cartasLi.push({ li, imgTapada, imgReal, carta });
  });

  // Después de 3 segundos, tapar y activar juego
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

    // Activar clicks y cronómetro
    active = true;
    cronometro = setInterval(() => {
      tiempo++;
      const minutos = Math.floor(tiempo / 60);
      const segundos = tiempo % 60;
      btnIniciar.innerText = `${nombreJugador} vas ${intentos} intentos en ${minutos}m ${segundos}s`;
    }, 1000);
  }, 3000);
}

// MODAL final
function gameOver() {
  Swal.fire({
    title: `🎉 ¡Ganaste, ${nombreJugador}!`,
    text: `Lo hiciste en ${intentos} intentos.`,
    icon: 'success',
    showCancelButton: true,
    confirmButtonText: 'Volver a jugar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      iniciarJuego(); // mismo nombre
    } else {
      nombreJugador = '';
      btnIniciar.disabled = false;
      btnIniciar.innerText = 'Iniciar Juego';
    }
  });
}
