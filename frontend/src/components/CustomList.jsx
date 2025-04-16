import { Box, Typography, List, ListItem } from "@mui/material";
function CustomList({ title, sx, type, listData, mappingFunction }) {
  return (
    <>
      {!listData ? (
        "Not avaliable"
      ) : listData.length == 0 ? (
        `No ${type}`
      ) : (
        <List disablePadding sx={{ padding: 0, margin: 0, ...sx }}>
          {title && (
            <ListItem
              disablePadding
              disableGutters
              sx={{ margin: "0", padding: "0" }}
            >
              <Typography variant="h6">{title}</Typography>
            </ListItem>
          )}
          {listData.map(mappingFunction)}
        </List>
      )}
    </>
  );
}

export default CustomList;
