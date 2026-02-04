import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  FileText,
  ExternalLink,
  Star,
  Save,
  Send,
  Download,
  Clock,
  Briefcase,
  User,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ApplicationStage } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, X } from "lucide-react";

const PENDING_STAGE_KEY = "hirelink_pending_stage";

const PENDING_STAGE_MESSAGES: Record<ApplicationStage, string> = {
  Applied: "",
  Reviewed:
    "Complete the review below (score and notes) to move this candidate to Reviewed.",
  "Interview Scheduled":
    "Schedule an interview below to move this candidate to Interview Scheduled.",
  "Offer Sent":
    "Draft and send the offer below to move this candidate to Offer Sent.",
};

export function AdminCandidate() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { applications, jobs, updateApplication, isHydrated, hydrate } =
    useStore();

  const [score, setScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(
    undefined
  );
  const [offerStartDate, setOfferStartDate] = useState<Date | undefined>(
    undefined
  );
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStage, setPendingStage] = useState<ApplicationStage | null>(
    null
  );

  const application = applications.find((a) => a.id === applicationId);
  const job = jobs.find((j) => j.id === application?.jobId);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    } else if (application) {
      if (score !== (application.score || 0)) setScore(application.score || 0);
      if (notes !== (application.notes || ""))
        setNotes(application.notes || "");
      if (application.interviewAt) {
        const date = new Date(application.interviewAt);
        if (interviewDate?.getTime() !== date.getTime()) setInterviewDate(date);
      }
    }
    window.scrollTo(0, 0);
  }, [isHydrated, hydrate, application]);

  useEffect(() => {
    if (!applicationId) return;
    const key = `${PENDING_STAGE_KEY}_${applicationId}`;
    const value = sessionStorage.getItem(key);
    if (
      value === "Reviewed" ||
      value === "Interview Scheduled" ||
      value === "Offer Sent"
    ) {
      sessionStorage.removeItem(key);
      const id = setTimeout(
        () => setPendingStage(value as ApplicationStage),
        0
      );
      return () => clearTimeout(id);
    }
  }, [applicationId]);

  if (!isHydrated || !application) {
    return (
      <Layout isAdmin>
        <div className="container mx-auto py-20 text-center">
          <p className="animate-pulse text-muted-foreground">
            Loading candidate details...
          </p>
        </div>
      </Layout>
    );
  }

  const handleSaveReview = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateApplication({
        ...application,
        score,
        notes,
        stage: application.stage === "Applied" ? "Reviewed" : application.stage,
      });
      setPendingStage(null);
      setIsSaving(false);
    }, 500);
  };

  const handleScheduleInterview = () => {
    if (!interviewDate) return;
    updateApplication({
      ...application,
      interviewAt: interviewDate.toISOString(),
      stage: "Interview Scheduled",
    });
    setPendingStage(null);
  };

  const handleSendOffer = () => {
    updateApplication({
      ...application,
      stage: "Offer Sent",
      offerLetter: `OFFER LETTER - ${application.candidateName}\n\nPosition: ${job?.title}\n\n... (Generated Mock Offer Letter) ...`,
    });
    setPendingStage(null);
    setIsOfferDialogOpen(false);

    // mailto link
    const subject = encodeURIComponent(`Job Offer: ${job?.title} at HireLink`);
    const body = encodeURIComponent(
      `Hi ${application.candidateName},\n\nWe are pleased to offer you the position of ${job?.title}...\n\n(Attach the generated PDF offer letter)`
    );
    window.location.href = `mailto:${application.email}?subject=${subject}&body=${body}`;
  };

  return (
    <Layout isAdmin>
      <div className="container mx-auto px-4 py-8 md:px-8 max-w-6xl">
        <Link
          to="/admin"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pipeline
        </Link>

        {pendingStage && PENDING_STAGE_MESSAGES[pendingStage] && (
          <Alert className="mb-6 border-primary/40 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle>Complete this step to move the candidate</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{PENDING_STAGE_MESSAGES[pendingStage]}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setPendingStage(null)}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="h-32 bg-linear-to-r from-primary/20 to-primary/5" />
              <CardHeader className="relative pt-0">
                <div className="absolute -top-12 left-6 bg-white dark:bg-slate-950 p-1 rounded-2xl shadow-xl border border-primary/5">
                  <div className="h-24 w-24 bg-primary/10 rounded-xl flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="pt-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {application.candidateName}
                    </h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Applied for{" "}
                      <span className="text-foreground font-medium ml-1">
                        {job?.title ?? "Deleted Job"}
                      </span>
                    </div>
                  </div>
                  <Badge className="w-fit text-sm px-3 py-1 shadow-sm">
                    {application.stage}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="bg-muted p-2 rounded-lg transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-medium">{application.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="bg-muted p-2 rounded-lg transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm font-medium">{application.phone}</p>
                    </div>
                  </div>
                  {application.portfolioUrl && (
                    <div className="flex items-center gap-3 group">
                      <div className="bg-muted p-2 rounded-lg transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Portfolio
                        </p>
                        <a
                          href={application.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {application.portfolioUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="bg-muted p-2 rounded-lg transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Experience
                      </p>
                      <p className="text-sm font-medium">
                        {application.yearsOfExperience} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="bg-muted p-2 rounded-lg transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Applied on
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardContent className="py-6 space-y-4">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="px-3 py-1 font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {application.resumeMeta.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(application.resumeMeta.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>
                <Dialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Resume Preview: {application.resumeMeta.fileName}
                      </DialogTitle>
                      <DialogDescription>
                        Application submitted on{" "}
                        {format(new Date(application.createdAt), "PPP")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-900 m-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
                        <FileText className="h-20 w-20 text-primary/40" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg">
                          {application.resumeMeta.fileName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {application.resumeMeta.type} •{" "}
                          {(application.resumeMeta.size / 1024 / 1024).toFixed(
                            2
                          )}{" "}
                          MB
                        </p>
                      </div>
                      <div className="max-w-xs text-xs text-muted-foreground leading-relaxed">
                        This is a simulated document preview. In a real
                        application, the actual PDF/DOCX would be rendered here
                        using a library like react-pdf or an iframe.
                      </div>
                      <Button asChild variant="secondary">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("Downloading simulated file...");
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Original
                        </a>
                      </Button>
                    </div>
                    <DialogFooter className="p-6 pt-0">
                      <Button
                        variant="outline"
                        onClick={() => setIsResumeOpen(false)}
                      >
                        Close Preview
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* Internal Review */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl">Internal Review</CardTitle>
                <CardDescription>
                  Score this candidate and add private recruitment notes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Candidate Score (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setScore(star)}
                        aria-label={`Rate ${star} stars`}
                        className={`transition-all duration-200 transform hover:scale-110 ${
                          star <= score
                            ? "text-primary"
                            : "text-muted hover:text-primary/50"
                        }`}
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= score ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Interview / Review Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter notes about the candidate's performance, strengths, or weaknesses..."
                    className="min-h-[150px] focus:border-primary"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end bg-slate-50/50 p-4">
                <Button onClick={handleSaveReview} disabled={isSaving}>
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Review
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Actions & Next Steps */}
          <div className="space-y-8">
            <Card className="shadow-lg border-none overflow-hidden">
              <div className="bg-primary p-6 text-primary-foreground shadow-inner">
                <h3 className="text-lg font-bold">Quick Actions</h3>
                <p className="text-xs opacity-80 mt-1">
                  Move candidate to the next stage.
                </p>
              </div>
              <CardContent className="p-6 space-y-4">
                {/* Interview Scheduler */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Interview Scheduler
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="interview" className="text-xs">
                      Interview Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !interviewDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {interviewDate ? (
                            format(interviewDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={interviewDate}
                          onSelect={setInterviewDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleScheduleInterview}
                    disabled={!interviewDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {application.interviewAt
                      ? "Reschedule Interview"
                      : "Schedule Interview"}
                  </Button>
                  {application.interviewAt && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-medium border border-orange-100">
                      <Clock className="h-4 w-4" />
                      Interview set for{" "}
                      {format(new Date(application.interviewAt), "PPP")}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Offer Actions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Offer Phase
                  </h4>
                  <Dialog
                    open={isOfferDialogOpen}
                    onOpenChange={setIsOfferDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full shadow-md"
                        disabled={application.stage === "Applied"}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Draft Offer Letter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Generate Offer Letter</DialogTitle>
                        <DialogDescription>
                          Review the offer details for{" "}
                          {application.candidateName}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Salary Offer</Label>
                            <Input placeholder="e.g. $80,000" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Start Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-10",
                                    !offerStartDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {offerStartDate ? (
                                    format(offerStartDate, "PP")
                                  ) : (
                                    <span>Date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={offerStartDate}
                                  onSelect={setOfferStartDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-lg text-[10px] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                          {`DEAR ${application.candidateName.toUpperCase()},\n\nWE ARE THRILLED TO OFFER YOU THE POSITION OF ${job?.title.toUpperCase()} AT HIRELINK. YOUR EXPERTISE IN ${application.skills
                            .slice(0, 3)
                            .join(", ")
                            .toUpperCase()} MAKES YOU AN IDEAL FIT FOR OUR TEAM...`}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsOfferDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSendOffer}>
                          <Send className="mr-2 h-4 w-4" />
                          Generate & Email Offer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Note: Generates a PDF and opens your email client.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="p-6">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Application Timeline
                </h4>
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-muted">
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                    <p className="text-xs font-bold">Application Submitted</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {application.score !== undefined && (
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                      <p className="text-xs font-bold">Candidate Reviewed</p>
                      <p className="text-[10px] text-muted-foreground">
                        Score: {application.score}/5
                      </p>
                    </div>
                  )}
                  {application.interviewAt && (
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                      <p className="text-xs font-bold">Interview Scheduled</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(application.interviewAt), "PPp")}
                      </p>
                    </div>
                  )}
                  {application.stage === "Offer Sent" && (
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-background" />
                      <p className="text-xs font-bold text-green-600 dark:text-green-400">
                        Offer Sent
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
