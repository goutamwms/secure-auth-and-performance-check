import type {Ticket} from "./types/Ticket";

// Unwrap method for standard API calls (URL, method, body)
async function unwrap<T>(
  url: string,
  method: string = 'GET',
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
  };

  if (body) {
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getTickets(): Promise<Ticket[]> {
   return unwrap<Ticket[]>("/api/tickets");
}

export function toggleTicketStatus(id: number): Promise<Ticket> {
  return unwrap<Ticket>(`/api/tickets/${id}/status`, "PATCH");
}

export function advanceTicketPriority(id: number): Promise<Ticket> {
  return unwrap<Ticket>(`/api/tickets/${id}/priority`, "PATCH");
}