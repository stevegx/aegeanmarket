import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"
export default function mainPage(){

  return (
    <div>
      <h1 className="mx-4 py-4 text-blue-200">Hello there</h1>
     <Link href="/register">
       <Button>Register</Button>
     </Link>
      
    </div>
    
  )

}