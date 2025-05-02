import { Dialog } from "@mui/material";

export default function Modal({ isOpen, handleClose, children }) {
  return (
    <Dialog
      sx={{
        width: "fit-content",
        height: "fit-content",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
      onClose={handleClose}
      open={isOpen}
    >
      {children}
    </Dialog>
  );
}
