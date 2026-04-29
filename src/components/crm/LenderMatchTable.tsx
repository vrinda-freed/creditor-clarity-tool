import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Check, X, Pencil, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type MatchStatus = "eligible" | "ineligible";
type EmployerCategory = "CAT A" | "CAT B" | "CAT C" | "CAT D" | "NA";

interface LenderColumn {
  name: string;
  type: "qualified" | "preferred" | "normal";
  employerCategory: EmployerCategory;
  policyMatch: boolean;
  policyNote?: string;
  matches: Record<string, MatchStatus>;
}

const parameters = [
  { key: "creditScore", label: "Credit score", input: "680" },
  { key: "minSalary", label: "Min. In Hand Salary", input: "31,000" },
  { key: "maxFoir", label: "Max FOIR", input: "75%" },
  { key: "employerCat", label: "Employer CAT", input: "Airtel Digital" },
  { key: "serviceableLocation", label: "Serviceable Location", input: "Delhi" },
  { key: "maxAccounts", label: "Max Accounts", input: "5" },
  { key: "btMix", label: "BT Mix", input: "2" },
  { key: "ownedHouse", label: "Owned House", input: "Yes" },
];

const CATEGORY_OPTIONS: EmployerCategory[] = ["CAT A", "CAT B", "CAT C", "CAT D", "NA"];

const initialLenders: LenderColumn[] = [
  { name: "Poonawala", type: "qualified", employerCategory: "CAT A", policyMatch: true,
    matches: { creditScore: "eligible", minSalary: "eligible", maxFoir: "eligible", employerCat: "eligible", serviceableLocation: "eligible", maxAccounts: "eligible", btMix: "eligible", ownedHouse: "eligible" } },
  { name: "Shriram Finance", type: "preferred", employerCategory: "CAT A", policyMatch: true,
    matches: { creditScore: "eligible", minSalary: "eligible", maxFoir: "eligible", employerCat: "eligible", serviceableLocation: "eligible", maxAccounts: "eligible", btMix: "eligible", ownedHouse: "eligible" } },
  { name: "Bajaj Finserv", type: "preferred", employerCategory: "CAT B", policyMatch: true,
    matches: { creditScore: "eligible", minSalary: "eligible", maxFoir: "eligible", employerCat: "eligible", serviceableLocation: "eligible", maxAccounts: "eligible", btMix: "eligible", ownedHouse: "eligible" } },
  { name: "HDFC Bank", type: "qualified", employerCategory: "CAT A", policyMatch: true,
    matches: { creditScore: "eligible", minSalary: "eligible", maxFoir: "eligible", employerCat: "eligible", serviceableLocation: "eligible", maxAccounts: "eligible", btMix: "eligible", ownedHouse: "eligible" } },
  { name: "Axis Finance - 1", type: "normal", employerCategory: "CAT C", policyMatch: false, policyNote: "Lender policy not match",
    matches: { creditScore: "eligible", minSalary: "ineligible", maxFoir: "eligible", employerCat: "ineligible", serviceableLocation: "eligible", maxAccounts: "ineligible", btMix: "eligible", ownedHouse: "eligible" } },
  { name: "Axis Finance - 2", type: "normal", employerCategory: "CAT C", policyMatch: false, policyNote: "Lender policy not match",
    matches: { creditScore: "eligible", minSalary: "ineligible", maxFoir: "eligible", employerCat: "ineligible", serviceableLocation: "eligible", maxAccounts: "ineligible", btMix: "ineligible", ownedHouse: "eligible" } },
  { name: "ICICI Bank", type: "normal", employerCategory: "NA", policyMatch: false, policyNote: "Lender policy not match",
    matches: { creditScore: "ineligible", minSalary: "ineligible", maxFoir: "ineligible", employerCat: "ineligible", serviceableLocation: "eligible", maxAccounts: "ineligible", btMix: "ineligible", ownedHouse: "ineligible" } },
  { name: "Kotak Mahindra", type: "normal", employerCategory: "NA", policyMatch: false, policyNote: "Lender policy not match",
    matches: { creditScore: "ineligible", minSalary: "eligible", maxFoir: "ineligible", employerCat: "ineligible", serviceableLocation: "ineligible", maxAccounts: "ineligible", btMix: "eligible", ownedHouse: "ineligible" } },
  { name: "IDFC First", type: "normal", employerCategory: "CAT D", policyMatch: false, policyNote: "Lender policy not match",
    matches: { creditScore: "eligible", minSalary: "ineligible", maxFoir: "ineligible", employerCat: "ineligible", serviceableLocation: "eligible", maxAccounts: "ineligible", btMix: "ineligible", ownedHouse: "ineligible" } },
  { name: "Tata Capital", type: "normal", employerCategory: "NA", policyMatch: false, policyNote: "Lender policy not match",
    matches: { creditScore: "ineligible", minSalary: "ineligible", maxFoir: "eligible", employerCat: "ineligible", serviceableLocation: "ineligible", maxAccounts: "ineligible", btMix: "ineligible", ownedHouse: "eligible" } },
];

