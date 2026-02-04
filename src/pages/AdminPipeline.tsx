import { useState, useEffect } from "react";
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

export function AdminPipeline() {
  const { applications, jobs, updateApplication, isHydrated, hydrate } =
    useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const filteredApps = applications.filter((app) => {
    const job = jobs.find((j) => j.id === app.jobId);
    const searchStr = `${app.candidateName} ${job?.title ?? ""}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const appsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredApps.filter((app) => app.stage === stage);
    return acc;
  }, {} as Record<ApplicationStage, Application[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const navigate = useNavigate();

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
            <div className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[280px]">
              <div className="relative w-full">
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
      </div>
    </Layout>
  );
}
