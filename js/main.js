// Coordenadas de la Plaza de Armas de Cajamarca.
const CAJAMARCA = { lat: -7.1537, lng: -78.5110 };

var map = L.map('map').setView([CAJAMARCA.lat, CAJAMARCA.lng], 13);
var marker = L.marker([CAJAMARCA.lat, CAJAMARCA.lng])
    .addTo(map)
    .bindPopup('Plaza de Armas de Cajamarca')

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
    .addTo(map)


function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('Tu navegador no soporta geolocalización.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                const mensajes = {
                    1: 'Negaste el permiso. Puedes escribir tu dirección a mano.',
                    2: 'No se pudo determinar tu ubicación. ¿Está activo el GPS?',
                    3: 'La búsqueda tardó demasiado. Intenta de nuevo.',
                };
                reject(new Error(mensajes[error.code] ?? 'No se pudo obtener tu ubicación.'));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
}

let userMarker = null;

async function locateUser() {
    try {
        const position = await getCurrentPosition();

        userMarker = L.marker([position.lat, position.lng])
            .addTo(map)
            .bindPopup('Estás aquí')
            .openPopup();

        map.setView([position.lat, position.lng], 15);

    } catch (error) {
        console.warn(error.message);
        map.setView([CAJAMARCA.lat, CAJAMARCA.lng], 14);
    }
}

locateUser();