const StatusIcon = ({ status }: { status: MatchStatus }) =>
  status === "eligible" ? (
    <Check className="h-5 w-5 text-[hsl(var(--status-eligible))] mx-auto" />
  ) : (
    <X className="h-5 w-5 text-[hsl(var(--status-ineligible))] mx-auto" />
  );

const typeBadgeStyles: Record<string, string> = {
  qualified: "bg-status-eligible-bg text-status-eligible-foreground",
  preferred: "bg-primary/10 text-primary",
  normal: "",
};

const CategoryCell = ({
  lender,
  onChange,
}: {
  lender: LenderColumn;
  onChange: (value: EmployerCategory) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const isNA = lender.employerCategory === "NA";

  if (editing) {
    return (
      <Select
        value={lender.employerCategory}
        onValueChange={(v) => {
          onChange(v as EmployerCategory);
          setEditing(false);
        }}
        open
        onOpenChange={(o) => !o && setEditing(false)}
      >
        <SelectTrigger className="h-7 w-[90px] mx-auto text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        "group inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-colors",
        isNA
          ? "bg-status-ineligible-bg text-[hsl(var(--status-ineligible))] hover:bg-status-ineligible-bg/80"
          : "bg-muted text-foreground hover:bg-muted/70",
      )}
      title="Click to edit category"
    >
      {lender.employerCategory}
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60" />
    </button>
  );
};

const LenderMatchTable = () => {
  const [pwaSheetOpen, setPwaSheetOpen] = useState(false);
  const [lenders, setLenders] = useState<LenderColumn[]>(initialLenders);

  const updateCategory = (name: string, category: EmployerCategory) => {
    setLenders((prev) =>
      prev.map((l) => (l.name === name ? { ...l, employerCategory: category } : l)),
    );
  };

  const matchingCount = lenders.filter((l) => l.policyMatch).length;

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs font-semibold w-[160px] sticky left-0 bg-card z-10">
            Parameters
          </TableHead>
          <TableHead className="text-xs font-semibold text-center w-[100px]">Inputs</TableHead>
          {lenders.map((l) => (
            <TableHead key={l.name} className="text-center min-w-[130px] align-top py-3">
              <div className="flex flex-col items-center gap-1">
                {l.type !== "normal" ? (
                  <Badge className={`${typeBadgeStyles[l.type]} text-[10px] border-0 px-2 py-0.5`}>
                    {l.type === "qualified" ? "Qualified lender" : "Preferred lender"}
                  </Badge>
                ) : (
                  <span className="h-[18px]" />
                )}
                <span className="text-xs font-semibold">{l.name}</span>
                <CategoryCell lender={l} onChange={(v) => updateCategory(l.name, v)} />
                {!l.policyMatch && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--status-ineligible))] leading-tight mt-0.5">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{l.policyNote ?? "Lender policy not match"}</span>
                  </div>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((param) => (
          <TableRow key={param.key}>
            <TableCell className="text-sm font-medium sticky left-0 bg-card z-10">
              {param.label}
            </TableCell>
            <TableCell className="text-sm text-center text-muted-foreground">
              {param.input}
            </TableCell>
            {lenders.map((l) => (
              <TableCell
                key={l.name}
                className={cn("text-center", !l.policyMatch && "bg-status-ineligible-bg/20")}
              >
                <StatusIcon status={l.matches[param.key]} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="bg-card rounded-lg border" id="lender-match">
      <div className="flex items-center justify-between px-5 py-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Lender Match Details</h3>
          <Badge variant="secondary" className="text-[10px]">
            {matchingCount} of {lenders.length} matching
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setPwaSheetOpen(true)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          PWA Preferred Lender Match Data
        </Button>
      </div>
      <div className="overflow-x-auto">{renderTable()}</div>

      <Sheet open={pwaSheetOpen} onOpenChange={setPwaSheetOpen}>
        <SheetContent side="right" className="w-[900px] sm:max-w-[900px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>PWA Preferred Lender Match Data</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-x-auto">{renderTable()}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LenderMatchTable;
