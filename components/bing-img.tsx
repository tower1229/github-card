'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export function BingImg({ className = '' }: { className?: string }) {
    const [bgUrl, setBgUrl] = useState<string | null>(null)

    const fetchBgUrl = async () => {
        try {
            const response = await fetch('/api/background')
            const data = await response.json()
            console.log(data)
            if (data.success) {
                setBgUrl(data.url)
            }
        } catch (error) {
            console.error('Error fetching background URL:', error)
        }
    }

    useEffect(() => {
        fetchBgUrl()
    }, [])


    return <Image src={bgUrl || `https://www.bing.com/th?id=OHR.Rivendell_ZH-CN6669549862_1920x1080.jpg`} alt="Background" fill className={className} />
}
