'use server';

/* eslint-disable @typescript-eslint/no-unused-vars -- imports are for your implementation */
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { addModelSchema } from '@/lib/validations';
import { getUserId } from '@/lib/auth';
import type { Model } from '@/lib/types';
// ============================================================================
// CHALLENGE TASK 3: Complete the addModel server action
// ============================================================================
//
// This action is called when a user submits the "Add model" form.
//
// Steps:
//   1. Get the current user's ID — return an error if not authenticated
//   2. Extract the fields from formData and validate with addModelSchema
//      (see lib/validations.ts for the schema definition)
//   3. If validation fails, return { error: "<descriptive message>" }
//   4. INSERT the new model into the database
//   5. If the database insert fails, return { error: "<descriptive message>" }
//   6. Revalidate the dashboard path so the new model appears
//   7. Return { success: true }
//
// Check lib/validations.ts for the schema shape.
// Check lib/db.ts for the query helper.
// Check CONVENTIONS.md for the error return format and INSERT patterns.
//
// DO NOT use AI tools. Your screen recording will be reviewed.
// ============================================================================

export async function addModel(
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  // Check User Authentication
  const user_id = await getUserId()
  if (!user_id) return { error: "User is not Authenticated"}

  const validated_data = addModelSchema.safeParse(Object.fromEntries(formData))
  if (!validated_data.success) return { error: JSON.stringify(validated_data.error.errors.map((e)=> e.message).join(", "))}

  const data_for_insert = {...validated_data, added_by: user_id}
  const inserted_data = await query("INSERT INTO models (name, model_id, provider_id, context_window, status, notes ,added_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    Object.values(data_for_insert)
  );
  // Check if there is data
  if (!inserted_data) return { error: "The Data has failed to save. Please Try again"}
  revalidatePath("/dashboard")
  // TODO: Your implementation here
  return { success: true };
}
