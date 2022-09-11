import * as React from "react";
import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

interface InfoBoxProps {
  icon: JSX.Element; // MUI icon to display
  content: JSX.Element; // HTML content inside the info box
}

// custom styles for the info box, from MUI documentation: https://mui.com/material-ui/react-tooltip/#customization
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));

// Returns a styled info box with an icon and content
export default function InfoBox(props: InfoBoxProps) {
  return (
    <div>
      <HtmlTooltip
        title={
          <React.Fragment>
            <Typography color="inherit">{props.content}</Typography>
          </React.Fragment>
        }
      >
        <IconButton>{props.icon}</IconButton>
      </HtmlTooltip>
    </div>
  );
}
