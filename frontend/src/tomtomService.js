import axios from 'axios';

const API_KEY = 'V6jo7iP3AoV0ql49vAAAQ6KDRDVcVAfD'
const BASE_URL = 'https://api.tomtom.com';

export const getRoute = async (start, end) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/routing/1/calculateRoute/${start}:${end}/json?key=${API_KEY}`
        );
        return response.data.routes[0]; // Return the first route
    } catch (error) {
        console.error('Error fetching the route:', error);
        throw error;
    }
};

export const getTrafficIncident = async (boundingBox) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/traffic/services/incidentDetails?bbox=${boundingBox}&key=${API_KEY}`
        );
        return response.data; // Return traffic incidents data
    } catch (error) {
        console.error('Error fetching traffic incidents:', error);
        throw error;
    }
};