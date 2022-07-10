import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';

export interface AlertDialogProps {
  title: string;
  text: string;
  closeButtonText?: string;
  open: boolean;
  onClose: () => void;
}

const AlertDialog = (props: AlertDialogProps) => {
  const { onClose, open, title, text, closeButtonText } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{text}</Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          {closeButtonText ? closeButtonText : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
