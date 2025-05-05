import { Navbar } from "@/components/auth/navbar";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  DownloadCloud,
  Share2,
  QrCode,
  Trophy,
  Github,
  Users,
  Star,
  GitCommit,
} from "lucide-react";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "User Guide | GitHub Card",
  description:
    "Complete guide on how to use GitHub Card to create, customize, and share your GitHub profile cards",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar showLinks={true} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            GitHub Card User Guide
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transform your GitHub profile into beautiful shareable cards,
            showcasing your development achievements and contributions
          </p>
        </div>

        {/* Table of contents */}
        <div className="bg-[#161b22] rounded-lg p-6 mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Contents</h2>
          <ul className="space-y-3">
            <li>
              <a href="#introduction" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Project Introduction
                </span>
              </a>
            </li>
            <li>
              <a href="#login" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Registration and Login
                </span>
              </a>
            </li>
            <li>
              <a href="#features" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Main Features
                </span>
              </a>
            </li>
            <li>
              <a href="#templates" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Choose Template Style
                </span>
              </a>
            </li>
            <li>
              <a href="#sharing" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Share Cards
                </span>
              </a>
            </li>
            <li>
              <a href="#leaderboard" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Leaderboard Feature
                </span>
              </a>
            </li>
            <li>
              <a href="#faq" className="flex items-center group">
                <ChevronRight className="h-4 w-4 mr-2 text-[#fa7b19] transition-transform group-hover:translate-x-1" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Frequently Asked Questions
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* Introduction section */}
        <section id="introduction" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Project Introduction
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <p className="text-gray-300 mb-4">
                    GitHub Card is a tool designed specifically for developers
                    to transform your GitHub profile and contribution data into
                    beautiful visualization cards.
                  </p>
                  <p className="text-gray-300 mb-4">
                    These cards can be shared on social media, displayed on your
                    personal website, or used in your resume to showcase your
                    development achievements.
                  </p>
                  <p className="text-gray-300">
                    GitHub Card offers various template styles, supports
                    real-time data updates, and allows for easy sharing of your
                    cards via links or images.
                  </p>
                </div>
                <div className="md:w-1/2 relative min-h-[440px]">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden p-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="bg-[#0d1117] p-4 rounded-lg flex flex-col items-center">
                        <Github className="h-8 w-8 text-[#fa7b19] mb-2" />
                        <span className="text-sm">GitHub Data</span>
                      </div>
                      <ChevronRight className="h-6 w-6 text-[#fa7b19] transform rotate-90" />
                      <div className="bg-[#0d1117] p-4 rounded-lg flex flex-col items-center">
                        <Image
                          src="/logo.png"
                          alt="GitHub Card Logo"
                          width={32}
                          height={32}
                          className="mb-2"
                        />
                        <span className="text-sm">Process Conversion</span>
                      </div>
                      <ChevronRight className="h-6 w-6 text-[#fa7b19] transform rotate-90" />
                      <div className="bg-[#0d1117] p-4 rounded-lg flex flex-col items-center">
                        <Image
                          src="/preview/contribute.png"
                          alt="Card Preview"
                          width={32}
                          height={32}
                          className="mb-2 rounded"
                        />
                        <span className="text-sm">Beautiful Card</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Login section */}
        <section id="login" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Registration and Login
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold mb-4">
                    Login with GitHub Account
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                    <li>Visit the GitHub Card homepage</li>
                    <li>
                      Click the &ldquo;Login&rdquo; button in the top right
                      corner
                    </li>
                    <li>
                      The system will direct you to the GitHub authorization
                      page
                    </li>
                    <li>
                      After confirming authorization, you will automatically
                      return to the GitHub Card website
                    </li>
                  </ol>
                  <div className="mt-6 p-4 bg-[#0d1117] rounded-lg border border-[#30363d]">
                    <p className="text-gray-300 text-sm">
                      <strong>Note</strong>: GitHub Card needs access to your
                      basic GitHub profile information and contribution data,
                      but will not obtain or store your sensitive information.
                      The authorization process is completely secure and
                      complies with GitHub OAuth standards.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 relative min-h-64">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden p-4">
                    <div className="flex flex-col items-center">
                      <div className="relative w-64 h-12 bg-[#0d1117] rounded-md mb-4 flex items-center justify-center">
                        <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="absolute top-1 left-4 w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="absolute top-1 left-7 w-2 h-2 rounded-full bg-green-500"></span>
                        <div className="flex items-center justify-center gap-2 bg-[#21262d] px-4 py-2 rounded-md">
                          <Github className="h-5 w-5" />
                          <span className="text-sm">Login with GitHub</span>
                        </div>
                      </div>
                      <div className="w-32 h-32 bg-[#0d1117] rounded-md flex flex-col items-center justify-center p-4">
                        <Github className="h-10 w-10 text-[#fa7b19] mb-2" />
                        <span className="text-xs text-center">
                          Authorize GitHub Card to access your public data
                        </span>
                      </div>
                      <ChevronRight className="h-6 w-6 text-[#fa7b19] my-2 transform rotate-90" />
                      <div className="w-46 h-10 bg-[#fa7b19] rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold">
                          Authorization Complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Main Features
              </h2>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  Create Personal GitHub Cards
                </h3>
                <p className="text-gray-300 mb-4">
                  After successful login, the system will automatically retrieve
                  your GitHub data, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0d1117] p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-[#fa7b19] mr-2" />
                      <span className="font-semibold">Basic Profile</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Includes username, avatar, and personal bio
                    </p>
                  </div>
                  <div className="bg-[#0d1117] p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-[#fa7b19] mr-2" />
                      <span className="font-semibold">
                        Repository Statistics
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Shows number of repositories, stars received, and
                      followers
                    </p>
                  </div>
                  <div className="bg-[#0d1117] p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <GitCommit className="h-5 w-5 text-[#fa7b19] mr-2" />
                      <span className="font-semibold">Contribution Data</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Displays your contribution heatmap and total contributions
                    </p>
                  </div>
                </div>
                <p className="text-gray-300">
                  This data will be used to generate your personalized GitHub
                  card, making it easy to showcase your coding activity and
                  development achievements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Templates section */}
        <section id="templates" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Choose Template Style
              </h2>
              <p className="text-gray-300 mb-6">
                GitHub Card offers three beautiful templates, each with
                different layouts and design styles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#0d1117] rounded-lg overflow-hidden">
                  <div className="h-48 relative">
                    <Image
                      src="/preview/contribute.png"
                      alt="Contribution Template"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Contribute Template
                    </h3>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                      <li>Highlights your GitHub contribution heatmap</li>
                      <li>
                        Prominently displays total contributions and activity
                      </li>
                      <li>
                        Perfect for showcasing your coding consistency and
                        activity
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#0d1117] rounded-lg overflow-hidden">
                  <div className="h-48 relative">
                    <Image
                      src="/preview/linktree.png"
                      alt="Linktree Template"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Linktree Template
                    </h3>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                      <li>
                        Concisely displays your profile and key statistics
                      </li>
                      <li>Provides a social media-style link layout</li>
                      <li>
                        Ideal as a personal homepage or for sharing on social
                        media
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#0d1117] rounded-lg overflow-hidden">
                  <div className="h-48 relative">
                    <Image
                      src="/preview/flomo.png"
                      alt="Flomo Template"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Flomo Template
                    </h3>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                      <li>
                        Uses a card-based design inspired by popular note-taking
                        apps
                      </li>
                      <li>
                        Beautiful typography highlighting personal statistics
                      </li>
                      <li>Suitable for personal brand presentation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] p-4 rounded-lg mt-6">
                <h4 className="text-lg font-semibold mb-2">
                  Steps to choose a template:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>
                    Click on any template card in the &ldquo;Template
                    Gallery&rdquo; area on the homepage
                  </li>
                  <li>Click the &ldquo;Use Template&rdquo; button</li>
                  <li>
                    The system will generate a preview showing how your personal
                    data looks in that template
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Sharing section */}
        <section id="sharing" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Share Cards
              </h2>
              <p className="text-gray-300 mb-6">
                After generating your card, you can share your GitHub card in
                multiple ways.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#0d1117] rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Share2 className="h-8 w-8 text-[#fa7b19] mr-3" />
                    <h3 className="text-lg font-semibold">
                      Generate Share Link
                    </h3>
                  </div>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                    <li>
                      Click the share button (three dots icon) on the card
                    </li>
                    <li>
                      Select &ldquo;Copy Link&rdquo; in the drawer menu that
                      appears
                    </li>
                    <li>
                      The system will generate a unique link valid for 3 days
                    </li>
                    <li>
                      The link is copied to your clipboard and can be pasted
                      anywhere to share
                    </li>
                  </ol>
                </div>

                <div className="bg-[#0d1117] rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <DownloadCloud className="h-8 w-8 text-[#fa7b19] mr-3" />
                    <h3 className="text-lg font-semibold">Save as Image</h3>
                  </div>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                    <li>Click the share button on the card</li>
                    <li>
                      Select &ldquo;Save as Image&rdquo; in the drawer menu
                    </li>
                    <li>
                      The system will generate a high-definition image for you
                      to download
                    </li>
                    <li>
                      The downloaded image can be used on social media, resumes,
                      or personal websites
                    </li>
                  </ol>
                </div>

                <div className="bg-[#0d1117] rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <QrCode className="h-8 w-8 text-[#fa7b19] mr-3" />
                    <h3 className="text-lg font-semibold">QR Code Sharing</h3>
                  </div>
                  <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                    <li>
                      A QR code is displayed at the bottom of the card page
                    </li>
                    <li>
                      Scanning the QR code provides direct access to your
                      card&apos;s share link
                    </li>
                    <li>
                      Convenient for quickly sharing between mobile devices
                    </li>
                  </ol>
                </div>
              </div>

              <div className="bg-[#0d1117] p-5 rounded-lg flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white p-2 rounded-lg flex-shrink-0">
                  <div className="w-full h-full bg-[#0d1117] flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Sharing Example
                  </h4>
                  <p className="text-gray-400 mb-3">
                    Through the share link, anyone can view your GitHub card
                    without logging in. The link is valid for 3 days, and you
                    can generate a new one at any time.
                  </p>
                  <p className="text-gray-400">
                    After saving the image, you can directly upload it to your
                    social media, personal website, or online resume to showcase
                    your GitHub achievements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard section */}
        <section id="leaderboard" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Leaderboard Feature
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <p className="text-gray-300 mb-4">
                    GitHub Card has a contribution leaderboard that ranks
                    platform users by their contribution level.
                  </p>

                  <h3 className="text-xl font-semibold mt-6 mb-3">
                    View Leaderboard
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4 mb-6">
                    <li>
                      Click the &ldquo;Leaderboard&rdquo; link in the navigation
                      bar
                    </li>
                    <li>
                      The system will display the top 20 users sorted by
                      contribution score
                    </li>
                    <li>
                      If you&apos;re not in the top 20, your ranking information
                      will be shown separately at the bottom of the page
                    </li>
                  </ol>

                  <h3 className="text-xl font-semibold mt-6 mb-3">
                    Contribution Levels
                  </h3>
                  <p className="text-gray-300 mb-3">
                    The system categorizes users into the following levels based
                    on contribution scores:
                  </p>
                  <ul className="space-y-2 text-gray-300 ml-4">
                    <li>
                      <span className="text-red-400 font-bold">Level S</span>:
                      Top contributors (top 1%)
                    </li>
                    <li>
                      <span className="text-orange-400 font-bold">Level A</span>
                      : Excellent contributors (top 10%)
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Level B</span>
                      : Active contributors (top 25%)
                    </li>
                    <li>
                      <span className="text-green-400 font-bold">Level C</span>:
                      Regular contributors (top 50%)
                    </li>
                    <li>
                      <span className="text-blue-400 font-bold">Level D</span>:
                      New contributors (others)
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 relative">
                  <div className="bg-[#0d1117] rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
                      <h3 className="text-lg font-semibold">
                        Contribution Leaderboard
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center p-2 bg-[#161b22] rounded-md">
                        <span className="w-8 text-center font-bold">1</span>
                        <div className="w-8 h-8 bg-gray-700 rounded-full mx-3"></div>
                        <span className="flex-1">user1</span>
                        <span className="bg-red-400/20 text-red-400 px-2 py-1 rounded text-xs font-bold">
                          S
                        </span>
                        <span className="ml-3 text-sm">9876</span>
                      </div>
                      <div className="flex items-center p-2 bg-[#161b22] rounded-md">
                        <span className="w-8 text-center font-bold">2</span>
                        <div className="w-8 h-8 bg-gray-700 rounded-full mx-3"></div>
                        <span className="flex-1">user2</span>
                        <span className="bg-orange-400/20 text-orange-400 px-2 py-1 rounded text-xs font-bold">
                          A
                        </span>
                        <span className="ml-3 text-sm">8765</span>
                      </div>
                      <div className="flex items-center p-2 bg-[#161b22] rounded-md">
                        <span className="w-8 text-center font-bold">3</span>
                        <div className="w-8 h-8 bg-gray-700 rounded-full mx-3"></div>
                        <span className="flex-1">user3</span>
                        <span className="bg-orange-400/20 text-orange-400 px-2 py-1 rounded text-xs font-bold">
                          A
                        </span>
                        <span className="ml-3 text-sm">7654</span>
                      </div>
                      <div className="mt-4 border-t border-[#30363d] pt-4 flex items-center p-2 bg-[#21262d] rounded-md">
                        <span className="w-8 text-center font-bold">42</span>
                        <div className="w-8 h-8 bg-gray-700 rounded-full mx-3"></div>
                        <span className="flex-1">Your username</span>
                        <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                          C
                        </span>
                        <span className="ml-3 text-sm">2345</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                      The leaderboard updates automatically every hour to ensure
                      data timeliness
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section id="faq" className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0d1117] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    How often is my GitHub data updated?
                  </h3>
                  <p className="text-gray-400">
                    Your GitHub data is automatically updated each time you
                    generate a card. The system caches data for 24 hours to
                    reduce GitHub API calls and improve performance.
                  </p>
                </div>

                <div className="bg-[#0d1117] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    How long are share links valid?
                  </h3>
                  <p className="text-gray-400">
                    Share links are valid for 3 days. After expiration,
                    accessing the link will display an expiration message.
                  </p>
                </div>

                <div className="bg-[#0d1117] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    Can I customize the card content?
                  </h3>
                  <p className="text-gray-400">
                    Currently, card content is automatically generated based on
                    your GitHub data. We&apos;re developing more customization
                    options, stay tuned.
                  </p>
                </div>

                <div className="bg-[#0d1117] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    Why does my contribution heatmap look different from the one
                    on GitHub?
                  </h3>
                  <p className="text-gray-400">
                    GitHub Card uses the GitHub API to get your contribution
                    data, which may differ slightly from what is displayed on
                    the GitHub website, especially in terms of time zones and
                    recent contributions.
                  </p>
                </div>

                <div className="bg-[#0d1117] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    The total contributions shown on the card don&apos;t match
                    those on my GitHub profile?
                  </h3>
                  <p className="text-gray-400">
                    GitHub Card calculates your total contributions over all
                    time, while the GitHub profile page typically shows
                    contributions within a year.
                  </p>
                </div>

                <div className="bg-[#0d1117] p-5 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">
                    How is my ranking calculated?
                  </h3>
                  <p className="text-gray-400">
                    Rankings are based on a comprehensive algorithm that
                    considers your total contributions, repository star count,
                    number of followers, account age, and other factors to
                    provide a more complete assessment of activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick start guide */}
        <section className="mb-16">
          <div className="bg-[#161b22] rounded-lg overflow-hidden max-w-5xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-[#fa7b19]">
                Quick Start Guide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0d1117] p-4 rounded-lg">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#fa7b19] rounded-full mb-4">
                    <span className="font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Login</h3>
                  <p className="text-gray-400 text-sm">
                    Login to the system with your GitHub account
                  </p>
                </div>

                <div className="bg-[#0d1117] p-4 rounded-lg">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#fa7b19] rounded-full mb-4">
                    <span className="font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Choose Template
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Browse and select a template style you like
                  </p>
                </div>

                <div className="bg-[#0d1117] p-4 rounded-lg">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#fa7b19] rounded-full mb-4">
                    <span className="font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Generate Card</h3>
                  <p className="text-gray-400 text-sm">
                    The system automatically retrieves your GitHub data and
                    generates a card
                  </p>
                </div>

                <div className="bg-[#0d1117] p-4 rounded-lg">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#fa7b19] rounded-full mb-4">
                    <span className="font-bold text-xl">4</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Share</h3>
                  <p className="text-gray-400 text-sm">
                    Share your card via link, image, or QR code
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/#templates">
                  <button className="bg-[#fa7b19] hover:bg-[#e76b0a] text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer">
                    Start Creating My Card
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
