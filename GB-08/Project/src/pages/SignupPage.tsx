import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import signupIllustration from "@/assets/signup-illustration.jpg";

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // client-side validation
    const newErrors: typeof errors = {};
    if (!name) newErrors.name = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    if (password && confirmPassword && password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await signup(name, email, password, role);
      setSuccess(true);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      const resp = (error as any)?.response;
      // If server returned field-level validation errors, map them to form and skip toast
      if (resp?.data?.errors && typeof resp.data.errors === 'object') {
        const serverErrors: any = resp.data.errors;
        const normalized: any = {};
        Object.keys(serverErrors).forEach((k) => {
          const v = serverErrors[k];
          if (v && typeof v === 'object' && typeof v.message === 'string') normalized[k] = v.message;
          else if (typeof v === 'string') normalized[k] = v;
          else normalized[k] = String(v);
        });
        setErrors(normalized);
      } else {
        const msg = resp?.data?.message || (error as any)?.message || "Failed to create account";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:order-1"
          >
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 shadow-xl relative overflow-hidden">
              {success && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/95 z-10"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <CheckCircle2 className="w-20 h-20 text-secondary mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gradient">Welcome aboard!</h2>
                    <p className="text-muted-foreground mt-2">Redirecting to your dashboard...</p>
                  </div>
                </motion.div>
              )}

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gradient mb-2">
                  Create Account
                </h1>
                <p className="text-muted-foreground">
                  Start your journey to interview success
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    required
                    hasError={!!errors.name}
                    className="transition-smooth"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                    hasError={!!errors.email}
                    className="transition-smooth"
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    required
                    minLength={6}
                    hasError={!!errors.password}
                    className="transition-smooth"
                  />
                  {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    required
                    minLength={6}
                    hasError={!!errors.confirmPassword}
                    className="transition-smooth"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="transition-smooth">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">Candidate</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <Button
                  type="submit"
                  className="w-full transition-smooth hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Login here
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden lg:block lg:order-2"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={signupIllustration}
                alt="Success celebration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
