// Variables del juego
let preguntas = [];
let respuestasCorrectas = 0;
let respuestasIncorrectas = 0;
let nombreJugador = '';
let rondaActual = 1;
const preguntasPorRonda = 2;
let juegoTerminado = false;

// Cargar preguntas desde el archivo JSON
function cargarPreguntas() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            preguntas = data.sort(() => Math.random() - 0.5);
            iniciarRonda();
        });
}

// Iniciar el juego
function iniciarJuego() {
    nombreJugador = document.getElementById('nickname').value;
    if (!nombreJugador) {
        alert('Por favor ingresa un nombre.');
        return;
    }
    juegoTerminado = false;
    document.getElementById('landing').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    cargarPreguntas();
}

// Mostrar preguntas de la ronda actual
function mostrarPreguntas(preguntasRonda) {
    const contenedorPreguntas = document.getElementById('questions');
    contenedorPreguntas.innerHTML = '';

    preguntasRonda.forEach((pregunta, indice) => {
        let respuestas = pregunta.answers.sort(() => Math.random() - 0.5);
        let bloquePregunta = `<div class="question-block"><h3>${pregunta.question}</h3>`;

        respuestas.forEach(respuesta => {
            bloquePregunta += `<label>
                <input type="radio" name="pregunta${rondaActual}-${indice}" value="${respuesta}"> ${respuesta}
            </label><br>`;
        });
        bloquePregunta += '</div>';
        contenedorPreguntas.innerHTML += bloquePregunta;
    });

    agregarBotonComprobar();
}

// Agregar botón para comprobar respuestas
function agregarBotonComprobar() {
    const botonComprobar = document.getElementById('comprobar');
    if (!botonComprobar) {
        const nuevoBoton = document.createElement('button');
        nuevoBoton.id = 'comprobar';
        nuevoBoton.textContent = 'Comprobar respuestas';
        nuevoBoton.onclick = verificarRespuestas;
        document.getElementById('questions').appendChild(nuevoBoton);
    }
}

// Verificar respuestas seleccionadas
function verificarRespuestas() {
    if (juegoTerminado) return;

    const inicio = (rondaActual - 1) * preguntasPorRonda;
    const fin = inicio + preguntasPorRonda;
    const preguntasRonda = preguntas.slice(inicio, fin);

    let todasRespondidas = true;
    let rondaCorrecta = true;

    preguntasRonda.forEach((pregunta, indice) => {
        const respuestaSeleccionada = document.querySelector(`input[name="pregunta${rondaActual}-${indice}"]:checked`);

        if (!respuestaSeleccionada) {
            todasRespondidas = false;
            return;
        }

        if (respuestaSeleccionada.value === pregunta.correctAnswer) {
            respuestasCorrectas++;
        } else {
            respuestasIncorrectas++;
            rondaCorrecta = false;
        }
    });

    if (!todasRespondidas) {
        alert('Por favor responde todas las preguntas.');
        return;
    }

    moverPreguntasRespondidas(preguntasRonda);

    if (!rondaCorrecta) {
        juegoTerminado = true;
        alert('Has fallado. Fin del juego.');
        finalizarJuego(false);
    } else {
        avanzarRonda();
    }
}

// Mover preguntas respondidas al contenedor de preguntas anteriores y deshabilitar respuestas
function moverPreguntasRespondidas(preguntasRonda) {
    const contenedorPreguntasAnteriores = document.getElementById('previous-questions');

    preguntasRonda.forEach((pregunta, indice) => {
        const respuestaSeleccionada = document.querySelector(`input[name="pregunta${rondaActual}-${indice}"]:checked`).value;

        let bloquePregunta = `<div class="question-block"><h3>${pregunta.question}</h3>`;

        pregunta.answers.forEach(respuesta => {
            bloquePregunta += `<label>
                <input type="radio" name="pregunta${rondaActual}-${indice}" value="${respuesta}" disabled ${respuesta === respuestaSeleccionada ? "checked" : ""}> ${respuesta}
            </label><br>`;
        });

        bloquePregunta += '</div>';
        contenedorPreguntasAnteriores.innerHTML += bloquePregunta;
    });

    document.getElementById('questions').innerHTML = ''; // Limpiar preguntas actuales
}

// Avanzar a la siguiente ronda o finalizar el juego si se completaron todas
function avanzarRonda() {
    const totalRondas = Math.ceil(preguntas.length / preguntasPorRonda);
    if (rondaActual >= totalRondas) {
        juegoTerminado = true;
        alert('¡Felicidades! Has completado todas las preguntas correctamente.');
        finalizarJuego(true);
    } else {
        alert('¡Has pasado de ronda!');
        rondaActual++;
        iniciarRonda();
    }
}

// Iniciar la siguiente ronda
function iniciarRonda() {
    if (juegoTerminado) return;

    const inicio = (rondaActual - 1) * preguntasPorRonda;
    const fin = inicio + preguntasPorRonda;
    const preguntasRonda = preguntas.slice(inicio, fin);

    mostrarPreguntas(preguntasRonda);
}

// Finalizar el juego y descargar resultados
function finalizarJuego(ganado) {
    const resultado = {
        jugador: nombreJugador,
        correctas: respuestasCorrectas,
        incorrectas: respuestasIncorrectas,
        ganado: ganado
    };
    descargarResultados(resultado);
}

// Descargar los resultados en un archivo JSON
function descargarResultados(resultado) {
    const datosStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resultado));
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.setAttribute("href", datosStr);
    enlaceDescarga.setAttribute("download", "resultados.json");
    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    enlaceDescarga.remove();
}
