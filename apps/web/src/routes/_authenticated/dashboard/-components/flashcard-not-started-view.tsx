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
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 848">
          <rect fill="#F4FAFF" height="848" width="1440" />
          <g>
            <path d="M1534 1515H-126V332H-5.05176L724.5 654.421L1454.05 332H1534V1515Z" fill="#D9EFFA" />
            <path
              d="M1534 1515V1517H1536V1515H1534ZM-126 1515H-128V1517H-126V1515ZM-126 332V330H-128V332H-126ZM-5.05176 332L-4.2433 330.171L-4.62951 330H-5.05176V332ZM724.5 654.421L723.692 656.25L724.5 656.608L725.308 656.25L724.5 654.421ZM1454.05 332V330H1453.63L1453.24 330.171L1454.05 332ZM1534 332H1536V330H1534V332ZM1534 1515V1513H-126V1515V1517H1534V1515ZM-126 1515H-124V332H-126H-128V1515H-126ZM-126 332V334H-5.05176V332V330H-126V332ZM-5.05176 332L-5.86021 333.829L723.692 656.25L724.5 654.421L725.308 652.592L-4.2433 330.171L-5.05176 332ZM724.5 654.421L725.308 656.25L1454.86 333.829L1454.05 332L1453.24 330.171L723.692 652.592L724.5 654.421ZM1454.05 332V334H1534V332V330H1454.05V332ZM1534 332H1532V1515H1534H1536V332H1534Z"
              fill="#B3DFF5"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        <FlashcardStartCard />
      </div>

      <Dialog open={showPremiumDialog} onOpenChange={onPremiumDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fitur Terbatas!</DialogTitle>
            <DialogDescription>Dengan premium, kamu bisa bermain Brain Gym sepuasnya tanpa batas!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onPremiumDialogChange(false)}>
              Mungkin Nanti
            </Button>
            <Button asChild>
              <Link to="/premium">Beli Premium</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
