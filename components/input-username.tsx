"use client";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Templates } from "@/lib/constant";
import PulsatingButton from "@/components/ui/pulsating-button";

export function InputUsername({
  onTemplateChange,
}: {
  onTemplateChange?: (template: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [template, setTemplate] = useState(Templates[0].value);
  const router = useRouter();

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (username) {
      router.push(`/${username}?template=${template}`);
    }
  };

  useEffect(() => {
    onTemplateChange?.(template);
  }, [template, onTemplateChange]);

  return (
    <form
      onSubmit={handleSubmit}
      className="sm:w-[320px] bg-white p-6 text-gray-800 relative mx-auto"
    >
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Generate Your Card</h2>
          <p className="text-sm text-gray-600">
            Enter your Github username to create card
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Input Username"
            className="flex-1 text-gray-800 h-10"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
          />
          <PulsatingButton type="submit" pulseColor="#FFBE7B" className="bg-orange-600 text-white">✨ Generate</PulsatingButton>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium mb-3 block ">
            Select Template:
          </label>
          <RadioGroup value={template} onValueChange={setTemplate}>
            {Templates.map((item) => (
              <div
                className={`flex items-center space-x-3 hover:bg-gray-100 p-2 rounded-md transition-colors ${item.value === template ? "bg-gray-200" : ""
                  }`}
                key={item.value}
              >
                <Label
                  htmlFor={item.value}
                  className={`text-sm cursor-pointer flex-1 ${item.value === template
                    ? "text-orange-600"
                    : "text-gray-600"
                    }`}
                >
                  {item.label}
                </Label>
                <RadioGroupItem value={item.value} id={item.value} />
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </form>
  );
}
