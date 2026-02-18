import { auth, signOut } from "@/auth"
import Image from "next/image"

export default async function UserNav() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {session.user.name}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{session.user.email}</p>
      </div>

      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || "User"}
          width={40}
          height={40}
          className="rounded-full border-2 border-zinc-200 dark:border-zinc-800"
        />
      )}

      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
}
