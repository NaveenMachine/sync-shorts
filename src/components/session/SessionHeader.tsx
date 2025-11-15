import { Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface SessionHeaderProps {
  session: any;
}

export const SessionHeader = ({ session }: SessionHeaderProps) => {
  const joinUrl = `${window.location.origin}/?code=${session?.join_code}`;

  const copyJoinCode = () => {
    navigator.clipboard.writeText(session?.join_code || "");
    toast.success("Code copied to clipboard!");
  };

  const copyJoinUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <header className="bg-card rounded-xl p-4 border border-border shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Jam Session</h1>
          <p className="text-sm text-muted-foreground">
            Share the code or link with friends to join
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Join Code */}
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
            <span className="font-mono font-bold text-lg">
              {session?.join_code}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyJoinCode}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* QR Code Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan to Join</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 p-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={joinUrl} size={200} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Or share this link:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-secondary px-3 py-2 rounded">
                      {joinUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyJoinUrl}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};
