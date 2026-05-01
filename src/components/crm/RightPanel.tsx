import { useState, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  ChevronDown,
  ChevronRight,
  FileText,
  ClipboardList,
  Building2,
  MapPin,
  BookOpen,
  UserRound,
  ShieldCheck,
  X,
  Check,
  LogIn,
} from "lucide-react";
import { ScrubTask } from "@/types/scrub";

interface RightPanelProps {
  editContent?: ReactNode;
  onRequestDetails: () => void;
  onRequestDocuments: () => void;
  onAssignSalesRep: () => void;
  onEmployerList: () => void;
  onServiceability: () => void;
  onLenderPolicy: () => void;
  // Scrub
  scrubTasks: ScrubTask[];
  onRequestScrub: (primaryLender: string, secondaryLender?: string) => void;
  onScrubFileClick: (task: ScrubTask) => void;
  // Sales Rep Actions
  onRepActionSubmit: (action: "rejected" | "scrub" | "request-login", reason?: string) => void;
  // Lender names for scrub selection
  availableLenders?: string[];
  // Whether the file is ready for direct submission (enables Request Login)
  fileReadyForLogin?: boolean;
}

interface ActionRowProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  iconBg?: string;
}

const ActionRow = ({ icon, label, onClick, iconBg = "bg-muted" }: ActionRowProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group"
  >
    <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
      {label}
    </span>
    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
  </button>
);

const SCRUB_LENDER_LIST = [
  "AFL", "TATA Capital", "IDFC First", "Bajaj Finserv", "Piramal Finance",
  "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "SBI",
  "Bank of Baroda", "Canara Bank", "Union Bank", "IndusInd Bank",
  "Yes Bank", "Federal Bank", "RBL Bank", "Hero FinCorp",
  "Fullerton India", "Muthoot Finance", "Manappuram Finance",
  "L&T Finance", "Cholamandalam", "Shriram Finance", "IndiaBulls",
];

