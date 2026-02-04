import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { CheckCircle2, Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";

export function Thanks() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyToClipboard = () => {
    if (applicationId) {
      navigator.clipboard.writeText(applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="text-center shadow-2xl border-2 border-primary/10">
            <CardHeader className="pt-10">
              <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Application Received!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Thank you for applying. Our recruitment team will review your
                profile and get back to you soon.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-2">
                  Your Application ID
                </p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono font-bold text-primary tracking-tighter">
                    {applicationId ?? "—"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 text-sm text-muted-foreground px-4 text-left border-l-4 border-primary/20 bg-primary/5 py-4 rounded-r-lg">
                <p className="font-medium text-foreground">
                  What happens next?
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>
                    Our recruiters will review your experience and skills.
                  </li>
                  <li>
                    If your profile matches, we'll reach out for an initial
                    interview.
                  </li>
                  <li>
                    You can use your Application ID if you need to contact
                    support.
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center bg-slate-50/50 p-6">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/">Back to Job Listings</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
