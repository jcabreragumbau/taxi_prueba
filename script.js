const CALENDAR_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpJOA5elLqyTa4-bq_eWY3pDn-PA-LTxW3upFOW0RKqXgVH3phVX9UcQcdotx8Blv2/exec';
const EMAILJS_SERVICE_ID = 'STLIZE_service';
const EMAILJS_TEMPLATE_ID = 'template_hhmf1wu';
const EMAILJS_PUBLIC_KEY = '7IsyP95cxD43-8Jcl';
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
            // 1. Enviamos los datos al servidor para verificar solapamiento
            // IMPORTANTE: No usamos mode: 'no-cors' para poder leer la respuesta JSON
            const response = await fetch(CALENDAR_SCRIPT_URL, { 
                method: 'POST', 
                body: JSON.stringify(tripData) 
            });
    
            const result = await response.json();

            // 2. Si el servidor detecta que la hora ya está pillada
            if (result.result === "overlap") {
                formMessage.style.color = '#e74c3c';
                formMessage.innerText = 'Lo sentimos, esa hora ya está reservada. Por favor, elige otro horario.';
                submitBtn.innerText = 'Confirmar Reserva';
                submitBtn.disabled = false;
                return; // Detenemos todo aquí
            }

            // 3. Si no hay solapamiento, procedemos con el envío del email al cliente
            if (result.result === "success") {
                submitBtn.innerText = 'Enviando confirmación...';
                await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, tripData, EMAILJS_KEY);

                formMessage.style.color = '#27ae60';
                formMessage.innerText = '¡Reserva confirmada! Se ha añadido al calendario y enviado un email.';
                this.reset();
            } else {
                throw new Error("Error inesperado en el servidor");
            }

        } catch (error) {
            console.error("Error en la reserva:", error);
            formMessage.style.color = '#e74c3c';
            formMessage.innerText = 'Error al conectar con el sistema. Por favor, inténtalo de nuevo.';
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
