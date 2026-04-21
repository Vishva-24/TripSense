"use client";

import { FormEvent, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import TravelConnectSignin from "@/components/ui/travel-connect-signin";

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

export { DemoAiAssistatBasic, FloatingActionMenuDemo };
