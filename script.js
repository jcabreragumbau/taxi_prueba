// 1. Updated Translation Dictionary for Taxi
const translations = {
    en: {
        nav_home: "Home",
        nav_rates: "Rates",
        nav_location: "Area",
        nav_book: "Book a Taxi",
        footer_text: "© 2026 Taxi Prueba. All rights reserved.",
        hero_title: "Your Reliable Ride, Anytime",
        hero_subtitle: "Safe, professional transport services at your fingertips.",
        hero_btn: "Book Now",
        book_title: "Book Your Trip",
        book_subtitle: "Fill in the details below and we will confirm your pick-up.",
        form_name: "Full Name",
        form_email: "Email Address",
        form_pickup: "Pick-up Location",
        form_destination: "Travel Destination",
        form_date: "Date",
        form_time: "Time",
        form_passengers: "Number of Passengers (1-4)",
        form_btn: "Confirm Booking"
    },
    es: {
        nav_home: "Inicio",
        nav_rates: "Tarifas",
        nav_location: "Zona",
        nav_book: "Reservar Taxi",
        footer_text: "© 2026 Taxi Prueba. Todos los derechos reservados.",
        hero_title: "Tu Viaje Confiable, a Cualquier Hora",
        hero_subtitle: "Servicios de transporte seguros y profesionales.",
        hero_btn: "Reservar Ahora",
        book_title: "Reserva Tu Viaje",
        book_subtitle: "Completa los detalles y confirmaremos tu recogida.",
        form_name: "Nombre Completo",
        form_email: "Correo Electrónico",
        form_pickup: "Punto de Recogida",
        form_destination: "Destino del Viaje",
        form_date: "Fecha",
        form_time: "Hora",
        form_passengers: "Número de Pasajeros (1-4)",
        form_btn: "Confirmar Reserva"
    }
};

// 2. Language logic
function setLanguage(languageCode) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const translationKey = element.getAttribute('data-i18n');
        if (translations[languageCode] && translations[languageCode][translationKey]) {
            element.innerText = translations[languageCode][translationKey];
        }
    });
    localStorage.setItem('preferredLanguage', languageCode);
}

// 3. Google Maps Background Logic (Headless)
let autocompletePickup, autocompleteDest;

function initGoogleServices() {
    const pickupInput = document.getElementById('pickup');
    const destInput = document.getElementById('destination');

    if (pickupInput && destInput) {
        autocompletePickup = new google.maps.places.Autocomplete(pickupInput);
        autocompleteDest = new google.maps.places.Autocomplete(destInput);

        autocompletePickup.addListener('place_changed', calculateTrip);
        autocompleteDest.addListener('place_changed', calculateTrip);
    }
}

function calculateTrip() {
    const origin = document.getElementById('pickup').value;
    const destination = document.getElementById('destination').value;

    if (origin && destination) {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING',
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

// 4. Booking Form Logic
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const time = document.getElementById('time').value;
        const [hour] = time.split(':').map(Number);

        // Hour Validation (08:00 to 22:00)
        if (hour < 8 || hour >= 22) {
            alert("Please select a time between 08:00 and 22:00. Call 609492031 for off-hours bookings.");
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const formMessage = document.getElementById('form-message');
        
        submitBtn.innerText = 'Requesting Taxi...';
        submitBtn.disabled = true;

        try {
            // Prepare data for EmailJS
            const templateParams = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                pickup: document.getElementById('pickup').value,
                destination: document.getElementById('destination').value,
                date: document.getElementById('date').value,
                time: time,
                passengers: document.getElementById('guests').value,
                distance: document.getElementById('dist-val').innerText,
                duration: document.getElementById('time-val').innerText
            };
            
            // Note: Replace with your actual EmailJS credentials
            await emailjs.send('STLIZE_service', 'template_hhmf1wu', templateParams, '7IsyP95cxD43-8Jcl');

            formMessage.style.color = '#27ae60';
            formMessage.innerText = `Booking request sent! We will contact you shortly.`;
            bookingForm.reset();
            document.getElementById('trip-info').style.display = 'none';

        } catch (error) {
            formMessage.style.color = '#e74c3c';
            formMessage.innerText = 'Error sending request. Please try again.';
        } finally {
            submitBtn.innerText = 'Confirm Booking';
            submitBtn.disabled = false;
        }
    });
}

// Startup
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en'; 
    setLanguage(savedLanguage);
    if (typeof google !== 'undefined') initGoogleServices();
});
