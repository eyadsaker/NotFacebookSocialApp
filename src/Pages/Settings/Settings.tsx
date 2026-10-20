import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import { changePassword } from "../../services/auth.service";
import { errorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  password: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "Use at least 8 characters.").regex(/[A-Z]/, "Include an uppercase letter.").regex(/[a-z]/, "Include a lowercase letter.").regex(/[0-9]/, "Include a number.").regex(/[^A-Za-z0-9]/, "Include a special character."),
  confirmPassword: z.string(),
}).refine((values) => values.newPassword === values.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] })
  .refine((values) => values.newPassword !== values.password, { message: "Choose a different password.", path: ["newPassword"] });

export default function Settings() {
  const { user, saveUserToken, removeUserToken } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      if (data?.token) saveUserToken(data.token, data.user || user || undefined);
      else removeUserToken();
      reset();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  return <section className="social-panel p-6 sm:p-8">
    <div className="mb-6 flex items-center gap-3"><span className="rounded-2xl bg-primary-bg p-3 text-primary"><LockKeyhole size={25} /></span><div><h1 className="text-xl font-extrabold">Change password</h1><p className="text-sm text-slate-500">Keep your NotFacebook account secure.</p></div></div>
    <form className="space-y-5" onSubmit={handleSubmit(({ password, newPassword }) => mutation.mutate({ password, newPassword }))}>
      {([{ name: "password", label: "Current password" }, { name: "newPassword", label: "New password" }, { name: "confirmPassword", label: "Confirm new password" }] as const).map(({ name, label }) => <label key={name} className="block text-sm font-bold text-slate-700">{label}<input type="password" autoComplete={name === "password" ? "current-password" : "new-password"} {...register(name)} className="app-input mt-2" aria-invalid={Boolean(errors[name])} />{errors[name] && <span role="alert" className="mt-1 block font-normal text-rose-600">{errors[name]?.message}</span>}</label>)}
      <Button type="submit" className="bg-primary font-bold text-white" isPending={mutation.isPending} isDisabled={mutation.isPending}>Update password</Button>
    </form>
  </section>;
}
