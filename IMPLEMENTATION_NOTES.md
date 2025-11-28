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
- Bottom tab navigation with 4 tabs: Inicio, Pedidos, Favoritos, Perfil
- Stack navigation for surprise bag details page
- Details page is a placeholder showing "Coming Soon" message

### Currency Formatting
- Prices are formatted using Argentine peso format with dot as thousands separator
- Example: 2300 → "$2.300"
- Original prices are shown with strikethrough and grayed out

### Text Truncation
- Descriptions are truncated to approximately 80 characters (2 lines) with ellipsis
- Store names are truncated to 1 line with ellipsis if too long

## Future Improvements Needed

1. **Distance Calculation**: Implement distance calculation based on user location and store coordinates
2. **Location Selection**: Make the location dropdown functional to filter by different neighbourhoods
3. **Category Groupings**: Implement "Para cenar ahora" and "Para mañana por la mañana" groupings when requirements are provided
4. **Details Page**: Implement full details page when design is provided
5. **Authentication**: Add authentication flow when needed (currently API client supports token but no auth screens)
6. **Pull to Refresh**: Add pull-to-refresh functionality to the surprise bags list
7. **Image Caching**: Consider implementing better image caching for performance
8. **Error States**: Enhance error messages and retry mechanisms

## Testing Notes

- Test on both iOS and Android simulators/emulators
- Test with API online and offline scenarios
- Test with missing/null data fields
- Test navigation between screens
- Test error handling and retry functionality

