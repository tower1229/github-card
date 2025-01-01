'use client'
import ShinyButton from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useRouter } from 'next/navigation'

export function InputUsername() {
    const [username, setUsername] = useState("");
    const router = useRouter();

    return (
        <>
            <Input type="text" placeholder="Github Username" className='flex-1 text-black' value={username} onChange={(e) => setUsername(e.target.value.trim())} />
            <ShinyButton onClick={() => {
                if (username) {
                    router.push(`/${username}`);
                }
            }}>✨Get Mine </ShinyButton>
        </>
    )
}