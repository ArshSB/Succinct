import React, { useEffect } from "react";
import TextField from "@mui/material/TextField";

interface TextFieldProps {
  label: string; // label of the text field
  placeholder: string; // placeholder of the text field
  callback: Function; // callback function that is called when the text field is changed
}

export default function TextInput(props: TextFieldProps) {
  // holds sting value of the text field
  const [value, setValue] = React.useState("");

  // on change of the text field, update the value
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // when text field value changes, update the value in parent component (App.tsx) via callback function
  useEffect(() => {
    props.callback("url", value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Return the text field component based on the props along with label and Youtube Icon
  return (
    <TextField
      fullWidth={true}
      sx={{ pb: 2 }}
      id="input-with-sx"
      label={props.label}
      variant="outlined"
      onChange={handleChange}
      placeholder={props.placeholder}
    />
  );
}
