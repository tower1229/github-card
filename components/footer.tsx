import { GithubLogo, } from '@phosphor-icons/react/dist/ssr'
import Qrcode from "qrcode"
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";

export function Footer({ showQrcode = false }: { showQrcode?: boolean }) {

    if (showQrcode) {
        Qrcode.toCanvas(document.getElementById("canvas"), window.location.href, {
            margin: 2,
            width: 100,
        })
    }

    return (
        <div className="z-10 flex min-h-40 flex-col items-center justify-center gap-4 p-4 mt-10">
            {showQrcode && <canvas id="canvas"></canvas>}
            <a href={process.env.NEXT_PUBLIC_APP_URL} >
                <AnimatedGradientText className='bg-black/40'>
                    <GithubLogo size={20} />
                    <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
                    <span
                        className={cn(
                            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                        )}
                    >Github Card</span>
                </AnimatedGradientText>
            </a>
        </div >
    );
}