// Inicializar el mapa
var map = L.map('map').setView([4.5709, -74.2973], 13);  // Valores predeterminados (puedes ajustar)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Intentar obtener la ubicación actual del usuario
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        // Obtener la latitud y longitud del usuario
        var userLat = position.coords.latitude;
        var userLon = position.coords.longitude;

        // Centrar el mapa en la ubicación del usuario
        map.setView([userLat, userLon], 13);

        // Agregar un marcador en la ubicación del usuario
        L.marker([userLat, userLon]).addTo(map)
            .bindPopup("Tu ubicación actual")
            .openPopup();
    }, function () {
        console.error("No se pudo obtener la ubicación del usuario.");
    });
} else {
    alert("La geolocalización no es compatible con este navegador.");
}

// Crear el geocodificador
var geocoder = L.Control.Geocoder.nominatim();

// Escuchar el clic en el botón de búsqueda de dirección
document.getElementById('search-button-address').addEventListener('click', function () {
    var address = document.getElementById('address-input').value;
    var service = document.getElementById('service-input').value;  // Obtener el tipo de servicio seleccionado

    // Buscar la dirección con el geocodificador
    geocoder.geocode(address, function (results) {
        if (results.length > 0) {
            var result = results[0];
            map.setView([result.center.lat, result.center.lng], 13);  // Centra el mapa en la ubicación encontrada
            L.marker([result.center.lat, result.center.lng]).addTo(map)
                .bindPopup(result.name)
                .openPopup();

            // Llamar a la función para agregar servicios filtrados cerca de la ubicación
            addFilteredServices(result.center.lat, result.center.lng, 10, service);
        } else {
            alert("No se pudo encontrar la dirección.");
        }
    });
});

// Escuchar el clic en el botón de búsqueda de servicios
document.getElementById('search-button-service').addEventListener('click', function () {
    var service = document.getElementById('service-input').value;  // Obtener el tipo de servicio
    var currentCenter = map.getCenter();  // Obtiene la posición actual del mapa
    console.log("Servicio buscado: ", service);  // Depurar el valor del servicio
    addFilteredServices(currentCenter.lat, currentCenter.lng, 5, service);
});

// Lista de servicios disponibles con ubicaciones y tipos
const servicesList = [
    // { type: 'plomeria', lat: 4.5709, lon: -74.2973, description: 'Servicio de plomería #1' },
    // { type: 'cerrajeria', lat: 4.5715, lon: -74.2970, description: 'Servicio de cerrajería #1' },
    // { type: 'contaduria', lat: 4.5720, lon: -74.2968, description: 'Servicio de contaduría #1' },
    // { type: 'electricidad', lat: 4.5730, lon: -74.2955, description: 'Servicio de electricidad #1' },
    // { type: 'pintura', lat: 4.5740, lon: -74.2942, description: 'Servicio de pintura #1' },
    // { type: 'jardineria', lat: 4.5750, lon: -74.2930, description: 'Servicio de jardinería #1' },
    // { type: 'mudanzas', lat: 4.5760, lon: -74.2918, description: 'Servicio de mudanzas #1' },
    // { type: 'mantenimiento', lat: 4.5770, lon: -74.2905, description: 'Servicio de mantenimiento #1' },
    // { type: 'reformas', lat: 4.5780, lon: -74.2892, description: 'Servicio de reformas #1' },
    // { type: 'pestControl', lat: 4.5790, lon: -74.2880, description: 'Servicio de control de plagas #1' },
    // { type: 'limpieza', lat: 4.5800, lon: -74.2867, description: 'Servicio de limpieza #1' },
    // { type: 'carpinteria', lat: 4.5810, lon: -74.2855, description: 'Servicio de carpintería #1' },
    // { type: 'abogados', lat: 4.5820, lon: -74.2842, description: 'Servicio de abogados #1' },
    // { type: 'dentista', lat: 4.5830, lon: -74.2830, description: 'Servicio de dentista #1' },
    // { type: 'psicologia', lat: 4.5840, lon: -74.2817, description: 'Servicio de psicología #1' },
    // { type: 'tatuajes', lat: 4.5850, lon: -74.2805, description: 'Servicio de tatuajes #1' },
    // { type: 'masajes', lat: 4.5860, lon: -74.2792, description: 'Servicio de masajes #1' },
    // { type: 'fotografia', lat: 4.5870, lon: -74.2780, description: 'Servicio de fotografía #1' },
    // { type: 'moda', lat: 4.5880, lon: -74.2767, description: 'Servicio de moda #1' },
    // { type: 'decoracion', lat: 4.5890, lon: -74.2755, description: 'Servicio de decoración #1' }
];

// Función para agregar servicios filtrados cerca de la ubicación
// Función para agregar servicios filtrados cerca de la ubicación
function addFilteredServices(lat, lon, number, serviceType) {
    // Limpiar puntos existentes si los hay
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Filtrar los servicios por tipo
    const filteredServices = servicesList.filter(service => service.type.toLowerCase() === serviceType.toLowerCase());

    // Si no hay servicios filtrados, agregar puntos aleatorios cercanos
    if (filteredServices.length === 0) {
        addRandomServices(lat, lon, number); // Generar puntos aleatorios si no hay coincidencias
    } else {
        // Generar un nuevo marcador para el servicio, pero con coordenadas aleatorias cercanas
        filteredServices.forEach(function (service) {
            // Llamamos a la función para alterar las coordenadas cercanas a la ubicación actual
            var newLatLon = getAlteredCoordinates(lat, lon);

            var serviceMarker = L.marker([newLatLon.lat, newLatLon.lon]).addTo(map);
            serviceMarker.bindPopup(service.description);
        });
    }
}

// Función para alterar las coordenadas de un punto cerca de la ubicación actual
function getAlteredCoordinates(lat, lon) {
    const distance = 0.02;  // Rango de variación de aproximadamente 2 km

    // Alterar las coordenadas aleatoriamente dentro de un rango cercano
    var alteredLat = lat + (Math.random() - 0.5) * distance;
    var alteredLon = lon + (Math.random() - 0.5) * distance;

    return { lat: alteredLat, lon: alteredLon };
}
function addRandomServices(lat, lon, number) {
    const distance = 0.05;  // Rango de dispersión más amplio para asegurarse de generar varios puntos

    console.log("Generando " + number + " servicios cerca de la ubicación");

    for (var i = 0; i < number; i++) {
        // Generar latitudes y longitudes cercanas a la ubicación actual
        var serviceLat = lat + (Math.random() - 0.5) * distance;  // Genera latitudes dentro del rango
        var serviceLon = lon + (Math.random() - 0.5) * distance; // Genera longitudes dentro del rango

        console.log("Generando punto #" + (i + 1) + " en lat: " + serviceLat + ", lon: " + serviceLon);

        // Agregar marcador para cada punto generado
        var serviceMarker = L.marker([serviceLat, serviceLon]).addTo(map);
        serviceMarker.bindPopup("Servicio disponible #" + (i + 1));
    }
}