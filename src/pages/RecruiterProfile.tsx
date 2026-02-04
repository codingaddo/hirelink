import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export function RecruiterProfile() {
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <Layout isAdmin>
      <div className="container mx-auto px-4 py-8 md:px-8 max-w-2xl">
        <Link
          to="/admin"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and personal information.
          </p>
        </div>

        <Card className="shadow-xl border-none overflow-hidden">
          <div className="h-32 bg-primary" />
          <CardHeader className="relative pt-0 flex flex-col items-center">
            <div className="absolute -top-16 bg-white dark:bg-slate-950 p-1.5 rounded-full shadow-2xl">
              <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User className="h-16 w-16" />
              </div>
            </div>
            <div className="pt-20 text-center">
              <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
              <CardDescription className="flex items-center justify-center mt-2 text-sm">
                <Shield className="mr-1.5 h-4 w-4" />
                Recruitment Administrator
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-12">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-muted">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Email Address
                  </p>
                  <p className="text-base font-medium">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              {/* <Button variant="outline" className="flex-1 h-11">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button> */}
              <Button
                variant="destructive"
                className="flex-1 h-11"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
