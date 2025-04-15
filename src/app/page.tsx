'use client';

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
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger} from '@/components/ui/select';
import {generateWorkoutPlan} from '@/ai/flows/generate-workout-plan';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Abs',
  'Full Body',
];

const formSchema = z.object({
  weight: z.coerce.number().min(1, {message: 'Weight must be greater than 0'}),
  height: z.coerce.number().min(1, {message: 'Height must be greater than 0'}),
  gender: z.enum(['male', 'female']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  endGoal: z.string().min(1, {message: 'End goal cannot be empty'}),
  injuryInformation: z.string().optional(),
  muscles: z.array(z.string()).default([]), // Muscle selection
});

export default function IndexPage() {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      weight: 0,
      height: 0,
      gender: 'male',
      fitnessLevel: 'beginner',
      endGoal: '',
      injuryInformation: '',
      muscles: [], // Muscle selection
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    generateWorkoutPlan(values).then(result => {
      console.log('Workout plan:', result.workoutPlan);
      setPlan(result.workoutPlan);
      setOpen(true);
    });
  }

  const getTableData = () => {
    if (!plan) return [];

    const lines = plan.split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split('|').map(header => header.trim());
    const dataRows = lines.slice(1).map(row => {
      return row.split('|').map(cell => cell.trim());
    });

    // Combine header and data rows
    const tableData = [header, ...dataRows];

    return tableData;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light-gray py-12">
      <Card className="w-[800px] bg-white rounded-lg shadow-md">
        <CardHeader className="flex flex-col items-start space-y-1">
          <CardTitle className="text-2xl font-semibold">FitPlanAI</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Enter your details to generate a personalized workout plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter your weight"
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Enter your weight in kilograms.</FormDescription>
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
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter your height"
                        />
                      </FormControl>
                      <FormMessage />
                       <FormDescription>Enter your height in centimeters.</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="gender"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        {field.value === 'male' ? 'Male' : 'Female'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                      <SelectTrigger>
                        {field.value}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                      <Input
                        {...field}
                        placeholder="e.g., lose weight, build muscle"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Specify your fitness goal.</FormDescription>
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
                      <Input
                        {...field}
                        placeholder="e.g., lower back pain, knee injury"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>Any injury information to take into account when building workout plan.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="muscles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muscle Groups</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroups.map((muscle) => (
                        <FormItem
                          key={muscle}
                          className="space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(muscle)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), muscle])
                                } else {
                                  field.onChange(field.value?.filter((val) => val !== muscle))
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal pl-2">{muscle}</FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                    <FormDescription>Select the muscle groups to focus on.</FormDescription>
                  </FormItem>
                )}
              />
              <Button type="submit">Generate Workout Plan</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Your Workout Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Here is your personalized workout plan for today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {plan ? (
                <div className="w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {getTableData()[0]?.map((header, index) => (
                          <TableHead key={index}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTableData().slice(1).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center">Loading...</div>
              )}
          </ScrollArea>
          <AlertDialogFooter className="justify-center">
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