const RightPanel = ({
  editContent,
  onRequestDetails,
  onRequestDocuments,
  onAssignSalesRep,
  onEmployerList,
  onServiceability,
  onLenderPolicy,
  scrubTasks,
  onRequestScrub,
  onScrubFileClick,
  onRepActionSubmit,
  availableLenders,
  fileReadyForLogin = false,
}: RightPanelProps) => {
  const [noteText, setNoteText] = useState("");
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);

  // Sales Rep Actions state
  const [repAction, setRepAction] = useState<null | "rejected" | "scrub" | "request-login">(null);
  const [rejectReason, setRejectReason] = useState("");
  const [repComment, setRepComment] = useState("");
  const [repSubmitted, setRepSubmitted] = useState(false);

  // Lender selection for scrub
  const lenderList = availableLenders && availableLenders.length > 0 ? availableLenders : SCRUB_LENDER_LIST;
  const [scrubPrimaryLender, setScrubPrimaryLender] = useState("");
  const [scrubSecondaryLenders, setScrubSecondaryLenders] = useState<string[]>([]);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  const notes = [
    "Call Nature : Manual-Outbound| Call start time: 2025-03-10 10:30",
    "Call Nature : Manual-Outbound| Call start time: 2025-03-09 14:15",
    "Call Nature : Manual-Outbound| Call start time: 2025-03-08 11:45",
  ];

  const handleAddNote = () => {
    if (noteText.trim()) setNoteText("");
  };

  // Normal sidebar content
  const normalContent = (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">

      {/* Sales Rep / RM */}
      <Card className="shadow-none">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sales Rep :</span>
            <Badge variant="outline" className="text-xs font-normal border-primary text-primary">
              chandan.pandey
            </Badge>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm text-muted-foreground">RM :</span>
            <span className="text-sm text-muted-foreground">—</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-none">
        <CardContent className="p-2 space-y-0.5">
          <ActionRow
            icon={<Building2 className="h-3.5 w-3.5 text-blue-600" />}
            label="Employers List"
            onClick={onEmployerList}
            iconBg="bg-blue-50"
          />
          <ActionRow
            icon={<MapPin className="h-3.5 w-3.5 text-emerald-600" />}
            label="Serviceability List"
            onClick={onServiceability}
            iconBg="bg-emerald-50"
          />
          <ActionRow
            icon={<BookOpen className="h-3.5 w-3.5 text-violet-600" />}
            label="Lender Policy"
            onClick={onLenderPolicy}
            iconBg="bg-violet-50"
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-none">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <Tabs defaultValue="notes">
              <TabsList className="h-7 p-0.5 bg-muted">
                <TabsTrigger value="notes" className="text-[10px] px-2 h-6 data-[state=active]:bg-card">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="highlighted" className="text-[10px] px-2 h-6 data-[state=active]:bg-card">
                  Highlighted
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="relative">
            <Textarea
              placeholder="Add Note (Ctrl + Enter)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[60px] pr-10 text-xs resize-none bg-muted/50"
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") handleAddNote();
              }}
            />
            <button
              onClick={handleAddNote}
              className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-0">
            {notes.map((note, i) => (
              <div key={i} className="py-2 border-b last:border-0">
                <p className="text-xs text-muted-foreground truncate">{note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Information */}
      <Card className="shadow-none">
        <CardContent className="p-3">
          <button
            onClick={() => setRequestInfoOpen(!requestInfoOpen)}
            className="flex items-center w-full text-left"
          >
            <span className="text-sm font-medium text-foreground flex-1">
              Request Information
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                requestInfoOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {requestInfoOpen && (
            <div className="mt-3 border-t pt-3 space-y-1">
              <button
                onClick={onRequestDetails}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group"
              >
                <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary leading-none mb-0.5">
                    Request Details
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-none">
                    Request client information
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              </button>

              <button
                onClick={onRequestDocuments}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group"
              >
                <div className="h-7 w-7 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary leading-none mb-0.5">
                    Request Document
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-none">
                    Request client documents
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Sales Rep */}
      <Card className="shadow-none">
        <CardContent className="p-2">
          <ActionRow
            icon={<UserRound className="h-3.5 w-3.5 text-primary" />}
            label="Assign Sales Rep"
            onClick={onAssignSalesRep}
            iconBg="bg-primary/10"
          />
        </CardContent>
      </Card>

      {/* Sales Rep Actions */}
      <Card className={`shadow-none ${repSubmitted ? (repAction === "rejected" ? "border-red-200" : repAction === "scrub" ? "border-amber-200" : "border-emerald-200") : ""}`}>
        <CardContent className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Sales Rep Actions</span>
              {repSubmitted && (
                <Badge variant="outline" className={`text-[10px] h-4 px-1.5 border ${repAction === "rejected" ? "border-red-300 text-red-700 bg-red-50" : repAction === "scrub" ? "border-amber-300 text-amber-700 bg-amber-50" : "border-emerald-300 text-emerald-700 bg-emerald-50"}`}>
                  {repAction === "rejected" ? "Rejected" : repAction === "scrub" ? "Scrub Requested" : "Login Requested"}
                </Badge>
              )}
            </div>
            {repSubmitted && (
              <button onClick={() => { setRepSubmitted(false); setRepAction(null); setRejectReason(""); setRepComment(""); setScrubSecondaryLenders([]); }}
                className="text-[10px] text-muted-foreground hover:text-foreground underline">Reset</button>
            )}
          </div>

          {repSubmitted ? (
            <div className={`rounded-lg px-3 py-2.5 text-xs ${repAction === "rejected" ? "bg-red-50 border border-red-200 text-red-800" : repAction === "scrub" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-emerald-50 border border-emerald-200 text-emerald-800"}`}>
              {repAction === "rejected"
                ? `File rejected${rejectReason ? ` — ${rejectReason.replace(/-/g, " ")}` : ""}.`
                : repAction === "scrub"
                  ? "Scrub requested successfully."
                  : "Login requested — file submitted."}
              {repAction === "scrub" && scrubPrimaryLender && (
                <div className="mt-1.5 space-y-0.5">
                  <p className="font-medium">Primary: <span className="font-normal">{scrubPrimaryLender}</span></p>
                  {scrubSecondaryLenders.length > 0 && (
                    <p className="font-medium">Secondary: <span className="font-normal">{scrubSecondaryLenders.join(", ")}</span></p>
                  )}
                </div>
              )}
              {repComment && <p className="mt-1 italic text-muted-foreground">"{repComment}"</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Action toggle buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setRepAction(repAction === "rejected" ? null : "rejected")}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${repAction === "rejected" ? "bg-red-50 border-red-300 text-red-700" : "border-border text-muted-foreground hover:bg-muted/60"}`}>
                  <X className="h-3 w-3" /> Reject Fill
                </button>
                <button
                  onClick={() => setRepAction(repAction === "scrub" ? null : "scrub")}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${repAction === "scrub" ? "bg-amber-50 border-amber-300 text-amber-700" : "border-border text-muted-foreground hover:bg-muted/60"}`}>
                  <ShieldCheck className="h-3 w-3" /> Request Scrub
                </button>
                <button
                  disabled={!fileReadyForLogin}
                  onClick={() => fileReadyForLogin && setRepAction(repAction === "request-login" ? null : "request-login")}
                  title={fileReadyForLogin ? "Submit file for login" : "Available only when file is ready to submit"}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${
                    !fileReadyForLogin
                      ? "border-border text-muted-foreground/40 bg-muted/30 cursor-not-allowed"
                      : repAction === "request-login"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                  }`}>
                  <LogIn className="h-3 w-3" /> Request Login
                </button>
              </div>

              {/* Reject reason — shown when rejected */}
              {repAction === "rejected" && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Rejection Reason</p>
                  <Select value={rejectReason} onValueChange={setRejectReason}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incomplete-docs">Incomplete Documents</SelectItem>
                      <SelectItem value="low-cibil">Low CIBIL Score</SelectItem>
                      <SelectItem value="high-foir">High FOIR</SelectItem>
                      <SelectItem value="income-insufficient">Insufficient Income</SelectItem>
                      <SelectItem value="existing-defaults">Existing Defaults</SelectItem>
                      <SelectItem value="wrong-info">Incorrect Information</SelectItem>
                      <SelectItem value="duplicate">Duplicate Application</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lender selection — shown when scrub */}
              {repAction === "scrub" && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Primary Lender <span className="text-red-500">*</span>
                    </p>
                    <Select value={scrubPrimaryLender} onValueChange={(v) => {
                      setScrubPrimaryLender(v);
                      setScrubSecondaryLenders((prev) => prev.filter((x) => x !== v));
                    }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select primary lender" />
                      </SelectTrigger>
                      <SelectContent>
                        {lenderList.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Secondary Lenders <span className="text-muted-foreground/50 normal-case">(optional, multi-select)</span>
                    </p>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSecondaryOpen((p) => !p)}
                        className="flex h-7 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <span className="truncate text-left">
                          {scrubSecondaryLenders.length === 0
                            ? <span className="text-muted-foreground">Select secondary lenders</span>
                            : scrubSecondaryLenders.join(", ")}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
                      </button>
                      {secondaryOpen && (
                        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
                          {lenderList.filter((l) => l !== scrubPrimaryLender).map((l) => {
                            const checked = scrubSecondaryLenders.includes(l);
                            return (
                              <button
                                key={l}
                                type="button"
                                onClick={() =>
                                  setScrubSecondaryLenders((prev) =>
                                    prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
                                  )
                                }
                                className="flex w-full items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/60 text-left"
                              >
                                <span className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${checked ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}>
                                  {checked && <Check className="h-2.5 w-2.5" />}
                                </span>
                                {l}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {scrubSecondaryLenders.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {scrubSecondaryLenders.map((l) => (
                          <Badge key={l} variant="outline" className="text-[10px] h-5 gap-1 pr-1">
                            {l}
                            <button onClick={() => setScrubSecondaryLenders((prev) => prev.filter((x) => x !== l))}>
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comment */}
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Comment
                  {repAction === "request-login" && <span className="text-red-500"> *</span>}
                </p>
                <Textarea
                  value={repComment}
                  onChange={(e) => setRepComment(e.target.value)}
                  placeholder={repAction === "request-login" ? "Mandatory remark for login request..." : "Add notes..."}
                  className="min-h-[50px] text-xs resize-none bg-muted/50"
                  rows={2}
                />
              </div>

              {/* Submit */}
              <Button
                size="sm"
                className="w-full h-7 text-xs gap-1.5"
                disabled={
                  !repAction ||
                  (repAction === "rejected" && !rejectReason) ||
                  (repAction === "scrub" && !scrubPrimaryLender) ||
                  (repAction === "request-login" && !repComment.trim())
                }
                onClick={() => {
                  if (repAction === "scrub") onRequestScrub(scrubPrimaryLender, scrubSecondaryLenders.join(", ") || undefined);
                  onRepActionSubmit(repAction!, rejectReason || undefined);
                  setRepSubmitted(true);
                }}
              >
                <Check className="h-3 w-3" />
                {repAction === "rejected" ? "Confirm Rejection" : repAction === "scrub" ? "Request Scrub" : repAction === "request-login" ? "Submit for Login" : "Submit"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );

  return (
    <aside className="sticky top-0 h-screen w-[300px] bg-card border-l shrink-0 z-30 flex flex-col">
      {editContent ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {editContent}
        </div>
      ) : normalContent}
    </aside>
  );
};

export default RightPanel;
