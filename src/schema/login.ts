import z from "zod";

export const loginSchema =z.object({
  


  email: z.string().email("Please enter valid Email Address."),


  password: z.string()
  .min(8, "password must be atleast 8 characters.")
  .regex(/[A-Z]/,"Password must contain atleast one UpperCase Letter.")
  .regex(/[a-z]/,"Password must contain atleast one LowerCase Letter.")
  .regex(/[0-9]/,"Password must contain atleast one Number.")
  .regex(/[^A-Za-z0-9]/,"Password must contain atleast one special character."),


 


})


export type LoginFormSchema = z.infer<typeof loginSchema>