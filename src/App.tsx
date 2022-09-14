import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  CssBaseline,
  Paper,
  Box,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";

import SliderInput from "./components/Slider";
import TextInput from "./components/TextInput";
import DrawerDisplay from "./components/Drawer";
import AlertBar from "./components/Alert";
import InfoBox from "./components/InfoBox";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import BoltIcon from "@mui/icons-material/Bolt";
import NotesIcon from "@mui/icons-material/Notes";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SendIcon from "@mui/icons-material/Send";
import GitHubIcon from "@mui/icons-material/GitHub";
import HelpIcon from "@mui/icons-material/Help";
import YouTubeIcon from "@mui/icons-material/YouTube";

// Custom MUI theme for the entire app, currently set to dark mode
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: { fontFamily: ["'Samsung Sans', sans-serif"].join(",") },
});

export default function App() {
  // object state that holds the user input for video link and length of summay
  const [inputVals, setInputVals] = useState({ url: "", length: 30 });
  // object state that holds drawer content
  const [drawerContent, setDrawerContent] = useState({
    content: {
      summary: "",
      transcript: "",
      classification: [""],
      tags: [""],
    },
  });

  // holds the visibility value of submit button
  const [submitButton, setSubmitButton] = useState(true);
  // holds the visibility value of the error message
  const [error, setError] = useState(false);
  // holds the string value of the error message
  const [errorDisplay, setErrorDisplay] = useState("");
  // holds the visibility value of the drawer
  const [drawerDisplay, setDrawerDisplay] = useState(false);
  // tells drawer which content to display
  const [category, setCategory] = useState("");

  // getter function for category state
  const getCategory = () => {
    return category;
  };

  // shows error box with the given text for some duration and hides drawer content
  const showError = (duration: number, text: string) => {
    setError(true);
    setErrorDisplay(text);
    setDrawerDisplay(false);
    setTimeout(() => {
      setError(false);
      setSubmitButton(true);
    }, duration);
  };

  // handles logic that displays error or video content after user submission
  const sendRequest = async () => {
    // Hide error, submit button and drawer content
    setError(false);
    setSubmitButton(false);
    setDrawerDisplay(false);

    // Check if provided URL is a valid Youtube video link that includes the video ID
    // Regex sources from https://stackoverflow.com/questions/2936467/parse-youtube-video-id-using-preg-match/6382259#6382259
    const regex =
      '(?:youtube(?:-nocookie)?\\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\\.be/)([^"&?/\\s]{11})';
    const found = inputVals["url"].match(regex);

    console.log(found);
    console.log(inputVals["url"]);
    // if the link is not valid, show error
    if (found === null) {
      showError(2500, "Invalid link, please try again");
    } else {
      // Send POST HTTP request to Google Cloud Function with the video ID and length of summary
      const getSummary = await fetch(
        "https://us-central1-succinct.cloudfunctions.net/get-video-information",
        {
          method: "POST",
          headers: {
            // 'Accept': 'application/json',
            "Content-Type": "application/json",
            // "Access-Control-Request-Method": "POST",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            video_ID: found[1],
            summary_length: inputVals["length"],
          }),
        }
      );

      // Wait for reply from the server and convert it to JSON
      const response = await getSummary.json();

      // If the response returns success, store the video information
      if (response.success) {
        const data = {
          summary: response.summary.replaceAll("[...]", "\n"), // For better formatting
          transcript: response.transcript.replaceAll(". ", ".\n"), // Build new line for easier reading
          classification: response.classification,
          tags: response.tags,
        };

        // Update the drawer content state and set category to a default
        setDrawerContent({ content: data });
        setCategory("Summary");
        setSubmitButton(true);
        // Show the drawer content and hide errors
        setDrawerDisplay(true);
        setError(false);
      } else {
        // Otherwise, if the HTTP request failed, show error
        showError(2500, "Could not complete request, please try again");
      }
    }
  };

  // update the input values state whenever the user changes the input
  const handleInputChange = (name: string, value: number) => {
    setInputVals({ ...inputVals, [name]: value });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main>
        <div style={{ width: "100%", height: "100%" }}>
          <Stack
            width="100%"
            height="100%"
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="center"
            justifyContent="center"
            px={{ xs: "0%", sm: "8%" }}
            marginTop="10%"
            marginBottom="10%"
          >
            <Box>
              <Paper elevation={6} sx={{ padding: "15px 15px 25px 15px" }}>
                <Stack direction="column" alignItems="flex-start">
                  <Box
                    sx={{
                      marginLeft: "0%",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <Typography
                      variant="h3"
                      paddingBottom="3%"
                      paddingRight="2%"
                      sx={{ color: "#90caf9", fontWeight: "bolder" }}
                    >
                      Succinct
                    </Typography>
                    <YouTubeIcon sx={{ color: "red", width: 75, height: 75 }} />
                  </Box>
                  <Typography
                    paddingBottom="12%"
                    marginTop="-2%"
                    sx={{ fontSize: "14px", color: "grey.500" }}
                  >
                    Generate summaries for Youtube videos
                  </Typography>
                  <TextInput
                    label="Enter URL here"
                    placeholder="youtube.com/watch?v="
                    callback={handleInputChange}
                  />
                  <SliderInput
                    label="Length of summary"
                    min={5}
                    max={95}
                    step={5}
                    info={
                      <p style={{ fontSize: "14px", fontWeight: "normal" }}>
                        <b>
                          Based on the total number of sentences in the video's
                          transcript multiplied by the selected percentage
                        </b>
                        <br />
                        <p style={{ fontSize: "12px" }}>
                          ➤ For example, if a video's transcript has 100
                          sentences, and your selected percentage is 30%, then
                          your summary will be 30 sentences long (carefully
                          chosen by a machine learning model)
                        </p>
                      </p>
                    }
                    callback={handleInputChange}
                  />
                  <Stack
                    width="100%"
                    direction="row"
                    // display="flex"
                    justifyContent="space-between"
                  >
                    <Button
                      sx={{ marginTop: 2 }}
                      onClick={() => {
                        sendRequest();
                      }}
                      variant="contained"
                      endIcon={<SendIcon />}
                      disabled={!submitButton}
                    >
                      Submit
                    </Button>

                    <Box paddingTop="15px">
                      <InfoBox
                        icon={<GitHubIcon sx={{ width: 20, height: 20 }} />}
                        content={
                          <p style={{ fontSize: "14px", fontWeight: "bolder" }}>
                            Made with ♡ by {""}
                            <a
                              href="https://github.com/ArshSB"
                              style={{ textDecoration: "none", color: "red" }}
                            >
                              Arsh
                            </a>{" "}
                            &amp; {""}
                            <a
                              href="https://github.com/Roba-Geleta"
                              style={{ textDecoration: "none", color: "blue" }}
                            >
                              Roba
                            </a>
                            <br />
                            <p
                              style={{ fontSize: "12px", fontWeight: "normal" }}
                            >
                              ➤ This project is open source and your feedback is
                              much appreciated! You can view it {""}
                              <a
                                href="https://github.com/ArshSB/Succinct"
                                style={{ color: "green" }}
                              >
                                here
                              </a>
                            </p>
                          </p>
                        }
                      ></InfoBox>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
            <Box sx={{ width: "80%" }}>
              <Paper elevation={6} sx={{ padding: "15px 15px 15px 15px" }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                  marginBottom="2%"
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      disabled={!drawerDisplay}
                      sx={{
                        width: "120px",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => {
                        setCategory("Summary");
                      }}
                      startIcon={<BoltIcon />}
                      variant="outlined"
                    >
                      Summary
                    </Button>
                    <Button
                      disabled={!drawerDisplay}
                      sx={{
                        // height: "30px",
                        width: "120px",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => {
                        setCategory("Transcript");
                      }}
                      variant="outlined"
                      startIcon={<NotesIcon />}
                    >
                      Transcript
                    </Button>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      disabled={!drawerDisplay}
                      sx={{
                        width: "120px",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => {
                        setCategory("Topics");
                      }}
                      variant="outlined"
                      startIcon={<ManageSearchIcon />}
                    >
                      Topics
                    </Button>
                    <InfoBox
                      icon={<HelpIcon />}
                      content={
                        <p style={{ fontSize: "14px" }}>
                          <b>Summary</b> of your desired length. Note that it
                          may take multiple requests for longer videos
                          <br />
                          <br /> <b>Transcript </b> of the video as well as the
                          concepts considered inside the text
                          <br />
                          <br /> <b>Topics </b>
                          discussed in the video such as people, places,
                          entities, ideas &amp; more
                        </p>
                      }
                    />
                  </Stack>
                </Stack>
                <Box sx={{ height: "50vh", overflowY: "auto" }}>
                  <Stack direction="column" spacing={1} alignItems="center">
                    <Box paddingTop="10%" display={error ? "" : "none"}>
                      <AlertBar text={errorDisplay} />
                    </Box>
                    <Box
                      width="80%"
                      paddingTop="10%"
                      display={
                        submitButton && !error && !drawerDisplay ? "" : "none"
                      }
                    >
                      <Stack direction="row" spacing={5} paddingBottom="2%">
                        {Array(3).fill(
                          <Skeleton
                            variant="rectangular"
                            width={80}
                            height={30}
                          />
                        )}
                      </Stack>
                      <Skeleton />
                      <Skeleton animation="wave" />
                      <Skeleton animation={false} />
                    </Box>
                    <Box
                      display={!submitButton && !error ? "" : "none"}
                      paddingTop="12%"
                    >
                      <CircularProgress />
                    </Box>
                    <Box display={drawerDisplay ? "" : "none"}>
                      <DrawerDisplay
                        result={drawerContent["content"]}
                        getCategory={getCategory}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Box>
          </Stack>
        </div>
      </main>
    </ThemeProvider>
  );
}
