import { memo, useCallback, useRef } from "react";
import type { Ticket } from "../types/Ticket";

interface TicketRowProps {
  ticket: Ticket;
  onToggleStatus: (id: number) => Promise<void>;
  onCyclePriority: (id: number) => Promise<void>;
}

const statusLabel: Record<Ticket["status"], string> = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved"
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export const TicketRow = memo(function TicketRow({
  ticket,
  onToggleStatus,
  onCyclePriority,
}: TicketRowProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const handleStatusClick = useCallback(() => {
    void onToggleStatus(ticket.id);
  }, [onToggleStatus, ticket.id]);

  const handlePriorityClick = useCallback(() => {
    void onCyclePriority(ticket.id);
  }, [onCyclePriority, ticket.id]);

  return (
    <article className={`ticket-row priority-${ticket.priority}`}>
      <div className="ticket-main">
        <div className="ticket-title-row">
          <h3>{ticket.subject}</h3>
          {ticket.ticketFiles && ticket.ticketFiles.length > 0 && (
              <span className="ticket-attachment" title="Attachments">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                 {ticket.ticketFiles.length}
            </span>
          )}
          <span className="render-pill">row renders: {renderCount.current}</span>
        </div>

        <p className="ticket-meta">
          <strong>{ticket.customer}</strong> · {ticket.assignee} ·{" "}
          {formatDate(ticket.createdAt)}
        </p>

        <div className="tags">
          {ticket.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="ticket-side">
        <span className={`badge status-${ticket.status}`}>
          {statusLabel[ticket.status]}
        </span>

        <span className={`badge priority-${ticket.priority}`}>
          {ticket.priority.toUpperCase()}
        </span>

        <span className="messages">{ticket.messagesCount} messages</span>

        <div className="actions">
          <button onClick={handleStatusClick}>Next status</button>
          <button onClick={handlePriorityClick}>Next priority</button>
        </div>
      </div>
    </article>
  );
});
