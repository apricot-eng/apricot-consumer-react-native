/**
 * Maps store categories to their corresponding map pin image assets
 * Returns the require() statement for the pin image
 */
export const getMapPinImage = (category: string): any => {
  // Normalize category to lowercase for matching
  const normalizedCategory = category.toLowerCase().trim();
  
  const categoryMap: Record<string, any> = {
    'cafe': require('@/assets/images/map-pins/cafe.png'),
    'verduleria': require('@/assets/images/map-pins/verduleria.png'),
    'heladeria': require('@/assets/images/map-pins/heladeria.png'),
    'panaderia': require('@/assets/images/map-pins/panaderia.png'),
    'pescaderia': require('@/assets/images/map-pins/pescaderia.png'),
    'fiambreria': require('@/assets/images/map-pins/fiambreria.png'),
    'floreria': require('@/assets/images/map-pins/floreria.png'),
    'restaurante': require('@/assets/images/map-pins/restaurante.png'),
    'sushi': require('@/assets/images/map-pins/sushi.png'),
  };

  return categoryMap[normalizedCategory] || categoryMap['cafe']; // Default to cafe pin if category not found
};

/**
 * Get the category name for a pin image filename
 * Used to identify which pin image corresponds to which category
 */
export const getCategoryFromPinName = (pinName: string): string => {
  const pinToCategory: Record<string, string> = {
    'cafe': 'cafe',
    'verduleria': 'verduleria',
    'heladeria': 'heladeria',
    'panaderia': 'panaderia',
    'pescaderia': 'pescaderia',
    'fiambreria': 'fiambreria',
    'floreria': 'floreria',
    'restaurante': 'restaurante',
    'sushi': 'sushi',
  };
  
  return pinToCategory[pinName] || 'cafe';
};
