import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw, Mail } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { UserContext } from "../../context/userContext";
import { toast } from "react-hot-toast";

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.VERIFY_EMAIL, {
        email,
        otp: otpString,
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        toast.success("Email verified! Welcome aboard.");
        navigate("/blueprint");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Verification failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setResending(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.RESEND_OTP, { email });
      toast.success("A new code has been sent to your email.");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-grid selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground text-center">Verify Your Email</h1>
          <p className="text-muted-foreground font-medium mt-3 text-center px-4">
            We've sent a 6-digit verification code to <br />
            <span className="text-slate-900 font-bold">{email}</span>
          </p>
        </div>

        <div className="p-8 rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-xl font-black text-slate-900 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-xs font-bold"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
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
                  Verify Identity <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <button 
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className={`h-4 w-4 ${timer === 0 ? 'animate-pulse' : ''}`} />}
              {timer > 0 ? `Resend Code in ${timer}s` : "Resend Verification Code"}
            </button>
            
            <Link to="/signup" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors no-underline">
              Use a different email
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
                Check your spam folder if you don't see the email within a minute.
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
