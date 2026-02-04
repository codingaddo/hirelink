import { create } from "zustand";
import type { Job, Application, User } from "../types";

interface HireLinkState {
  jobs: Job[];
  applications: Application[];
  users: User[];
  currentUser: User | null;
  isHydrated: boolean;

  // Actions
  setJobs: (jobs: Job[]) => void;
  setApplications: (applications: Application[]) => void;
  setCurrentUser: (user: User | null) => void;

  // Job Actions
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;

  // Application Actions
  addApplication: (app: Application) => void;
  updateApplication: (app: Application) => void;

  // Hydration
  hydrate: () => Promise<void>;
}

export const useStore = create<HireLinkState>((set, get) => ({
  jobs: [],
  applications: [],
  users: [],
  currentUser: null,
  isHydrated: false,

  setJobs: (jobs) => {
    set({ jobs });
    localStorage.setItem("hirelink_jobs", JSON.stringify(jobs));
  },

  setApplications: (applications) => {
    set({ applications });
    localStorage.setItem("hirelink_applications", JSON.stringify(applications));
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      localStorage.setItem("hirelink_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("hirelink_session");
    }
  },

  addJob: (job) => {
    const newJobs = [...get().jobs, job];
    get().setJobs(newJobs);
  },

  updateJob: (job) => {
    const newJobs = get().jobs.map((j) => (j.id === job.id ? job : j));
    get().setJobs(newJobs);
  },

  deleteJob: (id) => {
    const newJobs = get().jobs.filter((j) => j.id !== id);
    get().setJobs(newJobs);
  },

  addApplication: (app) => {
    const newApps = [...get().applications, app];
    get().setApplications(newApps);
  },

  updateApplication: (app) => {
    const newApps = get().applications.map((a) => (a.id === app.id ? app : a));
    get().setApplications(newApps);
  },

  hydrate: async () => {
    const storedJobs = localStorage.getItem("hirelink_jobs");
    const storedApps = localStorage.getItem("hirelink_applications");
    const storedSession = localStorage.getItem("hirelink_session");

    if (storedJobs && storedApps) {
      set({
        jobs: JSON.parse(storedJobs),
        applications: JSON.parse(storedApps),
        currentUser: storedSession ? JSON.parse(storedSession) : null,
        isHydrated: true,
      });

      const response = await fetch("/seed.json");
      const seedData = await response.json();
      set({ users: seedData.users });
    } else {
      try {
        const response = await fetch("/seed.json");
        const seedData = await response.json();

        set({
          jobs: seedData.jobs,
          applications: seedData.applications,
          users: seedData.users,
          isHydrated: true,
        });

        localStorage.setItem("hirelink_jobs", JSON.stringify(seedData.jobs));
        localStorage.setItem(
          "hirelink_applications",
          JSON.stringify(seedData.applications)
        );
      } catch (error) {
        console.error("Failed to hydrate from seed.json", error);
      }
    }
  },
}));
