'use client'
import ShinyButton from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useRouter } from 'next/navigation'

export function InputUsername() {
    const [username, setUsername] = useState("");
    const router = useRouter();

    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (username) {
            router.push(`/${username}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-[90%] max-w-sm items-center gap-2 bg-white shadow-md rounded-lg p-2">
            <Input type="text" placeholder="Github Username" className='flex-1 text-black' value={username} onChange={(e) => setUsername(e.target.value.trim())} />
            <ShinyButton type="submit">✨Get Mine </ShinyButton>
        </form>
    )
}