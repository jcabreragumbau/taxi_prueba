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
let pickupWidget, destWidget;

async function initGoogleServices() {
    try {
        // Importamos las librerías New (Places y Routes)
        const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");
        
        // Creamos el componente de Recogida
        pickupWidget = new PlaceAutocompleteElement({
            placeholder: "Introduce punto de origen"
        });
        pickupWidget.id = "pickup-input";
        document.getElementById('pickup-container').appendChild(pickupWidget);

        // Creamos el componente de Destino
        destWidget = new PlaceAutocompleteElement({
            placeholder: "Introduce destino"
        });
        destWidget.id = "dest-input";
        document.getElementById('destination-container').appendChild(destWidget);

        // Escuchar cuando el usuario selecciona una dirección
        pickupWidget.addEventListener('gmp-placeselect', calculateTrip);
        destWidget.addEventListener('gmp-placeselect', calculateTrip);

    } catch (error) {
        console.error("Error al cargar componentes de Google Maps:", error);
    }
}

async function calculateTrip() {
    // Obtenemos las direcciones de los nuevos widgets
    const origin = pickupWidget.value;
    const destination = destWidget.value;

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

        const submitBtn = document.getElementById('submit-btn');
        const formMessage = document.getElementById('form-message');
        
        // Extraemos las direcciones finales de los widgets
        const pickupAddr = pickupWidget.value;
        const destAddr = destWidget.value;

        if (!pickupAddr || !destAddr) {
            alert("Por favor, selecciona direcciones válidas de la lista.");
            return;
        }

        submitBtn.innerText = 'Enviando...';
        submitBtn.disabled = true;

        const tripData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            pickup: pickupAddr,
            destination: destAddr,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            passengers: document.getElementById('guests').value,
            distance: document.getElementById('dist-val').innerText,
            duration: document.getElementById('time-val').innerText
        };

        try {
            await fetch(CALENDAR_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(tripData)
            });

            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, tripData, EMAILJS_PUBLIC_KEY);

            formMessage.style.color = '#27ae60';
            formMessage.innerText = '¡Reserva confirmada!';
            bookingForm.reset();
            document.getElementById('trip-info').style.display = 'none';
        } catch (error) {
            formMessage.innerText = 'Error en la reserva.';
        } finally {
            submitBtn.innerText = 'Confirmar Reserva';
            submitBtn.disabled = false;
        }
    });
}
// 5. TRADUCCIÓN Y ARRANQUE
function setLanguage(lang) {
    // 1. Traducción de elementos estándar de la página
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('preferredLanguage', lang);

    // 2. Traducción específica para los nuevos componentes de Google
    // Como los widgets se crean dinámicamente, actualizamos sus placeholders aquí
    if (pickupWidget && destWidget) {
        const isEs = lang === 'es';
        pickupWidget.placeholder = isEs ? "Introduce punto de origen" : "Enter pick-up location";
        destWidget.placeholder = isEs ? "Introduce destino" : "Enter destination";
    }
}

// El evento debe ser async para esperar a la carga de librerías de Google
document.addEventListener('DOMContentLoaded', async () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'es';
    
    // Primero traducimos el contenido estático
    setLanguage(savedLang);

    // Verificamos e iniciamos los servicios de Google de forma asíncrona
    if (typeof google !== 'undefined') {
        await initGoogleServices();
        
        // Ejecutamos setLanguage de nuevo para asegurar que los widgets 
        // recién creados aparezcan en el idioma correcto
        setLanguage(savedLang);
    }
});

const selector = document.getElementById('language-selector');
if (selector) {
    selector.addEventListener('change', (e) => setLanguage(e.target.value));
}
