import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormProvider } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email(),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  course: z.string(),
  duration: z.string(),
  equipment: z.string(),
  previousExperience: z.string().optional(),
  message: z.string().optional(),
  terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface RegistrationFormProps {
  courses: Array<{
    id: string
    title: string
    basePrice: string
    durations: Array<{
      id: string
      name: string
      description: string
    }>
    equipmentOptions: Array<{
      id: string
      name: string
      description: string
    }>
    priceMatrix: Record<string, string>
  }>
  onSubmit: (data: FormValues) => void
  isSubmitting?: boolean
}

export function RegistrationForm({ courses, onSubmit, isSubmitting = false }: RegistrationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      course: "",
      duration: "",
      equipment: "",
      previousExperience: "",
      message: "",
      terms: false,
    },
  })

  function handleSubmit(data: FormValues) {
    onSubmit(data)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      className="border-gray-200" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      className="border-gray-200" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
                      className="border-gray-200" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>



        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Training Options</h3>
          
          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-gray-700">Choose Course</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  // Reset duration and equipment when course changes
                  form.setValue('duration', '');
                  form.setValue('equipment', '');
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} ({course.basePrice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        {form.watch('course') && (
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-gray-700">Choose Duration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select course duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses
                      .find(course => course.id === form.watch('course'))?.durations
                      .map((duration) => (
                        <SelectItem key={duration.id} value={duration.id}>
                          {duration.name} - {duration.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('course') && (
          <FormField
            control={form.control}
            name="equipment"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-gray-700">Equipment Option</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select equipment option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses
                      .find(course => course.id === form.watch('course'))?.equipmentOptions
                      .map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} - {option.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {form.watch('course') && form.watch('duration') && form.watch('equipment') && (
                  <div className="mt-4 p-4 border border-gray-100 rounded shadow-sm bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Package Price:</span>
                      <span className="text-lg font-bold text-pink-600">
                        {courses.find(c => c.id === form.watch('course'))?.priceMatrix[
                          `${form.watch('duration')}-${form.watch('equipment')}`
                        ] || 'Select all options'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Payment details provided after registration</p>
                  </div>
                )}
              </FormItem>
            )}
          />
        )}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Additional Information</h3>
          
          <FormField
            control={form.control}
            name="previousExperience"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-gray-700">Previous Experience</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your previous experience in the beauty industry..." 
                    className="min-h-[80px] border-gray-200" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-gray-500 text-xs mt-1">
                  This helps us customize your training program to match your skills.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Additional Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information you'd like to share..." 
                    className="min-h-[80px] border-gray-200"  
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4 mb-6">
              <FormControl>
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500" 
                  checked={field.value} 
                  onChange={field.onChange}
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-gray-700">
                  I agree to the <a href="/terms" className="text-pink-600 hover:text-pink-800">Terms and Conditions</a>
                </FormLabel>
                <FormDescription className="text-xs text-gray-500">
                  By checking this box, you agree to our training terms and payment policies.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 font-medium rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Complete Registration'}
        </Button>
        <p className="text-center text-gray-500 text-xs mt-3">
          You will receive a confirmation email after registration
        </p>
      </form>
    </FormProvider>
  )
}
