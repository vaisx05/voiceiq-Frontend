"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Mic,
  Languages,
  UserCheck,
  Globe,
  Headphones,
  CircleCheck,
  FileAudio,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { X } from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";

const AbstractBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden">
    <div className="absolute w-full h-full opacity-90" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/5"></div>
    <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5"></div>
  </div>
);

const GlassCard = ({ children, className = "", delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <Card
      className={`bg-white/10 dark:bg-white/10 border border-white/10 shadow-xl backdrop-blur-md ${className}`}
    >
      {children}
    </Card>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <GlassCard
      delay={delay}
      className="overflow-hidden h-full transition-all duration-500"
    >
      <motion.div
        className="p-6 h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="mb-4"
        >
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 inline-block backdrop-blur-sm border border-white/10">
            <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
          </div>
        </motion.div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="dark:text-gray-300 text-sm text-gray-700">
          {description}
        </p>
      </motion.div>
    </GlassCard>
  );
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => setMounted(true), []);

  const steps = [
    {
      id: 1,
      title: "Upload",
      description: "Drag & drop your media files",
      icon: FileAudio,
    },
    {
      id: 2,
      title: "Process",
      description: "Our AI analyzes your content",
      icon: Sparkles,
    },
    {
      id: 3,
      title: "Review",
      description: "Examine the transcription results",
      icon: CircleCheck,
    },
  ];

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const PrimaryButton = ({ children, href, className = "" }: any) => (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Button
          onClick={() => {
            setShowLoginModal(true);
          }}
          variant="ghost"
          className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-white/10 ${className}`}
        >
          {children}
        </Button>
      </motion.div>
    </Link>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      if (!data.access_token) {
        setError("No token received from server.");
        setIsLoading(false);
        return;
      }

      // Decode the JWT to check the role
      const decoded: any = jwtDecode(data.access_token);

      document.cookie = `token=${data.access_token}; path=/; max-age=86400; Secure; SameSite=Lax`;
      setIsLoading(false);

      if (decoded.role === "super_admin") {
        router.push("/admin");
      } else {
        router.push("/upload");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <AbstractBackground />

      <div className=" mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-transparent bg-clip-text">
              Citrus IQ
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-700 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            AI-powered transcription with blazing speed and incredible accuracy
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PrimaryButton href="/">
              <Upload className="mr-2 h-4 w-4" />
              Start Transcribing
            </PrimaryButton>
          </motion.div>
        </motion.div>

        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-2xl font-semibold mb-10 text-center text-gray-700 dark:text-white"
          >
            Premium Features
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ">
            <FeatureCard
              icon={Mic}
              title="High Quality Transcription"
              description="Achieve up to 95% accuracy with our industry-leading AI transcription engine."
              delay={0.9}
            />
            <FeatureCard
              icon={Languages}
              title="100+ Languages Supported"
              description="Transcribe in English, Spanish, French, Hindi, and many more with ease."
              delay={1.0}
            />
            <FeatureCard
              icon={UserCheck}
              title="Speaker Recognition"
              description="Automatically identify and label different speakers in your audio."
              delay={1.1}
            />
            <FeatureCard
              icon={Globe}
              title="Auto Language Detection"
              description="Detect and switch between languages automatically in multilingual meetings."
              delay={1.2}
            />
          </div>
        </div>

        <GlassCard className="p-8" delay={1.3}>
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-10">
            Upload your audio, view detailed reports, and chat with your
            transcript in three simple steps.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent"
                    style={{ width: "calc(100% - 2rem)" }}
                  ></div>
                )}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4 backdrop-blur-sm border border-white/10">
                    <step.icon
                      className="h-8 w-8 text-blue-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                  <p className="dark:text-gray-300 text-sm text-gray-700">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col space-y-2 text-center mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                Blazing speed. Incredible accuracy.
              </h1>
              <p className="text-sm text-gray-400">
                Meet the new standard in AI transcription
              </p>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-md p-3 mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  autoComplete="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-white text-black rounded-md font-medium flex items-center justify-center"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <button className="text-blue-400 hover:underline">
                Get Started Free
              </button>
              <span className="px-1">—</span>
              No credit card required
            </div>
          </div>
        </div>
      )}
      {/* <VoiceIQLanding /> */}
    </div>
  );
}
