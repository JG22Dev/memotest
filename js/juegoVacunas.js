const d = new DOM();
const btnIniciar = d.id('iniciar');
const tablero = d.query('main ul');
const body = document.body;

let nombreJugador = '';
let intentos = 0;
let totalPares = 4;
let seleccionadas = [];
let active = true;

btnIniciar.addEventListener('click', mostrarModalInicio);

// Mostrar el modal para pedir nombre y pares
function mostrarModalInicio() {
  // Crear estructura del modal
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
      if (!nombre) {
        alert('Por favor ingresá tu nombre.');
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

// Iniciar el juego
function iniciarJuego() {
  tablero.innerHTML = '';
  intentos = 0;
  seleccionadas = [];
  active = true;

  btnIniciar.disabled = true;

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

        const img1 = li.querySelector('img:first-child');  // tapada
        const img2 = li.querySelector('img:last-child');   // real
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

          if (nombre1 === nombre2) {
            li.classList.replace('seleccionado', 'fija');
            flippedElem.classList.replace('seleccionado', 'fija');
            flipped = '';
            flippedElem = null;

            const aciertos = d.queryAll('.fija').length;
            if (aciertos === totalPares * 2) {
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

    const img1 = d.create('img', { src: '../cardVacunas/tapada.png' });
    const img2 = d.create('img', {
      src: `../cardVacunas/${carpeta}/${carta.nombre}`,
      style: 'visibility: hidden; position: absolute; top: 0; left: 0;'
    });

    d.append([img1, img2], li);
    d.append(li, tablero);
  });
}

// Mostrar resultado final
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
    },
    className: 'cerrar-modal'
  });
  d.append([h2, p, cerrar], cont);
  d.append(cont, modal);
  d.append(modal);
}
