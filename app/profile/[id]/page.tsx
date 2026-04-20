import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/getSession'
import { getUserFromDb } from '@/lib/db'

import Image from 'next/image'
export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  if (session.userId !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to view this profile.</p>
      </div>
    )
  }

  const user = await getUserFromDb(id)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col justify-center items-center h-full w-full gap-4">
      <h1 className="font-bold text-4xl text-center text-aegean-dark mt-10">
        Profile
      </h1>
      <div className="border border-aegean-gray shadow-md w-full h-auto max-w-md p-6 rounded-lg flex flex-col items-center gap-4 m-6 shadow-aegean-green/20">
        <div className="h-12 w-full relative">
          <Image
            src="/images/userDefaultImage.png"
            alt="User Default Image"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="font-bold text-xl">
          Hello {user.role},{' '}
          <span className=" text-aegean-dark">{user.username}</span>
        </h2>
        <div className="flex flex-col">
          <label className="pt-2 text-aegean-dark" htmlFor="username">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            defaultValue={user.username}
            className="bg-aegean-gray/50 rounded-md px-2 py-1 focus:ring-1 focus:ring-aegean-terracotta focus:ring-opacity-20 focus:outline-none transition-all"
            readOnly
          />
          <label className="pt-2 text-aegean-dark" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user.email}
            className="bg-aegean-gray/50 rounded-md px-2 py-1 focus:ring-1 focus:ring-aegean-terracotta focus:ring-opacity-20 focus:outline-none transition-all"
            readOnly
          />
          <label className="pt-2 text-aegean-dark" htmlFor="address">
            Address:
          </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={user.address}
            className="bg-aegean-gray/50 rounded-md px-2 py-1 focus:ring-1 focus:ring-aegean-terracotta focus:ring-opacity-20 focus:outline-none transition-all"
            readOnly
          />
          <label className="pt-2 text-aegean-dark" htmlFor="phone">
            Phone:
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            defaultValue={user.phone}
            className="bg-aegean-gray/50 rounded-md px-2 py-1 focus:ring-1 focus:ring-aegean-terracotta focus:ring-opacity-20 focus:outline-none transition-all"
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
