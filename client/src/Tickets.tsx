import { useCallback, useEffect, useMemo, useState } from "react";
import { advanceTicketPriority, getTickets, toggleTicketStatus } from "./TicketApi";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { TicketRow } from "./components/TicketRow";
import type { Analytics, Priority, Status, Ticket } from "./types/Ticket";

type StatusFilter = Status | "all";
type PriorityFilter = Priority | "all";
type SortBy = "newest" | "oldest" | "messages";

import "./Tickets.css";

function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const replaceTicket = useCallback((updatedTicket: Ticket) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  }, []);

  const onToggleStatus = useCallback(
    async (id: number) => {
      setError("");

      try {
        const updated = await toggleTicketStatus(id);
        replaceTicket(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update status");
      }
    },
    [replaceTicket]
  );

  const onCyclePriority = useCallback(
    async (id: number) => {
      setError("");

      try {
        const updated = await advanceTicketPriority(id);
        replaceTicket(updated);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not update priority"
        );
      }
    },
    [replaceTicket]
  );

  // useMemo practical use case #1:
  // expensive derived list: filter + search + sort
  const visibleTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = tickets.filter((ticket) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        ticket.subject.toLowerCase().includes(normalizedQuery) ||
        ticket.customer.toLowerCase().includes(normalizedQuery) ||
        ticket.assignee.toLowerCase().includes(normalizedQuery) ||
        ticket.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      if (sortBy === "messages") {
        return b.messagesCount - a.messagesCount;
      }

      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      return sortBy === "oldest" ? aTime - bTime : bTime - aTime;
    });

    return filtered;
  }, [tickets, query, statusFilter, priorityFilter, sortBy]);

  // useMemo practical use case #2:
  // expensive summary/analytics only when raw tickets change
  const analytics = useMemo<Analytics>(() => {
    const mutableStatus = {
      open: 0,
      "in-progress": 0,
      resolved: 0
    };

    let highPriority = 0;
    let totalMessages = 0;
    const byAssignee = new Map<string, number>();

    for (const ticket of tickets) {
      mutableStatus[ticket.status] += 1;
      totalMessages += ticket.messagesCount;

      if (ticket.priority === "high") {
        highPriority += 1;
      }

      byAssignee.set(ticket.assignee, (byAssignee.get(ticket.assignee) ?? 0) + 1);
    }

    return {
      total: tickets.length,
      open: mutableStatus.open,
      inProgress: mutableStatus["in-progress"],
      resolved: mutableStatus.resolved,
      highPriority,
      avgMessages: tickets.length
        ? Number((totalMessages / tickets.length).toFixed(1))
        : 0,
      topAssignees: [...byAssignee.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      statusBars: [
        { label: "Open", value: mutableStatus.open, color: "#ef4444" },
        {
          label: "In progress",
          value: mutableStatus["in-progress"],
          color: "#f59e0b"
        },
        { label: "Resolved", value: mutableStatus.resolved, color: "#10b981" }
      ]
    };
  }, [tickets]);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">React performance demo</p>
          <h1>Support Desk Performance Dashboard</h1>
          <p className="lead">
            This app demonstrates practical, real-world use cases for{" "}
            <code>memo</code>, <code>useMemo</code>, and <code>useCallback</code>.
            Try typing in search, changing filters, and updating one ticket.
          </p>
        </div>

        <button className="refresh-button" onClick={() => void loadTickets()}>
          {loading ? "Refreshing..." : "Refresh from API"}
        </button>
      </header>

      <section className="panel">
        <div className="controls">
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, customer, assignee, or tag"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="newest">Sort: newest</option>
            <option value="oldest">Sort: oldest</option>
            <option value="messages">Sort: messages</option>
          </select>
        </div>

        <p className="hint">
          Watch the render counters. Typing in the search box rerenders the page,
          but thanks to memoization, unchanged rows and the analytics panel avoid
          unnecessary rerenders.
        </p>
      </section>

      {error ? <div className="error-card">{error}</div> : null}

      <AnalyticsPanel analytics={analytics} />

      <section className="panel">
        <div className="panel-header">
          <h2>Tickets</h2>
          <span className="subtle-count">
            {visibleTickets.length} visible / {tickets.length} total
          </span>
        </div>

        <div className="ticket-list">
          {visibleTickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              onToggleStatus={onToggleStatus}
              onCyclePriority={onCyclePriority}
            />
          ))}

          {visibleTickets.length === 0 && (
            <div className="empty-state">No tickets match your current filters.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Tickets;
