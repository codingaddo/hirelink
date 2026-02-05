export type Job = {
  id: string;
  title: string;
  location: string;
  description: string;
  type: string;
  createdAt: string;
};

export type ApplicationStage =
  | "Applied"
  | "Reviewed"
  | "Interview Scheduled"
  | "Offer Sent";

export type ResumeMeta = {
  fileName: string;
  type: string;
  size: number;
  lastModified: number;
};

export type Application = {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone: string;
  yearsOfExperience: number;
  skills: string[];
  portfolioUrl?: string;
  resumeMeta: ResumeMeta;
  /** Base64 data URL or base64 string for in-memory resume preview (same session/device) */
  resumeData?: string;
  stage: ApplicationStage;
  score?: number;
  notes?: string;
  interviewAt?: string;
  offerLetter?: string;
  createdAt: string;
};

export type User = {
  email: string;
  password?: string;
  name: string;
};
