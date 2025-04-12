'use client';

import {useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {generateWorkoutPlan} from '@/ai/flows/generate-workout-plan';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {toast} from '@/hooks/use-toast';
import {customizeWorkoutPlan} from '@/ai/flows/customize-workout-plan';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {HelpCircle} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formSchema = z.object({
  weight: z.coerce.number().min(1, {message: 'Weight must be greater than 0'}),
  height: z.coerce.number().min(1, {message: 'Height must be greater than 0'}),
  gender: z.enum(['male', 'female']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  endGoal: z.string().min(3, {message: 'End goal must be at least 3 characters'}),
  injuryInformation: z.string().optional(),
});

export default function Home() {
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  const [customizedPlan, setCustomizedPlan] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: 70,
      height: 175,
      gender: 'male',
      fitnessLevel: 'beginner',
      endGoal: 'Lose weight',
      injuryInformation: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const generatedPlan = await generateWorkoutPlan(values);
      setWorkoutPlan(generatedPlan.workoutPlan);
      setCustomizedPlan(null); // Reset customized plan when generating a new plan
      toast({
        title: 'Workout plan generated!',
        description: 'Check out your new workout plan below.',
      });
    } catch (error: any) {
      console.error('Error generating workout plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating workout plan',
        description: error.message || 'Failed to generate workout plan. Please try again.',
      });
    }
  }

  async function onCustomize(injuryInfo: string) {
    if (!workoutPlan) {
      toast({
        variant: 'destructive',
        title: 'No workout plan available',
        description: 'Please generate a workout plan first.',
      });
      return;
    }

    try {
      const customized = await customizeWorkoutPlan({
        workoutPlan: workoutPlan,
        injuryInformation: injuryInfo,
      });
      setCustomizedPlan(customized.customizedPlan);
      toast({
        title: 'Workout plan customized!',
        description: 'Check out your customized workout plan below.',
      });
    } catch (error: any) {
      console.error('Error customizing workout plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error customizing workout plan',
        description: error.message || 'Failed to customize workout plan. Please try again.',
      });
    }
  }

  const downloadPdf = () => {
    if (!workoutPlan) {
      toast({
        variant: 'destructive',
        title: 'No workout plan available',
        description: 'Please generate a workout plan first.',
      });
      return;
    }

    const doc = new jsPDF();
    doc.text('Workout Plan', 10, 10);

    // Parse the workout plan into table rows
    const rows = workoutPlan.split('\n').map(row => {
        return [row]; // Each row in the workout plan becomes a row in the table
    });

    (doc as any).autoTable({
        head: [['Exercise']], // Table header
        body: rows, // Table body
    });

    doc.save('workout_plan.pdf');
  };

  const parsedWorkoutPlan = workoutPlan ? workoutPlan.split('\n') : [];
  const parsedCustomizedPlan = customizedPlan ? customizedPlan.split('\n') : [];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-5">FitPlanAI</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Plan Generator</CardTitle>
            <CardDescription>
              Enter your details to generate a personalized workout plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your weight" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your height" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your gender"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your fitness level"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endGoal"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>End Goal</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your end goal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="injuryInformation"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Injury Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any injury information"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide any information about injuries or limitations to consider when
                        generating the workout plan.
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <Button type="submit">Generate Workout Plan</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout Plan</CardTitle>
            <CardDescription>
              Here is your personalized workout plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutPlan ? (
              <div className="space-y-2">
                <Table>
                  <TableCaption>A personalized daily workout plan based on your inputs.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Exercise</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customizedPlan ? (
                      parsedCustomizedPlan.map((exercise, index) => (
                        <TableRow key={index}>
                          <TableCell>{exercise}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      parsedWorkoutPlan.map((exercise, index) => (
                        <TableRow key={index}>
                          <TableCell>{exercise}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <Button onClick={downloadPdf}>Download as PDF</Button>
                {!customizedPlan && (
                  <TooltipProvider>
                    <div className="flex items-center space-x-2">
                      <Textarea
                        id="injuryInformation"
                        placeholder="Enter any injury information to customize the plan"
                        className="resize-none"
                        onBlur={(e) => onCustomize(e.target.value)}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Customize your workout plan by providing information about injuries or limitations.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No workout plan generated yet. Please submit the form to generate one.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
