import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  User,
  Briefcase,
  FileText,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Validation Schemas
const step1Schema = z.object({
  candidateName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Invalid phone number"),
});

const step2Schema = z.object({
  yearsOfExperience: z.number().min(0, "Years must be 0 or more"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const COMMON_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Tailwind CSS",
  "Next.js",
  "Docker",
  "AWS",
  "Kubernetes",
  "PostgreSQL",
  "GraphQL",
  "Figma",
  "UI/UX Design",
  "Product Management",
  "Data Science",
  "Machine Learning",
  "Cybersecurity",
  "DevOps",
  "CI/CD",
  "Testing",
  "Agile",
  "Scrum",
  "Git",
  "System Architecture",
  "API Design",
  "Java",
  "C++",
  "C#",
  "SQL",
  "Angular",
  "Vue.js",
  "Svelte",
  "PHP",
  "Ruby",
  "Android",
  "iOS",
  "Flutter",
  "React Native",
  "Firebase",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "Terraform",
  "Ansible",
  "Jenkins",
  "Azure",
  "Google Cloud",
  "Salesforce",
  "ServiceNow",
  "SAP",
  "Excel",
  "Tableau",
  "Power BI",
  "Data Analysis",
  "Deep Learning",
  "NLP",
  "Computer Vision",
].sort();

export function ApplyWizard() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs, addApplication, isHydrated, hydrate } = useStore();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const job = jobs.find((j) => j.id === jobId);

  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { candidateName: "", email: "", phone: "" },
  });
  const form2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      yearsOfExperience: 0,
      skills: [] as string[],
      portfolioUrl: "",
    },
  });

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
    window.scrollTo(0, 0);
  }, [isHydrated, hydrate]);

  if (!isHydrated) return null;
  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <Button asChild className="mt-4">
            <Link to="/">Back to Jobs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form1.trigger();
      if (valid) {
        setStep(2);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      }
    } else if (step === 2) {
      const valid = await form2.trigger();
      if (valid) {
        setStep(3);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = skills.includes(skill)
      ? skills.filter((s) => s !== skill)
      : [...skills, skill];
    setSkills(newSkills);
    form2.setValue("skills", newSkills, { shouldValidate: true });
  };

  const removeSkill = (s: string) => {
    const newSkills = skills.filter((skill) => skill !== s);
    setSkills(newSkills);
    form2.setValue("skills", newSkills, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Max 5MB.");
        return;
      }
      setResumeFile(file);
    }
  };

  const onSubmit = () => {
    if (!resumeFile) return;

    const appId = `app_${Math.random().toString(36).substr(2, 9)}`;
    const data1 = form1.getValues();
    const data2 = form2.getValues();

    addApplication({
      id: appId,
      jobId: job.id,
      candidateName: data1.candidateName,
      email: data1.email,
      phone: data1.phone,
      yearsOfExperience: data2.yearsOfExperience,
      skills: skills,
      portfolioUrl: data2.portfolioUrl,
      resumeMeta: {
        fileName: resumeFile.name,
        type: resumeFile.type,
        size: resumeFile.size,
        lastModified: resumeFile.lastModified,
      },
      stage: "Applied",
      createdAt: new Date().toISOString(),
    });

    navigate(`/thanks/${appId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-12 md:py-20 flex flex-col justify-center min-h-[calc(100vh-64px)]">
        <div className="mb-8 relative">
          <Button
            asChild
            variant="ghost"
            className="absolute -left-4 top-0 md:-left-20 hidden md:flex text-muted-foreground hover:text-primary"
          >
            <Link to="/">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Apply for {job.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {job.location} • {job.type}
            </p>
            <Button
              asChild
              variant="link"
              className="md:hidden mt-2 text-muted-foreground"
            >
              <Link to="/">Back to jobs</Link>
            </Button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10 -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors duration-300 ${
                step >= s
                  ? "border-primary text-primary font-bold shadow-[0_0_0_4px_white,0_0_0_5px_theme(colors.primary.DEFAULT)]"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
            </div>
          ))}
        </div>

        <Card className="shadow-lg overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Tell us who you are and how to reach you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="candidateName">Full Name</Label>
                    <Input
                      id="candidateName"
                      {...form1.register("candidateName")}
                      placeholder="John Doe"
                    />
                    {form1.formState.errors.candidateName && (
                      <p className="text-xs text-destructive">
                        {
                          (
                            form1.formState.errors.candidateName as {
                              message?: string;
                            }
                          )?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form1.register("email")}
                      placeholder="john@example.com"
                    />
                    {form1.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {
                          (form1.formState.errors.email as { message?: string })
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...form1.register("phone")}
                      placeholder="+233..."
                    />
                    {form1.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {
                          (form1.formState.errors.phone as { message?: string })
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Experience & Skills
                  </CardTitle>
                  <CardDescription>
                    Showcase your background and expertise.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="years">Years of Experience</Label>
                    <Input
                      id="years"
                      type="number"
                      {...form2.register("yearsOfExperience", {
                        valueAsNumber: true,
                      })}
                      placeholder="e.g. 5"
                    />
                    {form2.formState.errors.yearsOfExperience && (
                      <p className="text-xs text-destructive">
                        {
                          (
                            form2.formState.errors.yearsOfExperience as {
                              message?: string;
                            }
                          )?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between h-12"
                        >
                          <span className="truncate">
                            {skills.length > 0
                              ? `${skills.length} selected`
                              : "Select skills..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command className="w-full">
                          <CommandInput placeholder="Search skills..." />
                          <CommandList>
                            <CommandEmpty>No skill found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {COMMON_SKILLS.map((skill) => (
                                <CommandItem
                                  key={skill}
                                  value={skill}
                                  onSelect={() => {
                                    toggleSkill(skill);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      skills.includes(skill)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {skill}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {form2.formState.errors.skills && (
                      <p className="text-xs text-destructive">
                        {Array.isArray(form2.formState.errors.skills)
                          ? "Please select at least one skill"
                          : (
                              form2.formState.errors.skills as {
                                message?: string;
                              }
                            )?.message}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3 min-h-8 p-3 border border-dashed rounded-lg bg-slate-50/50">
                      {skills.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 italic self-center">
                          Selected skills will appear here...
                        </p>
                      ) : (
                        skills.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="pl-2 pr-1 gap-1 py-1 text-sm bg-white border shadow-sm group transition-all hover:border-primary/30"
                          >
                            {s}
                            <button
                              title="Remove skill"
                              type="button"
                              onClick={() => removeSkill(s)}
                              className="text-muted-foreground hover:text-destructive p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="portfolio">
                      Portfolio / LinkedIn (Optional)
                    </Label>
                    <Input
                      id="portfolio"
                      {...form2.register("portfolioUrl")}
                      placeholder="https://..."
                    />
                    {form2.formState.errors.portfolioUrl && (
                      <p className="text-xs text-destructive">
                        {
                          (
                            form2.formState.errors.portfolioUrl as {
                              message?: string;
                            }
                          )?.message
                        }
                      </p>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Resume Upload
                  </CardTitle>
                  <CardDescription>
                    Upload your CV (PDF or DOCX, max 5MB).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 bg-slate-50 dark:bg-slate-900 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer relative">
                    <input
                      title="Upload resume"
                      type="file"
                      id="resume"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      {resumeFile ? (
                        <div className="space-y-1">
                          <p className="font-medium text-primary">
                            {resumeFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-destructive h-auto p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setResumeFile(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, DOCX up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>

          <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={!resumeFile}
                className="bg-primary hover:bg-primary/90"
              >
                Submit Application
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
