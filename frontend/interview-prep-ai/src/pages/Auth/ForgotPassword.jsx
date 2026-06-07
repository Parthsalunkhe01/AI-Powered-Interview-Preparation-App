import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
        email: email.trim().toLowerCase(),
      });

      setSubmitted(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
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
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center">
          <Link to="/" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 no-underline group mb-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src={logo} alt="InterviewAI" className="h-full w-full object-contain rounded-2xl" />
            </div>
            <span className="font-black text-xl sm:text-3xl tracking-tighter text-foreground">AI-powered Interview Prep</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Forgot Password</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1.5 sm:mt-2 text-center max-w-xs mx-auto">
            Enter your email to receive password reset instructions.
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center py-4 gap-5"
              >
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-2">Check your inbox</h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    If <span className="font-bold text-slate-700">{email}</span> is registered, a reset link has been sent. Check your spam folder if you don't see it.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  The link expires in <span className="font-bold text-slate-700">15 minutes</span>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  className="text-sm font-bold text-primary/70 hover:text-primary transition-colors underline underline-offset-4"
                >
                  Try a different email
                </button>
              </motion.div>
            ) : (
              /* ── Form State ── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Registered Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="name@email.com"
                      autoFocus
                      className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-bold"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Secure SSL Encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
