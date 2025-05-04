"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const TEMPLATE_OPTIONS = [
  { id: "default", name: "Default" },
  { id: "dark", name: "Dark Theme" },
  { id: "minimal", name: "Minimal" },
  { id: "contribute", name: "Contributions" },
  { id: "linktree", name: "LinkTree" },
  { id: "flomo", name: "Flomo" },
];

export function CardGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState("default");
  const router = useRouter();
  const { data: session } = useSession();

  const generateCard = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!session?.user) {
        throw new Error("You must be logged in to generate a card");
      }

      const response = await fetch("/api/share-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate card");
      }

      const data = await response.json();

      // Success, redirect to share page
      router.push(`/shared/${data.shareUrl.split("/").pop()}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-generator p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-white">
        Generate GitHub Card
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-300">
          Template Style
        </label>
        <select
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          {TEMPLATE_OPTIONS.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={generateCard}
        disabled={loading || !session}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate GitHub Card"}
      </Button>

      {error && <div className="mt-2 text-red-500">{error}</div>}

      {!session && (
        <div className="mt-2 text-amber-400 text-sm">
          You need to be logged in to generate a card
        </div>
      )}
    </div>
  );
}
