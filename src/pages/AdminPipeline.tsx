import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Application, ApplicationStage } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  MoreVertical,
  ExternalLink,
  Calendar,
  CheckCircle2,
  UserCheck,
  Star,
  LayoutGrid,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";

const STAGES: ApplicationStage[] = [
  "Applied",
  "Reviewed",
  "Interview Scheduled",
  "Offer Sent",
];

const STAGE_ORDER: Record<ApplicationStage, number> = {
  Applied: 0,
  Reviewed: 1,
  "Interview Scheduled": 2,
  "Offer Sent": 3,
};

const PENDING_STAGE_KEY = "hirelink_pending_stage";
const PIPELINE_VIEW_KEY = "hirelink_pipeline_view";

function canMoveToStage(
  app: Application,
  targetStage: ApplicationStage
): boolean {
  const current = app.stage;
  if (targetStage === current) return true;
  const currentOrder = STAGE_ORDER[current];
  const targetOrder = STAGE_ORDER[targetStage];
  if (targetOrder <= currentOrder) return true;
  switch (targetStage) {
    case "Reviewed":
      return (
        (app.score != null && app.score >= 1) ||
        (!!app.notes && app.notes.trim().length > 0)
      );
    case "Interview Scheduled":
      return !!app.interviewAt;
    case "Offer Sent":
      return !!app.offerLetter;
    default:
      return true;
  }
}

