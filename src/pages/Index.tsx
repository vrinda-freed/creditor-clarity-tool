import { useState, useRef, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClientHeader from "@/components/crm/ClientHeader";
import LeftSidebar from "@/components/crm/LeftSidebar";
import RightPanel from "@/components/crm/RightPanel";
import RequestDetailsView from "@/components/crm/RequestDetailsView";
import RequestDocumentsView from "@/components/crm/RequestDocumentsView";
import AssignSalesRepView from "@/components/crm/AssignSalesRepView";
import EmployerListModal from "@/components/crm/EmployerListModal";
import ServiceabilityListModal from "@/components/crm/ServiceabilityListModal";
import LenderPolicyModal from "@/components/crm/LenderPolicyModal";
import TLScrubTasksView from "@/components/crm/TLScrubTasksView";
import ScrubApprovalModal from "@/components/crm/ScrubApprovalModal";
import PortalPage from "@/components/crm/PortalPage";
import DashboardTab from "@/components/crm/DashboardTab";
import SecondaryLoginTab from "@/components/crm/SecondaryLoginTab";
import { Download, ShieldCheck, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

import { ScrubTask, ScrubStatus, SCRUB_STATUS_CONFIG } from "@/types/scrub";
import { Creditor, INITIAL_INCLUDED, INITIAL_EXCLUDED } from "@/types/creditor";
import {
  PersonalData,
  AddressData,
  EmploymentData,
  BankData,
  RefPersonData,
  SentDetailItem,
  SentDetailRequest,
  SentDocItem,
  SentDocumentRequest,
  INITIAL_PERSONAL_DATA,
  INITIAL_ADDRESS_DATA,
  INITIAL_EMPLOYMENT_DATA,
  INITIAL_BANK_DATA,
  INITIAL_REF_DATA,
  getEmptyDetailIds,
  isDetailFilled,
} from "@/types/client";

// ── Mock client data ───────────────────────────────────────────────────────────
const CLIENT_KFS_ID     = "KFSAPP-INH-0226-2362704";
const CLIENT_MOBILE     = "77210 69734";
const CLIENT_COMPANY    = "Infosys Technologies";
const CLIENT_CATEGORY   = "IT / Software";
const CLIENT_LOCATION   = "Pune";
const ASSIGNED_TL       = "rajesh.sharma";

type ActiveView =
  | "main"
  | "request-details"
  | "request-documents"
  | "assign-sales-rep"
  | "tl-tasks"
  | "portal";

/* ── Stat box ── */
const StatBox = ({
  label,
  displayValue,
  valueClass = "text-foreground",
}: {
  label: string;
  displayValue: string;
  valueClass?: string;
}) => (
  <div className="border-2 rounded-xl px-5 py-3 bg-card min-w-[160px] border-border">
    <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-xl font-bold leading-tight ${valueClass}`}>{displayValue}</p>
  </div>
);

const Index = () => {
  const [activeView, setActiveView]         = useState<ActiveView>("main");
  const [activeTab, setActiveTab]           = useState("overview");
  const [employerModalOpen, setEmployerModalOpen]             = useState(false);
  const [serviceabilityModalOpen, setServiceabilityModalOpen] = useState(false);
  const [lenderPolicyModalOpen, setLenderPolicyModalOpen]     = useState(false);

  // ── Edit panel (shown in RightPanel — used by CreditorTab) ────────────────
  const [editPanelContent, setEditPanelContent] = useState<ReactNode>(null);

  // ── Editable stat box values ──────────────────────────────────────────────
  const [totalOutstanding, setTotalOutstanding] = useState(1432155);
  const [cibilScore, setCibilScore]             = useState(751);

  // ── Shared creditor state (passed to both CreditorTab and CalculatorTab) ──
  const [included, setIncluded] = useState<Creditor[]>(INITIAL_INCLUDED);
  const [excluded, setExcluded] = useState<Creditor[]>(INITIAL_EXCLUDED);
  const [stcIds, setStcIds]     = useState<Set<string>>(new Set());

  const handleToggleStc = (id: string) => {
    setStcIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Client form data (lifted from PRE LOGIN DETAILS cards) ─────────────────
  const [personalData, setPersonalData]     = useState<PersonalData>(INITIAL_PERSONAL_DATA);
  const [addressData, setAddressData]       = useState<AddressData>(INITIAL_ADDRESS_DATA);
  const [employmentData, setEmploymentData] = useState<EmploymentData>(INITIAL_EMPLOYMENT_DATA);
  const [bankData, setBankData]             = useState<BankData>(INITIAL_BANK_DATA);
  const [ref1Data, setRef1Data]             = useState<RefPersonData>(INITIAL_REF_DATA);
  const [ref2Data, setRef2Data]             = useState<RefPersonData>(INITIAL_REF_DATA);

  // ── Request tracking ───────────────────────────────────────────────────────
  const [sentDetailRequests, setSentDetailRequests]     = useState<SentDetailRequest[]>([]);
  const [sentDocumentRequests, setSentDocumentRequests] = useState<SentDocumentRequest[]>([]);

  // Compute which detail IDs have empty form fields right now
  const emptyDetailIds = getEmptyDetailIds(
    personalData, addressData, employmentData, bankData, ref1Data, ref2Data
  );

  // All detail IDs that have ever been requested (for badges in PRE LOGIN DETAILS)
  const requestedDetailIds = sentDetailRequests.flatMap(r => r.items.map(i => i.id));

  // Check if a detail ID is now filled
  const checkDetailFilled = (id: string) =>
    isDetailFilled(id, personalData, addressData, employmentData, bankData, ref1Data, ref2Data);

  // ── Request send handlers ──────────────────────────────────────────────────
  const handleSendDetailRequest = (items: SentDetailItem[]) => {
    setSentDetailRequests(prev => [
      ...prev,
      { id: Date.now().toString(), sentAt: new Date().toISOString(), items },
    ]);
  };

  const handleSendDocumentRequest = (items: SentDocItem[]) => {
    setSentDocumentRequests(prev => [
      ...prev,
      { id: Date.now().toString(), sentAt: new Date().toISOString(), items },
    ]);
  };

  // ── Scrub state ────────────────────────────────────────────────────────────
  const [scrubTasks, setScrubTasks]               = useState<ScrubTask[]>([]);
  const [approvalOpen, setApprovalOpen]           = useState(false);
  const [selectedScrubTask, setSelectedScrubTask] = useState<ScrubTask | null>(null);
  const tabsRef                                   = useRef<HTMLDivElement>(null);

  // ── Sales Rep Action state ─────────────────────────────────────────────────
  const [repActionStatus, setRepActionStatus] = useState<null | "rejected" | "scrub" | "request-login">(null);
  const [repActionReason, setRepActionReason] = useState("");
  const [fileReadyForLogin, setFileReadyForLogin] = useState(false);

  const handleRepActionSubmit = (action: "rejected" | "scrub" | "request-login", reason?: string) => {
    setRepActionStatus(action);
    if (reason) setRepActionReason(reason);
  };

  // Derived scrub values
  const latestScrub  = scrubTasks.length > 0 ? scrubTasks[scrubTasks.length - 1] : null;
  const latestCfg    = latestScrub ? SCRUB_STATUS_CONFIG[latestScrub.status] : null;
  const pendingCount = scrubTasks.filter((t) => t.status === "scrub-check-pending").length;

  // Dynamic stage for header — priority: rep action > scrub > requests > default
  const displayStage =
    repActionStatus === "rejected"
      ? "File Rejected"
      : repActionStatus === "scrub"
      ? "Scrub Requested"
      : repActionStatus === "request-login"
      ? "Login Requested"
      : latestScrub
      ? SCRUB_STATUS_CONFIG[latestScrub.status].clientStage
      : sentDocumentRequests.length > 0
      ? "Documents Requested"
      : sentDetailRequests.length > 0
      ? "Details Requested"
      : "DCP_AGREEMENT_SIGNED";

  const handleCheckLenderMatch = () => {
    const el = document.getElementById("lender-match");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ── Scrub handlers ─────────────────────────────────────────────────────────
  const handleRequestScrub = (primaryLender: string, secondaryLender?: string) => {
    const newTask: ScrubTask = {
      id: Date.now().toString(),
      kfsId:           CLIENT_KFS_ID,
      mobileNumber:    CLIENT_MOBILE,
      companyName:     CLIENT_COMPANY,
      companyCategory: CLIENT_CATEGORY,
      location:        CLIENT_LOCATION,
      status:          "scrub-check-pending",
      requestedAt:     new Date().toISOString(),
      assignedTL:      ASSIGNED_TL,
      primaryLender,
      secondaryLender,
    };
    setScrubTasks((prev) => [...prev, newTask]);
  };

  const handleScrubApproval = (
    taskId: string,
    status: ScrubStatus,
    comment: string
  ) => {
    setScrubTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              comment: comment || undefined,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setApprovalOpen(false);
    setSelectedScrubTask(null);
  };

  const handleScrubFileClick = (task: ScrubTask) => {
    setActiveView("main");
    setActiveTab("overview");
    setSelectedScrubTask(task);
    setApprovalOpen(true);
  };

  const handleTLViewClient = (_task: ScrubTask) => {
    setActiveView("main");
    setActiveTab("overview");
    setSelectedScrubTask(null);
  };

  const cibilScoreClass =
    cibilScore >= 750
      ? "text-green-600"
      : cibilScore >= 650
      ? "text-amber-600"
      : "text-red-600";

  // ── Render ─────────────────────────────────────────────────────────────────
  const renderMainContent = () => {
    switch (activeView) {
      case "request-details":
        return (
          <RequestDetailsView
            onClose={() => setActiveView("main")}
            emptyDetailIds={emptyDetailIds}
            onSend={handleSendDetailRequest}
            sentRequests={sentDetailRequests}
            isDetailFilled={checkDetailFilled}
          />
        );
      case "request-documents":
        return (
          <RequestDocumentsView
            onClose={() => setActiveView("main")}
            onSend={handleSendDocumentRequest}
            sentRequests={sentDocumentRequests}
          />
        );
      case "assign-sales-rep":
        return <AssignSalesRepView onClose={() => setActiveView("main")} />;
      case "tl-tasks":
        return (
          <TLScrubTasksView
            tasks={scrubTasks}
            onClose={() => setActiveView("main")}
            onViewClient={handleTLViewClient}
            onApprove={handleScrubApproval}
          />
        );
      case "portal":
        return <PortalPage onBack={() => setActiveView("main")} />;
      default:
        return (
          <div className="w-full px-6 pt-5 pb-8">

            {/* ── Stat boxes + actions row ── */}
            <div className="flex items-center gap-4 mb-5">
              <StatBox
                label="Total Outstanding"
                displayValue={`₹${totalOutstanding.toLocaleString()}`}
              />
              <StatBox
                label="Experian Score"
                displayValue={String(cibilScore)}
                valueClass={cibilScoreClass}
              />
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-foreground"
                  onClick={() => {}}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Login Sheet
                </Button>
              </div>
            </div>

            {/* ── Scrub Approval Flow Banner ── */}
            {latestScrub && latestCfg && (
              <div
                className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${latestCfg.bgClass}`}
              >
                <ShieldCheck
                  className={`h-5 w-5 shrink-0 ${latestCfg.colorClass}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                    Scrub Approval Flow &amp; Client File Stage
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs border ${latestCfg.badgeClass}`}
                    >
                      {latestCfg.label}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span
                      className={`text-sm font-semibold ${latestCfg.colorClass}`}
                    >
                      {latestCfg.clientStage}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  onClick={() => setActiveView("tl-tasks")}
                >
                  Review
                </Button>
              </div>
            )}

            {/* ── Tabs ── */}
            <div ref={tabsRef}>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex items-center mb-5">
                  <div className="flex-1" />
                  <TabsList className="bg-card border h-10 p-1">
                    <TabsTrigger
                      value="overview"
                      className="text-xs font-medium px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      QUALIFICATION DETAILS
                    </TabsTrigger>
                    <TabsTrigger
                      value="secondary-login"
                      className="text-xs font-medium px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      PRE LOGIN DETAILS
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-1 flex justify-end">
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs h-9"
                      onClick={() => {
                        toast.success(
                          activeTab === "overview"
                            ? "Qualification details saved"
                            : "Pre-login details saved"
                        );
                      }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </Button>
                  </div>
                </div>

                <TabsContent value="overview">
                  <DashboardTab
                    included={included}
                    setIncluded={setIncluded}
                    excluded={excluded}
                    setExcluded={setExcluded}
                    stcIds={stcIds}
                    onToggleStc={handleToggleStc}
                    onFileReadyChange={setFileReadyForLogin}
                  />
                </TabsContent>

                <TabsContent value="secondary-login">
                  <SecondaryLoginTab
                    personalData={personalData}
                    onPersonalChange={setPersonalData}
                    addressData={addressData}
                    onAddressChange={setAddressData}
                    employmentData={employmentData}
                    onEmploymentChange={setEmploymentData}
                    bankData={bankData}
                    onBankChange={setBankData}
                    ref1Data={ref1Data}
                    onRef1Change={setRef1Data}
                    ref2Data={ref2Data}
                    onRef2Change={setRef2Data}
                    requestedDetailIds={requestedDetailIds}
                  />
                </TabsContent>

              </Tabs>
            </div>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <ClientHeader
          clientName="Saurabh Deshpande"
          clientId="KFSAPP-INH-0226-2362704"
          stage={displayStage}
          phone="77210 69734"
          channel="DCP"
          onCheckLenderMatch={handleCheckLenderMatch}
          onPortalClick={() => setActiveView("portal")}
        />

        {activeView === "portal" ? (
          <main className="flex-1 overflow-y-auto">
            {renderMainContent()}
          </main>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <LeftSidebar
              pendingScrubCount={pendingCount}
              onTLTasksClick={() => setActiveView("tl-tasks")}
            />
            <main className="flex-1 overflow-y-auto">
              {renderMainContent()}
            </main>
            <RightPanel
              editContent={editPanelContent}
              onRequestDetails={() => setActiveView("request-details")}
              onRequestDocuments={() => setActiveView("request-documents")}
              onAssignSalesRep={() => setActiveView("assign-sales-rep")}
              onEmployerList={() => setEmployerModalOpen(true)}
              onServiceability={() => setServiceabilityModalOpen(true)}
              onLenderPolicy={() => setLenderPolicyModalOpen(true)}
              scrubTasks={scrubTasks}
              onRequestScrub={handleRequestScrub}
              onScrubFileClick={handleScrubFileClick}
              onRepActionSubmit={handleRepActionSubmit}
              fileReadyForLogin={fileReadyForLogin}
            />
          </div>
        )}

        <EmployerListModal
          open={employerModalOpen}
          onOpenChange={setEmployerModalOpen}
        />
        <ServiceabilityListModal
          open={serviceabilityModalOpen}
          onOpenChange={setServiceabilityModalOpen}
        />
        <LenderPolicyModal
          open={lenderPolicyModalOpen}
          onOpenChange={setLenderPolicyModalOpen}
        />

        <ScrubApprovalModal
          open={approvalOpen}
          onOpenChange={setApprovalOpen}
          task={selectedScrubTask}
          onSubmit={handleScrubApproval}
        />
      </div>
    </TooltipProvider>
  );
};

export default Index;
