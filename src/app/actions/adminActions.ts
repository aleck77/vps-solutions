
'use server';

import { seedDatabase } from '@/lib/seed';

export async function seedDatabaseAction(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[AdminActions] Attempting to seed database...');
    await seedDatabase(); // This function in seed.ts should handle its own logging
    console.log('[AdminActions] Database seeding process completed from seedDatabase function.');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error: any) {
    console.error('[AdminActions] Error seeding database:', error);
    return { success: false, message: error.message || 'Failed to seed database.' };
  }
}
