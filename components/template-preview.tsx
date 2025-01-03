"use client";

import { Templates } from "@/lib/constant";
import { InputUsername } from "@/components/input-username";
import Image from "next/image";
import PreviewLinktree from "@/public/preview/linktree.png";
import PreviewContribute from "@/public/preview/contribute.png";
import { useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";

export function TemplatePreview() {
  const [template, setTemplate] = useState(Templates[0].value);
  const preview = template === "linktree" ? PreviewLinktree : PreviewContribute;

  return (
    <div className="shadow-xl relative bg-white/40 p-4 rounded-2xl ">
      <div className="flex flex-col sm:flex-row  overflow-hidden rounded-lg">
        <InputUsername onTemplateChange={setTemplate} />
        <div className="w-[320px] sm:w-[335px] h-[504px] relative">
          <Image src={preview} alt="Preview" className="w-full" />
        </div>
      </div>
      <BorderBeam size={250} duration={10} delay={9} />
    </div>
  );
}
