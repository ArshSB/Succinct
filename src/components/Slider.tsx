import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import InfoBox from "./InfoBox";
import InfoIcon from "@mui/icons-material/Info";

interface SliderProps {
  label: string; // label of the slider
  min: number; // minimum value of the slider
  max: number; // maximum value of the slider
  step: number; // step value of the slider
  info: JSX.Element; // HTML content of the info box
  callback: Function; // callback function that is called when the slider is changed
}

export default function InputSlider(props: SliderProps) {
  // holds the value of the slider, default is 30
  const [value, setValue] = React.useState<
    number | string | Array<number | string>
  >(30);

  // on change of the slider, update the value
  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue);
  };

  // show custom value of the slider to user
  function valueLabelFormat(value: number) {
    const units = "%";
    return `${value} ${units}`;
  }

  // when slider value changes, update the value in parent component (App.tsx) via callback function
  useEffect(() => {
    props.callback("length", value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Return the slider component based on the props along with label and info icon content
  return (
    <Grid sx={{ width: 250 }} container direction="row">
      <Grid item>
        <Typography>{props.label}</Typography>
      </Grid>
      <Grid item sx={{ marginTop: -1 }}>
        <InfoBox icon={<InfoIcon />} content={props.info} />
      </Grid>
      <Slider
        sx={{ marginTop: 1 }}
        value={Number(value)}
        min={props.min}
        step={props.step}
        max={props.max}
        getAriaValueText={valueLabelFormat}
        onChange={handleChange}
        valueLabelDisplay="auto"
        aria-labelledby="step-slider"
        valueLabelFormat={valueLabelFormat}
      />
    </Grid>
  );
}
