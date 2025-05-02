import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";

export function ContributionGrade({ grade }: { grade: string }) {
  return (
    <div className="z-10 mt-4">
      <AnimatedGradientText className="bg-black rounded-full flex items-center justify-center w-12 h-12">
        <span
          className={cn(
            ` animate-gradient text-2xl font-bold bg-linear-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
          )}
        >
          {grade}
        </span>
      </AnimatedGradientText>
    </div>
  );
}
