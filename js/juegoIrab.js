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
  const modal = d.create('div', { id: 'modal' });
  const contenedor = d.create('div');

  const titulo = d.create('h2', { innerHTML: '¡Bienvenido al juego!' });

  const labelNombre = d.create('label', { innerHTML: 'Ingresá tu nombre:' });
  const inputNombre = d.create('input', { type: 'text', id: 'nombreJugador', required: true });

  const labelSlider = d.create('label', { innerHTML: 'Seleccioná cantidad de pares: <span id="valorSlider">4</span>' });
  const slider = d.create('input', { type: 'range', id: 'sliderPares', min: 2, max: 8, value: 4 });

  const comenzar = d.create('a', {
  href: 'javascript:void(0)',
  innerHTML: 'Comenzar',
  className: 'cerrar-modal',
  onclick: () => {
    const nombre = inputNombre.value.trim();

    // Validaciones
    if (nombre.length < 3) {
      alert('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (nombre.length > 30) {
      alert('El nombre no puede superar los 30 caracteres.');
      return;
    }

    nombreJugador = nombre;
    totalPares = parseInt(slider.value);
    modal.remove();
    iniciarJuego();
  }
});


  slider.addEventListener('input', () => {
    d.query('#valorSlider').innerText = slider.value;
  });

  d.append([titulo, labelNombre, inputNombre, labelSlider, slider, comenzar], contenedor);
  d.append(contenedor, modal);
  d.append(modal);
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
    innerHTML: 'Cerrar',
    onclick: () => {
      modal.remove();
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
  const modal = d.create('div', { id: 'modal' });
  const cont = d.create('div');

  const h2 = d.create('h2', { innerHTML: '¿Estás seguro?' });
  const p = d.create('p', { innerHTML: 'Si volvés al inicio se perderá la partida actual.' });

  const btnSi = d.create('a', {
    href: '../index.html',
    innerHTML: 'Sí, volver',
    className: 'cerrar-modal'
  });

  const btnNo = d.create('a', {
    href: 'javascript:void(0)',
    innerHTML: 'No, seguir jugando',
    onclick: () => modal.remove(),
    className: 'cerrar-modal'
  });

  d.append([h2, p, btnSi, btnNo], cont);
  d.append(cont, modal);
  d.append(modal);
}
