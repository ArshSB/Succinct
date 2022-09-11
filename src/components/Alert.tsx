import React from "react";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

interface AlertBarProps {
  text: string; // text to display in the alert box
}

export default function AlertBar(props: AlertBarProps) {
  // from MUI Alert doc: https://mui.com/material-ui/react-alert/#main-content
  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  // Return a erro alert box with the given text (severity can be set via props instead of default)
  return <Alert severity="error">{props.text}</Alert>;
}
