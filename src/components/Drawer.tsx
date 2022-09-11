import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Chips from "./Chips";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Encoe Sans', sans-serif;",
  },
});

// import SamsungSansttf from "../fonts/SamsungSans-Light.ttf";
// // import Sa from "../fonts/SamsungSans-Regular.ttf";

// const theme = createTheme({
//   typography: {
//     fontFamily: "Raleway, Arial",
//   },
// });
type Display = {
  summary: string; // summary of the video
  transcript: string; // full transcript of the video
  classification: string[]; // words and concepts that classify the video
  tags: string[]; // tags that are associated with the video
};

interface DrawerProps {
  getCategory: Function; // Getter function that tells the drawer which content to show from the display object
  result: Display; // Object to hold different information about the video
}

export default function DrawerDisplay(props: DrawerProps) {
  // state for icon to display in the copy button
  const [copyText, setCopyText] = useState(<ContentCopyIcon />);
  // state to keep track of visibility of copy button
  const [copyVisibility, setCopyVisibility] = useState(false);

  // element that selectively displays the summary, transcript, or tags of the video
  const update = (content: string[], type: string) => (
    <Box
      sx={{
        width: "100%",
        align: "center",
        paddingLeft: "7%",
        paddingRight: "7%",
      }}
    >
      <IconButton
        disabled={copyVisibility}
        onClick={() => {
          // disable copy button when clicked
          setCopyVisibility(true);
          // upload text to user's clipbord
          navigator.clipboard.writeText(
            type === "tags" ? content.toString() : content[0]
          );
          // update icon temporarily to show user that text has been copied
          setCopyText(<CheckCircleIcon />);
          setTimeout(() => setCopyText(<ContentCopyIcon />), 2000);
          // showcopy button again after 2 seconds
          setCopyVisibility(false);
        }}
        sx={{ float: "right" }}
      >
        {copyText}
      </IconButton>
      {
        // if building tags, create chips for each tag, othewise creat chips for each word in the classification
        type === "tags" ? (
          <Chips label="" content={content}></Chips>
        ) : (
          <Chips label="" content={props.result["classification"]}></Chips>
        )
      }

      <ThemeProvider theme={theme}>
        <Typography
          sx={{
            whiteSpace: "pre-line",
            paddingTop: "10px",
            lineHeight: "2",
          }}
        >
          {
            // if building tags, don't display anything, otherwise display the summary or transcipt string
            type === "tags" ? "" : content[0]
          }
        </Typography>
      </ThemeProvider>
    </Box>
  );

  // Build the summary, transcript, and tags of the video and store them fo later use
  const getSummary = update([props.result["summary"]], "summary");
  const getTranscript = update([props.result["transcript"]], "transcript");
  const getTopic = update(props.result["tags"], "tags");

  // Return one of the above 3 element based on what the user wants to see
  return (
    <div>
      {props.getCategory() === "Summary" ? getSummary : ""}
      {props.getCategory() === "Transcript" ? getTranscript : ""}
      {props.getCategory() === "Topics" ? getTopic : ""}
    </div>
  );
}
