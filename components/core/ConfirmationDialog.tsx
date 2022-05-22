import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export enum ConfirmationDialogResponse {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
}

export interface ConfirmationDialogProps {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  open: boolean;
  onClose: (value?: string) => void;
}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { onClose, open, title, text, confirmButtonText, cancelButtonText } =
    props;

  const handleCancel = () => {
    onClose(ConfirmationDialogResponse.CANCEL);
  };

  const handleOk = () => {
    onClose(ConfirmationDialogResponse.CONFIRM);
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
        <Button onClick={handleOk}>
          {confirmButtonText ? confirmButtonText : 'Confirm'}
        </Button>
        <Button autoFocus onClick={handleCancel}>
          {cancelButtonText ? cancelButtonText : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
