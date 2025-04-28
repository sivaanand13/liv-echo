import { Link } from "react-router";
import { useState } from "react";
import { Box, Pagination, useTheme } from "@mui/material";
export const PAGE_SIZE = 6;

function PaginationController({ totalPageCount, changePage }) {
  const theme = useTheme();
  return (
    <>
      <Pagination
        count={totalPageCount}
        onChange={(e, newPage) => changePage(newPage)}
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "1em",
        }}
        size="large"
      />
    </>
  );
}

export default PaginationController;
