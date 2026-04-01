export type Priority = "low" | "medium" | "high";
export type Status = "open" | "in-progress" | "resolved";

export interface TicketFile {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  customer: string;
  priority: Priority;
  status: Status;
  assignee: string;
  createdAt: string;
  messagesCount: number;
  tags: string[];
  ticketFiles?: TicketFile[];
}

export interface Analytics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  avgMessages: number;
  topAssignees: { name: string; count: number }[];
  statusBars: { label: string; value: number; color: string }[];
}
