# Apricot API Documentation

This document describes the REST API for the Apricot application. This API is designed to be consumed by a React Native mobile application.

## Base URL

**Local Development:**
```
http://localhost:8000/api
```

## Authentication

The API uses Laravel Sanctum for token-based authentication. Most endpoints require authentication via Bearer token.

### Getting an Authentication Token

1. **Register** a new user or **Login** with existing credentials
2. The response will include a `token` field
3. Include this token in the `Authorization` header for subsequent requests:
   ```
   Authorization: Bearer {token}
   ```

### User Types

The API supports the following user types:
- `customer` - Regular app users
- `merchant` - Store owners
- `brand_representative` - Brand representatives
- `admin` - Administrators

---

## Endpoints

### Authentication

#### Register User

Create a new user account.

**Endpoint:** `POST /register`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+54123456789",
  "type": "customer"
}
```

**Request Parameters:**
- `name` (string, required) - User's full name
- `email` (string, required, unique) - User's email address
- `password` (string, required, min: 8) - User's password
- `password_confirmation` (string, required) - Password confirmation (must match password)
- `phone` (string, optional) - User's phone number
- `type` (string, required) - User type: `customer`, `merchant`, or `brand_representative`
- `created_by` (integer, optional) - ID of user who created this account

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+54123456789",
    "type": "customer",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  },
  "token": "1|abcdef123456..."
}
```

---

#### Login

Authenticate and receive an access token.

**Endpoint:** `POST /login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Parameters:**
- `email` (string, required) - User's email address
- `password` (string, required) - User's password

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "type": "customer",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  },
  "token": "1|abcdef123456..."
}
```

**Error Response:** `422 Unprocessable Entity`
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

---

#### Get Current User

Get the authenticated user's information.

**Endpoint:** `GET /user`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+54123456789",
  "type": "customer",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

#### Logout

Invalidate the current access token.

**Endpoint:** `POST /logout`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### Surprise Bags

#### Get All Surprise Bags

Retrieve all surprise bags. This is a public endpoint.

**Endpoint:** `GET /surprise-bags`

**Authentication:** Not required

**Query Parameters:**
- `store_id` (integer, optional) - Filter by store ID
- `neighbourhood` (string, optional) - Filter by neighborhood (e.g., "Palermo", "Palermo Hollywood")

**Example Requests:**
```
GET /surprise-bags
GET /surprise-bags?neighbourhood=Palermo
GET /surprise-bags?store_id=1
GET /surprise-bags?neighbourhood=Palermo Hollywood&store_id=1
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "store_id": 1,
    "category": "panadería",
    "allergens": "gluten",
    "photo": "https://example.com/image.jpg",
    "title": "Panes de masa madre",
    "description": "Deliciosos panes artesanales de masa madre",
    "price": "15000.00",
    "original_price": "30000.00",
    "discount_percentage": "50.00",
    "star_rating": "4.50",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z",
    "store": {
      "id": 1,
      "store_name": "Cocu Boulangerie",
      "logo": "https://example.com/logo.jpg",
      "neighbourhood": "Palermo"
    }
  }
]
```

**Available Neighborhoods:**
- Palermo
- Palermo Hollywood
- Barrio Norte
- Villa Crespo
- Almagro
- Recoleta

---

#### Get Surprise Bag by ID

Retrieve a specific surprise bag by its ID.

**Endpoint:** `GET /surprise-bags/{id}`

**Authentication:** Not required

