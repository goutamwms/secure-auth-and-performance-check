import {Router, Request, Response} from 'express'
import {getTickets,updateTicket,nextStatus,nextPriority} from '../ticketdata.js'

const app = Router();

app.get('/', async (_req, res:Response) => {
  try {
    const tickets = getTickets();
    return res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.patch("/:id/status", (req, res) => {
  const id = Number(req.params.id);

  const updated = updateTicket(id, (ticket) => ({
    ...ticket,
    status: nextStatus(ticket.status)
  }));

  if (!updated) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  return res.json(updated);
});

app.patch("/:id/priority", (req, res) => {
  const id = Number(req.params.id);

  const updated = updateTicket(id, (ticket) => ({
    ...ticket,
    priority: nextPriority(ticket.priority)
  }));

  if (!updated) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  return res.json(updated);
});

export default app;
