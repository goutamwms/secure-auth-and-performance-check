
const FruitValues = ["apple", "banana"] as const;
type Fruits = (typeof FruitValues)[number]; //(typeof FruitValues)[0 | 1];

const fruitBasket: Fruits[] = [];
FruitValues.forEach(Fruit => fruitBasket.push(Fruit));
console.log('fruitBasket',fruitBasket);


/* ticketing system */

const PriorityValues =  ["low", "medium", "high"] as const;
const StatusValues =  ["open", "in-progress", "resolved"] as const;

//export type Priority = "low" | "medium" | "high"
export type Priority = (typeof PriorityValues)[number];
//export type Status = "open" | "in-progress" | "resolved"
export type Status = (typeof StatusValues)[number];



export interface Ticket {
  id: number;
  subject :string;
  customer: string;
  priority: Priority;
  status: Status;
  assignee:string;
  createdAt:string;
  messageCount:number;
  tags:string[];
  ticketFiles?: TicketFile[];
}

export interface TicketFile {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}


const subjects = [
  "Login issue",
  "Payment failed",
  "Invoice mismatch",
  "Feature request",
  "Account locked",
  "Mobile UI bug",
  "Export not working",
  "Slow dashboard",
  "Missing notification",
  "Role permission problem"
];

const customers = [
  "Acme Corp",
  "Globex",
  "Initech",
  "Umbrella",
  "Wayne Enterprises",
  "Stark Industries",
  "Wonka Ltd",
  "Hooli",
  "Vandelay",
  "Oscorp"
];

const assignees = ["Ava", "Noah", "Mia", "Liam", "Sophia", "Unassigned"];
//const priorities = ["low", "medium", "high"];
//const statuses: Status[] = ["open", "in-progress", "resolved"];

const priorities = PriorityValues;
const statuses = StatusValues;

//const priorities = [...PriorityValues];
//const statuses = [...StatusValues];

const tagsPool = [
  "billing",
  "auth",
  "ui",
  "api",
  "enterprise",
  "mobile",
  "security",
  "reporting"
];

function createTickets(count = 5): Ticket[] {
  const now = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    return {
      id,
      subject: `${subjects[index % subjects.length]} #${1000 + id}`,
      customer: customers[index % customers.length],
      priority: priorities[index % priorities.length],
      status: statuses[index % statuses.length],
      assignee: assignees[index % assignees.length],
      createdAt: new Date(now - index * 1000 * 60 * 60 * 6).toISOString(),
      messagesCount: ((index * 7) % 15) + 1,
      tags: [
        tagsPool[index % tagsPool.length],
        tagsPool[(index + 3) % tagsPool.length]
      ]
    };
  });
}

export const db:Ticket[] = createTickets();

export function getTickets(): Ticket[] {
  return [...db].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateTicket(
  id: number,
  updater: (ticket: Ticket) => Ticket
): Ticket | undefined {
  const index = db.findIndex((ticket) => ticket.id === id);
  if (index === -1) return undefined;

  db[index] = updater(db[index]);
  return db[index];
}

export function nextStatus(status:Status):Status {
    if(status === "open") return "in-progress";
    if(status === "in-progress") return "resolved";
    return "open";
}

export function nextPriority(priority: Priority): Priority {
  if (priority === "low") return "medium";
  if (priority === "medium") return "high";
  return "low";
}