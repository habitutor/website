import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlashcardStartCard } from "./flashcard-start-card";

type FlashcardNotStartedViewProps = {
  showPremiumDialog: boolean;
  onPremiumDialogChange: (open: boolean) => void;
};

export function FlashcardNotStartedView({ showPremiumDialog, onPremiumDialogChange }: FlashcardNotStartedViewProps) {
  return (
    <>
      <div className="relative z-10">
        <FlashcardStartCard />
      </div>

      <Dialog open={showPremiumDialog} onOpenChange={onPremiumDialogChange}>
        <DialogContent className="rounded-sr-lg">
          <DialogHeader>
            <DialogTitle>Fitur Terbatas!</DialogTitle>
            <DialogDescription>Dengan premium, kamu bisa bermain Brain Gym sepuasnya tanpa batas!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => onPremiumDialogChange(false)}>
              Mungkin Nanti
            </Button>
            <Button className="rounded-full" asChild>
              <Link to="/premium">Beli Premium</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
