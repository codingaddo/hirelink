import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Lock,
  Mail,
  AlertCircle,
  User,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<"email" | "password" | null>(
    null
  );
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const DEMO_EMAIL = "recruiter@hirelink.com";
  const DEMO_PASSWORD = "password123";

  const copyToClipboard = async (text: string, field: "email" | "password") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const { users, setCurrentUser, isHydrated, hydrate } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        setCurrentUser(user);
        navigate("/admin");
      } else {
        setError("Invalid email or password");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen py-12 md:py-20 flex flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <Link to="/" className="mb-8 flex items-center space-x-2">
        <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
          <Briefcase className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight">HireLink</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Recruiter Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the recruiter dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="abc@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isHydrated}
              >
                {!isHydrated
                  ? "Loading..."
                  : isLoading
                    ? "Signing in..."
                    : "Sign In"}
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/">Back to Jobs</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Alert className="mt-6 border-primary/30 bg-primary/5">
          <User className="h-4 w-4 text-primary" />
          <AlertDescription className="space-y-2">
            <button
              title="Toggle demo credentials"
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-md py-1 text-left font-medium text-foreground hover:bg-background/30 transition-colors"
              onClick={() => setShowDemoCredentials((v) => !v)}
              {...(showDemoCredentials
                ? { "aria-expanded": "true" as const }
                : { "aria-expanded": "false" as const })}
            >
              <span>Demo credentials</span>
              {showDemoCredentials ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {showDemoCredentials && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between gap-2 rounded-md bg-background/50 px-2 py-1.5">
                      <span className="font-mono text-sm text-foreground">
                        {DEMO_EMAIL}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() => copyToClipboard(DEMO_EMAIL, "email")}
                        aria-label="Copy email"
                      >
                        {copiedField === "email" ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-md bg-background/50 px-2 py-1.5">
                      <span className="font-mono text-sm text-foreground">
                        {DEMO_PASSWORD}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          copyToClipboard(DEMO_PASSWORD, "password")
                        }
                        aria-label="Copy password"
                      >
                        {copiedField === "password" ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
