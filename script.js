const CALENDAR_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygMXRVE_rJW1VKh7jwt3h1_XLKQX3gKmgVHvUUAXy1JXqbJr5UkaJX_mJceDWxEPE3/exec';
const EMAILJS_SERVICE = 'STLIZE_service';
const EMAILJS_TEMPLATE = 'template_hhmf1wu';
const EMAILJS_KEY = '7IsyP95cxD43-8Jcl';
// 2. TRADUCCIONES (Incluyendo el nuevo campo de teléfono)
const translations = {
    en: {
        nav_home: "Home", nav_book: "Book a Taxi", footer_text: "© 2026 Taxi Prueba.",
        hero_title: "Your Reliable Ride", hero_subtitle: "Safe transport services at your fingertips.", hero_btn: "Book Now",
        book_title: "Book Your Trip", book_subtitle: "Fill in the details below for a confirmation email.",
        form_name: "Full Name", form_email: "Email", form_phone: "Contact Phone", 
        form_pickup: "Pick-up Location", form_destination: "Destination", form_date: "Date", 
        form_time: "Time", form_passengers: "Passengers (1-4)", form_btn: "Confirm Booking"
    },
    es: {
        nav_home: "Inicio", nav_book: "Reservar Taxi", footer_text: "© 2026 Taxi Prueba.",
        hero_title: "Tu Viaje Confiable", hero_subtitle: "Servicios de transporte seguros y profesionales.", hero_btn: "Reservar Ahora",
        book_title: "Reserva Tu Viaje", book_subtitle: "Completa los detalles y confirmaremos tu recogida.",
        form_name: "Nombre Completo", form_email: "Correo", form_phone: "Teléfono de Contacto",
        form_pickup: "Punto de Recogida", form_destination: "Destino del Viaje", form_date: "Fecha", 
        form_time: "Hora", form_passengers: "Pasajeros (1-4)", form_btn: "Confirmar Reserva"
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('preferredLanguage', lang);
}

// 3. LÓGICA DE RESERVA
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const timeStr = document.getElementById('time').value;
        const hour = parseInt(timeStr.split(':')[0]);

        // Validación de horario (08:00 - 22:00)
        if (hour < 8 || hour >= 22) {
            alert("Selecciona una hora entre las 08:00 y las 22:00 o llama al 609492031.");
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const formMessage = document.getElementById('form-message');
        
        // Estado de carga visual
        submitBtn.innerText = 'Verificando disponibilidad...';
        submitBtn.disabled = true;
        formMessage.innerText = '';

        const tripData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            pickup: document.getElementById('pickup').value,
            destination: document.getElementById('destination').value,
            date: document.getElementById('date').value,
            time: timeStr,
            passengers: document.getElementById('guests').value
        };

        try {
            // 1. Enviamos los datos al servidor para verificar disponibilidad
            const response = await fetch(CALENDAR_SCRIPT_URL, { 
                method: 'POST', 
                body: JSON.stringify(tripData) 
            });
    
            if (!response.ok) throw new Error("Error de conexión con el servidor");

            const result = await response.json();

            // 2. Manejo de solapamiento de horario
            if (result.result === "overlap") {
                formMessage.style.color = '#e74c3c';
                formMessage.innerText = 'Lo sentimos, esa hora ya está reservada. Por favor, elige otro horario.';
                submitBtn.innerText = 'Confirmar Reserva';
                submitBtn.disabled = false;
                return; 
            }

            // 3. ÉXITO: Reserva guardada en calendario y ahora enviamos confirmación al cliente
            if (result.result === "success") {
                submitBtn.innerText = 'Enviando confirmación...';
                
                // Disparamos EmailJS solo si el servidor de Google confirmó la reserva
                await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, tripData, EMAILJS_KEY);

                formMessage.style.color = '#27ae60';
                formMessage.innerText = '¡Reserva confirmada! Se ha añadido al calendario y enviado un email de confirmación.';
                this.reset();
            } else {
                // Capturamos el mensaje de error real que viene de Google Apps Script
                throw new Error(result.message || "Error desconocido en el servidor");
            }

        } catch (error) {
            console.error("Error detallado:", error);
            formMessage.style.color = '#e74c3c';
            // Mostramos el error específico para saber qué falla (ej: falta de permisos)
            formMessage.innerText = 'No se pudo completar la reserva: ' + error.message;
        } finally {
            submitBtn.innerText = 'Confirmar Reserva';
            submitBtn.disabled = false;
        }
    });
}

// Inicialización de idioma y selectores
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'es';
    setLanguage(savedLang);
});

const langSelector = document.getElementById('language-selector');
if (langSelector) {
    langSelector.addEventListener('change', (e) => setLanguage(e.target.value));
}
