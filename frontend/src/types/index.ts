export type Role = "admin" | "manager";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

export interface UserListItem extends User {
  // /users/ endpoint returns the same shape; password only used on create
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  website: string;
  phone: string;
  notes: string;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  company: number | null;
  company_name: string | null;
  notes: string;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
}

export interface ContactDetail extends Contact {
  activities: Activity[];
}

export type ActivityType = "call" | "email" | "meeting" | "note";

export interface Activity {
  id: number;
  contact: number | null;
  deal: number | null;
  type: ActivityType;
  text: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
}

export type DealStage =
  | "new"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Deal {
  id: number;
  title: string;
  contact: number | null;
  contact_name: string | null;
  company: number | null;
  company_name: string | null;
  amount: string;
  stage: DealStage;
  stage_display: string;
  probability: number;
  expected_close_date: string | null;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "open" | "done";

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  status: TaskStatus;
  deal: number | null;
  deal_title: string | null;
  contact: number | null;
  contact_name: string | null;
  assignee: number;
  assignee_username: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  stage: DealStage;
  count: number;
  total_amount: string | number;
}

export interface PipelineAnalytics {
  by_stage: PipelineStage[];
  total_deals: number;
  conversion_rate: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface ManagerActivity {
  owner__username: string;
  deal_count: number;
  total_amount: string | number;
}

export interface ImportResultTotals {
  new: number;
  update: number;
  delete: number;
  skip: number;
  error: number;
  invalid: number;
}

export interface ImportResult {
  total_rows: number;
  totals: ImportResultTotals;
  errors: string[];
  has_errors: boolean;
}

export interface ApiFieldErrors {
  [field: string]: string[] | string | undefined;
  detail?: string;
}
