import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextInput } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";
type SignupStep = "credentials" | "otp";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, startSignup, verifySignup } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>("credentials");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | undefined>();

  if (isAuthenticated) {
    return <Navigate to="/title" replace />;
  }

  const isLogin = mode === "login";

  const canSubmit = useMemo(() => {
    if (isLogin) {
      return Boolean(identifier && password);
    }

    if (signupStep === "credentials") {
      return Boolean(username && email && password);
    }

    return otp.length === 6;
  }, [isLogin, identifier, password, signupStep, username, email, otp]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setLoading(false);
    setDebugOtp(undefined);
    setOtp("");
    setSignupStep("credentials");
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isLogin) {
        await login({ identifier, password });
        toast.success("Login berhasil.");
        navigate("/title", { replace: true });
        return;
      }

      if (signupStep === "credentials") {
        const response = await startSignup({
          username,
          email,
          password,
        });
        setDebugOtp(response.debugOtp);
        setSignupStep("otp");
        toast.success("OTP dikirim ke email.");
        return;
      }

      await verifySignup(email, otp);
      toast.success("Akun berhasil dibuat.");
      navigate("/title", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[rgb(248,250,242)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="w-full border-[#d4ccc5] bg-white/88 p-6">
          <div className="flex gap-2 rounded-2xl bg-[#edeae5] p-1">
            <button
              className={`h-10 flex-1 rounded-xl text-sm font-bold transition ${isLogin ? "bg-white text-ink shadow" : "text-[#78676d]"}`}
              onClick={() => switchMode("login")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`h-10 flex-1 rounded-xl text-sm font-bold transition ${!isLogin ? "bg-white text-ink shadow" : "text-[#78676d]"}`}
              onClick={() => switchMode("signup")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <motion.div
            key={`${mode}-${signupStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 space-y-3"
          >
            {isLogin ? (
              <>
                <TextInput
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
                <TextInput
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </>
            ) : signupStep === "credentials" ? (
              <>
                <TextInput
                  placeholder="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                />
                <TextInput
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <TextInput
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </>
            ) : (
              <>
                <p className="text-sm text-[#58464c]">Masukkan OTP 6 digit yang dikirim ke `{email}`.</p>
                <TextInput
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                />
                {debugOtp && <p className="rounded-xl bg-[#fff5d9] px-3 py-2 text-xs text-[#7b5f25]">Dev OTP: {debugOtp}</p>}
                <Button variant="secondary" fullWidth onClick={() => setSignupStep("credentials")}>Kembali ke form</Button>
              </>
            )}

            <Button fullWidth onClick={handleSubmit} disabled={loading || !canSubmit}>
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In"
                : signupStep === "credentials"
                    ? "Sign Up"
                    : "Verify & Create Account"}
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};
