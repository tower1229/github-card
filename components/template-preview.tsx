"use client";

import { Templates } from "@/lib/constant";
import { InputUsername } from "@/components/input-username";
import Image from "next/image";
import PreviewLinktree from "@/public/preview/linktree.png";
import PreviewContribute from "@/public/preview/contribute.png";
import { useState } from "react";

export function TemplatePreview() {
  const [template, setTemplate] = useState(Templates[0].value);
  const preview = template === "linktree" ? PreviewLinktree : PreviewContribute;

  return (
    <div className="flex-1 overflow-hidden flex items-center justify-center">
      <div className="flex gap-8 flex-col sm:flex-row">
        <InputUsername onTemplateChange={setTemplate} />
        <div className="rounded-lg overflow-hidden shadow-xl w-[335px] h-[504px] relative">
          <Image src={preview} alt="Preview" className="w-full" />
        </div>
      </div>
    </div>
  );
}
