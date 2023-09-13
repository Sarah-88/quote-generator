import React, { useCallback, useReducer, useRef } from 'react';
import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey, blueGrey } from '@mui/material/colors';
import Settings from './Components/Settings';
import Preview from './Components/Preview';
import quoteSettings from './settings.json';
import { toPng } from 'html-to-image';

const theme = createTheme({
  palette: {
    action: {
      disabledBackground: grey[400],
    },
    secondary: blueGrey
  }
});

const INITIAL_STATE = {
  size: {
    width: 800,
    height: 800,
    bgColor: '#000000'
  },
  background: {  
    bgType: 'none',
    bgUploadImage: '',
    bgUrlImage: '',
    brightness: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    saturate: 100,
    contrast: 100,
    opacity: 100,
    sepia: 0
  },
  quote: {
    fontFamily: 'Merienda',
    fontSize: 48,
    color: '#ffffff',
    italic: false,
    maxWidth: 400,
    horizontalColAlignment: 'center',
    verticalColAlignment: 'center',
    text: 'Sample Quote',
    shadowColor: '#000000',
    shadowOpacity: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0
  },
  author: {
    fontFamily: 'Georgia',
    fontSize: 24,
    color: '#fefefe',
    italic: true,
    horizontalTextAlignment: 'right',
    text: 'Author',
    shadowColor: '#000000',
    shadowOpacity: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0
  },
  others: {
    accordionOpen: '',
    downloading: false,
    randomizing: false
  }
};
export type DisplayData = Omit<typeof INITIAL_STATE, 'others'>;

type ACTION = {type: string; key: string, data?:{[key: string]: string | undefined | number | boolean}};
const reducer = (state: typeof INITIAL_STATE, action: ACTION) => {
  switch (action.type) {
    case "update/values":
      return {...state, [action.key]: {...state[action.key as keyof typeof INITIAL_STATE], ...action.data}}
    case "update/status":
      const k = action.key as 'downloading' | 'randomizing';
      return {...state, others: {...state.others, [k]: !state.others[k]}};
    default:
      return state;
  }
};
const QuoteCard: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const previewImg = useRef<HTMLDivElement>(null);
  const randomQuote = useCallback(() => {
    dispatch({type: 'update/status', key: 'randomizing'});
    fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => {
        const maxW = Math.min(window.innerWidth * 0.075, Math.round(state.size.width * 0.075)) * 10;
        dispatch({type: 'update/values', key: 'quote', data: {
          text: data.content,
          fontSize: Math.round(Math.min(20 + (100/data.content.length)*20, 64)),
          maxWidth: maxW
        }});
        dispatch({type: 'update/values', key: 'author', data: {text: data.author}});
      })
      .finally(() => dispatch({type: 'update/status', key: 'randomizing'}));
  }, [state.size.width]);

  const updateSettings = useCallback((key: string, data: {[key: string]: any}) => () => {
    dispatch({type: 'update/values', key: key, data: data});
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Box maxWidth={1280} margin={'auto'} position='relative' zIndex={2}>
        <Box textAlign={'center'}><Typography variant="h2" fontFamily={'Cormorant SC'} marginBottom={2} color={'white'}>Quote Card</Typography></Box>
        <Grid container justifyContent={'center'} columnSpacing={3}>
          <Grid item container justifyContent={'center'} md={8} xs={12} mb={2}>
            <Preview background={state.background} size={state.size} author={state.author} quote={state.quote} imgRef={previewImg} />
          </Grid>
          <Grid item justifyContent={'center'} md={4} xs={12}>
            {quoteSettings.map((qt) => (
              <Settings 
                key={`setting-${qt.name}`} 
                type={qt} 
                selected={state.others.accordionOpen} 
                defaultValues={INITIAL_STATE[qt.name as 'background' | 'quote' | 'author']} 
                updatedValues={state[qt.name as 'background' | 'quote' | 'author']}
                updateFunction={updateSettings} 
              />
            ))}
            <Grid item mt={1}>
              <Button fullWidth variant="contained" color="secondary" disabled={state.others.randomizing} onClick={randomQuote}>
                Random Quote{state.others.randomizing && <CircularProgress size={20} style={{color: grey[200], marginLeft: 10}} />}
              </Button>
            </Grid>
            <Grid item mt={1}>
              <Button fullWidth variant="contained" disabled={state.others.downloading} onClick={() => {
                if (previewImg.current === null) {
                  return
                }
                dispatch({type: 'update/status', key: 'downloading'});
            
                toPng(previewImg.current, { cacheBust: true, })
                  .then((dataUrl) => {
                    dispatch({type: 'update/status', key: 'downloading'});
                    const link = document.createElement('a')
                    link.download = 'QuoteImage.png'
                    link.href = dataUrl
                    link.click()
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }}>Download{state.others.downloading && <CircularProgress size={20} style={{color: grey[200], marginLeft: 10}} />}</Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default QuoteCard;
