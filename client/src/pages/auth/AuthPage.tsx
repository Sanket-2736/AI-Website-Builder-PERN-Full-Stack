import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="p-6 flex justify-center flex-col items-center h-[80vh]">
      <AuthView pathname={pathname} classNames={{base : 'bg-black/60 ring ring-indigo-900'}}/>
    </main>
  )
}