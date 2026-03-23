"use client"
import { redirect } from "next/navigation"
import React, { useEffect } from "react"

export default function RegisterSuccessPage(){


   useEffect(() =>{
    const timer = setTimeout(()=>{
        redirect("/")
    },4000)
    return () => clearTimeout(timer)
   })




    return(
        <div className="flex flex-col justify-center items-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">Registration Successful!</h1>
            <p className="text-lg text-gray-600 font-italic">Thank you for registering. You will be redirected in {'timer'}.</p>
        </div>
    )
}