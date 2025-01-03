import { DotsThree, ImageSquare, Link as LinkIcon, Check, House } from '@phosphor-icons/react'
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose
} from "./ui/drawer"
import { toCanvas } from 'html-to-image'
import { downloadImage } from '@/lib/utils'
import toast from 'react-hot-toast'
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import Link from 'next/link'

export function ShareButton({
    setIsDownloading
}: {
    setIsDownloading: (isDownloading: boolean) => void
}) {
    const saveAsImage = () => {
        setIsDownloading(true)
        const node = document.body;
        if (node) {

            toCanvas(node)
                .then(function (canvas: HTMLCanvasElement) {
                    downloadImage(canvas);
                })
                .catch(function (error) {
                    console.error('Error saving image:', error)
                }).finally(() => {
                    setIsDownloading(false)
                })
        } else {
            throw new Error('Node not found')
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <button className="p-2 rounded-full bg-white/40 hover:bg-white/10" title='Share'>
                    <DotsThree size={24} weight="bold" />
                </button>
            </DrawerTrigger>

            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className='text-center'>Share GitHub Card</DrawerTitle>
                    </DrawerHeader>

                    <div className="flex flex-col gap-4 p-4 items-center">
                        <DrawerClose asChild>
                            <Button
                                onClick={saveAsImage}
                                className="w-[200px] flex items-center justify-center gap-2 h-10"
                            >
                                <ImageSquare size={20} />
                                Save as Image
                            </Button>
                        </DrawerClose>

                        <div onClick={copyLink}>
                            <AnimatedSubscribeButton
                                buttonColor="#171717"
                                buttonTextColor="#ffffff"
                                subscribeStatus={false}
                                initialText={
                                    <span className="group inline-flex items-center gap-2 text-sm font-normal">
                                        <LinkIcon size={16} />
                                        Copy link
                                    </span>
                                }
                                changeText={
                                    <span className="group inline-flex items-center gap-2 text-sm font-normal">
                                        <Check size={16} />
                                        Copied
                                    </span>
                                }

                            />
                        </div>

                        <DrawerClose asChild>
                            <Link href='/' >
                                <Button variant="outline"
                                    className="w-[200px] flex items-center justify-center gap-2 h-10"
                                >
                                    <House size={20} />
                                    Back to Home
                                </Button>
                            </Link>
                        </DrawerClose>


                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}