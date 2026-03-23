"use client"

import Image from "next/image"
import { Input } from "@base-ui/react/input"
import { NavigationMenu , NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent , NavigationMenuList} from "./navigation-menu"
import Logo from "@/images/aegeanMarketLogo.jpg"
import Link from "next/link"
import React , {useState} from "react"
import {loginUser} from "@/app/register/actions/loginUser"

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState<{ username: string } | null>(null)

    return (
        <nav className="flex items-center justify-between px-6 py-2 bg-aegean-dark text-aegean-white gap-4 shadow-md">
            <Link href="/" className="shrink-0">
                <Image src={Logo} alt="Aegean Market Logo" width={100} height={400} className="h-12 w-auto rounded-lg object-contain" loading="lazy" />
            </Link>
            
            <div className="grow max-w-md">
                <Input placeholder="Search products..." type="search" className="w-full bg-white/10 border-none px-3 py-1.5 rounded text-sm text-white placeholder:text-gray-200 focus:bg-white focus:text-black transition-all outline-none"/>
            </div>

            <div className="flex items-center gap-3">
                {isLoggedIn && username ? (
                    <UserMenu name={username.username} onLogout={() => {
                        setIsLoggedIn(false)
                        setUsername(null)
                    }} />
                ) : (
                    <div className="flex items-center gap-2"> 
                        <LoginInput onLoginSuccess={(name)=> {
                            setIsLoggedIn(true)
                            setUsername({username : name})
                        }} />  
                        <div className="w-px h-6 bg-gray-600 mx-1" />
                        <Link href="/register">
                            <button className="bg-aegean-green text-aegean-white px-4 py-1.5 rounded text-sm font-semibold cursor-pointer hover:bg-aegean-green/90 transition-colors">
                                Register
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

export function LoginInput({onLoginSuccess}:{onLoginSuccess:(name:string)=>void}) {
    return (
        <form className="flex items-center gap-2" onSubmit={ async (e)=>{
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const loginCredentials = formData.get("loginCredentials") as string
            const password = formData.get("password") as string
            
            const result = await loginUser({ loginCredentials, password })
            
            if(result && 'success' in result && result.success){
                onLoginSuccess(result.username as string)
            } else {
                alert("Wrong credentials, please try again.")
            }
        }}>
            <Input name="loginCredentials" placeholder="Username" type="text" className="w-24 h-8 bg-white/10 border-none px-2 rounded text-xs text-white placeholder:text-gray-400 outline-none focus:bg-white/20"/>
            <Input name="password" placeholder="Password" type="password" className="w-24 h-8 bg-white/10 border-none px-2 rounded text-xs text-white placeholder:text-gray-400 outline-none focus:bg-white/20"/>
            <button type="submit" className="text-aegean-white text-xs font-bold hover:text-aegean-green transition-colors cursor-pointer px-2 py-1">
                LOGIN
            </button>
        </form>
    )
}

export function UserMenu({ name, onLogout }: { name: string, onLogout: () => void }) {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-white hover:text-aegean-green border-none text-sm px-2">
                         {name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white text-aegean-dark rounded-md shadow-xl mt-2 border border-gray-200">
                        <ul className="p-2 min-w-35 flex flex-col gap-1">
                            <li>
                                <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors">Profile</Link>
                            </li>
                            <li>
                                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors">Orders</Link>
                            </li>
                            <li className="border-t border-gray-100 mt-1 pt-1">
                                <button 
                                    onClick={onLogout}
                                    className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 rounded transition-colors text-red-600 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}