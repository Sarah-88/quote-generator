import React, { useCallback } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Slider, Typography, Select, SelectChangeEvent, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton, Switch, FormGroup, FormControlLabel, TextField, FormLabel, RadioGroup, Radio, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import AlignVerticalBottomIcon from '@mui/icons-material/AlignVerticalBottom';
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
import AlignVerticalTopIcon from '@mui/icons-material/AlignVerticalTop';
import { grey, blue } from '@mui/material/colors';
import { formatLabel, urlCheck } from './utilities';

type Props = {
  type: {
    name: string;
    title: string;
    inputs: {
      type: string;
      min?: number;
      max?: number;
      step?: number
      label: string;
      name: string;
      colSize?: number;
      list?: string[];
      suffix?: string;
      subInput?: {
        type: string;
        name: string;
        label: string;
        min?: number;
        max?: number;
        step?: number;
        suffix?: string;
      }[];
    }[]
  };
  updateFunction: (key: string, data: { [key: string]: any }) => () => void;
  selected: string;
  defaultValues: {
    [key: string]: string | number | boolean
  },
  updatedValues: {
    [key: string]: string | number | boolean
  }
}

const generateInput = (
  input: Props['type']['inputs'][0], 
  field: string, 
  values: {[key: string]: string | number | boolean},
  latestValues: {[key: string]: string | number | boolean},
  updateValues: (param: {[key: string]: string | number | boolean}, quickUpdate?: boolean) => void
) => {
  const min = input.min ?? 0;
  const max = input.max ?? 0;
  const defaultValue = values[input.name];
  switch (input.type) {
    case "textarea":
    case "text":
      return (
        <TextField
          multiline={input.type === "textarea"}
          label={input.label}
          name={input.name}
          defaultValue={defaultValue}
          value={latestValues[input.name]}
          rows={4}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateValues({[input.name]: event.target.value});
          }}
        />
      )
    case "slider":
      return (
          <>
            <Typography variant={'overline'}>{input.label}</Typography>
            <Slider
              defaultValue={defaultValue as number}
              value={latestValues[input.name] as number}
              name={input.name}
              step={input.step ?? 1}
              min={min}
              max={max}
              valueLabelDisplay="auto" 
              valueLabelFormat={input.suffix ? formatLabel(input.suffix) : undefined}
              onChange={(event: Event, newValue: number | number[]) => {
                updateValues({[input.name]: newValue as number});
              }} />
          </>
        )
    case "select":
      return (
        <>
          <InputLabel id={`ipt-${field}-${input.name}`}>{input.label}</InputLabel>
          <Select labelId={`ipt-${field}-${input.name}`} label={input.label} defaultValue={defaultValue as string} onChange={(event: SelectChangeEvent) => {
            updateValues({[input.name]: event.target.value});
          }}>
            {input.list?.map((list, idx) => <MenuItem key={`menuitem-${input.name}-${idx}`} value={list} style={{fontFamily: input.name === 'fontFamily' ? list : 'inherit'}}>{list}</MenuItem>)}
          </Select>
        </>
      )
    case "switch":
      return (
        <FormGroup row>
          <FormControlLabel 
            label={input.label}
            labelPlacement={'end'}
            control={
              <Switch defaultChecked={defaultValue as boolean} name={input.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateValues({[input.name]: event.target.checked});
              }} />
            }
          />
        </FormGroup>
      )
    case "color":
      return (
        <Grid container columnGap={3}>
          <Typography variant={'overline'}>{input.label}</Typography>
          <input type="color" defaultValue={defaultValue as string} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateValues({[input.name]: event.target.value});
          }} />
        </Grid>
      )
    case "group":
      return (
        <Grid container borderTop={1} borderBottom={1} pt={1} borderColor={grey[300]}>
          {input.label && <Grid item xs={12}><Typography variant={'overline'} fontWeight={700}>{input.label}</Typography></Grid>}
          {input.subInput?.map((sub, idx) => 
            <Grid key={`group-${sub.name}-${idx}`} item xs={input.colSize} paddingLeft={2} paddingRight={2} paddingBottom={1}>
              {generateInput(sub, field, values, latestValues, updateValues)}
            </Grid>
          )}
        </Grid>
      )
    case "radio":
      return (
        <>
          <FormLabel>{input.label}</FormLabel>
          <RadioGroup defaultValue={defaultValue} name={input.name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateValues({[input.name]: event.target.value});
          }}>
            {input.subInput?.map((sub, idx) => (
              <Box key={`sub-${sub.name}-${idx}`}>
                <FormControlLabel value={sub.type} control={<Radio />} label={sub.label} />
                {latestValues[input.name] === sub.type && sub.name && (
                  <Box ml={4} mb={2}>
                    {sub.type === 'url' && (
                      <TextField
                        type="url"
                        variant="standard"
                        fullWidth
                        value={latestValues[sub.name]}
                        error={urlCheck(latestValues[sub.name] as string)}
                        helperText={urlCheck(latestValues[sub.name] as string) ? 'Invalid URL' : ''}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          updateValues({[sub.name]: event.target.value});
                        }}
                      />
                    )}
                    {sub.type === 'file' && (
                      <>
                        <input type="file" accept="image/png, image/jpeg" id="bgImageUpload" hidden onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                          if (event.target.files) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                updateValues({[sub.name]: ev.target.result as string});
                              }
                            }
                            reader.readAsDataURL(event.target.files[0]);
                          } else {
                            updateValues({[sub.name]: ''});
                          }
                        }} />
                        <label htmlFor="bgImageUpload">
                          <Button variant="outlined" component="span">{latestValues[sub.name] ? 'Change' : 'Select'} Image</Button>
                        </label>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </RadioGroup>
        </>
      )
    case "toggleGroup":
      return (
        <>
          <Typography variant={'overline'}>{input.label}</Typography>
          <ToggleButtonGroup
            value={latestValues[input.name] as string}
            exclusive
            onChange={(event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
              if (newAlignment) {
                updateValues({[input.name]: newAlignment});
              }
            }}
            aria-label="text alignment"
          >
            <ToggleButton value={input.name === "horizontalTextAlignment" ? "left" : "flex-start"} aria-label="left aligned">
              {input.name === 'verticalColAlignment' ? <AlignVerticalTopIcon /> : <FormatAlignLeftIcon />}
            </ToggleButton>
            <ToggleButton value="center" aria-label="centered">
              {input.name === 'verticalColAlignment' ? <AlignVerticalCenterIcon /> : <FormatAlignCenterIcon />}
            </ToggleButton>
            <ToggleButton value={input.name === "horizontalTextAlignment" ? "right" : "flex-end"} aria-label="right aligned">
              {input.name === 'verticalColAlignment' ? <AlignVerticalBottomIcon /> : <FormatAlignRightIcon />}
            </ToggleButton>
          </ToggleButtonGroup>
        </>
      )
  }
  return <></>;
}

const Settings: React.FC<Props> = (props) => {
  let timer = React.useRef<any>(null);
  //try to avoid UI lag a little
  const updateValues = useCallback((newVal: typeof props.updatedValues, quickUpdate?: boolean) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (quickUpdate) {
      props.updateFunction(props.type.name, {...props.updatedValues, ...newVal})();
      return;
    }
    timer.current = setTimeout(() => {
      props.updateFunction(props.type.name, {...props.updatedValues, ...newVal})();
      clearTimeout(timer.current);
      timer.current = null;
    }, 10);
  }, [props.updatedValues]);
  return (
    <Accordion elevation={1} expanded={props.type.name === props.selected} onChange={props.updateFunction('others', { accordionOpen: props.type.name === props.selected ? '' : props.type.name })}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="button" fontWeight={700} color={blue[800]}>{props.type.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {props.type.inputs.map((ipt) => 
          <Box key={`ipt-${props.type.name}-${ipt.name}`} mb={2}>
            <FormControl fullWidth>
              {generateInput(ipt, props.type.name, props.defaultValues, props.updatedValues, updateValues)}
            </FormControl>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default Settings;
