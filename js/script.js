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

// Función para generar y guardar el PDF
const generarPDF = (destinatario) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const texto = textArea.value;
    const margenIzquierdo = 20;
    const margenSuperior = 40;
    const anchoLinea = 170;

    // Obtener la fecha actual en formato legible
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Agregar encabezado estilizado al PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Carta para ${destinatario}`, doc.internal.pageSize.getWidth() / 2, 20, {
        align: "center"
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaFormateada}`, margenIzquierdo, 30);

    // Dividir el texto en líneas y agregarlo al PDF con estilo
    doc.setFontSize(14);
    doc.setFont("times", "italic");
    const lineas = doc.splitTextToSize(texto, anchoLinea);
    doc.text(lineas, margenIzquierdo, margenSuperior);

    // Agregar pie de página con número de página
    const numeroPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= numeroPaginas; i++) {
        doc.setPage(i);
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        doc.text(
            `Página ${i} de ${numeroPaginas}`,
            doc.internal.pageSize.getWidth() - 40,
            doc.internal.pageSize.getHeight() - 10
        );
    }

    // Generar el nombre del archivo
    const nombreArchivo = `Carta_${destinatario}_${fecha.toISOString().split('T')[0]}.pdf`;

    // Descargar el archivo
    doc.save(nombreArchivo);
};

// Asignar eventos a los botones del modal
btnEnviarMama.addEventListener('click', () => {
    destinatarioSeleccionado = "Mamá";
    generarPDF(destinatarioSeleccionado);
    cerrarModalEnviar();
});

btnEnviarPapa.addEventListener('click', () => {
    destinatarioSeleccionado = "Papá";
    generarPDF(destinatarioSeleccionado);
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

// Asignar eventos a los botones del modal
btnEnviarMama.addEventListener('click', () => {
    destinatarioSeleccionado = "Mamá";
    generarPDF(destinatarioSeleccionado);
    cerrarModalEnviar();
});

btnEnviarPapa.addEventListener('click', () => {
    destinatarioSeleccionado = "Papá";
    generarPDF(destinatarioSeleccionado);
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
