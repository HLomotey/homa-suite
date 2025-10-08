import { mockRoutes } from './useRoute';
import { createRoute, fetchRoutes } from './routeApi';

/**
 * Migrates mock route data to the database if it doesn't already exist
 * This ensures that the mock data used in development is also available in the database
 */
export async function migrateRouteMockData(): Promise<void> {
  try {
    console.log('Starting route mock data migration...');
    
    // Fetch existing routes from the database
    const existingRoutes = await fetchRoutes();
    const existingRouteNames = new Set(existingRoutes.map(route => route.name));
    
    // Filter mock routes that don't exist in the database
    const routesToMigrate = mockRoutes.filter(mockRoute => !existingRouteNames.has(mockRoute.name));
    
    if (routesToMigrate.length === 0) {
      console.log('All mock routes already exist in the database. No migration needed.');
      return;
    }
    
    console.log(`Migrating ${routesToMigrate.length} mock routes to the database...`);
    
    // Migrate each mock route to the database
    for (const mockRoute of routesToMigrate) {
      await createRoute(
        mockRoute.name,
        mockRoute.description,
        mockRoute.schedules.map(s => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      );
      console.log(`Migrated route: ${mockRoute.name}`);
    }
    
    console.log('Route mock data migration completed successfully.');
  } catch (error) {
    console.error('Error migrating route mock data:', error);
    throw error;
  }
}
