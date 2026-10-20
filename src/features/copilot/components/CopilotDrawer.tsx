"use client";

import * as React from "react";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";
import {
    Badge,
    Button,
    Input,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui";
import { Role } from "@/types";

interface Message {
    id: string;
    sender: "user" | "assistant";
    text: string;
    timestamp: string;
}

interface CopilotDrawerProps {
    userRole?: Role;
}

export default function CopilotDrawer({ userRole = Role.CITIZEN }: CopilotDrawerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const [messages, setMessages] = React.useState<Message[]>([
        {
            id: "initial",
            sender: "assistant",
            text:
                userRole === Role.CITIZEN
                    ? "Jambo! I am your muCitizen assistant. Ask how to report an issue, check a service target, or paste a reference number (e.g. SR-202610-8A190) to follow up."
                    : "Operational Copilot online. Ask for workload briefings, urgent incident status, or category turnaround metrics.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);

    const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            sender: "user",
            text: textToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!messageText) setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/copilot/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: textToSend }),
            });

            const data = await res.json();
            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                sender: "assistant",
                text: data.reply || "Unable to formulate response.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    sender: "assistant",
                    text: "County service information is not available right now. Please try again.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const samplePrompts =
        userRole === Role.CITIZEN
            ? [
                "What is the SLA for broken streetlights?",
                "How do I submit a water leak report?",
                "Check ticket SR-202610-8A190",
            ]
            : [
                "Give me an operational briefing",
                "What are the statutory SLA deadlines?",
                "Check ticket SR-202610-8A190",
            ];

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-2xl hover:bg-primary/90 transition-transform hover:scale-105 focus:outline-hidden"
            >
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold tracking-tight">Civic Copilot</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-bold">
                    AI
                </Badge>
            </button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col justify-between">
                    <div>
                        <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <SheetTitle className="text-sm font-bold">muCitizen Assistant</SheetTitle>
                                    <p className="text-[11px] text-muted-foreground">
                                        County service updates and response targets
                                    </p>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="p-3 bg-muted/30 border-b border-border flex flex-wrap gap-1.5">
                            {samplePrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => handleSend(prompt)}
                                    className="rounded-lg border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {/* Conversation Window */}
                        <div className="p-4 space-y-3.5 max-h-[calc(100vh-17rem)] overflow-y-auto">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${m.sender === "user"
                                                ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                                                : "bg-muted/70 text-foreground border border-border/60 rounded-tl-xs"
                                            }`}
                                    >
                                        {m.text}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground px-1 mt-1">
                                        {m.timestamp}
                                    </span>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                    <span>Checking county service records...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Chat Input Field */}
                    <div className="p-4 border-t border-border bg-background">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-2"
                        >
                            <Input
                                placeholder="Ask about SLAs or type a reference code..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="h-10 text-xs"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-10 w-10 shrink-0">
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send message</span>
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
