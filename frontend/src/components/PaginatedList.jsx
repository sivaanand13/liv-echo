import { useParams } from "react-router";
import { useState, useEffect } from "react";
import Loading from "./Loading.jsx";
import { PAGE_SIZE } from "./Pagination.jsx";
import { useNavigate } from "react-router";
import {
  List,
  Box,
  Grid,
  Divider,
  TextField,
  Pagination,
  IconButton,
  Paper,
  useTheme,
  Typography,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import NotFound from "./NotFound.jsx";
import ErrorPage from "./ErrorPage.jsx";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

function PaginatedList({
  title,
  type,
  dataSource,
  ListItemComponent,
  enableSearch,
}) {
  const navigate = useNavigate();

  const theme = useTheme();
  const [curPage, setCurPage] = useState(1);
  const [curPageData, setCurPageData] = useState(undefined);
  const [listData, setlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(undefined);
  const [searchInput, setSearchInput] = useState(undefined);
  const [searchKey, setSearchKey] = useState(undefined);
  const [searchKeyError, setSearchKeyError] = useState(undefined);
  const [error, setError] = useState(null);
  const [noUserFoundError, setNoUserFoundError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSearchKey = () => {
    if (!searchInput || searchInput.trim().length == 0) {
      setSearchKeyError("Search key must be non-empty!");
      setSearchInput("");
    } else {
      setCurPage(1);
      setSearchKey(searchInput.trim());
    }
  };
  const handleSearchReset = () => {
    setSearchKey("");
    setSearchInput("");
    setSearchKeyError("");
    changePage(1);
  };

  const changePage = (newPage) => {
    setCurPage(newPage);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // setSnackbarOpen(false);
        setNoUserFoundError("");
        const data = await dataSource(searchKey || ".*");
        // console.log("users:", data);
        if (data.length > 0) {
          setlistData(data);
          setLoading(false);
          setTotalPages(Math.ceil(data.length / PAGE_SIZE));
        } else {
          console.error("User not found!");
          setNoUserFoundError(`No ${type} found for "${searchKey}"`);
          setSnackbarOpen(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [searchKey, dataSource, type]);

  useEffect(() => {
    setError(null);

    if (listData && curPage) {
      const start = PAGE_SIZE * (curPage - 1);
      const pageData = listData.slice(start, start + PAGE_SIZE);
      setCurPageData([...pageData]);
    }
  }, [curPage, totalPages, listData]);

  if (loading || !listData) {
    return <Loading />;
  } else {
    if (error) {
      return <ErrorPage title="Invalid Page Number" message={error} />;
    } else if (curPage > totalPages) {
      return (
        <NotFound message={`No more ${type} for page number (${curPage})`} />
      );
    } else {
      return (
        <Box
          sx={{
            width: "70%",
            justifyContent: "center",
            alignItems: "center",
            padding: "1em",
            placeContent: "center",
            placeItems: "center",
            margin: "auto",
            marginTop: "4em",
          }}
        >
          {loading || !listData ? (
            <Loading />
          ) : error ? (
            <ErrorPage title="Invalid Page Number" message={error} />
          ) : curPage > totalPages ? (
            <NotFound
              message={`No more ${type} for page number (${curPage})`}
            />
          ) : (
            <>
              <Stack spacing={2} width="100%" sx={{ marginBottom: "2rem" }}>
                <Box sx={{ borderRadius: "0.2em" }}>
                  <Typography
                    variant="h2"
                    sx={{
                      width: "fit-content",
                      display: "block",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      margin: "auto",
                      textAlign: "center",
                      borderRadius: "0.2em",
                      padding: "0.2em",
                      backdropFilter: "blur(0.5em)",
                    }}
                    color="yellow"
                  >
                    {title}
                  </Typography>
                </Box>
                {enableSearch && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <Paper
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "80%",
                        marginBottom: "2rem",
                        marginTop: "3rem",

                        padding: "1em",
                      }}
                    >
                      <TextField
                        fullWidth
                        id="searchInput"
                        label="Search Bar"
                        onKeyDown={(e) => {
                          if (e.key == "Enter") {
                            handleSearchKey();
                          }
                        }}
                        placeholder="Enter term to search through names, usernames, and emails!"
                        variant="standard"
                        error={searchKeyError != null}
                        onChange={(e) => {
                          setSearchKeyError(null);
                          setSearchInput(e.target.value);
                        }}
                        value={searchInput}
                        helperText={searchKeyError}
                      />
                      <IconButton type="button" onClick={handleSearchKey}>
                        <SearchIcon />
                      </IconButton>
                      <Divider
                        sx={{ height: 28, m: 0.5 }}
                        orientation="vertical"
                      />
                      <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={4000}
                        onClose={() => {
                          handleSearchReset();
                          setSnackbarOpen(false);
                        }}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                      >
                        <Alert
                          severity="info"
                          variant="filled"
                          onClose={() => {
                            handleSearchReset();
                            setSnackbarOpen(false);
                          }}
                        >
                          {noUserFoundError}
                        </Alert>
                      </Snackbar>

                      <IconButton type="button" onClick={handleSearchReset}>
                        <RefreshIcon />
                      </IconButton>
                    </Paper>
                  </Box>
                )}
              </Stack>
              <Grid container spacing={10}>
                {curPageData &&
                  curPageData.map((listItem) => {
                    {
                      /* console.log(listItem); */
                    }
                    return (
                      <Grid
                        size={{
                          xs: 12,
                          sm: 12,
                          md: 6,
                          lg: 6,
                        }}
                        key={listItem.uid}
                        sx={{
                          display: "flex",
                        }}
                      >
                        <ListItemComponent item={listItem} />
                        <Divider sx={{ opacity: 0.2 }} />
                      </Grid>
                    );
                  })}
              </Grid>
              <Pagination
                count={totalPages}
                onChange={(e, newPage) => {
                  changePage(newPage);
                }}
                hideNextButton={curPage == totalPages}
                hidePrevButton={curPage == 1}
                page={curPage}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "0.3em",
                  margin: "1em",
                }}
                size="large"
              />
            </>
          )}
        </Box>
      );
    }
  }
}

export default PaginatedList;
