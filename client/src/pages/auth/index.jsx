import { Tabs } from "@radix-ui/react-tabs";
import Victory from "../../assets/victory.svg";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { LOGIN_PAGE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { Eye, EyeOff, Sun, Moon } from "lucide-react"; // 👁 Icons

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false); // 👁 Toggle
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(""); // 💪 Strength meter
  // ---------------- EMAIL FORMAT VALIDATION ----------------
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ---------------- PASSWORD STRENGTH ----------------
  const checkStrength = (pass) => {
    if (pass.length < 6) return setPasswordStrength("Weak");
    if (/[A-Z]/.test(pass) && /\d/.test(pass) && /[!@#$%]/.test(pass))
      return setPasswordStrength("Strong");
    return setPasswordStrength("Medium");
  };

  useEffect(() => {
    checkStrength(password);
  }, [password]);

  // ---------------- VALIDATIONS ----------------
  const validateLogin = () => {
    if (!email) return toast.error("Email is required"), false;
    if (!isValidEmail(email))
      return toast.error("Enter a valid email"), false;
    if (!password) return toast.error("Password is required"), false;
    return true;
  };

  const validateSignup = () => {
    if (!email) return toast.error("Email is required"), false;
    if (!isValidEmail(email))
      return toast.error("Enter a valid email"), false;
    if (!password) return toast.error("Password is required"), false;
    if (password !== confirmpassword)
      return toast.error("Passwords do not match"), false;
    return true;
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const response = await apiClient.post(
        LOGIN_PAGE,
        { email, password },
        { withCredentials: true }
      );

      if (!response.data?.user) {
        toast.error("Invalid email or password.");
        return;
      }

      setUserInfo(response.data.user);
      toast.success("Login successful!");
      navigate("/profile");
    } catch (error) {
      toast.error("Incorrect email or password");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async () => {
    if (!validateSignup()) return;

    setLoading(true);
    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        { email, password },
        { withCredentials: true }
      );

      toast.success("Successfully signed up!");

      if (response.status === 201) {
        setUserInfo(response.data.user);
        navigate("/profile");
      }
    } catch (err) {
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ENTER KEY SUBMIT ----------------
  const handleEnter = (e) => {
    if (e.key === "Enter") {
      activeTab === "login" ? handleLogin() : handleSignup();
    }
  };

  // ---------------- DARK MODE ----------------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center 
      bg-gray-50 dark:bg-[#0f0f11] px-4 relative transition"
      onKeyDown={handleEnter}
    >
      {/* ---------------- FULL SCREEN LOADER ---------------- */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="text-white text-2xl animate-pulse">Loading...</div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1f2129] shadow-xl rounded-3xl w-full max-w-5xl p-8 md:p-12 grid xl:grid-cols-2 gap-10 relative transition">
        
        {/* ---------------- LEFT SECTION ---------------- */}
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-2 text-black dark:text-white">
              Welcome
              <img src={Victory} alt="Victory" className="h-[70px] md:h-[90px]" />
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-2">
              Fill in the details to get started with the best chat app!
            </p>
          </div>

          {/* ---------------- AUTH TABS ---------------- */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-sm">
            <TabsList className="w-full grid grid-cols-2 border-b dark:border-gray-700">
              <TabsTrigger
                value="login"
                className="py-2 text-center data-[state=active]:border-b-2 data-[state=active]:border-purple-500 
                data-[state=active]:font-semibold"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="py-2 text-center data-[state=active]:border-b-2 data-[state=active]:border-purple-500 
                data-[state=active]:font-semibold"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ---------------- LOGIN TAB ---------------- */}
            <TabsContent value="login" className="flex flex-col gap-4 mt-6">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-5 dark:bg-[#2a2c35] dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* PASSWORD WITH TOGGLE */}
              <div className="relative">
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  className="rounded-full p-5 dark:bg-[#2a2c35] dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>

              <Button
                className="rounded-full p-5"
                onClick={handleLogin}
                disabled={loading} // disable button
              >
                Login
              </Button>
            </TabsContent>

            {/* ---------------- SIGNUP TAB ---------------- */}
            <TabsContent value="signup" className="flex flex-col gap-4 mt-6">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full p-5 dark:bg-[#2a2c35] dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* PASSWORD WITH TOGGLE */}
              <div className="relative">
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  className="rounded-full p-5 dark:bg-[#2a2c35] dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>

              {/* PASSWORD STRENGTH */}
              {password && (
                <span
                  className={`text-sm font-semibold ${
                    passwordStrength === "Weak"
                      ? "text-red-500"
                      : passwordStrength === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  Password Strength: {passwordStrength}
                </span>
              )}

              {/* CONFIRM PASSWORD WITH TOGGLE */}
              <div className="relative">
                <Input
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="rounded-full p-5 dark:bg-[#2a2c35] dark:text-white"
                  value={confirmpassword}
                  onChange={(e) => setConfirmpassword(e.target.value)}
                />
                <div
                  className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>

              <Button
                className="rounded-full p-5"
                onClick={handleSignup}
                disabled={loading} // disable button
              >
                Sign Up
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* ---------------- RIGHT ILLUSTRATION ---------------- */}
        <div className="hidden xl:flex items-center justify-center">
          <img
            src="https://illustrations.popsy.co/blue/communication.svg"
            alt="Chat Illustration"
            className="w-3/4"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