const STAGE_ICONS = {
  Applied: <Users className="h-4 w-4 text-blue-500" />,
  Reviewed: <UserCheck className="h-4 w-4 text-purple-500" />,
  "Interview Scheduled": <Calendar className="h-4 w-4 text-orange-500" />,
  "Offer Sent": <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

function DroppableColumn({
  id,
  children,
  stage,
  count,
}: {
  id: string;
  children: React.ReactNode;
  stage: ApplicationStage;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[240px] min-w-[240px] sm:w-[280px] sm:min-w-[280px] md:w-72 md:min-w-[18rem] lg:w-80 lg:min-w-[20rem] h-full rounded-xl transition-colors shrink-0 ${
        isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {STAGE_ICONS[stage]}
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {stage}
          </h2>
          <Badge variant="secondary" className="ml-1">
            {count}
          </Badge>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar min-h-[200px]">
        {children}
      </div>
    </div>
  );
}

function SortableApplicationCard({ app, job }: { app: Application; job: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative border-muted/60">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-bold truncate pr-4">
              {app.candidateName}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-2"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/candidates/${app.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <p className="text-xs text-muted-foreground font-medium">
            {job?.title ?? "Deleted Job"}
          </p>

          <div className="flex flex-wrap gap-1">
            {app.skills.slice(0, 2).map((skill, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 font-normal"
              >
                {skill}
              </Badge>
            ))}
            {app.skills.length > 2 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 font-normal"
              >
                +{app.skills.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <div className="flex items-center text-[10px] text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(app.createdAt), "MMM d, yyyy")}
            </div>
            {app.score !== undefined && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 ${
                      i < app.score!
                        ? "text-primary fill-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ViewMode = "board" | "table";
type SortKey = "name" | "job" | "stage" | "date" | "score";

export function AdminPipeline() {
  const { applications, jobs, updateApplication, isHydrated, hydrate } =
    useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    sessionStorage.getItem(PIPELINE_VIEW_KEY) === "board" ? "board" : "table"
  );
  const [stageFilter, setStageFilter] = useState<ApplicationStage | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
    window.scrollTo(0, 0);
  }, [isHydrated, hydrate]);

  useEffect(() => {
    sessionStorage.setItem(PIPELINE_VIEW_KEY, viewMode);
  }, [viewMode]);

  const filteredApps = applications.filter((app) => {
    const job = jobs.find((j) => j.id === app.jobId);
    const searchStr = `${app.candidateName} ${job?.title ?? ""}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const tableFilteredApps =
    stageFilter === "all"
      ? filteredApps
      : filteredApps.filter((app) => app.stage === stageFilter);

  const sortedApps = useMemo(() => {
    const list = [...tableFilteredApps];
    const mult = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const jobA = jobs.find((j) => j.id === a.jobId)?.title ?? "";
      const jobB = jobs.find((j) => j.id === b.jobId)?.title ?? "";
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.candidateName.localeCompare(b.candidateName);
          break;
        case "job":
          cmp = jobA.localeCompare(jobB);
          break;
        case "stage":
          cmp = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
          break;
        case "date":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "score":
          cmp = (a.score ?? 0) - (b.score ?? 0);
          break;
        default:
          break;
      }
      return mult * cmp;
    });
    return list;
  }, [tableFilteredApps, sortBy, sortDir, jobs]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir(key === "name" || key === "job" ? "asc" : "desc");
    }
  };

  const navigate = useNavigate();

  const appsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredApps.filter((app) => app.stage === stage);
    return acc;
  }, {} as Record<ApplicationStage, Application[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Stage update happens only on drop (handleDragEnd) so we can validate first.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeApp = applications.find(
      (app) => app.id === (active.id as string)
    );
    if (!activeApp) return;

    const overId = over.id as string;
    let targetStage: ApplicationStage | null = null;
    if (STAGES.includes(overId as ApplicationStage)) {
      targetStage = overId as ApplicationStage;
    } else {
      const overApp = applications.find((app) => app.id === overId);
      if (overApp) targetStage = overApp.stage;
    }

    if (!targetStage || targetStage === activeApp.stage) return;

    if (canMoveToStage(activeApp, targetStage)) {
      updateApplication({ ...activeApp, stage: targetStage });
    } else {
      sessionStorage.setItem(
        `${PENDING_STAGE_KEY}_${activeApp.id}`,
        targetStage
      );
      navigate(`/admin/candidates/${activeApp.id}`);
    }
  };

  if (!isHydrated) {
    return (
      <Layout isAdmin>
        <div className="container flex h-[60vh] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">
            Loading pipeline...
          </p>
        </div>
      </Layout>
    );
  }

  const activeApp = activeId
    ? applications.find((app) => app.id === activeId)
    : null;
  const activeJob = activeApp
    ? jobs.find((j) => j.id === activeApp.jobId)
    : null;

  return (
    <Layout isAdmin>
      <div className="flex flex-col h-[calc(100vh-64px)] min-h-0 overflow-hidden">
        <div className="container mx-auto px-4 py-4 sm:py-6 md:px-8 border-b bg-card shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">
                Candidate Pipeline
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                Manage and track candidate progress through recruitment stages.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex rounded-lg border bg-muted/30 p-0.5">
                <Button
                  variant={viewMode === "board" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-md h-8 px-3"
                  onClick={() => setViewMode("board")}
                >
                  <LayoutGrid className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Board</span>
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-md h-8 px-3"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
              </div>
              <div className="relative w-full sm:min-w-[200px] md:min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates or jobs..."
                  className="pl-9 h-10 sm:h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Stage:</span>
                <Select
                  value={stageFilter}
                  onValueChange={(v) =>
                    setStageFilter(v as ApplicationStage | "all")
                  }
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stages</SelectItem>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground ml-2">
                  {sortedApps.length} candidate
                  {sortedApps.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 font-medium"
                          onClick={() => toggleSort("name")}
                        >
                          Candidate
                          {sortBy === "name" ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="ml-1 h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 font-medium"
                          onClick={() => toggleSort("job")}
                        >
                          Job
                          {sortBy === "job" ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="ml-1 h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 font-medium"
                          onClick={() => toggleSort("stage")}
                        >
                          Stage
                          {sortBy === "stage" ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="ml-1 h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 font-medium"
                          onClick={() => toggleSort("date")}
                        >
                          Applied
                          {sortBy === "date" ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="ml-1 h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 font-medium"
                          onClick={() => toggleSort("score")}
                        >
                          Score
                          {sortBy === "score" ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="ml-1 h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedApps.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No candidates found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedApps.map((app) => {
                        const job = jobs.find((j) => j.id === app.jobId);
                        return (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">
                              {app.candidateName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {job?.title ?? "Deleted job"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "font-normal",
                                  app.stage === "Applied" &&
                                    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                                  app.stage === "Reviewed" &&
                                    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
                                  app.stage === "Interview Scheduled" &&
                                    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
                                  app.stage === "Offer Sent" &&
                                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                )}
                              >
                                {app.stage}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {format(new Date(app.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {app.score !== undefined ? (
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3.5 w-3.5",
                                        i < app.score!
                                          ? "text-primary fill-primary"
                                          : "text-muted"
                                      )}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                asChild
                              >
                                <Link
                                  to={`/admin/candidates/${app.id}`}
                                  aria-label="View candidate"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex gap-4 sm:gap-6 h-full min-w-max pb-4">
                {STAGES.map((stage) => (
                  <DroppableColumn
                    key={stage}
                    id={stage}
                    stage={stage}
                    count={appsByStage[stage].length}
                  >
                    <SortableContext
                      id={stage}
                      items={appsByStage[stage].map((app) => app.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {appsByStage[stage].length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl bg-card/30 text-muted-foreground">
                          <p className="text-xs">No candidates</p>
                        </div>
                      ) : (
                        appsByStage[stage].map((app) => (
                          <SortableApplicationCard
                            key={app.id}
                            app={app}
                            job={jobs.find((j) => j.id === app.jobId)}
                          />
                        ))
                      )}
                    </SortableContext>
                  </DroppableColumn>
                ))}
              </div>
            </div>

            <DragOverlay adjustScale={true}>
              {activeId && activeApp ? (
                <div className="w-[240px] sm:w-80 max-w-[90vw] cursor-grabbing">
                  <Card className="shadow-2xl border-primary/20 rotate-1 scale-105">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold truncate">
                        {activeApp.candidateName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <p className="text-xs text-muted-foreground font-medium">
                        {activeJob?.title ?? "Deleted Job"}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t mt-2">
                        <div className="flex items-center text-[10px] text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(new Date(activeApp.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </Layout>
  );
}
