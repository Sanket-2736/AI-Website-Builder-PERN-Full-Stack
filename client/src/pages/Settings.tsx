import { AccountSettingsCards, ChangePasswordCard, DeleteAccountCard } from "@daveyplate/better-auth-ui"

export default function SettingsPage() {
  return (
    <div className="flex w-full p-4 items-center justify-center flex-col gap-6 py-12 min-h-[90vh]">
      <AccountSettingsCards classNames={{
        card : {
            base : 'bg-black/10 ring ring-indigo-950 max-w-xl mx-auto',
            footer : 'bg-black/10 ring ring-indigo-950'
        }
      }} />
      <div className="w-full">
            <ChangePasswordCard classNames={{
                base : 'bg-black/10 ring ring-indigo-950 max-w-xl mx-auto',
                footer : 'bg-black/10 ring ring-indigo-950'
            }} />
        </div>
        <div className="w-full">
            <DeleteAccountCard classNames={{
                base : 'bg-black/10 ring ring-indigo-950 max-w-xl mx-auto',
            }}  />
        </div>
    </div>
  )
}