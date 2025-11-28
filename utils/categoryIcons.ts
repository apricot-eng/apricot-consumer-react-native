/**
 * Maps surprise bag categories to their corresponding icon file paths
 * Returns the require() statement for the icon
 */
export const getCategoryIcon = (category: string): any => {
  const categoryMap: Record<string, any> = {
    'flores': require('@/assets/images/small-food-icons/flores.svg'),
    'panadería': require('@/assets/images/small-food-icons/panaderia.svg'),
    'comidas': require('@/assets/images/small-food-icons/comidas.svg'),
    'frutas y verduras': require('@/assets/images/small-food-icons/frutas_y_vegetales.svg'),
    'lacteos': require('@/assets/images/small-food-icons/lacteos.svg'),
    'pescados y mariscos': require('@/assets/images/small-food-icons/pescados_y_mariscos.svg'),
    'helados': require('@/assets/images/small-food-icons/helados.svg'),
    'sushi': require('@/assets/images/small-food-icons/sushi.svg'),
    'fiambreria': require('@/assets/images/small-food-icons/fiambres_y_quesos.svg'),
    'cafe': require('@/assets/images/small-food-icons/cafe.svg'),
  };

  return categoryMap[category.toLowerCase()] || null;
};

