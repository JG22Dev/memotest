const d = new DOM();
const btnIniciar = d.id('iniciar');
const btnVolver = d.id('volver');
const tablero = d.query('main ul');
const body = document.body;

let nombreJugador = '';
let intentos = 0;
let totalPares = 4;
let seleccionadas = [];
let active = true;
let tiempo = 0;
let cronometro = null;

btnIniciar.addEventListener('click', () => {
  if (!nombreJugador) {
    mostrarModalInicio();
  }
});

btnVolver.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarModalVolver();
});

function mostrarModalInicio() {
  Swal.fire({
    title: '¡Bienvenido al juego!',
    html: `
      <input id="inputNombre" class="swal2-input" placeholder="Tu nombre (mín 3 letras)" maxlength="30">
      <br><br><label for="sliderPares">Cantidad de pares de cartas: <span id="sliderValor">4</span></label>
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



function iniciarJuego() {
  tablero.innerHTML = '';
  intentos = 0;
  tiempo = 0;
  seleccionadas = [];
  active = true;
  clearInterval(cronometro);

  btnIniciar.disabled = true;
  btnIniciar.innerText = `${nombreJugador} vas 0 intentos en 0s`;

  cronometro = setInterval(() => {
    tiempo++;
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    btnIniciar.innerText = `${nombreJugador} vas ${intentos} intentos en ${minutos}m ${segundos}s`;
  }, 1000);

  const cartas = [];

  for (let i = 1; i <= totalPares; i++) {
    cartas.push({ tipo: 'pregunta', nombre: `imagen${i}.png` });
    cartas.push({ tipo: 'respuesta', nombre: `imagen${i}.png` });
  }

  cartas.sort(() => Math.random() - 0.5);

  let flipped = '';
  let flippedElem = null;

  cartas.forEach((carta) => {
    const li = d.create('li', {
      onclick: () => {
        if (!active || li.classList.contains('fija') || li.classList.contains('seleccionado')) return;

        active = false;
        li.classList.add('seleccionado');

        const img1 = li.querySelector('img:first-child');
        const img2 = li.querySelector('img:last-child');
        img1.style.visibility = 'hidden';
        img2.style.visibility = 'visible';

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
              img1.style.visibility = 'visible';
              img2.style.visibility = 'hidden';
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
      }
    });

    const carpeta = carta.tipo === 'pregunta' ? 'preguntas' : 'respuestas';

    const img1 = d.create('img', { src: '../cardIrab/tapada.png' });
    const img2 = d.create('img', {
      src: `../cardIrab/${carpeta}/${carta.nombre}`,
      style: 'visibility: hidden; position: absolute; top: 0; left: 0;'
    });

    d.append([img1, img2], li);
    d.append(li, tablero);
  });
}

function gameOver() {
  const modal = d.create('div', { id: 'modal' });
  const cont = d.create('div');
  const h2 = d.create('h2', { innerHTML: `🎉 ¡Ganaste, ${nombreJugador}!` });
  const p = d.create('p', { innerHTML: `Lo hiciste en ${intentos} intentos.` });
  const cerrar = d.create('a', {
  href: 'javascript:void(0)',
  innerHTML: 'Volver a jugar',
  onclick: () => {
    modal.remove();
    nombreJugador = ''; // resetear nombre para que se pida otra vez
    btnIniciar.disabled = false;
    btnIniciar.innerText = 'Iniciar Juego';
  },
  className: 'cerrar-modal'
});
  d.append([h2, p, cerrar], cont);
  d.append(cont, modal);
  d.append(modal);
}

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


  const btnNo = d.create('a', {
    href: 'javascript:void(0)',
    innerHTML: 'No, seguir jugando',
    onclick: () => modal.remove(),
    className: 'cerrar-modal'
  });

  d.append([h2, p, btnSi, btnNo], cont);
  d.append(cont, modal);
  d.append(modal);

