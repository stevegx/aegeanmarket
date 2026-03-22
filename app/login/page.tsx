"use client"
import React from "react";
export default function LoginPage(){
    return (
    <div className="flex flex-col justify-center items-center p-5">
        <h1 className="text-4xl my-5"> Login Page </h1>
        <form action="" className="flex flex-col gap-4 m-3 justify-center items-center">
            <input type="text" required={true} placeholder="Username"/>
            <input type="text" required={true} placeholder="Password"/>
            
        </form>
    </div>
    )
}
