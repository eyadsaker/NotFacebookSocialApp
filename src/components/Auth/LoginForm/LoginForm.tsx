import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { errorMessage } from "../../../services/api";
import { Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signIn } from "../../../services/auth.service";
import { Spinner } from '@heroui/react';
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormSchema } from "../../../schema/login";
import type { loginFormData } from "../../../interface/login";
import { useAuth } from "../../../context/AuthContext";


export default function LoginForm() {

  const navigate=useNavigate()
  const {saveUserToken} = useAuth()
  const login = useMutation({ mutationFn: signIn });

  const {register , handleSubmit , formState:{errors , isSubmitting}} = useForm<LoginFormSchema>({
    // mode: "onBlur"

    defaultValues:{

    email: '',
  
    password:"",

  },
  resolver: zodResolver(loginSchema)
  })


  async function onSubmit(data : loginFormData){
    

    try {
      const {token,user} = await login.mutateAsync(data)
      // console.log("Submitted",token)
      saveUserToken(token, user)

      navigate("/")
      
    } catch (error: unknown) {
      toast.error(errorMessage(error));
      
    }

  }

  
  return (
    <>
      <h2 className="text-2xl font-extrabold text-slate-900 ">
        Login
      </h2>
      <p className="text-sm text-slate-500 mb-1">It is quick and easy.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* <input type="text" name="name" placeholder="Enter Your Full Name" /> */}
       

        <Input {...register('email')} aria-label="Email" fullWidth placeholder="Enter Your Email"/>
        {errors.email && <p className="text-red-600 text-sm ">{errors.email.message}</p>}


        <Input {...register('password')} aria-label="Password" fullWidth placeholder="Enter Your Password" type="password"/>
        {errors.password && <p className="text-red-600 text-sm mb-2">{errors.password.message}</p>}
        

        <Button fullWidth
          className="bg-primary font-extrabold text-white hover:bg-primary-hover" type ="submit" isPending={isSubmitting} isDisabled={isSubmitting}>
          {({isPending}) => (
            <>
              {isPending ? <Spinner color="current" size="sm" /> : null}
              Login
            </>
          )}
        </Button>
      </form>
    </>
  );
}



