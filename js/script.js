const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnClear = document.getElementById('btnClear');
const btnSave = document.getElementById('btnSave');
const btnListen = document.getElementById('btnListen');
const textArea = document.getElementById('textArea');
let destinatarioSeleccionado = "";

// Indicador visual
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingText = document.getElementById('recordingText');

// Modal de confirmación para borrar texto
const modalConfirmDelete = document.getElementById('modalConfirmDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCancelDelete = document.getElementById('btnCancelDelete');

// Configuración del reconocimiento de voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.lang = 'es-ES';

// Función para actualizar el estado de los botones
const actualizarEstadoBotones = () => {
    btnStop.disabled = recordingIndicator.style.display !== "block";
    btnClear.disabled = textArea.value.trim() === "";
    btnSave.disabled = textArea.value.trim() === "";
    btnListen.disabled = textArea.value.trim() === "";
};

// Función para iniciar la grabación
btnStart.addEventListener('click', () => {
    textArea.placeholder = "Escuchando...";
    recognition.start();

    // Mostrar indicador visual
    recordingIndicator.style.display = "block";
    recordingText.style.display = "block";

    // Actualizar botones
    actualizarEstadoBotones();
});

// Función para detener la grabación
btnStop.addEventListener('click', () => {
    if (recordingIndicator.style.display === "none") {
        alert("No hay grabación en curso.");
        return;
    }

    textArea.placeholder = "Grabación detenida.";
    recognition.stop();

    // Ocultar indicador visual
    recordingIndicator.style.display = "none";
    recordingText.style.display = "none";

    // Actualizar botones
    actualizarEstadoBotones();
});

// Función para abrir el modal de confirmación
const abrirModal = () => {
    modalConfirmDelete.style.display = 'flex';
};

// Función para cerrar el modal de confirmación
const cerrarModal = () => {
    modalConfirmDelete.style.display = 'none';
};

// Función para limpiar el texto (con modal)
btnClear.addEventListener('click', () => {
    if (textArea.value.trim() === "") {
        alert("No hay texto para borrar.");
        return;
    }
    abrirModal(); // Mostrar el modal de confirmación
});

// Confirmar la acción de borrar
btnConfirmDelete.addEventListener('click', () => {
    textArea.value = ""; // Limpiar el área de texto
    cerrarModal(); // Cerrar el modal después de borrar el texto
    actualizarEstadoBotones(); // Actualizar el estado de los botones
});

// Cancelar la acción de borrar
btnCancelDelete.addEventListener('click', () => {
    cerrarModal(); // Cerrar el modal sin borrar el texto
});

// Nuevo modal de envío
const modalEnviar = document.getElementById('modalEnviar');
const btnEnviarMama = document.getElementById('btnEnviarMama');
const btnEnviarPapa = document.getElementById('btnEnviarPapa');
const btnCerrarEnviar = document.getElementById('btnCerrarEnviar');

// Función para abrir el modal de envío
const abrirModalEnviar = () => {
    modalEnviar.style.display = 'flex';
};

// Función para cerrar el modal de envío
const cerrarModalEnviar = () => {
    modalEnviar.style.display = 'none';
};

// Theme selection modal
const modalTemas = document.getElementById('modalTemas');
const btnTheme = document.getElementById('btnTheme');
const btnCerrarTemas = document.getElementById('btnCerrarTemas');
const modalTemasButtons = modalTemas.querySelector('.modal-buttons');

// Themes configuration
const themes = [
    { name: 'Naturaleza', image: 'img/temas/naturaleza.jpg' },
    { name: 'Playa', image: 'img/temas/playa.jpg' },
    { name: 'Montaña', image: 'img/temas/montana.jpg' },
    { name: 'Ciudad', image: 'img/temas/ciudad.jpg' }
    // Add more themes as needed
];

let selectedTheme = null;

// Function to open theme modal
const abrirModalTemas = () => {
    // Clear existing buttons
    modalTemasButtons.innerHTML = '';

    // Create buttons for each theme
    themes.forEach((tema, index) => {
        const boton = document.createElement('button');
        boton.innerHTML = `<img src="${tema.image}" alt="${tema.name}" class="icono-tema">`;
        boton.title = tema.name;
        boton.addEventListener('click', () => {
            selectedTheme = tema;
            cerrarModalTemas();
        });
        modalTemasButtons.appendChild(boton);
    });

    modalTemas.style.display = 'flex';
};

// Function to close theme modal
const cerrarModalTemas = () => {
    modalTemas.style.display = 'none';
};

// Event listeners for theme modal
btnTheme.addEventListener('click', abrirModalTemas);
btnCerrarTemas.addEventListener('click', cerrarModalTemas);

// Modify the save functionality to generate an image instead of PDF
const generarImagen = (destinatario) => {
    if (textArea.value.trim() === "") {
        alert("No hay texto para guardar.");
        return;
    }

    // Create a canvas to draw the letter
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Fill background with theme image if selected
    if (selectedTheme) {
        const img = new Image();
        img.onload = () => {
            // Draw theme image (scaled and centered)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Add text overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

            // Text styling
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
            
            // Add header
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Carta para ${destinatario}`, 60, 90);

            // Add date
            ctx.font = '16px Arial';
            const fecha = new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            ctx.fillText(`Fecha: ${fecha}`, 60, 120);

            // Add main text
            ctx.font = '16px Arial';
            const lineas = wrapText(ctx, textArea.value, 60, 160, canvas.width - 120, 25);

            // Generate filename
            const nombreArchivo = `Carta_${destinatario}_${new Date().toISOString().split('T')[0]}.png`;

            // Convert to image and download
            const imagenURL = canvas.toDataURL('image/png');
            const enlaceDescarga = document.createElement('a');
            enlaceDescarga.href = imagenURL;
            enlaceDescarga.download = nombreArchivo;
            enlaceDescarga.click();
        };
        img.src = selectedTheme.image;
    } else {
        // Fallback if no theme selected
        alert("Por favor, selecciona un tema antes de guardar.");
    }
};

// Helper function to wrap text on canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    return y;
}

// Modificar la función para generar PDF
const generarPDF = (destinatario) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const texto = textArea.value;
    const margenIzquierdo = 10;
    const margenSuperior = 20;
    const anchoLinea = 180;

    // Obtener la fecha actual en formato legible
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Agregar encabezado al PDF
    doc.setFontSize(16);
    doc.text(`Carta para ${destinatario}`, margenIzquierdo, margenSuperior);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaFormateada}`, margenIzquierdo, margenSuperior + 10);

    // Dividir el texto en líneas y agregarlo al PDF
    const lineas = doc.splitTextToSize(texto, anchoLinea);
    doc.text(lineas, margenIzquierdo, margenSuperior + 20);

    // Generar el nombre del archivo
    const nombreArchivo = `Carta_${destinatario}_${fecha.toISOString().split('T')[0]}.pdf`;

    // Descargar el archivo
    doc.save(nombreArchivo);
};

// Asignar eventos a los botones del modal
btnEnviarMama.addEventListener('click', () => {
    destinatarioSeleccionado = "Mamá";
    if (selectedTheme) {
        generarImagen(destinatarioSeleccionado);
    } else {
        generarPDF(destinatarioSeleccionado);
    }
    cerrarModalEnviar();
});

btnEnviarPapa.addEventListener('click', () => {
    destinatarioSeleccionado = "Papá";
    if (selectedTheme) {
        generarImagen(destinatarioSeleccionado);
    } else {
        generarPDF(destinatarioSeleccionado);
    }
    cerrarModalEnviar();
});

// Cerrar el modal sin acción
btnCerrarEnviar.addEventListener('click', cerrarModalEnviar);

// Evento para el botón "Guardar"
btnSave.addEventListener('click', () => {
    if (textArea.value.trim() === "") {
        alert("No hay texto para guardar.");
        return;
    }
    abrirModalEnviar(); // Mostrar el modal para seleccionar el destinatario
});

// Agregar texto reconocido al área de texto en tiempo real
recognition.onresult = (event) => {
    let textoTemporal = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i];
        textoTemporal += resultado[0].transcript;

        if (resultado.isFinal) {
            textArea.value += textoTemporal + " ";
            textoTemporal = '';
        }
    }

    if (textoTemporal) {
        textArea.placeholder = textoTemporal;
    }

    actualizarEstadoBotones();
};

// Manejo de errores
recognition.onerror = (event) => {
    alert(`Error: ${event.error}`);
};

// Función para leer el texto en voz alta
btnListen.addEventListener('click', () => {
    if (textArea.value.trim() === "") {
        alert("No hay texto para escuchar.");
        return;
    }

    const texto = textArea.value;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
});

// Actualizar el estado de los botones al cargar
actualizarEstadoBotones();
