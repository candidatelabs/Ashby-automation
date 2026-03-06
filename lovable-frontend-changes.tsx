/**
 * ============================================================
 * LOVABLE FRONTEND CHANGES
 * ============================================================
 *
 * Copy these components into your Lovable project to enable
 * self-serve extraction. Replace YOUR_RAILWAY_URL with your
 * deployed Railway URL (e.g., https://ashby-automation-production.up.railway.app).
 *
 * Files to create/modify in Lovable:
 *   1. src/components/AshbyExtract.tsx  (NEW - the extract button component)
 *   2. src/pages/Index.tsx              (MODIFY - add AshbyExtract alongside CsvUpload)
 */

// ============================================================
// FILE 1: src/components/AshbyExtract.tsx
// ============================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Candidate } from "@/data/candidates";

// IMPORTANT: Replace with your Railway URL after deploying
const API_URL = "YOUR_RAILWAY_URL";

interface AshbyExtractProps {
  onExtract: (candidates: Candidate[]) => void;
}

export function AshbyExtract({ onExtract }: AshbyExtractProps) {
  const [open, setOpen] = useState(false);
  const [cookie, setCookie] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleExtract = async () => {
    if (!cookie.trim()) {
      toast.error("Please paste your Ashby cookie.");
      return;
    }

    setLoading(true);
    setProgress("Connecting to Ashby...");

    try {
      const res = await fetch(`${API_URL}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie: cookie.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Session expired. Please paste a fresh cookie from Ashby.");
        } else {
          toast.error(data.error || "Extraction failed.");
        }
        return;
      }

      if (data.candidates && data.candidates.length > 0) {
        onExtract(data.candidates);
        toast.success(
          `Extracted ${data.candidates.length} candidates from ${data.stats.companies} companies.`
        );
        setOpen(false);
        setCookie("");
      } else {
        toast.error("No candidates found. Check your Ashby access.");
      }
    } catch (err: any) {
      toast.error("Could not connect to extraction server. Is it running?");
      console.error("Extraction error:", err);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Fetch from Ashby
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fetch Pipeline from Ashby</DialogTitle>
          <DialogDescription>
            Paste your Ashby session cookie to pull the latest pipeline data.
            This replaces any currently loaded data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">How to get your cookie:</label>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Open <strong>app.ashbyhq.com</strong> in Chrome (make sure you're logged in)</li>
              <li>Press <strong>F12</strong> to open DevTools</li>
              <li>Go to <strong>Application</strong> tab → <strong>Cookies</strong> → <strong>app.ashbyhq.com</strong></li>
              <li>Find <strong>ashby_session_token</strong>, right-click → <strong>Copy value</strong></li>
              <li>Paste it below as: <code className="bg-muted px-1 rounded">ashby_session_token=VALUE</code></li>
            </ol>
          </div>

          <Input
            placeholder="ashby_session_token=..."
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            disabled={loading}
          />

          {progress && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {progress}
            </p>
          )}

          <Button
            onClick={handleExtract}
            disabled={loading || !cookie.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extracting pipeline data...
              </>
            ) : (
              "Extract Pipeline"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// FILE 2: Modify src/pages/Index.tsx
// ============================================================
// Add this import at the top:
//
//   import { AshbyExtract } from "@/components/AshbyExtract";
//
// Then in the header actions area (around line 99-112), add the AshbyExtract
// component next to the existing CsvUpload:
//
//   <div className="flex items-center gap-2">
//     {sessionId && (
//       <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
//         <Share2 className="h-4 w-4" />
//         Copy Share Link
//       </Button>
//     )}
//     <AshbyExtract onExtract={handleCsvUpload} />    {/* <-- ADD THIS */}
//     <CsvUpload onUpload={handleCsvUpload} />
//   </div>
//
// And in the empty state (around line 129), add it there too:
//
//   <AshbyExtract onExtract={handleCsvUpload} />    {/* <-- ADD THIS */}
//   <CsvUpload onUpload={handleCsvUpload} />
