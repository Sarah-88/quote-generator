import React, { useMemo } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { DisplayData } from '../QuoteCard';
import { Box } from '@mui/system';
import { hexToRgb } from './utilities';

const formatBgStyle = (styles: DisplayData['background'] & DisplayData['size']) => {
  let style: {area: {[key: string]: number | string}, image: {[key: string]: string | number}} = {
    area: {
      width: styles.width,
      height: styles.height,
      backgroundColor: styles.bgColor
    },
    image: {}
  }
  if (['url','file'].includes(styles.bgType)) {
    style.image = {...style.image, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'};
    if (styles.bgType === 'url') {
      if (/^https?:\/\/\w+(\.[\w]+){1,3}/.test(styles.bgUrlImage)) {
        style.image['backgroundImage'] = `url(${styles.bgUrlImage})`;
      }
    } else {
      if (styles.bgUploadImage) {
        style.image['backgroundImage'] = `url(${styles.bgUploadImage})`;
      }
    }
  }
  let filters = [];
  ['contrast','saturate','brightness','opacity','grayscale','sepia'].forEach((ft) => {
    filters.push(`${ft}(${styles[ft as keyof DisplayData['background']] as number/100})`);
  });
  if (styles.blur > 0) {
    filters.push(`blur(${styles.blur}px)`);
  }
  if (styles.hue > 0) {
    filters.push(`hue-rotate(${styles.hue}deg)`);
  }
  if (filters.length) style.image['filter'] = filters.join(' ');
  return style;
}
const formatTextStyle = (styles: DisplayData['author'] | DisplayData['quote']) => {
  let style: {parent: {[key: string]: string | number}, text: {[key: string]: string | number}} = {parent: {}, text: {}};
  for (const [key, val] of Object.entries(styles)) {
    switch (key) {
      case "italic":
        style.text['fontStyle'] = val ? 'italic' : 'normal';
        break;
      case "horizontalColAlignment":
        style.parent['alignContent'] = val as string;
        break;
      case "horizontalTextAlignment":
        style.parent['textAlign'] = val as string;
        break;
      case "verticalColAlignment":
        style.parent['justifyContent'] = val as string;
        break;
      case "text":
        style.text['whiteSpace'] = 'pre-wrap';
        break;
      //skip these, handle later
      case "shadowOpacity":
      case "shadowColor":
      case "shadowOffsetX":
      case "shadowOffsetY":
      case "shadowBlur":
        break;
      default:
        style.text[key] = val as string | number;
        break;
    }
  }
  if (styles.shadowOpacity > 0) {
    style.text['textShadow'] = `rgba(${hexToRgb(styles.shadowColor).join(',')},${styles.shadowOpacity/100}) ${styles.shadowOffsetX}px ${styles.shadowOffsetY}px ${styles.shadowBlur}px`;
  }
  return style;
}
const Preview: React.FC<DisplayData & {imgRef: React.RefObject<HTMLDivElement>}> = (props) => {
  const bgStyle = useMemo(() => formatBgStyle({...props.background, ...props.size}), [props.background, props.size]);
  const quoteStyle = useMemo(() => formatTextStyle(props.quote), [props.quote]);
  const authorStyle = useMemo(() => formatTextStyle(props.author), [props.author]);

  return (
    <Paper ref={props.imgRef} elevation={3} square style={bgStyle.area} sx={{
      position: 'relative',
      padding: 2,
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <Box style={bgStyle.image} position='absolute' sx={{inset: -20}} />
      <Grid container style={quoteStyle.parent} position='relative' height="100%" flexDirection={'column'}>
        <Grid item><Typography style={quoteStyle.text}>{props.quote.text}</Typography></Grid>
      </Grid>
      {props.author.text && (
        <Box style={{position: 'absolute', bottom: 0, left: 10, right: 10, ...authorStyle.parent}}>
          <Typography style={authorStyle.text}>{props.author.text}</Typography>
        </Box>
      )}
    </Paper>
  );
}

export default Preview;
