"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import ChatBox from "@/components/chat-box";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  FileAudio,
  MessageCircle,
  Clock,
  Phone,
  Info,
  ArrowDownCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";

type Message = {
  type: "user" | "bot";
  text: string;
  timestamp: string;
  isAudio?: boolean;
};

// Helper to get token from cookies
function getTokenFromCookies() {
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  return match ? match[2] : null;
}

export default function ReportPage() {
  const params = useParams();
  const [transcription, setTranscription] = useState("");
  const [calllog, setCalllog] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [callDetailsLoading, setCallDetailsLoading] = useState(false);
  const [metadata, setMetadata] = useState({
    call_date: "",
    filename: "",
    caller: "",
    issueSummary: "",
    keyPoints: [] as string[],
    responder_name: "",
    call_type: "",
    toll_free_did: "",
    customer_number: "",
    call_start_time: "",
    call_id: "",
  });

  const [qaPairs, setQaPairs] = useState<{ question_text: string; answer_text: string }[]>([]);

  const [sentiment, setSentiment] = useState<string | undefined>();
  const [callType, setCallType] = useState<string | undefined>();

  const [messages, setMessages] = useState<Message[]>([]);

  const transcriptionRef = useRef<HTMLDivElement>(null);
  const issueSummaryRef = useRef<HTMLDivElement>(null);

  const exportAsText = (
    ref: React.RefObject<HTMLDivElement>,
    fileName: string
  ) => {
    if (!ref.current) return;

    try {
      const element = ref.current;
      let content = element.innerText || element.textContent || "";

      const formattedContent = `
========================================
CitrusIQ REPORT - ${fileName}
Generated on: ${new Date().toLocaleString()}
========================================

${content}
`;

      const blob = new Blob([formattedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.txt`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting text:", error);
      alert("Failed to export text. Please try again.");
    }
  };

  const exportTranscription = () => {
    if (transcriptionRef.current) {
      exportAsText(transcriptionRef, `transcription-${params.id}`);
    }
  };

  const exportIssueSummary = () => {
    if (issueSummaryRef.current) {
      exportAsText(issueSummaryRef, `issue-summary-${params.id}`);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "calllog") {
      setCallDetailsLoading(true);
      setTimeout(() => {
        setCallDetailsLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getTokenFromCookies();

        // Fetch report details
        const res = await fetch(`${BASE_URL}/logs/${params.id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const result = data.data[0];

        setTranscription(result.transcription || "No transcription available");
        setCalllog(result.call_log || "No call log available");
        setSentiment(result.caller_sentiment);
        setCallType(result.request_type);

        setMetadata({
          call_date: result.call_date || new Date().toLocaleDateString(),
          filename: result.filename || "Unknown",
          caller: result.caller_name || "Unknown caller",
          issueSummary: result.issue_summary || "No issue details available",
          keyPoints: result.key_points || [],
          responder_name: result.responder_name || "Unknown",
          call_type: result.call_type || "Unknown",
          toll_free_did: result.toll_free_did || "N/A",
          customer_number: result.customer_number || "N/A",
          call_start_time: result.call_start_time || "N/A",
          call_id: result.call_id || "N/A",
        });

        // Fetch QA pairs
        const qaRes = await fetch(`${BASE_URL}/get_answers/${params.id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!qaRes.ok) {
          throw new Error("Failed to fetch QA");
        }
        const qaData = await qaRes.json();
        setQaPairs(qaData);

      } catch (err: any) {
        setError(err.message || "Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary/30 animate-pulse mx-auto mb-4"></div>
            <p className="text-sm font-medium text-muted-foreground">
              Loading report data
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md">
            <p className="text-sm font-medium text-destructive mb-2">
              Unable to load report
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const formattedTranscription = calllog
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const trimmedLine = line.trim();
      let speaker = "Unknown";
      let text = trimmedLine;

      if (trimmedLine.startsWith("Support Agent:")) {
        speaker = "Agent";
        text = trimmedLine.replace("Support Agent:", "").trim();
      } else if (trimmedLine.startsWith("Client:")) {
        speaker = "Customer";
        text = trimmedLine.replace("Client:", "").trim();
      }

      return {
        id: index,
        text: text,
        speaker: speaker,
      };
    })
    .filter((segment) => segment.text.length > 0);

  return (
    <DashboardShell>
      <div className="mb-3 w-full mx-auto px-2 sm:px-4">
        {/* Call Metadata */}
        <div className="mb-6 sm:mb-8 mt-2">
          <h1 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4">Call Report</h1>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon
                size={14}
                className="text-muted-foreground/70 flex-shrink-0"
              />
              <span className="truncate">{metadata.call_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-muted-foreground/70 flex-shrink-0" />
              <span className="truncate">{metadata.caller}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileAudio
                size={14}
                className="text-muted-foreground/70 flex-shrink-0"
              />
              <span className="truncate">{metadata.filename}</span>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="transcription"
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="bg-muted/50 p-1 rounded-lg mb-6 sm:mb-8 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger
              value="transcription"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
            >
              <FileAudio size={14} className="sm:size-4" />
              <span className="hidden xs:block sm:block">Transcription</span>
              <span className="xs:hidden sm:hidden">Trans</span>
            </TabsTrigger>
            <TabsTrigger
              value="chatbot"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
            >
              <MessageCircle size={14} className="sm:size-4" />
              <span className="hidden xs:block sm:block">Chatbot</span>
              <span className="xs:hidden sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="calllog"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Info size={14} className="sm:size-4" />
              <span className="hidden xs:block sm:block">Call Details</span>
              <span className="xs:hidden sm:hidden">Details</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcription" className="focus:outline-none">
            <div
              className="space-y-0 sm:space-y-3 pb-6 sm:pb-10"
              ref={transcriptionRef}
            >
              {formattedTranscription.map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    "flex gap-2 sm:gap-4",
                    segment.speaker === "Customer" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs text-primary-foreground flex-shrink-0",
                      segment.speaker === "Agent"
                        ? "bg-primary"
                        : "bg-muted-foreground"
                    )}
                  >
                    {segment.speaker[0]}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] py-2 sm:py-3 px-3 sm:px-4 rounded-2xl text-sm",
                      segment.speaker === "Agent"
                        ? "bg-muted/50 text-foreground"
                        : "bg-blue-100 text-foreground"
                    )}
                  >
                    {/* <p className="font-medium text-xs mb-1 text-muted-foreground">
                      {segment.speaker}
                    </p> */}
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mb-6">
              <button
                onClick={exportTranscription}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowDownCircle size={16} />
                <span>Export Transcription</span>
              </button>
            </div>
          </TabsContent>

          <TabsContent value="chatbot" className="focus:outline-none">
            <div className="bg-card rounded-lg p-2 sm:p-4 h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] min-h-[400px] sm:min-h-[500px] border">
              <ChatBox messages={messages} setMessages={setMessages} />
            </div>
          </TabsContent>

          <TabsContent value="calllog" className="focus:outline-none">
            {callDetailsLoading ? (
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] min-h-[400px] sm:min-h-[500px]">
                {/* loading skeletons unchanged - omitted for brevity */}
              </div>
            ) : (
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left side: Issue Summary + Q&A stacked vertically */}
                <div className="lg:col-span-2 flex flex-col gap-6 order-2 lg:order-1">
                  {/* Issue Summary */}
                  <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-background border-b px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h2 className="font-medium text-base sm:text-lg">Call Issue Summary</h2>
                      <button
                        onClick={exportIssueSummary}
                        className="text-xs text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
                      >
                        <ArrowDownCircle size={14} />
                        <span>Export as Text</span>
                      </button>
                    </div>
                    <div className="p-4 sm:p-6" ref={issueSummaryRef}>
                      <div className="text-sm leading-relaxed space-y-4">
                        <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-muted">
                          <p className="text-sm sm:text-base">{metadata.issueSummary}</p>
                        </div>

                        <div className="mt-4 sm:mt-6">
                          <h4 className="text-sm font-medium mb-3">Key Points</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {metadata.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs">{index + 1}</span>
                                </div>
                                <p className="text-sm leading-relaxed">{point}.</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Custom Queries box below Issue Summary */}
                  <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-background border-b px-4 sm:px-6 py-3 sm:py-4">
                      <h2 className="font-medium text-base sm:text-lg">Custom Queries</h2>
                    </div>
                    <div className="p-4 sm:p-6 max-h-[350px] overflow-y-auto space-y-4">
                      {qaPairs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                        No Custom Queries available for this call.
                        </p>
                      ) : (
                     qaPairs.map((pair, index) => (
                     <div key={index} className="bg-muted/30 p-4 rounded-md border border-muted space-y-1">
                     <p className="text-sm font-medium text-foreground">Q: {pair.question_text}</p>
                     <p className="text-sm text-muted-foreground">A: {pair.answer_text}</p>
                    </div>
                    ))
                    )}
                    </div>
                  </div>
                </div>
                {/* RIGHT sidebar unchanged - fully original */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
                  <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-background border-b px-3 sm:px-4 py-2 sm:py-3">
                      <h3 className="font-medium text-sm">Call Summary</h3>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Request Type</p>
                          <p className="text-sm font-medium">
                            {callType?.charAt(0).toUpperCase() + callType?.slice(1) || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Call Direction</p>
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full mr-2 flex-shrink-0",
                                metadata.call_type === "in" ? "bg-blue-500" : "bg-green-500"
                              )}
                            ></div>
                            <p className="text-sm font-medium capitalize">
                              {metadata.call_type === "in" ? "Incoming" : "Outgoing"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Agent</p>
                          <p className="text-sm font-medium truncate">{metadata.responder_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Call Start Time</p>
                          <p className="text-sm font-medium truncate">{metadata.call_start_time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Call ID</p>
                          <p className="text-sm font-medium truncate">{metadata.call_id}</p>
                        </div>
                        <div>
                          <div className="text-xs mb-1">
                            <p className="text-muted-foreground">Initial Sentiment</p>
                            <p className="text-sm font-medium">
                              {sentiment === "happy" && "😊"}
                              {sentiment === "frustrated" && "😐"}
                              {sentiment === "angry" && "😠"}
                              {!sentiment && "❓"}&nbsp;
                              {sentiment?.charAt(0).toUpperCase() + sentiment?.slice(1) || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-background border-b px-3 sm:px-4 py-2 sm:py-3">
                      <h3 className="font-medium text-sm">Contact Information</h3>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Toll Free DID</p>
                          <p className="text-sm font-medium">{metadata.toll_free_did}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Customer Number</p>
                          <p className="text-sm font-medium">{metadata.customer_number}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                                <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-background border-b px-3 sm:px-4 py-2 sm:py-3">
                      <h3 className="font-medium text-sm">Resources</h3>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="space-y-3">
                        <button
                          onClick={exportIssueSummary}
                          className="flex items-center gap-2 text-sm text-primary w-full hover:underline text-left"
                        >
                          <ArrowDownCircle
                            size={14}
                            className="flex-shrink-0"
                          />
                          <span>Export Issue Summary as Text</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
