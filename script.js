const CALENDAR_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpJOA5elLqyTa4-bq_eWY3pDn-PA-LTxW3upFOW0RKqXgVH3phVX9UcQcdotx8Blv2/exec';

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
        form_pickup: "Recogida", form_destination: "Destino", form_date: "Fecha",
        form_time: "Hora", form_passengers: "Pasajeros (1-4)", form_btn: "Confirmar Reserva"
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerText = translations[lang][key];
    });
}

let autocompleteP, autocompleteD;
function initGoogle() {
    autocompleteP = new google.maps.places.Autocomplete(document.getElementById('pickup'));
    autocompleteD = new google.maps.places.Autocomplete(document.getElementById('destination'));
    [autocompleteP, autocompleteD].forEach(a => a.addListener('place_changed', calculateDistance));
}

function calculateDistance() {
    const origin = document.getElementById('pickup').value;
    const dest = document.getElementById('destination').value;
    if (origin && dest) {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({ origins: [origin], destinations: [dest], travelMode: 'DRIVING' }, (res, status) => {
            if (status === 'OK') {
                const data = res.rows[0].elements[0];
                document.getElementById('trip-info').style.display = 'block';
                document.getElementById('dist-val').innerText = data.distance.text;
                document.getElementById('time-val').innerText = data.duration.text;
            }
        });
    }
}

document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const hour = parseInt(document.getElementById('time').value.split(':')[0]);
    if (hour < 8 || hour >= 22) return alert("Select 08:00 - 22:00 or call 609492031.");

    const btn = document.getElementById('submit-btn');
    const msg = document.getElementById('form-message');
    btn.innerText = 'Saving...';
    btn.disabled = true;

    const tripData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        pickup: document.getElementById('pickup').value,
        destination: document.getElementById('destination').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        passengers: document.getElementById('guests').value,
        distance: document.getElementById('dist-val').innerText
    };

    try {
        // 1. Save to Google Calendar
        await fetch(CALENDAR_SCRIPT_URL, { method: 'POST', body: JSON.stringify(tripData) });

        // 2. Send Email
        await emailjs.send('STLIZE_service', 'template_hhmf1wu', tripData, '7IsyP95cxD43-8Jcl');

        msg.style.color = '#27ae60';
        msg.innerText = 'Trip confirmed and added to calendar!';
        document.getElementById('booking-form').reset();
    } catch (err) {
        msg.innerText = 'Error saving booking.';
    } finally {
        btn.innerText = 'Confirm Booking';
        btn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(localStorage.getItem('preferredLanguage') || 'en');
    if (typeof google !== 'undefined') initGoogle();
});
