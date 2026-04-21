"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
  }
>(({ className, size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "lg" && "h-11 px-8",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

type TravelConnectSigninProps = {
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
  email: string;
  password: string;
  name?: string;
  country?: string;
  confirmPassword?: string;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
  isSubmitting?: boolean;
  isLoggedIn?: boolean;
  activeEmail?: string;
  error?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange?: (value: string) => void;
  onCountryChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword?: () => void;
  onGoogleSignIn: () => void | Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onSignOut?: () => void;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fillOpacity=".54"
      />
      <path
        fill="#4285F4"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#34A853"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
      <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
    </svg>
  );
}

const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
  {
    start: { x: 100, y: 150, delay: 0 },
    end: { x: 200, y: 80, delay: 2 },
    color: "#87c1e8"
  },
  {
    start: { x: 200, y: 80, delay: 2 },
    end: { x: 260, y: 120, delay: 4 },
    color: "#87c1e8"
  },
  {
    start: { x: 50, y: 50, delay: 1 },
    end: { x: 150, y: 180, delay: 3 },
    color: "#87c1e8"
  },
  {
    start: { x: 280, y: 60, delay: 0.5 },
    end: { x: 180, y: 180, delay: 2.5 },
    color: "#87c1e8"
  }
];

function generateDots(width: number, height: number) {
  const dots = [];
  const gap = 12;
  const dotRadius = 1;

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const isInMapShape =
        ((x < width * 0.25 && x > width * 0.05) &&
          (y < height * 0.4 && y > height * 0.1)) ||
        ((x < width * 0.25 && x > width * 0.15) &&
          (y < height * 0.8 && y > height * 0.4)) ||
        ((x < width * 0.45 && x > width * 0.3) &&
          (y < height * 0.35 && y > height * 0.15)) ||
        ((x < width * 0.5 && x > width * 0.35) &&
          (y < height * 0.65 && y > height * 0.35)) ||
        ((x < width * 0.7 && x > width * 0.45) &&
          (y < height * 0.5 && y > height * 0.1)) ||
        ((x < width * 0.8 && x > width * 0.65) &&
          (y < height * 0.8 && y > height * 0.6));

      if (isInMapShape && Math.random() > 0.3) {
        dots.push({
          x,
          y,
          radius: dotRadius,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    }
  }

  return dots;
}

function DotMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId = 0;
    let startTime = Date.now();

    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(95, 107, 122, ${dot.opacity * 0.9})`;
        ctx.fill();
      });
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;

      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#e9c98a";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(233, 201, 138, 0.25)";
        ctx.fill();

        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }

    function animate() {
      drawDots();
      drawRoutes();

      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        startTime = Date.now();
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export default function TravelConnectSignin({
  mode,
  onModeChange,
  email,
  password,
  name = "",
  country = "",
  confirmPassword = "",
  showPassword = false,
  showConfirmPassword = false,
  isSubmitting = false,
  isLoggedIn = false,
  activeEmail = "",
  error = "",
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onCountryChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onGoogleSignIn,
  onSubmit,
  onSignOut
}: TravelConnectSigninProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex min-h-dvh w-full box-border items-center justify-center px-4 pb-6 pt-20 md:px-8 md:pt-24">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
        <div className="flex w-full overflow-hidden rounded-[32px] border border-app-border bg-white/95 text-app-slate shadow-card backdrop-blur-sm md:min-h-[620px]">
          <div className="relative hidden w-1/2 overflow-hidden border-r border-app-border md:block md:min-h-[620px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(135,193,232,0.36),_transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.96),rgba(234,246,255,0.95),rgba(246,231,197,0.45))]">
              <DotMap />

              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-10 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-app-sandSoft to-app-skyDeep shadow-lg shadow-app-blue/20"
                >
                  <Compass className="h-7 w-7 text-app-slate" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mb-3 text-3xl font-bold text-app-slate"
                >
                  TripSense
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-sm text-sm leading-6 text-app-muted"
                >
                  Access your AI-curated trips and connect with travelers heading
                  to your next destination.
                </motion.p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col justify-center bg-white/90 px-6 py-8 sm:px-8 md:w-1/2 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-app-slate md:text-3xl">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mb-8 mt-1 text-sm text-app-muted">
                {mode === "signup"
                  ? "Sign up to save itineraries and personalize your travel flow."
                  : "Sign in to continue to your travel dashboard."}
              </p>

              <AnimatePresence mode="wait">
                {isLoggedIn ? (
                  <motion.div
                    key="logged-in"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                  >
                    Signed in as {activeEmail}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    void onGoogleSignIn();
                  }}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-app-border bg-white p-3 text-sm font-medium text-app-slate shadow-sm transition-all duration-300 hover:bg-app-sky/40"
                >
                  <GoogleIcon />
                  <span>Login with Google</span>
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-app-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-app-muted">or</span>
                </div>
              </div>

              <form className="space-y-5" onSubmit={onSubmit}>
                <AnimatePresence initial={false}>
                  {mode === "signup" ? (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 overflow-hidden"
                    >
                      <div>
                        <label
                          htmlFor="travel-connect-name"
                          className="mb-1 block text-sm font-medium text-app-slate"
                        >
                          Your Name <span className="text-app-blue">*</span>
                        </label>
                        <Input
                          id="travel-connect-name"
                          type="text"
                          value={name}
                          onChange={(event) => onNameChange?.(event.target.value)}
                          placeholder="Enter your name"
                          className="w-full rounded-2xl border-app-border bg-white text-app-slate placeholder:text-app-muted focus-visible:border-app-blue focus-visible:ring-2 focus-visible:ring-app-skyDeep/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="travel-connect-country"
                          className="mb-1 block text-sm font-medium text-app-slate"
                        >
                          Country <span className="text-app-blue">*</span>
                        </label>
                        <Input
                          id="travel-connect-country"
                          type="text"
                          value={country}
                          onChange={(event) => onCountryChange?.(event.target.value)}
                          placeholder="Enter your country"
                          className="w-full rounded-2xl border-app-border bg-white text-app-slate placeholder:text-app-muted focus-visible:border-app-blue focus-visible:ring-2 focus-visible:ring-app-skyDeep/50"
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div>
                  <label
                    htmlFor="travel-connect-email"
                    className="mb-1 block text-sm font-medium text-app-slate"
                  >
                    Email <span className="text-app-blue">*</span>
                  </label>
                  <Input
                    id="travel-connect-email"
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full rounded-2xl border-app-border bg-white text-app-slate placeholder:text-app-muted focus-visible:border-app-blue focus-visible:ring-2 focus-visible:ring-app-skyDeep/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="travel-connect-password"
                    className="mb-1 block text-sm font-medium text-app-slate"
                  >
                    Password <span className="text-app-blue">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="travel-connect-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => onPasswordChange(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-2xl border-app-border bg-white pr-10 text-app-slate placeholder:text-app-muted focus-visible:border-app-blue focus-visible:ring-2 focus-visible:ring-app-skyDeep/50"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-app-muted transition hover:text-app-slate"
                      onClick={onTogglePassword}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {mode === "signup" ? (
                    <motion.div
                      key="confirm-password"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label
                        htmlFor="travel-connect-confirm-password"
                        className="mb-1 block text-sm font-medium text-app-slate"
                      >
                        Confirm Password <span className="text-app-blue">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="travel-connect-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) =>
                            onConfirmPasswordChange?.(event.target.value)
                          }
                          placeholder="Re-enter your password"
                          className="w-full rounded-2xl border-app-border bg-white pr-10 text-app-slate placeholder:text-app-muted focus-visible:border-app-blue focus-visible:ring-2 focus-visible:ring-app-skyDeep/50"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-app-muted transition hover:text-app-slate"
                          onClick={() => onToggleConfirmPassword?.()}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "relative w-full overflow-hidden rounded-2xl bg-app-slate py-2 text-white transition-all duration-300 hover:bg-slate-800",
                      isHovered && "shadow-lg shadow-slate-900/15"
                    )}
                  >
                    <span className="flex items-center justify-center">
                      {isSubmitting
                        ? "Please wait..."
                        : mode === "signup"
                          ? "Create Account"
                          : "Sign in"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>

                    {isHovered ? (
                      <motion.span
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="absolute bottom-0 top-0 left-0 w-20 bg-gradient-to-r from-transparent via-app-sandSoft/40 to-transparent"
                        style={{ filter: "blur(8px)" }}
                      />
                    ) : null}
                  </Button>
                </motion.div>

                <div className="text-center">
                  <Link
                    href="#"
                    className="text-sm text-app-muted transition-colors hover:text-app-slate"
                  >
                    Forgot password?
                  </Link>
                </div>
              </form>

              {error ? (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {error}
                </p>
              ) : null}

              <p className="mt-6 text-center text-sm text-app-muted">
                {mode === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() =>
                    onModeChange(mode === "signin" ? "signup" : "signin")
                  }
                  className="font-semibold text-app-slate transition hover:text-app-muted"
                >
                  {mode === "signup" ? "Sign in" : "Sign up"}
                </button>
              </p>

              {isLoggedIn ? (
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    href="/trips"
                    className="rounded-full border border-app-border px-4 py-1.5 text-xs font-semibold text-app-slate transition hover:bg-app-sky/40"
                  >
                    Go to My Trips
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
