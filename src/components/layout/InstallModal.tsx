import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, MoreVertical, Smartphone, Zap, MapPin, Search, Star } from "lucide-react";
import { BrowserContextType } from "@/hooks/useInstallPrompt";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  browserContext: BrowserContextType;
}

export function InstallModal({ isOpen, onClose, browserContext }: InstallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-gold/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-forest flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-gold" />
            Install Pushya App
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Get the full premium experience directly on your home screen.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits Section */}
        <div className="bg-muted/50 p-4 rounded-lg my-4 space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-forest/70">App Benefits</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> Faster Ordering</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> Saved Addresses</li>
            <li className="flex items-center gap-2"><Search className="w-4 h-4 text-gold" /> Instant Order Tracking</li>
            <li className="flex items-center gap-2"><Star className="w-4 h-4 text-gold" /> Exclusive App Offers</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="space-y-4 pt-2">
          {browserContext === 'ios-safari' && (
            <div className="flex flex-col items-center text-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="font-medium text-blue-900 mb-3">To install on your iPhone:</p>
              <div className="flex items-center gap-3 text-sm text-blue-800">
                1. Tap the <Share className="w-5 h-5 mx-1 p-1 bg-white rounded shadow-sm" /> Share icon below
              </div>
              <div className="h-4 border-l border-blue-200 my-1"></div>
              <div className="flex items-center gap-3 text-sm text-blue-800">
                2. Scroll and tap <span className="font-bold">Add to Home Screen</span>
              </div>
            </div>
          )}
          
          {(browserContext === 'android-other' || browserContext === 'desktop-other' || browserContext === 'unknown') && (
            <div className="flex flex-col items-center text-center p-4 bg-forest-soft rounded-xl border border-forest/20">
              <p className="font-medium text-forest mb-3">To install manually:</p>
              <div className="flex items-center gap-3 text-sm text-forest/90">
                1. Tap the menu <MoreVertical className="w-5 h-5 mx-1" /> in your browser
              </div>
              <div className="h-4 border-l border-forest/30 my-1"></div>
              <div className="flex items-center gap-3 text-sm text-forest/90">
                2. Select <span className="font-bold">Add to Home screen</span>
              </div>
            </div>
          )}

          {browserContext === 'desktop-chrome' && (
            <div className="flex flex-col items-center text-center p-4 bg-forest-soft rounded-xl border border-forest/20">
              <p className="font-medium text-forest mb-3">To install on Desktop:</p>
              <div className="flex items-center gap-3 text-sm text-forest/90">
                Look for the <Smartphone className="w-4 h-4 mx-1" /> install icon in your address bar!
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full bg-forest hover:bg-forest/90 text-background h-12">
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
