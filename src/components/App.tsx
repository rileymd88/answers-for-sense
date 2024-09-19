import React, { useState } from 'react';
import { AppProps } from '../types';
import { ThemeProvider } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, useMediaQuery } from '@mui/material';
import muiSetup from "../components/mui-setup";
import CloseIcon from '@qlik-trial/sprout/icons/react/Close';
import * as Icons from "@qlik-trial/sprout/icons/react";

const App: React.FC<AppProps> = ({ layout, interactions, options, rect }) => {
  const [open, setOpen] = useState(false);
  const fullScreen = useMediaQuery('(max-width:600px)');
  const { baseTheme, dialogTheme } = muiSetup(options.direction, layout.props.theme === "qlik-dark" ? "dark" : "light");

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { assistantId, useDialog, theme, icon, iconSize, iconColor, iconPosition } = layout.props;
  const isDarkMode = layout.props.theme === "qlik-dark";

  const calculateIconSize = () => {
    const size = iconSize ? iconSize : 80;
    const percentage = size / 100;
    return Math.min(rect.width, rect.height) * percentage;
  };

  const actualIconSize = calculateIconSize();

  const loadIcon = (iconName: string | undefined) => {
    if (iconName === "None") return null;
    const finalIconName = !iconName ? "ChatOutline" : iconName;
    const NestedObject = (Icons as any)[finalIconName + 'Icon'] as unknown as {
      default: React.ComponentType<{
        height: string | number,
        width: string | number,
        color: string
      }>
    };
    if (NestedObject && NestedObject.default) {
      const color = !iconColor || iconColor.color === "" ? "#000000" : iconColor.color;
      return React.createElement(NestedObject.default, {
        height: actualIconSize,
        width: actualIconSize,
        color
      });
    } else {
      console.error(`Icon ${iconName} not found`);
      return null;
    }
  };

  const getIconPosition = () => {
    const position = !iconPosition ? "center" : iconPosition;
    switch (position) {
      case "top-left":
        return { justifyContent: 'flex-start', alignItems: 'flex-start' };
      case "top-right":
        return { justifyContent: 'flex-end', alignItems: 'flex-start' };
      case "center-left":
        return { justifyContent: 'flex-start', alignItems: 'center' };
      case "center-right":
        return { justifyContent: 'flex-end', alignItems: 'center' };
      case "bottom-left":
        return { justifyContent: 'flex-start', alignItems: 'flex-end' };
      case "bottom-right":
        return { justifyContent: 'flex-end', alignItems: 'flex-end' };
      case "center-center":
      default:
        return { justifyContent: 'center', alignItems: 'center' };
    }
  };

  const embedContent = (
    <qlik-embed
      ui="ai/assistant"
      assistant-id={assistantId}
      appearance={theme}
    />
  );

  return (
    <ThemeProvider theme={baseTheme}>
      <Box position="relative" width="100%" height="100%" className="answers-for-sense-container">
        {assistantId === "" ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" className="answers-for-sense-empty-state">
            <Typography variant="body1" color="text.secondary">
              Please select an Assistant
            </Typography>
          </Box>
        ) : useDialog ? (
          <>
            <Box
              onClick={() => !interactions.edit && handleClickOpen()}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                ...getIconPosition(),
                cursor: interactions.edit ? 'default' : 'pointer',
              }}
              className="answers-for-sense-icon-wrapper"
            >
              <IconButton
                className="answers-for-sense-icon-button"
                sx={{
                  margin: '10px',
                  padding: 0,
                  width: `${actualIconSize}px`,
                  height: `${actualIconSize}px`,
                  '& svg': {
                    width: '100%',
                    height: '100%',
                  },
                }}
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => !interactions.edit && handleClickOpen()}
              >
                <span className="answers-for-sense-icon">
                  {loadIcon(icon)}
                </span>
              </IconButton>
            </Box>
            <ThemeProvider theme={dialogTheme}>
              <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                aria-labelledby="assistant-dialog-title"
                PaperProps={{
                  sx: {
                    height: '90vh',
                    maxHeight: '90vh',
                  },
                }}
                className="answers-for-sense-dialog"
              >
                <DialogTitle id="assistant-dialog-title" className="answers-for-sense-dialog-title">
                  <IconButton
                    onClick={handleClose}
                    aria-label="close"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                    }}
                    disabled={interactions.edit}
                    className="answers-for-sense-close-button"
                  >
                    <CloseIcon height="16px" color={isDarkMode ? "#FFFFFF" : "#000000"} />
                  </IconButton>
                </DialogTitle>
                <DialogContent className="answers-for-sense-dialog-content">
                  <Box height="100%" overflow="auto" className="answers-for-sense-embed-container">
                    {embedContent}
                  </Box>
                </DialogContent>
              </Dialog>
            </ThemeProvider>
          </>
        ) : (
          <Box className="answers-for-sense-embed-container" sx={{ height: '100%', width: '100%' }}>
            {embedContent}
          </Box>
        )}
        {interactions.edit && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={1}
            className="answers-for-sense-edit-overlay"
          />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;
