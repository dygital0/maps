import React, { useEffect, useState, useRef } from 'react';
import { getRoute } from './tomtomService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Make sure to import your CSS file

function App() {
    const [start, setStart] = useState('51.505,-0.09');
    const [end, setEnd] = useState('51.51,-0.1');
    const [map, setMap] = useState(null);
    const [costs, setCosts] = useState({ gameTheory: 0, chaosTheory: 0 }); // Initialize costs with default values
    const mapInitializedRef = useRef(false);
    const mapContainerRef = useRef(null); // Reference for the map container

    useEffect(() => {
        // Initialize the map
        const initMap = () => {
            const mapInstance = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
            L.tileLayer('https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=V6jo7iP3AoV0ql49vAAAQ6KDRDVcVAfD', {
                attribution: '&copy; TomTom'
            }).addTo(mapInstance);
            setMap(mapInstance);
            mapInitializedRef.current = true; // Mark the map as initialized
        };

        if (!mapInitializedRef.current) {
            initMap();
        }

        return () => {
            if (map) {
                map.remove(); // Cleanup the map instance
                setMap(null);
            }
        };
    }, [map]);

    const handleRouteFetch = async () => {
        try {
            const routeData = await getRoute(start, end);
            // Log routeData to inspect its structure
            console.log('Route Data:', JSON.stringify(routeData, null, 2)); // Pretty print the object
            if (!routeData || !routeData.legs || routeData.legs.length === 0) {
                alert('No route found. Please check your coordinates and try again.');
                return;
            }

            // Clear existing layers if necessary
            map.eachLayer((layer) => {
                if (layer instanceof L.Polyline) {
                    map.removeLayer(layer);
                }
            });

            // Add the new route to the map
            const latLngs = routeData.legs[0].points.map(point => [point.latitude, point.longitude]);
            const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(map);
            map.fitBounds(polyline.getBounds()); // Adjust map view to show the route

            // Extract the distance from the route data
            const distance = routeData.legs[0].length; // Check this property based on your API response
            console.log('Extracted Distance:', distance); // Log the distance value

            // Ensure distance is valid
            if (typeof distance !== 'number' || isNaN(distance) || distance <= 0) {
                console.warn('Invalid distance:', distance);
                alert('Invalid distance received from route data.');
                return; // Exit if distance is not valid
            }

            // Simulate cost calculation using game theory and chaos theory
            simulateCosts(distance);

        } catch (error) {
            console.error('Failed to fetch route:', error);
            alert('Failed to fetch route. Please check your coordinates and try again.');
        }
    };

    const simulateCosts = (distance) => {
        // Simulate some costs based on distance and hypothetical parameters
        const trafficFactor = Math.random(); // Simulate traffic factor (0 to 1)
        const chaosFactor = Math.random() * 2; // Simulate chaos factor (1 to 2)

        const gameTheoryCost = distance * (1 + trafficFactor);
        const chaosTheoryCost = distance * (1 + chaosFactor);

        console.log('Game Theory Cost:', gameTheoryCost); // Log calculated cost
        console.log('Chaos Theory Cost:', chaosTheoryCost); // Log calculated cost

        setCosts({
            gameTheory: gameTheoryCost.toFixed(2), // Format costs to two decimal places
            chaosTheory: chaosTheoryCost.toFixed(2),
        });
    };

    return (
        <div className="App">
            <h1>GPS Routing with TomTom API</h1>
            <div className="input-container">
                <input
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Start (lat,long)"
                />
                <input
                    type="text"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="End (lat,long)"
                />
                <button onClick={handleRouteFetch}>Get Route</button>
            </div>
            <div ref={mapContainerRef} id="map" className="map-container" style={{ width: '100%', height: '600px', position: 'relative' }}></div>
            {costs && (
                <div className="costs-container" style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <h2>Cost Estimates</h2>
                    <p><strong>Game Theory Cost:</strong> ${costs.gameTheory}</p>
                    <p><strong>Chaos Theory Cost:</strong> ${costs.chaosTheory}</p>
                </div>
            )}
        </div>
    );
}

export default App;
