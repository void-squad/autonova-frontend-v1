import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Project, ProjectActivity, ProjectStatus, Quote, QuoteStatus, Task } from "@/types/project";

const PERSIST = false;
const STORAGE_KEY = "autonova.projects.store";
const REQUEST_DELAY_MS = 120;

export type ListProjectsParams = {
  q?: string;
  status?: ProjectStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type ListProjectsResult = {
  data: Project[];
  total: number;
  page: number;
  pageSize: number;
};

type CreateProjectInput = Pick<Project, "customerName" | "title" | "description" | "priority">;
type UpdateProjectInput = Partial<Omit<Project, "id" | "code" | "createdAt" | "updatedAt" | "assigneeIds" | "startDate" | "endDate" | "status">>;
type CreateTaskInput = Pick<Task, "name" | "hours" | "rate">;
type UpdateTaskInput = Partial<CreateTaskInput>;
type ScheduleInput = Pick<Project, "startDate" | "endDate">;

export interface Employee {
  id: string;
  name: string;
  email: string;
}

const EMPLOYEES: Employee[] = [
  { id: "emp-001", name: "Sophia Alvarez", email: "s.alvarez@autonova.io" },
  { id: "emp-002", name: "Michael Chen", email: "m.chen@autonova.io" },
  { id: "emp-003", name: "Priya Patel", email: "p.patel@autonova.io" },
  { id: "emp-004", name: "Daniel Brooks", email: "d.brooks@autonova.io" },
  { id: "emp-005", name: "Helena Morais", email: "h.morais@autonova.io" },
];

interface StoredState {
  projects: Project[];
  tasks: Task[];
  quotes: Quote[];
  activity: ProjectActivity[];
}

interface ProjectsStoreValue extends StoredState {
  listProjects: (filters?: ListProjectsParams) => Promise<ListProjectsResult>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  getProject: (id: string) => Promise<Project | null>;
  updateProject: (id: string, patch: UpdateProjectInput) => Promise<Project>;
  listTasks: (projectId: string) => Promise<Task[]>;
  addTask: (projectId: string, input: CreateTaskInput) => Promise<Task>;
  updateTask: (projectId: string, taskId: string, patch: UpdateTaskInput) => Promise<Task>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  getQuote: (projectId: string) => Promise<Quote | null>;
  createQuote: (projectId: string, taxRate?: number) => Promise<Quote>;
  approveProject: (id: string) => Promise<Project>;
  rejectProject: (id: string) => Promise<Project>;
  setAssignees: (id: string, assigneeIds: string[]) => Promise<Project>;
  setSchedule: (id: string, schedule: ScheduleInput) => Promise<Project>;
  startProject: (id: string) => Promise<Project>;
  completeProject: (id: string) => Promise<Project>;
  cancelProject: (id: string) => Promise<Project>;
}

const ProjectsStoreContext = createContext<ProjectsStoreValue | undefined>(undefined);

const delay = (ms: number = REQUEST_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const nowIso = () => new Date().toISOString();

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const getDefaultState = (): StoredState => {
  const baseCreated = new Date();

  const projects: Project[] = [
    {
      id: createId(),
      code: "PRJ-0001",
      customerName: "Alex Murphy",
      title: "Widebody Kit Installation",
      status: "pending",
      priority: "high",
      description: "Install a custom widebody kit with paint matching and suspension calibration",
      assigneeIds: [],
      createdAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: createId(),
      code: "PRJ-0002",
      customerName: "Dana Walsh",
      title: "Performance Tune & Exhaust Upgrade",
      status: "approved",
      priority: "medium",
      description: "Stage 2 ECU tune with titanium exhaust installation and dyno verification",
      assigneeIds: [EMPLOYEES[1].id, EMPLOYEES[3].id],
      startDate: new Date(baseCreated.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
      endDate: new Date(baseCreated.getTime() + 1000 * 60 * 60 * 24 * 10).toISOString().slice(0, 10),
      createdAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      updatedAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: createId(),
      code: "PRJ-0003",
      customerName: "Marcus Reed",
      title: "Interior Customization",
      status: "in_progress",
      priority: "low",
      description: "Custom leather upholstery, ambient lighting retrofit, and smart controls",
      assigneeIds: [EMPLOYEES[0].id],
      startDate: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10),
      endDate: new Date(baseCreated.getTime() + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10),
      createdAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updatedAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
  ];

  const tasks: Task[] = [
    {
      id: createId(),
      projectId: projects[0].id,
      name: "Body kit fitting",
      hours: 8,
      rate: 120,
    },
    {
      id: createId(),
      projectId: projects[0].id,
      name: "Paint matching",
      hours: 5,
      rate: 110,
    },
    {
      id: createId(),
      projectId: projects[1].id,
      name: "ECU calibration",
      hours: 3,
      rate: 140,
    },
    {
      id: createId(),
      projectId: projects[1].id,
      name: "Exhaust installation",
      hours: 4,
      rate: 115,
    },
    {
      id: createId(),
      projectId: projects[2].id,
      name: "Upholstery prep",
      hours: 6,
      rate: 100,
    },
    {
      id: createId(),
      projectId: projects[2].id,
      name: "Lighting wiring",
      hours: 2,
      rate: 95,
    },
  ];

  const quoteSubtotal = tasks
    .filter((task) => task.projectId === projects[1].id)
    .reduce((sum, task) => sum + task.hours * task.rate, 0);

  const quotes: Quote[] = [
    {
      id: createId(),
      projectId: projects[1].id,
      subtotal: quoteSubtotal,
      tax: Number((quoteSubtotal * 0.1).toFixed(2)),
      total: Number((quoteSubtotal * 1.1).toFixed(2)),
      status: "draft",
    },
  ];

  const activity: ProjectActivity[] = [
    {
      id: createId(),
      projectId: projects[0].id,
      type: "project",
      message: "Project created",
      at: projects[0].createdAt,
    },
    {
      id: createId(),
      projectId: projects[1].id,
      type: "project",
      message: "Project approved",
      at: projects[1].updatedAt,
    },
    {
      id: createId(),
      projectId: projects[2].id,
      type: "project",
      message: "Project moved to in progress",
      at: projects[2].updatedAt,
    },
  ];

  return {
    projects,
    tasks,
    quotes,
    activity,
  };
};

const defaultState = getDefaultState();

export const computeProjectList = (source: Project[], filters?: ListProjectsParams): ListProjectsResult => {
  const { q, status, from, to, page = 1, pageSize = 10 } = filters ?? {};

  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  let result = [...source];

  if (q) {
    const query = q.toLowerCase();
    result = result.filter(
      (project) => project.title.toLowerCase().includes(query) || project.customerName.toLowerCase().includes(query),
    );
  }

  if (status) {
    result = result.filter((project) => project.status === status);
  }

  if (fromDate) {
    result = result.filter((project) => new Date(project.createdAt) >= fromDate);
  }

  if (toDate) {
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);
    result = result.filter((project) => new Date(project.createdAt) <= endOfDay);
  }

  result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const total = result.length;
  const start = (page - 1) * pageSize;
  const data = result.slice(start, start + pageSize);

  return { data, total, page, pageSize };
};

export const ProjectsStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(defaultState.projects);
  const [tasks, setTasks] = useState<Task[]>(defaultState.tasks);
  const [quotes, setQuotes] = useState<Quote[]>(defaultState.quotes);
  const [activity, setActivity] = useState<ProjectActivity[]>(defaultState.activity);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!PERSIST || hasHydrated.current) return;

    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as StoredState;
        setProjects(parsed.projects);
        setTasks(parsed.tasks);
        setQuotes(parsed.quotes);
        setActivity(parsed.activity);
      } catch {
        // ignore bad payloads
      }
    }
    hasHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!PERSIST) return;
    const payload: StoredState = { projects, tasks, quotes, activity };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [projects, tasks, quotes, activity]);

  const recordActivity = useCallback((projectId: string, message: string, type: string) => {
    const entry: ProjectActivity = {
      id: createId(),
      projectId,
      type,
      message,
      at: nowIso(),
    };
    setActivity((prev) => [entry, ...prev]);
  }, []);

  const touchProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, updatedAt: nowIso() } : project)),
    );
  }, []);

  const mutateProject = useCallback(
    (
      id: string,
      mutator: (project: Project) => Project,
      activityMessage?: string,
      activityType: string = "project",
    ) => {
      let updated: Project | null = null;
      const timestamp = nowIso();

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== id) {
            return project;
          }
          const candidate = mutator({ ...project });
          updated = {
            ...candidate,
            updatedAt: timestamp,
          };
          return updated;
        }),
      );

      if (!updated) {
        throw new Error("Project not found");
      }

      if (activityMessage) {
        recordActivity(id, activityMessage, activityType);
      }

      return updated;
    },
    [recordActivity],
  );

  const recalcQuoteForProject = useCallback((projectId: string, tasksSnapshot: Task[]) => {
    setQuotes((prev) =>
      prev.map((quote) => {
        if (quote.projectId !== projectId || quote.status !== "draft") {
          return quote;
        }
        const subtotal = tasksSnapshot
          .filter((task) => task.projectId === projectId)
          .reduce((sum, task) => sum + task.hours * task.rate, 0);
        const tax = Number((subtotal * 0.1).toFixed(2));
        const total = Number((subtotal + tax).toFixed(2));
        return { ...quote, subtotal, tax, total };
      }),
    );
  }, []);

  const listProjects = useCallback(
    async (filters?: ListProjectsParams): Promise<ListProjectsResult> => {
      await delay();
      return computeProjectList(projects, filters);
    },
    [projects],
  );

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      await delay();
      let created: Project | null = null;

      setProjects((prev) => {
        const maxSeq = prev.reduce((acc, project) => {
          const match = project.code.match(/PRJ-(\d+)/);
          if (match) {
            return Math.max(acc, parseInt(match[1] ?? "0", 10));
          }
          return acc;
        }, 0);

        const code = `PRJ-${String(maxSeq + 1).padStart(4, "0")}`;
        const timestamp = nowIso();
        created = {
          id: createId(),
          code,
          customerName: input.customerName,
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: "pending",
          assigneeIds: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        return [...prev, created!];
      });

      if (!created) {
        throw new Error("Failed to create project");
      }

      recordActivity(created.id, "Project created", "project");
      return created;
    },
    [recordActivity],
  );

  const getProject = useCallback(
    async (id: string) => {
      await delay();
      return projects.find((project) => project.id === id) ?? null;
    },
    [projects],
  );

  const updateProject = useCallback(
    async (id: string, patch: UpdateProjectInput) => {
      await delay();
      return mutateProject(id, (project) => ({ ...project, ...patch }), "Project updated");
    },
    [mutateProject],
  );

  const listTasks = useCallback(
    async (projectId: string) => {
      await delay();
      return tasks.filter((task) => task.projectId === projectId);
    },
    [tasks],
  );

  const addTask = useCallback(
    async (projectId: string, input: CreateTaskInput) => {
      await delay();
      const task: Task = {
        id: createId(),
        projectId,
        name: input.name,
        hours: input.hours,
        rate: input.rate,
      };

      setTasks((prev) => {
        const next = [...prev, task];
        recalcQuoteForProject(projectId, next);
        return next;
      });

      touchProject(projectId);
      recordActivity(projectId, `Task added: ${task.name}`, "task");
      return task;
    },
    [recordActivity, recalcQuoteForProject, touchProject],
  );

  const updateTask = useCallback(
    async (projectId: string, taskId: string, patch: UpdateTaskInput) => {
      await delay();
      let updatedTask: Task | null = null;

      setTasks((prev) => {
        const next = prev.map((task) => {
          if (task.id !== taskId) {
            return task;
          }
          updatedTask = {
            ...task,
            ...patch,
          };
          return updatedTask!;
        });
        recalcQuoteForProject(projectId, next);
        return next;
      });

      if (!updatedTask) {
        throw new Error("Task not found");
      }

      touchProject(projectId);
      recordActivity(projectId, `Task updated: ${updatedTask.name}`, "task");
      return updatedTask;
    },
    [recordActivity, recalcQuoteForProject, touchProject],
  );

  const deleteTask = useCallback(
    async (projectId: string, taskId: string) => {
      await delay();
      let removed: Task | null = null;

      setTasks((prev) => {
        const next = prev.filter((task) => {
          if (task.id === taskId) {
            removed = task;
            return false;
          }
          return true;
        });
        recalcQuoteForProject(projectId, next);
        return next;
      });

      if (!removed) {
        throw new Error("Task not found");
      }

      touchProject(projectId);
      recordActivity(projectId, `Task removed: ${removed.name}`, "task");
    },
    [recordActivity, recalcQuoteForProject, touchProject],
  );

  const getQuote = useCallback(
    async (projectId: string) => {
      await delay();
      return quotes.find((quote) => quote.projectId === projectId) ?? null;
    },
    [quotes],
  );

  const createQuote = useCallback(
    async (projectId: string, taxRate = 0.1) => {
      await delay();
      const relatedTasks = tasks.filter((task) => task.projectId === projectId);
      const subtotal = relatedTasks.reduce((sum, task) => sum + task.hours * task.rate, 0);
      const tax = Number((subtotal * taxRate).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      let quote: Quote;
      const existing = quotes.find((q) => q.projectId === projectId);
      if (existing) {
        quote = { ...existing, subtotal, tax, total, status: "draft" as QuoteStatus };
        setQuotes((prev) => prev.map((q) => (q.projectId === projectId ? quote : q)));
        recordActivity(projectId, "Quote regenerated (draft)", "quote");
      } else {
        quote = {
          id: createId(),
          projectId,
          subtotal,
          tax,
          total,
          status: "draft",
        };
        setQuotes((prev) => [...prev, quote]);
        recordActivity(projectId, "Quote created (draft)", "quote");
      }

      touchProject(projectId);
      return quote;
    },
    [quotes, recordActivity, tasks, touchProject],
  );

  const approveProject = useCallback(
    async (id: string) => {
      await delay();
      return mutateProject(id, (project) => {
        if (project.status !== "pending") {
          throw new Error("Only pending projects can be approved.");
        }
        return { ...project, status: "approved" };
      }, "Project approved");
    },
    [mutateProject],
  );

  const rejectProject = useCallback(
    async (id: string) => {
      await delay();
      return mutateProject(id, (project) => {
        if (project.status !== "pending") {
          throw new Error("Only pending projects can be rejected.");
        }
        return { ...project, status: "cancelled" };
      }, "Project rejected");
    },
    [mutateProject],
  );

  const setAssignees = useCallback(
    async (id: string, assigneeIds: string[]) => {
      await delay();
      return mutateProject(
        id,
        (project) => ({
          ...project,
          assigneeIds: Array.from(new Set(assigneeIds)),
        }),
        "Assignees updated",
      );
    },
    [mutateProject],
  );

  const setSchedule = useCallback(
    async (id: string, schedule: ScheduleInput) => {
      await delay();
      if (schedule.startDate && schedule.endDate && new Date(schedule.startDate) > new Date(schedule.endDate)) {
        throw new Error("Start date must be before the end date.");
      }
      return mutateProject(
        id,
        (project) => ({
          ...project,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
        }),
        "Schedule updated",
      );
    },
    [mutateProject],
  );

  const startProject = useCallback(
    async (id: string) => {
      await delay();
      return mutateProject(id, (project) => {
        if (project.status !== "approved") {
          throw new Error("Approve the project before starting");
        }
        return { ...project, status: "in_progress" };
      }, "Project started");
    },
    [mutateProject],
  );

  const completeProject = useCallback(
    async (id: string) => {
      await delay();
      return mutateProject(id, (project) => {
        if (project.status !== "in_progress") {
          throw new Error("Only in-progress projects can be completed");
        }
        return { ...project, status: "completed" };
      }, "Project completed");
    },
    [mutateProject],
  );

  const cancelProject = useCallback(
    async (id: string) => {
      await delay();
      return mutateProject(
        id,
        (project) => {
          if (project.status === "cancelled") {
            throw new Error("Project already cancelled");
          }
          if (project.status === "completed") {
            throw new Error("Completed projects cannot be cancelled");
          }
          return { ...project, status: "cancelled" };
        },
        "Project cancelled",
      );
    },
    [mutateProject],
  );

  const value = useMemo<ProjectsStoreValue>(
    () => ({
      projects,
      tasks,
      quotes,
      activity,
      listProjects,
      createProject,
      getProject,
      updateProject,
      listTasks,
      addTask,
      updateTask,
      deleteTask,
      getQuote,
      createQuote,
      approveProject,
      rejectProject,
      setAssignees,
      setSchedule,
      startProject,
      completeProject,
      cancelProject,
    }),
    [
      projects,
      tasks,
      quotes,
      activity,
      listProjects,
      createProject,
      getProject,
      updateProject,
      listTasks,
      addTask,
      updateTask,
      deleteTask,
      getQuote,
      createQuote,
      approveProject,
      rejectProject,
      setAssignees,
      setSchedule,
      startProject,
      completeProject,
      cancelProject,
    ],
  );

  return <ProjectsStoreContext.Provider value={value}>{children}</ProjectsStoreContext.Provider>;
};

export const useProjectsStore = () => {
  const context = useContext(ProjectsStoreContext);
  if (!context) {
    throw new Error("useProjectsStore must be used within a ProjectsStoreProvider");
  }
  return context;
};

export const useEmployees = () => EMPLOYEES;
