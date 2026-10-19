import z from "zod";

export const registerSchema =z.object({
  name: z.string().trim()
    .min(2, "Full Name must be atleast 2 characters.")
    .max(50, "Full Name must be atMost 50 characters."),


  username: z.string()
    .min(2, "Full Name must be atleast 2 characters.")
    .max(20, "Full Name must be atMost 20 characters."),
    // .regex(/^[a-zA-Z0-9_]$/,"Username can only contain Letters,numbers and underscores."),


  email: z.string().email("Please enter valid Email Address."),


  password: z.string()
  .min(8, "password must be atleast 8 characters.")
  .regex(/[A-Z]/,"Password must contain atleast one UpperCase Letter.")
  .regex(/[a-z]/,"Password must contain atleast one LowerCase Letter.")
  .regex(/[0-9]/,"Password must contain atleast one Number.")
  .regex(/[^A-Za-z0-9]/,"Password must contain atleast one special character."),


  rePassword: z.string() 
  .min(8, "password must be atleast 8 characters.")
  .regex(/[A-Z]/,"Password must contain atleast one UpperCase Letter.")
  .regex(/[a-z]/,"Password must contain atleast one LowerCase Letter.")
  .regex(/[0-9]/,"Password must contain atleast one Number.")
  .regex(/[^A-Za-z0-9]/,"Password must contain atleast one special character."),



  dateOfBirth: z.string()
  .nonempty("Date of Birth is Required")
   
  .refine((value)=>{
    const selectedYear = new Date(value).getFullYear()
    const currentYear = new Date().getFullYear()

    return currentYear - selectedYear >= 16
  }, "Your Age must be atleast 16"),


  gender: z.enum(["male","female"], {message:"Please select a gender."})
}).refine((data)=> data.password === data.rePassword, { message:"Passwords Doesn't match " , path:['rePassword']})


export type RegisterFormSchema = z.infer<typeof registerSchema>