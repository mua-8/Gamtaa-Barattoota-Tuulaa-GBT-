"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailOpen,
  Reply,
  Trash2,
  Archive,
  Search,
  Clock,
  User,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateMessageStatus, deleteMessage, MessageStatus } from "@/lib/actions/messages";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
}

interface MessagesClientProps {
  initialMessages: ContactMessage[];
}

export function MessagesClient({ initialMessages }: MessagesClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [activeFilter, setActiveFilter] = useState<"all" | MessageStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = activeFilter === "all" ? true : msg.status === activeFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const newCount = messages.filter((m) => m.status === "new").length;
  const readCount = messages.filter((m) => m.status === "read").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;
  const archivedCount = messages.filter((m) => m.status === "archived").length;

  const handleStatusChange = async (id: string, newStatus: MessageStatus) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await updateMessageStatus(id, newStatus);
      if (res?.error) {
        setFeedback({ text: res.error, type: "error" });
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setFeedback({ text: `Message marked as ${newStatus}.`, type: "success" });
        router.refresh();
      }
    } catch {
      setFeedback({ text: "Failed to update status", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await deleteMessage(id);
      if (res?.error) {
        setFeedback({ text: res.error, type: "error" });
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        setFeedback({ text: "Message permanently deleted.", type: "success" });
        router.refresh();
      }
    } catch {
      setFeedback({ text: "Failed to delete message", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const openMessageModal = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    // If it was 'new', automatically mark as 'read'
    if (msg.status === "new") {
      handleStatusChange(msg.id, "read");
    }
  };

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case "new":
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">New</Badge>;
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "replied":
        return <Badge className="bg-purple-600 text-white hover:bg-purple-700">Replied</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-destructive/15 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "all"
                ? "bg-forest-900 text-white"
                : "bg-forest-50 text-forest-800 hover:bg-forest-100"
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setActiveFilter("new")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "new"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            New ({newCount})
          </button>
          <button
            onClick={() => setActiveFilter("read")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "read"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            Read ({readCount})
          </button>
          <button
            onClick={() => setActiveFilter("replied")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "replied"
                ? "bg-purple-700 text-white"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            Replied ({repliedCount})
          </button>
          <button
            onClick={() => setActiveFilter("archived")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "archived"
                ? "bg-neutral-700 text-white"
                : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm focus-visible:outline-ring"
          />
        </div>
      </div>

      {/* Messages List / Table */}
      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-16 text-center shadow-sm">
          <Mail className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-semibold text-foreground">No messages found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {searchQuery
              ? `No messages matched "${searchQuery}". Try a different search term.`
              : "Your inbox is clear. Messages submitted through the contact form will appear here."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border bg-white shadow-sm overflow-hidden">
          {filteredMessages.map((msg) => {
            const isUnread = msg.status === "new";
            const dateStr = new Date(msg.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors hover:bg-muted/30 gap-4 ${
                  isUnread ? "bg-emerald-50/20 font-medium" : ""
                }`}
              >
                <div
                  onClick={() => openMessageModal(msg)}
                  className="flex-1 cursor-pointer min-w-0 pr-4"
                >
                  <div className="flex items-center gap-3">
                    {getStatusBadge(msg.status)}
                    <span className="font-semibold text-foreground text-sm truncate">
                      {msg.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate hidden md:inline">
                      &lt;{msg.email}&gt;
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto sm:ml-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dateStr}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm text-forest-950 font-bold truncate">
                    {msg.subject}
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {msg.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMessageModal(msg)}
                    className="h-8 text-xs font-semibold"
                  >
                    View
                  </Button>
                  {msg.status !== "replied" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Reply via email"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                          msg.subject
                        )}`}
                        onClick={() => handleStatusChange(msg.id, "replied")}
                      >
                        <Reply className="h-4 w-4 text-purple-600" />
                      </a>
                    </Button>
                  )}
                  {msg.status !== "archived" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Archive"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(msg.id, "archived")}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Unarchive (Mark Read)"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(msg.id, "read")}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <MailOpen className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Delete"
                    disabled={isProcessing}
                    onClick={() => handleDelete(msg.id)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message View Modal Dialog */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedMessage.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedMessage.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-forest-950">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-lg bg-forest-50/50 p-4 space-y-2 border border-forest-100 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-forest-600 shrink-0" />
                <span className="font-semibold text-foreground">Sender:</span>
                <span className="text-forest-950 font-bold">{selectedMessage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-forest-600 shrink-0" />
                <span className="font-semibold text-foreground">Email:</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-forest-800 underline hover:text-forest-950 font-medium"
                >
                  {selectedMessage.email}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Message Content
              </label>
              <div className="whitespace-pre-wrap rounded-lg border bg-neutral-50/60 p-4 text-sm text-foreground leading-relaxed max-h-72 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleStatusChange(
                      selectedMessage.id,
                      selectedMessage.status === "new" ? "read" : "new"
                    )
                  }
                  disabled={isProcessing}
                >
                  {selectedMessage.status === "new" ? "Mark Read" : "Mark as New"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleStatusChange(
                      selectedMessage.id,
                      selectedMessage.status === "archived" ? "read" : "archived"
                    )
                  }
                  disabled={isProcessing}
                >
                  {selectedMessage.status === "archived" ? "Unarchive" : "Archive"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-forest-900 text-white hover:bg-forest-800"
                >
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    onClick={() => handleStatusChange(selectedMessage.id, "replied")}
                  >
                    <Reply className="mr-1.5 h-3.5 w-3.5" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
