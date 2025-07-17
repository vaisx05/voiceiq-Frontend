"use client";

import * as React from "react";
import { Dialog, DialogContent,DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  highlightedText?: React.ReactNode;
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  highlightedText,
  icon,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 sm:max-w-sm bg-background rounded-xl text-center shadow-lg">
        {icon && <div className="mx-auto mb-3">{icon}</div>}

        <DialogTitle asChild>
          <h2 className="text-lg font-semibold mb-1">{title}</h2>
        </DialogTitle>

        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
          {message}
        </p>

        {highlightedText && (
        <div className="mb-4">
        {highlightedText}
        </div>
         )}

        <div className="flex justify-center gap-4">
          <Button
            variant="destructive"
            onClick={onClose}
            className="w-20"
          >
            No
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="w-20 bg-green-600 hover:bg-green-700 text-white"
          >
            Yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}