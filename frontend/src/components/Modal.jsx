import { useTheme } from "@mui/material";
import { useState, useContext } from "react";
import ReactModal from "react-modal";
ReactModal.setAppElement("#root");
const customStyles = {
  overlay: {
    backgroundColor: "rgba(255, 125, 200, 0.1)",
    zIndex: 1300,
  },
  content: {
    margin: "0",
    padding: "0",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "fit-content",
    height: "fit-content",
  },
};

export default function Modal({ isOpen, label, children }) {
  const theme = useTheme();

  return (
    <ReactModal isOpen={isOpen} contentLabel={label} style={customStyles}>
      {children}
    </ReactModal>
  );
}
