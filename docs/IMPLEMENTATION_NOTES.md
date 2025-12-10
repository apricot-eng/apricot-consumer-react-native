# Implementation Notes

## Assumptions and Placeholders

### API Configuration
- **Base URL**: Currently set to `http://localhost:8000/api` for development
- **Mobile Testing**: For testing on physical devices or emulators, update the base URL in `config/api.ts` to use your computer's local IP address (e.g., `http://192.168.1.100:8000/api`)
- **Production**: Update the production URL in `config/api.ts` when the production API is available

### API Endpoint
- Using `/surprise-bags?neighbourhood=Palermo` endpoint as specified
- The API documentation shows this is the correct endpoint for fetching surprise bags filtered by neighbourhood
- Note: Requirement mentioned "stores endpoint" but the API docs indicate `/surprise-bags` is the appropriate endpoint

### Missing API Fields
The following fields are used in the UI but may not be available in the current API response:
- `bags_left` - Displayed as "Quedan X" badge. Currently optional in the interface.
- `pickup_time_window` - Displayed as "Buscar: XX:XX a XX:XX hs". Currently optional in the interface.

**Action Required**: These fields should be added to the API response, or we need to calculate/derive them from other data.

### Hard-coded Values
- **Distance**: Currently hard-coded to "0 km" as the API doesn't provide distance calculation
- **Neighbourhood**: Hard-coded to "Palermo" for now (can be made dynamic later)
- **Location Dropdown**: The "Colegiales, Buenos Aires" dropdown is displayed but non-functional as specified

### Data Handling
- All API fields are checked for existence before rendering to prevent crashes
- Missing images show placeholder icons
- Missing store logos show a generic storefront icon
- Error handling is implemented with retry functionality

### Navigation
- Bottom tab navigation with 4 tabs: Inicio (index), Orders, Favourites, Profile
- Stack navigation for surprise bag details page
- Details page is a placeholder showing "Coming Soon" message

### Currency Formatting
- Prices are formatted using Argentine peso format with dot as thousands separator
- Example: 2300 → "$2.300"
- Original prices are shown with strikethrough and grayed out

### Text Truncation
- Descriptions are truncated to approximately 80 characters (2 lines) with ellipsis
- Store names are truncated to 1 line with ellipsis if too long

## Location Selection Screen

### Overview
A location selection screen has been implemented that appears before all other views if the user hasn't set their location. This screen allows users to search for and select their location, which is then saved to their user profile.

### Implementation Details

#### Files Created
- **`app/location.tsx`** - Main location selection screen component
- **`api/locations.ts`** - API functions for location search and user location management
- **`utils/mapPins.ts`** - Utility to map store categories to pin images
- **`hooks/useUserLocation.ts`** - Custom hook to check and manage user location state
- **`contexts/LocationContext.tsx`** - Context for triggering location refresh across components

#### Features
1. **MapLibre Map Integration**
   - Interactive map with pinch-to-zoom support
   - Default center on Buenos Aires (-34.5912554, -58.4280328)
   - Uses MapLibre demo tiles (no API key required)

2. **Store Pins**
   - Stores are displayed as custom pins on the map
   - Each pin image corresponds to the store category:
     - `cafe` → cafe.svg
     - `verduleria` → verduleria.svg
     - `heladeria` → heladeria.svg
     - `panaderia` → panaderia.svg
     - `pescaderia` → pescaderia.svg
     - `fiambreria` → fiambreria.svg
     - `floreria` → floreria.svg
     - `restaurante` → restaurante.svg
     - `sushi` → sushi.svg
   - Pins are fetched based on map bounds using GET /stores/nearby endpoint

3. **Predictive Location Search**
   - Search input field ("Ciudad o barrio")
   - Debounced search (300ms delay)
   - Shows up to 3 results in an overlay box
   - Displays "No results" message when no matches found
   - Uses GET /locations/search endpoint

4. **Distance Slider**
   - Range: 0-50 km (default: 2 km)
   - Functional slider component
   - Note: Currently the distance value is not used for filtering (as specified)

5. **Current Location**
   - "Usar mi ubicación actual" button with compass icon
   - Uses expo-location to get device GPS location
   - Requests location permissions
   - Centers map on current location when selected

6. **Location Saving**
   - "Seleccionar" button saves location via POST /user/location
   - Location is saved to user profile
   - After saving, the app automatically navigates to main screens
   - Uses LocationContext to trigger root layout refresh

#### Conditional Rendering
- Location screen is conditionally rendered in `app/_layout.tsx`
- Checks AsyncStorage first, then verifies with GET /user/location API
- Only shows location screen if user has no location set
- Shows loading state while checking location status

#### Dependencies Added
- `@maplibre/maplibre-react-native` - Map library
- `expo-location` - Location services
- `@react-native-community/slider` - Slider component

#### API Endpoints Used
- `GET /locations/search` - Search for locations (predictive search)
- `POST /user/location` - Save user location
- `GET /user/location` - Get user's saved location
- `GET /stores/nearby` - Get stores within map bounds

#### Translations
Location screen strings added to `i18n/translations.ts`:
- Search placeholder
- Distance slider label
- Use current location button
- Select button
- No results message
- Loading states

## Future Improvements Needed

1. **Distance Filtering**: Use the distance slider value to filter stores (currently functional but not used)
2. **Category Groupings**: Implement "Para cenar ahora" and "Para mañana por la mañana" groupings when requirements are provided
3. **Details Page**: Implement full details page when design is provided
4. **Authentication**: Add authentication flow when needed (currently API client supports token but no auth screens)
5. **Pull to Refresh**: Add pull-to-refresh functionality to the surprise bags list
6. **Image Caching**: Consider implementing better image caching for performance
7. **Error States**: Enhance error messages and retry mechanisms
8. **Map Pin Optimization**: Consider converting SVG pins to PNG for better MapLibre performance

## Testing Notes

- Test on both iOS and Android simulators/emulators
- Test with API online and offline scenarios
- Test with missing/null data fields
- Test navigation between screens
- Test error handling and retry functionality

