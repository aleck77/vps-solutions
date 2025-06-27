
'use server';

import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/app/actions/adminActions';
import type { MenuItem } from '@/types';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function updateNavigationAction(
  menuId: string,
  items: Omit<MenuItem, 'id'>[]
): Promise<ActionResult> {
  if (!menuId) {
    return { success: false, message: 'Menu ID is missing.' };
  }
  // Allow for more footer columns
  if (!['header-nav', 'footer-col-1', 'footer-col-2', 'footer-col-3'].includes(menuId)) {
    return { success: false, message: 'Invalid Menu ID provided.' };
  }
  
  try {
    const adminDb = await getAdminFirestore();
    const navRef = adminDb.collection('navigation').doc(menuId);

    // Update the 'items' array in the document.
    // This will replace the entire array with the new one.
    await navRef.update({ items: items });

    // Revalidate the root layout to ensure header and footer are updated everywhere
    revalidatePath('/', 'layout');

    return { success: true, message: `Menu "${menuId}" updated successfully.` };

  } catch (error: any) {
    console.error(`Error updating navigation menu ${menuId}:`, error);
    return { success: false, message: `Failed to update menu: ${error.message}` };
  }
}
