import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  actionType: 'danger' | 'warning' | 'info';
  confirmText?: string;
  requireReason?: boolean;
  requireConfirmation?: boolean;
  confirmationWord?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionType,
  confirmText = 'Confirm',
  requireReason = true,
  requireConfirmation = true,
  confirmationWord = 'CONFIRM'
}: ConfirmationDialogProps) {
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return;
    }
    
    if (requireConfirmation && confirmation !== confirmationWord) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setConfirmation('');
    onClose();
  };

  if (!isOpen) return null;

  const getActionColor = () => {
    switch (actionType) {
      case 'danger':
        return 'border-error bg-error/10';
      case 'warning':
        return 'border-warning bg-warning/10';
      default:
        return 'border-primary bg-primary/10';
    }
  };

  const getButtonVariant = () => {
    switch (actionType) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={getActionColor()}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{description}</AlertDescription>
          </Alert>

          {requireReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for this action *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a detailed reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={isLoading}
                required
              />
            </div>
          )}

          {requireConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type "{confirmationWord}" to confirm *
              </Label>
              <Input
                id="confirmation"
                placeholder={confirmationWord}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={getButtonVariant()}
              onClick={handleConfirm}
              disabled={
                isLoading ||
                (requireReason && !reason.trim()) ||
                (requireConfirmation && confirmation !== confirmationWord)
              }
              className="flex-1"
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}