**URL Parameters:**
- `id` (integer, required) - Surprise bag ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "store_id": 1,
  "category": "panadería",
  "allergens": "gluten",
  "photo": "https://example.com/image.jpg",
  "title": "Panes de masa madre",
  "description": "Deliciosos panes artesanales de masa madre",
  "price": "15000.00",
  "original_price": "30000.00",
  "discount_percentage": "50.00",
  "star_rating": "4.50",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "store": {
    "id": 1,
    "store_name": "Cocu Boulangerie",
    "logo": "https://example.com/logo.jpg",
    "neighbourhood": "Palermo"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "No query results for model [App\\Models\\SurpriseBag] {id}"
}
```

---

#### Create Surprise Bag

Create a new surprise bag. Requires authentication as merchant or brand representative.

**Endpoint:** `POST /surprise-bags`

**Authentication:** Required (merchant or brand_representative)

**Request Body:**
```json
{
  "store_id": 1,
  "category": "panadería",
  "allergens": "gluten",
  "photo": "https://example.com/image.jpg",
  "title": "Panes de masa madre",
  "description": "Deliciosos panes artesanales de masa madre",
  "price": 15000,
  "original_price": 30000,
  "discount_percentage": 50,
  "star_rating": 4.5
}
```

**Request Parameters:**
- `store_id` (integer, required) - ID of the store
- `category` (string, required) - Category (see available categories below)
- `allergens` (string, optional) - Allergen information (see available allergens below)
- `photo` (string, optional, url) - URL to the surprise bag photo
- `title` (string, required, max: 255) - Title of the surprise bag
- `description` (string, optional) - Description of the surprise bag
- `price` (number, required, min: 0) - Final/discounted price
- `original_price` (number, required, min: 0) - Original price before discount
- `discount_percentage` (number, required, min: 0, max: 100) - Discount percentage
- `star_rating` (number, optional, min: 0, max: 5) - Star rating

**Available Categories:**
- `flores`
- `panadería`
- `comidas`
- `frutas y verduras`
- `lacteos`
- `pescados y mariscos`
- `helados`

**Available Allergens:**
- `lactosa`
- `pescados y mariscos`
- `frutos secos y/o mani`
- `gluten`

**Response:** `201 Created`
```json
{
  "id": 1,
  "store_id": 1,
  "category": "panadería",
  "allergens": "gluten",
  "photo": "https://example.com/image.jpg",
  "title": "Panes de masa madre",
  "description": "Deliciosos panes artesanales de masa madre",
  "price": "15000.00",
  "original_price": "30000.00",
  "discount_percentage": "50.00",
  "star_rating": "4.50",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "store": {
    "id": 1,
    "store_name": "Cocu Boulangerie"
  }
}
```

**Error Response:** `403 Forbidden` (if merchant doesn't own the store)
```json
{
  "message": "Unauthorized"
}
```

---

#### Update Surprise Bag

Update an existing surprise bag. Requires authentication as merchant or brand representative.

**Endpoint:** `PUT /surprise-bags/{id}`

**Authentication:** Required (merchant or brand_representative)

**URL Parameters:**
- `id` (integer, required) - Surprise bag ID

**Request Body:** (Same as Create, all fields optional except those required by validation)

**Response:** `200 OK`
```json
{
  "id": 1,
  "store_id": 1,
  "category": "panadería",
  "allergens": "gluten",
  "photo": "https://example.com/image.jpg",
  "title": "Updated Title",
  "description": "Updated description",
  "price": "20000.00",
  "original_price": "40000.00",
  "discount_percentage": "50.00",
  "star_rating": "4.80",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T01:00:00.000000Z",
  "store": {
    "id": 1,
    "store_name": "Cocu Boulangerie"
  }
}
```

---

#### Delete Surprise Bag

Delete a surprise bag. Requires authentication as merchant or brand representative.

**Endpoint:** `DELETE /surprise-bags/{id}`

**Authentication:** Required (merchant or brand_representative)

**URL Parameters:**
- `id` (integer, required) - Surprise bag ID

**Response:** `200 OK`
```json
{
  "message": "Surprise bag deleted successfully"
}
```

---

### Stores

#### Get All Stores

Retrieve all stores. Requires authentication.

**Endpoint:** `GET /stores`

**Authentication:** Required

**Response Behavior:**
- **Merchants:** Only see their own stores
- **Brand Representatives & Admins:** See all stores
- **Customers:** See all stores (read-only)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "merchant_id": 2,
    "store_name": "Cocu Boulangerie",
    "address": "Malabia 1510",
    "city": "Buenos Aires",
    "province": "Buenos Aires",
    "postal_code": "C1414",
    "logo": "https://example.com/logo.jpg",
    "email": "info@cocu.com",
    "owner_name": "John",
    "owner_last_name": "Doe",
    "cuit": "20-12345678-9",
    "category": "Panadería",
    "group": 1,
    "neighbourhood": "Palermo",
    "latitude": -34.5912554,
    "longitude": -58.4280328,
    "map_id": "ChIJuVp5BXjKvJURqAIUEHbYVz4",
    "approved": true,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z",
    "store_preferences": {
      "id": 1,
      "fee_over_price": false,
      "pickup_schedule": null,
      "bags_per_day": 10
    },
    "surprise_bags": [
      {
        "id": 1,
        "title": "Panes de masa madre",
        "price": "15000.00"
      }
    ]
  }
]
```

---

#### Get Store by ID

Retrieve a specific store by its ID.

**Endpoint:** `GET /stores/{id}`

**Authentication:** Required

