import React, { useState } from "react";
import postUtils from "./postUtils";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
import searchBg from "../../assets/users/search.jpg"; //Idk make it the same
import SearchIcon from "@mui/icons-material/Search";
import StaticPaginatedList from "../../components/StaticPaginatedList";
import validation from "../../utils/validation";
export default function SearchPosts() {
  const [query, setQuery] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setSearchTriggered(true);
    try {
      validation.validateString(inputQuery, "Input Query");
    } catch (e) {
      setError(e);
    }
    try {
      const res = await postUtils.searchPosts(inputQuery);
      setQuery(res);
    } catch (err) {
      setError("Search failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${searchBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
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
            Search Posts
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{ color: "white", marginBottom: "10px" }}
        ></Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            minWidth: "70vw",
          }}
        >
          {!loading ? (
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
                disabled={loading}
                id="searchPosts"
                label="Search Posts"
                variant="outlined"
                onKeyDown={(e) => {
                  if (e.key == "Enter") handleSearch();
                }}
                placeholder="Enter term to search through names, usernames, and emails!"
                error={error != null}
                onChange={(e) => {
                  setInputQuery(e.target.value);
                  setSearchTriggered(false);
                  setError("");
                  setQuery([]);
                }}
                helperText={error}
                value={inputQuery}
              />
              <IconButton type="button" onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </Paper>
          ) : (
            <CircularProgress size={24} />
          )}
        </Box>
      </Box>

      {query.length > 0 && !loading && (
        <StaticPaginatedList
          type="posts"
          sourceData={query}
          ListItemComponent={PostCard}
          enableSearch={false}
          PAGE_SIZE={10}
        />
      )}

      {/* Show no posts message when no results and search was triggered */}
      {searchTriggered &&
        query.length === 0 &&
        !loading &&
        inputQuery.trim() && (
          <Typography variant="h6" sx={{ color: "white", marginTop: "20px" }}>
            There are no posts for the search term "{inputQuery}"
          </Typography>
        )}
    </Box>
  );
}
