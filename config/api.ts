/**
 * API Configuration
 * 
 * Note: For mobile devices, localhost won't work. You'll need to:
 * - Use your computer's local IP address (e.g., http://192.168.1.100:8000/api)
 * - Or use a tunnel service like ngrok for testing
 * - Or deploy the API to a staging/production server
 * 
 * To find your local IP:
 * - macOS/Linux: ifconfig | grep "inet "
 * - Windows: ipconfig
 */
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://192.168.50.77:8000/api' // Change to your local IP for mobile testing
    : 'https://reliable-abundance-production.up.railway.app/api', // Production URL (update when available)
};

