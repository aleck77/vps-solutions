
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore, AdminFieldValue } from '@/app/actions/adminActions';
import { vpsPlanSchema, type VpsPlanFormValues } from '@/lib/schemas';
import type { VPSPlan } from '@/types';

interface ActionResult {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export async function createPlanAction(
  prevState: ActionResult | undefined,
  formData: VpsPlanFormValues
): Promise<ActionResult> {
  const validatedFields = vpsPlanSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }
  
  const { features, ...restOfData } = validatedFields.data;
  const featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);

  const newPlanData: Omit<VPSPlan, 'id'> = {
    ...restOfData,
    features: featuresArray,
  };

  try {
    const adminDb = await getAdminFirestore();
    await adminDb.collection('vps_plans').add(newPlanData);

    revalidatePath('/admin/plans');
    revalidatePath('/'); // Revalidate homepage where plans are teased
    revalidatePath('/order'); // Revalidate order page

  } catch (error: any) {
    console.error('Error creating VPS plan:', error);
    return { success: false, message: `Failed to create plan: ${error.message}` };
  }

  return { success: true, message: `Plan "${validatedFields.data.name}" created successfully.` };
}

export async function updatePlanAction(
  planId: string,
  prevState: ActionResult | undefined,
  formData: VpsPlanFormValues
): Promise<ActionResult> {
  if (!planId) {
    return { success: false, message: 'Plan ID is missing. Cannot update.' };
  }

  const validatedFields = vpsPlanSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.issues,
    };
  }

  const { features, ...restOfData } = validatedFields.data;
  const featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);

  const planUpdateData: Omit<VPSPlan, 'id'> = {
    ...restOfData,
    features: featuresArray,
  };

  try {
    const adminDb = await getAdminFirestore();
    const planRef = adminDb.collection('vps_plans').doc(planId);
    await planRef.update(planUpdateData);

    revalidatePath('/admin/plans');
    revalidatePath(`/admin/plans/edit/${planId}`);
    revalidatePath('/');
    revalidatePath('/order');

  } catch (error: any) {
    console.error(`Error updating plan ${planId}:`, error);
    return { success: false, message: `Failed to update plan: ${error.message}` };
  }

  return { success: true, message: `Plan "${validatedFields.data.name}" updated successfully.` };
}

export async function deletePlanAction(planId: string): Promise<{ success: boolean; message: string }> {
  if (!planId) {
    return { success: false, message: 'Plan ID is missing. Cannot delete.' };
  }
  try {
    const adminDb = await getAdminFirestore();
    await adminDb.collection('vps_plans').doc(planId).delete();

    revalidatePath('/admin/plans');
    revalidatePath('/');
    revalidatePath('/order');

    return { success: true, message: 'Plan deleted successfully.' };

  } catch (error: any) {
    console.error(`Error deleting plan ${planId}:`, error);
    return { success: false, message: `Failed to delete plan: ${error.message}` };
  }
}
