
const model = tf.sequential();

// Obtengo los elementos HTML
let inputNumEpocas = document.getElementById('iInputEpocas');
let inputVariableX = document.getElementById('iInputX');
const btnEntrenar = document.getElementById('btn_entrenar');
const btnPredecir = document.getElementById('btn_predecir');
const outDiv = document.getElementById('micro-out-div');

// Variable para almacenar el número ingresado por el usuario
let epochs;
let prevNum;
const valoresXY = [];


inputNumEpocas.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { // Verificar si la tecla presionada es "Enter"
        event.preventDefault(); // Prevenir que se envíe el formulario
        btnEntrenar.click(); // Hacer click en el botón
    }
})

inputVariableX.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { // Verificar si la tecla presionada es "Enter"
        event.preventDefault(); // Prevenir que se envíe el formulario
        btnPredecir.click(); // Hacer click en el botón
    }
})

// Evento de input para validar el número ingresado y habilitar el botón "Entrenar":

inputNumEpocas.addEventListener( 'input', (event) => {

    // console.log("Imprimo el input", event.target.value);
    // console.log("Imprimo el TIPO del input", typeof(event.target.value));

    // Obtener el valor del input
    epochs = parseInt(inputNumEpocas.value);

    // console.log("Imprimo el epochs", epochs);
    // console.log("Imprimo el TIPO del epochs", typeof(epochs));

    // Validar que sea un número entero
    if (!isNaN(epochs) && Number.isInteger(epochs) && epochs > 0) {
        // Habilitar el botón "Entrenar"
        outDiv.innerHTML = ``;
        btnEntrenar.disabled = false;
    } else {
        // Deshabilitar el botón "Entrenar"
        btnEntrenar.disabled = true;
        console.warn("Debe ingresar n número entero POSITIVO!");
        outDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
                Debe ingresar un número entero POSITIVO!
            </div>`;
    }
});

btnEntrenar.addEventListener('click', function() {
    // Deshabilitar el input
    inputNumEpocas.disabled = true;
    // Mostrar alert rojo
    outDiv.innerHTML = `
        <div class="alert alert-danger" role="alert">
            Entrenando modelo. Espere por favor... 💬 🕐...
        </div>`;
    // Deshabilitar el botón "Entrenar"
    btnEntrenar.disabled = true;
    // Llamar a la función de entrenamiento
    run(epochs);
    
});


// Evento del input para validar el número ingresado en la variable X habilitar el botón "Predecir"

inputVariableX.addEventListener( 'input', (event) => {
    
    // console.log("Imprimo el input", event.target.value);
    // console.log("Imprimo el TIPO del input", typeof(event.target.value));

    // Obtener el valor del input
    variableX = parseFloat(inputVariableX.value);

    // console.log("Imprimo el epochs", epochs);
    // console.log("Imprimo el TIPO del epochs", typeof(epochs));

    // Validar que sea un número
    if (!isNaN(variableX) > 0) {
        // Habilitar el botón "Predecir"
        outDiv.innerHTML = ``;
        btnPredecir.disabled = false;
    } else {
        // Deshabilitar el botón "Predecir"
        btnPredecir.disabled = true;
        console.warn("Debe ingresar un número!");
        outDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
            Debe ingresar un número!
            </div>`;
    }
});


btnPredecir.addEventListener('click', function () {

    //Realizar la predicción:
    const resultado = Predecir(variableX);

    // Limpiar el input de épocas
    inputNumEpocas.value = "";
    // Limpiar el input de la variable x
    inputVariableX.value = "";

    //Habilitar el input épocas
    inputNumEpocas.disabled = false;
    inputNumEpocas.focus();
    
    //Desabilitar el input de la variable x
    inputVariableX.disabled = true;

    // Deshabilitar el botón "Predecir"
    btnPredecir.disabled = true;

    // Mostrar alert azul con el resultado de la predicción
    outDiv.innerHTML = `
        <div class="alert alert-primary" role="alert">
            <p> El resultado de la predicción para el valor de <strong>"y"</strong>, utilizando un entrenamiento de <strong>${epochs} épocas</strong>, cuando <strong>x = ${variableX}</strong> es: 
                <strong>${resultado}</strong>
            </p>
        </div>`;

});



async function run(epochs)  {
    /*
    Creamos con tf un modelo que predice el valor de y cuando el usuario ingrese un valor x. La computadora entrenará un modelo en función de datos pre-cargados. Este entrenamiento estará definido por el número de épocas previamente cargado por el usuario.
    */
    // Create a simple model.
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    
    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
    
    // Generate some synthetic data for training. (y = 2x - 1)
    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4, 5, 6], [8, 1]);
    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7, 9, 11], [8, 1]);
    
    
    // Train the model using the data.
    await model.fit(xs, ys, {
        epochs: epochs,

        callbacks: {
            onEpochEnd: (epochs, logs) => {
                console.log(logs);
                console.log("/n");
                console.log(`Epchs ${epochs+1} - Loss: ${logs.loss.toFixed(4)}`);
                //Formo un array de objetos con la forma [{x: , y: },{x: , y: }]
                valoresXY.push({x: epochs+1, y:logs.loss.toFixed(4)});
            }
        }
    });

    //Me fijo si se me cargaron los valores en el de x e y en el array
    console.log("Este es mi array para el gráfico", valoresXY);


    // Mostrar alert verde
    outDiv.innerHTML = `
        <div class="alert alert-success" role="alert">
            Terminé de entrenar el modelo 🤖
        </div>`;

    //Habilito el input para que ingrese el valor de X:
    inputVariableX.disabled = false;
   // console.log("Luego de habilitar el input de la x")
    inputVariableX.focus();



}


function Predecir (valor) {
    // Use the model to do inference on a data point the model hasn't seen.
    
    // document.getElementById('micro-out-div').innerText = model.predict(tf.tensor2d([20], [1, 1])).dataSync();
    const resultado = model.predict(tf.tensor2d([valor], [1, 1])).dataSync();

    //########################### Gráfico de error #############################################

    const data = {values: valoresXY}
    // Get a surface
    const surface = tfvis.visor().surface({ name: 'Pérdida vs épocas: y(x)', tab: 'Charts' });

    // Render a linechart on that surface
    tfvis.render.linechart(surface, data, {zoomToFit: true});



    return resultado
}

