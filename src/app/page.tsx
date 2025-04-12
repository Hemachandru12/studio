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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import jsPDF from 'jspdf';

const formSchema = z.object({
  weight: z.coerce.number().min(1, {message: 'Weight must be greater than 0'}),
  height: z.coerce.number().min(1, {message: 'Height must be greater than 0'}),
  gender: z.enum(['male', 'female']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  endGoal: z.string().min(1, {message: 'End goal cannot be empty'}),
  injuryInformation: z.string().optional(),
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

  const downloadPdf = async () => {
    if (!plan) return;

    const pdf = new jsPDF();
    pdf.text('Workout Plan', 10, 10);

    const data = [];
    const lines = plan.split('\n');
    if (lines.length < 2) return;

    const header = lines[0].split('|').map(header => header.trim());
    const dataRows = lines.slice(1).map(row => {
      return row.split('|').map(cell => cell.trim());
    });

    // Filter out empty rows (rows with only empty cells)
    const filteredDataRows = dataRows.filter(row => {
      return row.some(cell => cell !== ''); // Keep rows with at least one non-empty cell
    });

    // Dynamically import jspdf-autotable
    const { default: autoTable } = await import('jspdf-autotable');

    // Add the table to the PDF
    (pdf as any).autoTable({
      head: [header],
      body: filteredDataRows,
      startY: 20, // Adjust startY to leave space for the title
    });

    pdf.save('workout_plan.pdf');
  };

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
    <div className="flex justify-center items-center h-screen bg-light-gray">
      <Card className="w-[800px] bg-white rounded-lg shadow-md">
        <CardHeader>
          <CardTitle>FitPlanAI</CardTitle>
          <CardDescription>
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
              <Button type="submit">Generate Workout Plan</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your Workout Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Here is your personalized workout plan for today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
             {plan ? (
              <div className="rounded-md border">
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
              <div>Loading...</div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="button" onClick={downloadPdf}>
              Download PDF
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
