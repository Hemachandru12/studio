// This is an autogenerated file from Firebase Studio.

'use server';

/**
 * @fileOverview Provides functionality to customize a workout plan based on potential injury concerns.
 *
 * - customizeWorkoutPlan - An async function that takes a workout plan and user injury information and returns suggestions for exercise modifications.
 * - CustomizeWorkoutPlanInput - The input type for the customizeWorkoutPlan function.
 * - CustomizeWorkoutPlanOutput - The output type for the customizeWorkoutPlan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CustomizeWorkoutPlanInputSchema = z.object({
  workoutPlan: z.string().describe('The workout plan to customize.'),
  injuryInformation: z.string().describe('Information about the user\'s injuries or limitations.'),
});
export type CustomizeWorkoutPlanInput = z.infer<typeof CustomizeWorkoutPlanInputSchema>;

const CustomizeWorkoutPlanOutputSchema = z.object({
  customizedPlan: z.string().describe('The customized workout plan with suggestions for exercise modifications.'),
});
export type CustomizeWorkoutPlanOutput = z.infer<typeof CustomizeWorkoutPlanOutputSchema>;

export async function customizeWorkoutPlan(input: CustomizeWorkoutPlanInput): Promise<CustomizeWorkoutPlanOutput> {
  return customizeWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeWorkoutPlanPrompt',
  input: {
    schema: z.object({
      workoutPlan: z.string().describe('The workout plan to customize.'),
      injuryInformation: z.string().describe('Information about the user\'s injuries or limitations.'),
    }),
  },
  output: {
    schema: z.object({
      customizedPlan: z.string().describe('The customized workout plan with suggestions for exercise modifications.'),
    }),
  },
  prompt: `You are a personal trainer who adjusts workout plans to the user's injury concerns.

  Given the following workout plan:
  {{workoutPlan}}

  And the following injury information:
  {{injuryInformation}}

  Provide a customized workout plan with suggestions for exercise modifications.
  Explain why you are making the changes.
  If no changes are needed just copy the workout plan as is, and say no changes are needed.`,
});

const customizeWorkoutPlanFlow = ai.defineFlow<
  typeof CustomizeWorkoutPlanInputSchema,
  typeof CustomizeWorkoutPlanOutputSchema
>({
  name: 'customizeWorkoutPlanFlow',
  inputSchema: CustomizeWorkoutPlanInputSchema,
  outputSchema: CustomizeWorkoutPlanOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
