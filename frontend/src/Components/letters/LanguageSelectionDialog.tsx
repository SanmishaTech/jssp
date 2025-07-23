import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Label } from "@/Components/ui/label";

interface LanguageSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (language: 'english' | 'marathi') => void;
  isDownloading: boolean;
}

export default function LanguageSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  isDownloading
}: LanguageSelectionDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState<'english' | 'marathi'>('english');

  const handleConfirm = () => {
    onConfirm(selectedLanguage);
  };

  const handleClose = () => {
    if (!isDownloading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Letterhead Language</DialogTitle>
          <DialogDescription>
            Choose the language for the letterhead in your PDF document.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <RadioGroup
            value={selectedLanguage}
            onValueChange={(value) => setSelectedLanguage(value as 'english' | 'marathi')}
            className="grid grid-cols-1 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="english" id="english" />
              <Label htmlFor="english" className="cursor-pointer">
                English Letterhead
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="marathi" id="marathi" />
              <Label htmlFor="marathi" className="cursor-pointer">
                Marathi Letterhead (मराठी)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isDownloading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isDownloading}
          >
            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
