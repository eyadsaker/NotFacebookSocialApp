import { Button, Label, Radio, RadioGroup } from "@heroui/react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { errorMessage } from "../../../services/api";
import { Input } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { type RegisterFormSchema, registerSchema } from "../../../schema/register";
import type { RegisterFormData } from "../../../interface/register";
import { signUp } from "../../../services/auth.service";
import { Spinner } from '@heroui/react';
import { useNavigate } from "react-router-dom";


export default function RegisterForm() {

  const navigate=useNavigate()
  const signup = useMutation({ mutationFn: signUp });


  const {register, control, handleSubmit , formState:{errors , isSubmitting}} = useForm<RegisterFormSchema>({
    // mode: "onBlur"

    defaultValues:{
    name: '' ,
    username: '',
    email: '',
    dateOfBirth: '',
    password:"",
    rePassword:"",
    gender:"male",
  },
  resolver: zodResolver(registerSchema)
  })
  // console.log(register('rePassword')) 


  async function onSubmit(data : RegisterFormData){
    

    try {
      await signup.mutateAsync(data)


      navigate("/auth/login")
      
    } catch (error: unknown) {
      toast.error(errorMessage(error));
      
    }

  }

  



  
  
  return (
    <>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
        Create a new account
      </h2>
      <p className="text-sm text-slate-500">It is quick and easy.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* <input type="text" name="name" placeholder="Enter Your Full Name" /> */}
        <Input {...register('name')} aria-label="Full Name" fullWidth placeholder="Enter Your Name" />
        {errors.name && <p className="text-red-600 text-sm mb-2">{errors.name.message}</p>}

        
        <Input {...register('username')} aria-label="Username" fullWidth placeholder="Enter Your Username"/>
        {errors.username && <p className="text-red-600 text-sm mb-2">{errors.username.message}</p>}


        <Input {...register('email')} aria-label="Email" fullWidth placeholder="Enter Your Email"/>
        {errors.email && <p className="text-red-600 text-sm ">{errors.email.message}</p>}


        <Input {...register('password')} aria-label="Password" fullWidth placeholder="Enter Your Password" type="password"/>
        {errors.password && <p className="text-red-600 text-sm mb-2">{errors.password.message}</p>}


        <Input {...register('rePassword' )} aria-label="Confirm Password" fullWidth placeholder="Confirm Your Password" type="password"/>
        {errors.rePassword && <p className="text-red-600 text-sm mb-2">{errors.rePassword.message}</p>}


        <Input {...register('dateOfBirth')} aria-label="Date of birth" fullWidth placeholder="Enter you Birthdate" type="date"/>
        {errors.dateOfBirth && <p className="text-red-600 text-sm mb-2">{errors.dateOfBirth.message}</p>}


        <div className="flex flex-col gap-4">
          <Label>Gender</Label>
          <Controller name="gender" control={control} render={({ field }) => <RadioGroup aria-label="Gender" name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} orientation="horizontal">
            <Radio value="male">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                Male
              </Radio.Content>
            </Radio>

            <Radio value="female">
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                Female
              </Radio.Content>
            </Radio>
          </RadioGroup>} />
        </div>

        {errors.gender && <p className="text-red-600 text-sm mb-2">{errors.gender?.message}</p>}

        

        <Button fullWidth
          className="bg-primary font-extrabold text-white hover:bg-primary-hover" type ="submit" isPending={isSubmitting} isDisabled={isSubmitting}>
          {({isPending}) => (
            <>
              {isPending ? <Spinner color="current" size="sm" /> : null}
              Create New Account
            </>
          )}
        </Button>
      </form>
    </>
  );
}


// import * as z from 'zod'

