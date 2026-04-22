"use client";

import { FormEvent, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import TravelConnectSignin from "@/components/ui/travel-connect-signin";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { SparklesCore } from "@/components/ui/sparkles";
import GlobeDemo from "@/components/ui/globe-demo";
import TrailCardDemo from "@/components/ui/trail-card-demo";

function DemoAiAssistatBasic() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    console.log("Demo submit", { mode, name, country, email, password, confirmPassword });
  };

  return (
    <TravelConnectSignin
      mode={mode}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setError("");
      }}
      email={email}
      password={password}
      name={name}
      country={country}
      confirmPassword={confirmPassword}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onNameChange={setName}
      onCountryChange={setCountry}
      onConfirmPasswordChange={setConfirmPassword}
      onTogglePassword={() => setShowPassword((prev) => !prev)}
      onToggleConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
      onGoogleSignIn={() => console.log("Demo Google sign-in")}
      onSubmit={handleSubmit}
    />
  );
}

function FloatingActionMenuDemo() {
  return (
    <FloatingActionMenu
      className="relative bottom-auto right-auto"
      options={[
        {
          label: "Account",
          Icon: <User className="h-4 w-4" />,
          onClick: () => console.log("Account clicked")
        },
        {
          label: "Settings",
          Icon: <Settings className="h-4 w-4" />,
          onClick: () => console.log("Settings clicked")
        },
        {
          label: "Logout",
          Icon: <LogOut className="h-4 w-4" />,
          onClick: () => console.log("Logout clicked")
        }
      ]}
    />
  );
}

function MotionFooterDemo() {
  return (
    <div className="relative w-full overflow-x-hidden bg-background min-h-screen font-sans">
      <main className="relative z-10 flex min-h-[120vh] w-full flex-col items-center justify-center rounded-b-3xl border-b border-white/10 bg-background shadow-sm">
        <h1 className="mb-8 px-4 text-center text-4xl font-light uppercase tracking-[0.2em] text-neutral-400 md:text-5xl">
          Scroll down to reveal
        </h1>
        <div className="h-32 w-px bg-gradient-to-b from-neutral-400 to-transparent" />
      </main>
      <CinematicFooter />
    </div>
  );
}

function SparklesPreview() {
  return (
    <div className="relative flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-slate-950">
      <h1 className="relative z-20 text-center text-3xl font-bold text-white md:text-7xl lg:text-9xl">
        TripSense
      </h1>
      <div className="relative h-40 w-[40rem]">
        <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
        <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
        <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="h-full w-full"
          particleColor="#FFFFFF"
        />
        <div className="absolute inset-0 h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
      </div>
    </div>
  );
}

export {
  DemoAiAssistatBasic,
  FloatingActionMenuDemo,
  MotionFooterDemo,
  SparklesPreview,
  GlobeDemo,
  TrailCardDemo
};

