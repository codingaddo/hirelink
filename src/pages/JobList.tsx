import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const JOBS_PER_PAGE = 6;

export function JobList() {
  const { jobs, isHydrated, hydrate } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  // Reset to first page on search
  useEffect(() => {
    const id = setTimeout(() => setCurrentPage(1), 0);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (!isHydrated) {
    return (
      <Layout>
        <div className="container mx-auto flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading jobs...</p>
        </div>
      </Layout>
    );
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + JOBS_PER_PAGE
  );

  return (
    <Layout>
      <section className="bg-slate-50 py-12 md:py-20 dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Find your next <span className="text-primary">career move</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Browse our open positions and join a team that's building the
              future of digital solutions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by role or location..."
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {paginatedJobs.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredJobs.length}
              </span>{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {paginatedJobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <h2 className="text-2xl font-semibold text-slate-400">
                    No jobs found matching your search
                  </h2>
                  <Button
                    variant="link"
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-primary"
                  >
                    Clear search filters
                  </Button>
                </motion.div>
              ) : (
                paginatedJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 border-slate-200/60 dark:border-slate-800">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge
                            variant="secondary"
                            className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100"
                          >
                            {job.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-slate-400" />
                            Posted{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {job.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0 pb-6 px-6">
                        <Button asChild className="w-full shadow-md">
                          <Link to={`/apply/${job.id}`}>
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className="h-10 w-10"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-10 w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