**URL Parameters:**
- `id` (integer, required) - Store ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "merchant_id": 2,
  "store_name": "Cocu Boulangerie",
  "address": "Malabia 1510",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "postal_code": "C1414",
  "logo": "https://example.com/logo.jpg",
  "email": "info@cocu.com",
  "owner_name": "John",
  "owner_last_name": "Doe",
  "cuit": "20-12345678-9",
  "category": "Panadería",
  "group": 1,
  "neighbourhood": "Palermo",
  "latitude": -34.5912554,
  "longitude": -58.4280328,
  "map_id": "ChIJuVp5BXjKvJURqAIUEHbYVz4",
  "approved": true,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "merchant": {
    "id": 2,
    "name": "Store Owner",
    "email": "owner@example.com"
  },
  "store_preferences": {
    "id": 1,
    "fee_over_price": false,
    "pickup_schedule": null,
    "bags_per_day": 10
  },
  "surprise_bags": []
}
```

**Error Response:** `403 Forbidden` (if merchant doesn't own the store)
```json
{
  "message": "Unauthorized"
}
```

---

#### Create Store

Create a new store. Requires authentication as merchant, brand representative, or admin.

**Endpoint:** `POST /stores`

**Authentication:** Required (merchant, brand_representative, or admin)

**Request Body:**
```json
{
  "store_name": "My Store",
  "address": "Street Address 123",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "postal_code": "C1000",
  "logo": "https://example.com/logo.jpg",
  "email": "store@example.com",
  "owner_name": "John",
  "owner_last_name": "Doe",
  "cuit": "20-12345678-9",
  "category": "Panadería",
  "group": 1,
  "neighbourhood": "Palermo",
  "latitude": -34.603722,
  "longitude": -58.381592,
  "map_id": "ChIJ1234567890",
  "approved": false
}
```

**Request Parameters:**
- `merchant_id` (integer, optional) - Merchant user ID (required for brand_representative/admin, auto-set for merchants)
- `store_name` (string, required, max: 255) - Store name
- `address` (string, required, max: 255) - Street address
- `city` (string, required, max: 255) - City name
- `province` (string, required, max: 255) - Province/state name
- `postal_code` (string, required, max: 20) - Postal code
- `logo` (string, optional, url, max: 500) - Logo URL
- `email` (string, required, email, max: 255) - Store email
- `owner_name` (string, required, max: 255) - Owner's first name
- `owner_last_name` (string, required, max: 255) - Owner's last name
- `cuit` (string, required, regex: `^\d{2}-\d{8}-\d{1}$`) - Tax ID (format: XX-XXXXXXXX-X)
- `latitude` (number, required, between: -90, 90) - Latitude coordinate
- `longitude` (number, required, between: -180, 180) - Longitude coordinate
- `map_id` (string, optional, max: 255) - Google Maps place ID
- `store_preferences_id` (integer, optional) - Store preferences ID
- `category` (string, required, max: 255) - Store category
- `group` (integer, required, min: 1) - Category group number
- `neighbourhood` (string, required, max: 255) - Neighborhood name
- `approved` (boolean, optional) - Approval status (only admins and brand_representatives can set this)

**Response:** `201 Created`
```json
{
  "id": 1,
  "merchant_id": 2,
  "store_name": "My Store",
  "address": "Street Address 123",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "postal_code": "C1000",
  "logo": "https://example.com/logo.jpg",
  "email": "store@example.com",
  "owner_name": "John",
  "owner_last_name": "Doe",
  "cuit": "20-12345678-9",
  "category": "Panadería",
  "group": 1,
  "neighbourhood": "Palermo",
  "latitude": -34.603722,
  "longitude": -58.381592,
  "map_id": "ChIJ1234567890",
  "approved": false,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "store_preferences": null,
  "surprise_bags": []
}
```

**Error Response:** `403 Forbidden`
```json
{
  "message": "Unauthorized"
}
```

---

#### Update Store

Update an existing store. Requires authentication.

**Endpoint:** `PUT /stores/{id}`

**Authentication:** Required

**URL Parameters:**
- `id` (integer, required) - Store ID

**Request Body:** (Same as Create, all fields optional)

**Permissions:**
- **Merchants:** Can only update their own stores
- **Brand Representatives & Admins:** Can update any store
- **Customers:** Cannot update stores

**Response:** `200 OK` (Same structure as Create response)

---

#### Delete Store

Delete a store. Requires authentication.

**Endpoint:** `DELETE /stores/{id}`

**Authentication:** Required

**URL Parameters:**
- `id` (integer, required) - Store ID

**Permissions:**
- **Merchants:** Can only delete their own stores
- **Brand Representatives & Admins:** Can delete any store
- **Customers:** Cannot delete stores

**Response:** `200 OK`
```json
{
  "message": "Store deleted successfully"
}
```

---

### Store Preferences

#### Get Store Preferences

Retrieve preferences for a specific store.

**Endpoint:** `GET /stores/{store}/preferences`

**Authentication:** Required (merchant or brand_representative)

**URL Parameters:**
- `store` (integer, required) - Store ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "fee_over_price": false,
  "pickup_schedule": null,
  "bags_per_day": 10,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

#### Update Store Preferences

Update preferences for a specific store.

**Endpoint:** `PUT /stores/{store}/preferences`

**Authentication:** Required (merchant or brand_representative)

**URL Parameters:**
- `store` (integer, required) - Store ID

**Request Body:**
```json
{
  "fee_over_price": true,
  "pickup_schedule": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00"
  },
  "bags_per_day": 20
}
```

**Request Parameters:**
- `fee_over_price` (boolean, required) - Whether fee is over price
- `pickup_schedule` (object, optional) - Pickup schedule (flexible structure)
- `bags_per_day` (integer, required, min: 0) - Number of bags per day

**Response:** `200 OK`
```json
{
  "id": 1,
  "fee_over_price": true,
  "pickup_schedule": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00"
  },
  "bags_per_day": 20,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T01:00:00.000000Z"
}
```

---

### Customer Preferences

#### Get Customer Preferences

Retrieve preferences for the authenticated customer.

**Endpoint:** `GET /customer/preferences`

**Authentication:** Required (customer only)

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "notification_settings": {
    "flash_sales": true,
    "daily_reminder": false,
    "stores_i_follow": true,
    "promotions": true
  },
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

#### Update Customer Preferences

Update preferences for the authenticated customer.

**Endpoint:** `PUT /customer/preferences`

**Authentication:** Required (customer only)

**Request Body:**
```json
{
  "notification_settings": {
    "flash_sales": true,
    "daily_reminder": false,
    "stores_i_follow": true,
    "promotions": true
  }
}
```

**Request Parameters:**
- `notification_settings` (object, optional) - Notification settings
  - `flash_sales` (boolean, optional) - Flash sales notifications
  - `daily_reminder` (boolean, optional) - Daily reminder notifications
  - `stores_i_follow` (boolean, optional) - Stores I follow notifications
  - `promotions` (boolean, optional) - Promotions notifications

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "notification_settings": {
    "flash_sales": true,
    "daily_reminder": false,
    "stores_i_follow": true,
    "promotions": true
  },
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T01:00:00.000000Z"
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "message": "Error message here",
  "errors": {
    "field_name": ["Error message for this field"]
  }
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Common Error Examples

**401 Unauthorized** (Missing or invalid token):
```json
{
  "message": "Unauthenticated."
}
```

**403 Forbidden** (Insufficient permissions):
```json
{
  "message": "Unauthorized"
}
```

**422 Unprocessable Entity** (Validation errors):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

## React Native Implementation Examples

### Setting Up API Client

```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Authentication Example

