import { shortenAddress, debounce } from './utils.js';


// Coordenadas de la Plaza de Armas de Cajamarca.
const CAJAMARCA = { lat: -7.1537, lon: -78.5110 };

var map = L.map('map').setView([CAJAMARCA.lat, CAJAMARCA.lon], 13);
var marker = L.marker([CAJAMARCA.lat, CAJAMARCA.lon])
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
                    lon: position.coords.longitude,
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

        userMarker = L.marker([position.lat, position.lon])
            .addTo(map)
            .bindPopup('Estás aquí')
            .openPopup();

        map.setView([position.lat, position.lon], 15);

    } catch (error) {
        console.warn(error.message);
        map.setView([CAJAMARCA.lat, CAJAMARCA.lon], 14);
    }
}

locateUser();

//Petición para Nominatim (Open Street Map)
async function searchAdress(query) {
    const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        'accept-language': 'es'
    })
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
    if (!response.ok) {
        throw new Error(`El servidor lanzó ${response.status}`);
    }

    const results = await response.json();


    return results.map((result) => (
        {
            lat: Number.parseFloat(result.lat),
            lon: Number.parseFloat(result.lon),
            addres: result.display_name
        }
    ))
}

//CONECTAR LOS MÉTODOS AL INPUT
const destInput = document.getElementById('destination-input');
let destination = null;
let destinationMarker = null;

const buscar = debounce(async (query) => {
    try {
        const results = await searchAdress(query);
        if (results.length === 0) return;

        destination = results[0];


        if (destinationMarker) map.removeLayer(destinationMarker);

        destinationMarker = L.marker([destination.lat, destination.lon])
            .addTo(map)
            .bindPopup(shortenAddress(destination.addres));

        map.setView([destination.lat, destination.lon]);

    } catch (e) {
        console.log(e.message);
    }
}, 450);

destInput.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    if (value.length < 3) return;
    buscar(value);
})

