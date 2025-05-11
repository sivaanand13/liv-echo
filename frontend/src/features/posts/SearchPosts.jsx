import React, { useState } from "react";
import postUtils from "./postUtils";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
import searchBg from "../../assets/users/search.jpg"; //Idk make it the same

export default function SearchPosts() {
  const [query, setQuery] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleSearch = async () => {
    if (!inputQuery.trim()) return;
    setLoading(true);
    setError("");
    setSearchTriggered(true);
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
        <Typography variant="h4" sx={{ color: "white", marginBottom: "10px" }}>
          Search Posts
        </Typography>
        <TextField
          label="Search Posts"
          variant="outlined"
          value={inputQuery}
          onChange={(e) => {
            setInputQuery(e.target.value);
            setSearchTriggered(false);
            setError("");
            setQuery([]);
          }}
          sx={{
            marginBottom: "10px",
            width: "300px",
            backgroundColor: "white",
            borderRadius: "4px",
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ marginLeft: "10px" }}
        >
          {loading ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {query.length > 0 && !loading && (
        <Grid
          container
          spacing={2}
          sx={{ maxWidth: "1200px", marginTop: "20px" }}
        >
          {query.map((post) => (
            <Grid key={post._id}>
              <Link to={`/posts/${post.id}`} style={{ textDecoration: "none" }}>
                <PostCard item={post} />
              </Link>
            </Grid>
          ))}
        </Grid>
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
