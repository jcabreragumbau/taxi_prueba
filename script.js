const CALENDAR_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpJOA5elLqyTa4-bq_eWY3pDn-PA-LTxW3upFOW0RKqXgVH3phVX9UcQcdotx8Blv2/exec';
const EMAILJS_SERVICE_ID = 'STLIZE_service';
const EMAILJS_TEMPLATE_ID = 'template_hhmf1wu';
const EMAILJS_PUBLIC_KEY = '7IsyP95cxD43-8Jcl';
// 2. TRANSLATION DICTIONARY
const translations = {
    en: {
        nav_home: "Home", nav_book: "Book a Taxi", footer_text: "© 2026 Taxi Prueba.",
        hero_title: "Your Reliable Ride", hero_subtitle: "Safe transport services.", hero_btn: "Book Now",
        book_title: "Book Your Trip", form_name: "Full Name", form_email: "Email",
        form_pickup: "Pick-up Location", form_destination: "Destination", form_date: "Date",
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

// 3. LANGUAGE LOGIC
function setLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('preferredLanguage', lang);
}

// 4. BOOKING FORM LOGIC (Manual Address Entry)
const bookingForm = document.getElementById('booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const timeStr = document.getElementById('time').value;
        const hour = parseInt(timeStr.split(':')[0]);

        // Validate hours (08:00 - 22:00)
        if (hour < 8 || hour >= 22) {
            alert("Please select a time between 08:00 and 22:00.");
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const formMessage = document.getElementById('form-message');
        
        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;

        const tripData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            pickup: document.getElementById('pickup').value,
            destination: document.getElementById('destination').value,
            date: document.getElementById('date').value,
            time: timeStr,
            passengers: document.getElementById('guests').value
        };

        try {
            // A. Send to Google Calendar (via Apps Script)
            await fetch(CALENDAR_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(tripData)
            });

            // B. Send Email via EmailJS
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, tripData, EMAILJS_PUBLIC_KEY);

            formMessage.style.color = '#27ae60';
            formMessage.innerText = 'Reservation successful! Check your calendar and email.';
            bookingForm.reset();

        } catch (error) {
            formMessage.style.color = '#e74c3c';
            formMessage.innerText = 'Error processing booking. Please try again.';
        } finally {
            submitBtn.innerText = 'Confirm Booking';
            submitBtn.disabled = false;
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'es';
    setLanguage(savedLang);
});

const selector = document.getElementById('language-selector');
if (selector) {
    selector.addEventListener('change', (e) => setLanguage(e.target.value));
}
