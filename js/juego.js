const d = new DOM( );
const btnIniciar = d.id('iniciar');
const tablero = d.query( 'main ul' );

btnIniciar.addEventListener( 'click', iniciarJuego );

let intentos = 0;
let cantCartas = 6;
let imgs = [];
for(let i = 1; i <= cantCartas; i++){
    imgs.push( `img${i}.png` );
    imgs.push( `img${i}.png` );
}




function iniciarJuego( ){
    tablero.innerHTML = '';
    intentos = 0;
    let active = true;
    let flipped = '';

    imgs = imgs.sort(function () {
        return Math.random() - 0.5;
    });

    imgs.forEach( i => {
        const li = d.create('li', { onclick: ( ) =>{
            if( ! active ) return;
            if( li.classList.contains('fija') ) return;

            active = false;
            li.classList.add('seleccionado');
            if( flipped === '' ){
                //esto significa que recién di vuelta la primera carta
                flipped = i;
                active = true;
            }else{
                //acá ya di vuelta las dos cartas...
                intentos++;
                const acerto = flipped == i;
                if( acerto ){
                    li.classList.replace('seleccionado','fija');
                    d.query('.seleccionado').classList.replace('seleccionado','fija');
                    active = true;

                    const cuantosAcerte = d.queryAll('.fija');
                    if( cuantosAcerte.length == imgs.length ){
                        gameOver( );
                    }

                }else{
                    setTimeout(
                        function( ){
                            li.classList.remove('seleccionado');
                            d.query('.seleccionado').classList.remove('seleccionado');
                            active = true;
                        },
                        2000
                    );
                }
                flipped = '';
            }

        } });
        const img1 = d.create('img', { src: 'c/back.png' } );
        const img2 = d.create('img',{ src: `c/${i}` });
        
        d.append( [img1, img2], li );
        d.append( li, tablero );
    } );

}


function gameOver( ){
    const modal = d.create('div', { id: 'modal' } );
    const subm = d.create('div');
    const h2 = d.create('h2', { innerHTML: 'GANASTE!!!' });
    const p = d.create('p', { innerHTML: `Lo hiciste en ${intentos} intentos` } );
    const cerrar = d.create('a',{ href: 'javascript:void(0)', innerHTML: 'cerrar', onclick: function( ){ modal.remove();  }, className: 'cerrar-modal' });
    d.append( [h2,p,cerrar], subm );
    d.append( subm, modal );
    d.append( modal );
}

iniciarJuego( );