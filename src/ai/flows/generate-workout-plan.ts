'use server';
/**
 * @fileOverview Generates a personalized daily workout plan based on user inputs.
 *
 * - generateWorkoutPlan - A function that handles the workout plan generation process.
 * - WorkoutPlanInput - The input type for the generateWorkoutPlan function.
 * - WorkoutPlanOutput - The return type for the generateWorkoutPlan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const WorkoutPlanInputSchema = z.object({
  weight: z.number().describe('Your weight in kilograms.'),
  height: z.number().describe('Your height in centimeters.'),
  gender: z.enum(['male', 'female']).describe('Your gender.'),
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('Your current fitness level.'),
  endGoal:
    z.string().describe('Your fitness goal (e.g., lose weight, build muscle).'),
  injuryInformation: z.string().optional().describe('Any injury information to take into account when building workout plan.'),
  muscles: z.array(z.string()).describe('The muscles to focus on during the workout.'), // Muscle selection
});

export type WorkoutPlanInput = z.infer<typeof WorkoutPlanInputSchema>;

const WorkoutPlanOutputSchema = z.object({
  workoutPlan: z
    .string()
    .describe('A personalized daily workout plan based on your inputs.'),
});

export type WorkoutPlanOutput = z.infer<typeof WorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(
  input: WorkoutPlanInput
): Promise<WorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {
    schema: z.object({
      weight: z.number().describe('Your weight in kilograms.'),
      height: z.number().describe('Your height in centimeters.'),
      gender: z.enum(['male', 'female']).describe('Your gender.'),
      fitnessLevel: z
        .enum(['beginner', 'intermediate', 'advanced'])
        .describe('Your current fitness level.'),
      endGoal:
        z.string().describe('Your fitness goal (e.g., lose weight, build muscle).'),
        injuryInformation: z.string().optional().describe('Any injury information to take into account when building workout plan.'),
      muscles: z.array(z.string()).describe('The muscles to focus on during the workout.'), // Muscle selection
    }),
  },
  output: {
    schema: z.object({
      workoutPlan: z
        .string()
        .describe('A personalized daily workout plan based on your inputs.'),
    }),
  },
  prompt: `You are a personal trainer. Generate a workout plan based on the user's information. The workout plan must be in a table format with the following columns: Exercise, Sets, Reps, Weights, Rest Between Sets.

  Consider the following information when generating the workout plan:

  Weight: {{{weight}}} kg
  Height: {{{height}}} cm
  Gender: {{{gender}}}
  Fitness Level: {{{fitnessLevel}}}
  End Goal: {{{endGoal}}}
  Injury Information: {{{injuryInformation}}}
  
  The workout plan should include specific exercises, sets, reps, weights, and rest times for the selected muscles.
  Make sure to take into account any injury information provided.
  Focus on the following muscles: {{{muscles}}}

  Example:

  Exercise   | Sets | Reps       | Weights | Rest Between Sets
  -----------|------|------------|---------|--------------------
  Push-ups   | 3    | 10         | --      | 60 seconds
  Squats     | 3    | 10         | --      | 60 seconds
  Plank      | 3    | 30 seconds | --      | 60 seconds
  
  Make sure to use the column names "Exercise", "Sets", "Reps", "Weights", and "Rest Between Sets".
  Do not provide any introductory or concluding sentences. Only provide the workout plan in the specified tabular format.
  `,
});

const generateWorkoutPlanFlow = ai.defineFlow<
  typeof WorkoutPlanInputSchema,
  typeof WorkoutPlanOutputSchema
>(
  {
    name: 'generateWorkoutPlanFlow',
    inputSchema: WorkoutPlanInputSchema,
    outputSchema: WorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
