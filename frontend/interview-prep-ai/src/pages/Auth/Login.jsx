import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { UserContext } from "../../context/userContext";
import { toast } from "react-hot-toast";
import GoogleAuthButton from "../../components/Auth/GoogleAuthButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        toast.success("Welcome back! Launching workspace...");
        
        if (response.data.hasBlueprint) {
          navigate("/dashboard");
        } else {
          navigate("/blueprint");
        }
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isVerified === false) {
        const emailToVerify = err.response.data.email;
        toast.error("Email not verified. Redirecting to verification...");
        navigate(`/verify-email?email=${encodeURIComponent(emailToVerify)}`);
        return;
      }
      const message = err.response?.data?.message || "Authentication failed. Check your credentials.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-grid selection:bg-primary/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex items-center gap-3 no-underline group mb-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src={logo} alt="InterviewAI" className="h-full w-full object-contain rounded-2xl" />
            </div>
            <span className="font-black text-3xl tracking-tighter text-foreground">AI-powered Interview Prep</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Login</h1>
          <p className="text-muted-foreground font-medium mt-2">Enter your details to access your account.</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Forgot Password?</Link>
                </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none p-1 rounded-lg"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-bold"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </motion.div>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground font-bold tracking-widest">Or</span>
              </div>
            </div>
            
            <GoogleAuthButton />
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-4">Create an Account</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors">
                Secure SSL Encryption
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;