/* eslint-disable @next/next/no-img-element */
// import Image from 'next/image'
import { ContributionGrade } from "@/components/contribution-grade";

import { GitHubData } from "@/lib/types";

export function ProfileTotal({ userData }: { userData: GitHubData }) {
  return (
    <div className="flex flex-col items-center">
      <a
        href={`https://github.com/${userData.login}`}
        target="_blank"
        className="w-32 h-32 rounded-full mb-6 relative"
      >
        <img
          src={userData.avatar_url}
          alt="Profile"
          width={128}
          height={128}
          className="object-cover rounded-full"
        />
        <div className="absolute bottom-0 right-0">
          <ContributionGrade grade={userData.contribution_grade} />
        </div>
      </a>
      <h1 className="text-2xl font-bold mb-2">
        {userData.name || userData.login}
      </h1>
      <p className="text-gray-200">{userData.bio || "No bio available"}</p>
    </div>
  );
}
