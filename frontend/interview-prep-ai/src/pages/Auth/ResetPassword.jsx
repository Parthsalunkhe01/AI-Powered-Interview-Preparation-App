import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { toast } from "react-hot-toast";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "Contains a number", test: (v) => /\d/.test(v) },
  { label: "Contains a letter", test: (v) => /[a-zA-Z]/.test(v) },
];

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Guard: redirect if token/email params are missing
  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid or missing reset link.");
      navigate("/forgot-password", { replace: true });
    }
  }, [token, email, navigate]);

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(newPassword)).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-rose-500", "bg-amber-400", "bg-emerald-500"][passwordStrength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        token,
        email,
        newPassword,
      });

      setSuccess(true);
      toast.success("Password updated successfully!");

      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate("/login", { replace: true }), 3000);
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
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Reset Password</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium mt-1.5 sm:mt-2 text-center max-w-xs mx-auto">
            {email && (
              <>Resetting password for <span className="font-bold text-slate-700">{email}</span></>
            )}
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          <AnimatePresence mode="wait">
            {success ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-4 gap-5"
              >
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-2">Password Updated!</h2>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Your password has been changed successfully. Redirecting you to the login page...
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Go to Login <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              /* ── Form State ── */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {newPassword.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 pt-1"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= passwordStrength ? strengthColor : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-0.5">
                          {PASSWORD_RULES.map((rule) => (
                            <span
                              key={rule.label}
                              className={`text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                rule.test(newPassword) ? "text-emerald-500" : "text-slate-400"
                              }`}
                            >
                              <span>{rule.test(newPassword) ? "✓" : "○"}</span>
                              {rule.label}
                            </span>
                          ))}
                        </div>
                        {strengthLabel && (
                          <span className={`text-xs font-bold ${["", "text-rose-500", "text-amber-500", "text-emerald-500"][passwordStrength]}`}>
                            {strengthLabel}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      placeholder="••••••••"
                      className={`w-full h-14 bg-slate-50 border rounded-2xl pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 placeholder:text-slate-400 ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-rose-400 focus:border-rose-400"
                          : confirmPassword && newPassword === confirmPassword
                          ? "border-emerald-400 focus:border-emerald-400"
                          : "border-slate-200 focus:border-primary/40"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
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
                      Update Password <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {!success && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          )}
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

export default ResetPassword;
