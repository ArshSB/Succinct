import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

interface ChipsProps {
  label: string; // text to display before the chips (can be empty)
  content: string[]; // array of strings to display as chips individually
}

// Returns a box that includes a label and multiple chips
export default function Chips(props: ChipsProps) {
  return (
    <Box>
      <b>{props.label}</b>
      {props.content.map((item, index) => {
        return (
          <Chip
            sx={{
              margin: 0.5,
              textAlign: "center",
              textTransform: "capitalize",
            }}
            key={index}
            label={item}
          />
        );
      })}
    </Box>
  );
}
