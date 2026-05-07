const CALENDAR_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpJOA5elLqyTa4-bq_eWY3pDn-PA-LTxW3upFOW0RKqXgVH3phVX9UcQcdotx8Blv2/exec';
const EMAILJS_SERVICE_ID = 'STLIZE_service';
const EMAILJS_TEMPLATE_ID = 'template_hhmf1wu';
const EMAILJS_PUBLIC_KEY = '7IsyP95cxD43-8Jcl';
// 2. DICCIONARIO DE TRADUCCIÓN
const translations = {
    en: {
        nav_home: "Home", nav_book: "Book a Taxi", footer_text: "© 2026 Taxi Prueba.",
        hero_title: "Your Reliable Ride", hero_subtitle: "Safe transport.", hero_btn: "Book Now",
        book_title: "Book Your Trip", form_name: "Full Name", form_email: "Email",
        form_pickup: "Pick-up", form_destination: "Destination", form_date: "Date",
        form_time: "Time", form_passengers: "Passengers (1-4)", form_btn: "Confirm Booking"
    },
    es: {
        nav_home: "Inicio", nav_book: "Reservar Taxi", footer_text: "© 2026 Taxi Prueba.",
        hero_title: "Tu Viaje Confiable", hero_subtitle: "Transporte seguro.", hero_btn: "Reservar Ahora",
        book_title: "Reserva Tu Viaje", form_name: "Nombre", form_email: "Correo",
        form_pickup: "Punto de Recogida", form_destination: "Destino del Viaje", form_date: "Fecha",
        form_time: "Hora", form_passengers: "Pasajeros (1-4)", form_btn: "Confirmar Reserva"
    }
};

// 3. LÓGICA DE GOOGLE MAPS (MODERNA 2026)
let autocompletePickup, autocompleteDest;

async function initGoogleServices() {
    try {
        // Importación moderna de librerías para evitar errores de "Legacy API"
        const { Autocomplete } = await google.maps.importLibrary("places");
        const { DistanceMatrixService } = await google.maps.importLibrary("routes");

        const pickupInput = document.getElementById('pickup');
        const destInput = document.getElementById('destination');

        if (pickupInput && destInput) {
            autocompletePickup = new Autocomplete(pickupInput);
            autocompleteDest = new Autocomplete(destInput);

            // Escuchar cambios para calcular distancia
            autocompletePickup.addListener('place_changed', calculateTrip);
            autocompleteDest.addListener('place_changed', calculateTrip);
        }
    } catch (error) {
        console.error("Error cargando librerías de Google:", error);
    }
}

async function calculateTrip() {
    const origin = document.getElementById('pickup').value;
    const destination = document.getElementById('destination').value;

    if (origin && destination) {
        const { DistanceMatrixService } = await google.maps.importLibrary("routes");
        const service = new DistanceMatrixService();
        
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING'
        }, (response, status) => {
            if (status === 'OK') {
                const results = response.rows[0].elements[0];
                if (results.status === "OK") {
                    document.getElementById('trip-info').style.display = 'block';
                    document.getElementById('dist-val').innerText = results.distance.text;
                    document.getElementById('time-val').innerText = results.duration.text;
                }
            }
        });
    }
}

// 4. ENVÍO DE FORMULARIO (CALENDAR + EMAIL)
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const timeStr = document.getElementById('time').value;
        const hour = parseInt(timeStr.split(':')[0]);

        // Validación de horario (08:00 - 22:00)
        if (hour < 8 || hour >= 22) {
            alert("Por favor selecciona un horario entre las 08:00 y las 22:00.");
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const formMessage = document.getElementById('form-message');
        
        submitBtn.innerText = 'Procesando...';
        submitBtn.disabled = true;

        const tripData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            pickup: document.getElementById('pickup').value,
            destination: document.getElementById('destination').value,
            date: document.getElementById('date').value,
            time: timeStr,
            passengers: document.getElementById('guests').value,
            distance: document.getElementById('dist-val').innerText,
            duration: document.getElementById('time-val').innerText
        };

        try {
            // A. Guardar en Google Calendar (vía Apps Script)
            await fetch(CALENDAR_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Necesario para evitar bloqueos de Google
                body: JSON.stringify(tripData)
            });

            // B. Enviar Email de confirmación
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, tripData, EMAILJS_PUBLIC_KEY);

            formMessage.style.color = '#27ae60';
            formMessage.innerText = '¡Viaje reservado! Se ha añadido a nuestro calendario.';
            bookingForm.reset();
            document.getElementById('trip-info').style.display = 'none';

        } catch (error) {
            console.error(error);
            formMessage.style.color = '#e74c3c';
            formMessage.innerText = 'Hubo un error al procesar tu reserva.';
        } finally {
            submitBtn.innerText = 'Confirmar Reserva';
            submitBtn.disabled = false;
        }
    });
}

// 5. TRADUCCIÓN Y ARRANQUE
function setLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });
    localStorage.setItem('preferredLanguage', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'es';
    setLanguage(savedLang);
    
    // Iniciar Google Maps con el nuevo sistema de 2026
    if (typeof google !== 'undefined') {
        initGoogleServices();
    }
});

const selector = document.getElementById('language-selector');
if (selector) {
    selector.addEventListener('change', (e) => setLanguage(e.target.value));
}