```javascript
// api/auth.js
import apiClient from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/login', {
      email,
      password,
    });
    
    // Store token
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    
    // Store token
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/logout');
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Fetching Surprise Bags

```javascript
// api/surpriseBags.js
import apiClient from './client';

export const getSurpriseBags = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.neighbourhood) {
      params.append('neighbourhood', filters.neighbourhood);
    }
    
    if (filters.store_id) {
      params.append('store_id', filters.store_id);
    }
    
    const queryString = params.toString();
    const url = `/surprise-bags${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSurpriseBagById = async (id) => {
  try {
    const response = await apiClient.get(`/surprise-bags/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### Fetching Stores

```javascript
// api/stores.js
import apiClient from './client';

export const getStores = async () => {
  try {
    const response = await apiClient.get('/stores');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStoreById = async (id) => {
  try {
    const response = await apiClient.get(`/stores/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## Notes for React Native Development

1. **Base URL Configuration**: Update the base URL based on your environment (development, staging, production)

2. **Token Storage**: Use `@react-native-async-storage/async-storage` to persist authentication tokens

3. **Network Requests**: Consider using `axios` or `fetch` for HTTP requests. The examples above use `axios`

4. **Error Handling**: Always handle network errors and API errors gracefully

5. **Authentication**: Include the Bearer token in the `Authorization` header for protected endpoints

6. **Image URLs**: Photo and logo fields contain full URLs that can be used directly with React Native's `Image` component

7. **Decimal Values**: Price, original_price, discount_percentage, and star_rating are returned as strings with 2 decimal places. Parse them as needed:
   ```javascript
   const price = parseFloat(surpriseBag.price);
   ```

8. **Date Formatting**: All dates are in ISO 8601 format. Use a library like `date-fns` or `moment` to format them for display

---

## Support

For issues or questions about the API, please contact the development team.

