"use client"
import React, { useState } from "react";              
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createUser } from "../actions/createUser";
import { registerSchema, RegisterFormData } from "@/lib/validate"

export default function RegisterPage(){
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string[]>>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
        e.preventDefault()
        const formData = {
            username: e.currentTarget.username.value,
            email: e.currentTarget.email.value,
            password: e.currentTarget.password.value,
            confirmPassword: e.currentTarget.confirmPassword.value,
            address: e.currentTarget.address.value,
            phone: e.currentTarget.phone.value
        }
        const result = registerSchema.safeParse(formData);
        if(!result.success){
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors(fieldErrors);
        } else {
            setErrors({})
            const {confirmPassword, ...userData} = result.data
            await createUser(userData)
        }
    }

    return(
        <div className="flex flex-col justify-center items-center min-h-screen">
            <form className="flex flex-col shadow-2xl rounded-4xl w-lg p-10 gap-4" onSubmit={handleSubmit}>
                <h1 className="flex text-4xl my-5 font-bold justify-center">Register</h1>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" type="text" placeholder="Username" />
                    {errors.username && <p className="text-red-500 text-sm">{errors.username[0]}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email"  placeholder="Email" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Password" />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password[0]}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword[0]}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" type="text" placeholder="Address" />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address[0]}</p>}
                </div>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Phone Number" />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone[0]}</p>}
                </div>

                <Button type="submit" className="w-full mt-2 py-5 font-bold text-lg">Register</Button>
                <p className="text-sm text-center">Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link></p>
            </form>
        </div>
    )
}