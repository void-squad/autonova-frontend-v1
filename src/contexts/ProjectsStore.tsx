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
type UpdateProjectInput = Partial<Omit<Project, "id" | "code" | "createdAt" | "updatedAt">>;
type CreateTaskInput = Pick<Task, "name" | "hours" | "rate">;
type UpdateTaskInput = Partial<CreateTaskInput>;

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
      status: "requested",
      priority: "high",
      description: "Install custom widebody kit with paint matching and alignment",
      createdAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: createId(),
      code: "PRJ-0002",
      customerName: "Dana Walsh",
      title: "Performance Tune & Exhaust Upgrade",
      status: "quoted",
      priority: "medium",
      description: "ECU tune for stage 2 kit, install cat-back exhaust system",
      createdAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      updatedAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: createId(),
      code: "PRJ-0003",
      customerName: "Marcus Reed",
      title: "Interior Customization",
      status: "approved",
      priority: "low",
      description: "Custom leather upholstery and ambient lighting upgrade",
      createdAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updatedAt: new Date(baseCreated.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
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
      message: "Project quoted",
      at: projects[1].updatedAt,
    },
    {
      id: createId(),
      projectId: projects[2].id,
      type: "project",
      message: "Project approved",
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
        // ignore
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
          status: "requested",
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
      let updated: Project | null = null;
      const timestamp = nowIso();

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== id) {
            return project;
          }
          updated = {
            ...project,
            ...patch,
            updatedAt: timestamp,
          };
          return updated!;
        }),
      );

      if (!updated) {
        throw new Error("Project not found");
      }

      recordActivity(id, "Project updated", "project");
      return updated;
    },
    [recordActivity],
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
      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? { ...project, updatedAt: nowIso() } : project)),
      );
      recordActivity(projectId, `Task added: ${task.name}`, "task");
      return task;
    },
    [recordActivity, recalcQuoteForProject],
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

      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? { ...project, updatedAt: nowIso() } : project)),
      );

      recordActivity(projectId, `Task updated: ${updatedTask.name}`, "task");
      return updatedTask;
    },
    [recordActivity, recalcQuoteForProject],
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

      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? { ...project, updatedAt: nowIso() } : project)),
      );

      recordActivity(projectId, `Task removed: ${removed.name}`, "task");
    },
    [recordActivity, recalcQuoteForProject],
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
      }

      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) {
            return project;
          }
          return { ...project, status: "quoted", updatedAt: nowIso() };
        }),
      );

      recordActivity(projectId, "Quote created (draft)", "quote");
      return quote;
    },
    [quotes, recordActivity, tasks],
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
