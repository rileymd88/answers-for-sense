import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppProps, DialogSizePreset } from '../types';
import { ThemeProvider } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  Drawer,
  Paper,
  PaperProps,
} from '@mui/material';
import muiSetup from '../components/mui-setup';
import CloseIcon from '@qlik-trial/sprout/icons/react/Close';
import * as Icons from '@qlik-trial/sprout/icons/react';
import QlikEmbedAssistant from './QlikEmbedAssistant';

const MIN_DRAWER_WIDTH = 320;
const DEFAULT_DRAWER_WIDTH = 560;
const DRAWER_WIDTH_MARGIN = 0;

const computeDrawerWidthBounds = () => {
  const min = MIN_DRAWER_WIDTH;
  if (typeof window === 'undefined') {
    return { min, max: DEFAULT_DRAWER_WIDTH };
  }
  const availableWidth = window.innerWidth - DRAWER_WIDTH_MARGIN;
  const max = Math.max(min, availableWidth);
  return { min, max };
};

const computeInitialDrawerWidth = () => {
  const { min, max } = computeDrawerWidthBounds();
  if (typeof window === 'undefined') {
    return Math.min(Math.max(DEFAULT_DRAWER_WIDTH, min), max);
  }
  const preferred = Math.round(window.innerWidth * 0.5);
  return Math.min(Math.max(preferred, min), max);
};

const DraggablePaper: React.FC<PaperProps> = props => {
  const { sx, ...rest } = props;
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const header = target.closest('.dialog-header');
      const button = target.closest('button');
      if (header && !button) {
        setIsDragging(true);
        dragStartRef.current = {
          x: event.clientX - position.x,
          y: event.clientY - position.y,
        };
      }
    },
    [position.x, position.y]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      setPosition({
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      });
    },
    []
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseUp = () => stopDragging();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    const body = document.body;
    if (body) {
      body.style.cursor = 'move';
      body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (body) {
        body.style.cursor = '';
        body.style.userSelect = '';
      }
    };
  }, [handleMouseMove, isDragging, stopDragging]);

  return (
    <Paper
      {...rest}
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      sx={{
        ...sx,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    />
  );
};

const App: React.FC<AppProps> = ({ layout, interactions, options, rect, hostConfig }) => {
  const [open, setOpen] = useState(false);
  const fullScreenDialog = useMediaQuery('(max-width:600px)');
  const { baseTheme, dialogTheme } = muiSetup(options.direction, layout.props.theme === 'qlik-dark' ? 'dark' : 'light');

  const {
    assistantId,
    legacyAssistant = true,
    fullScreenMode = true,
    useDialog,
    theme,
    icon,
    iconSize,
    iconColor,
    iconPosition,
    dialogMode = 'dialog',
    dialogSizePreset = 'standard',
    drawerPosition = 'right',
    draggable = false,
    resizable = false,
  } = layout.props;

  const isDarkMode = layout.props.theme === 'qlik-dark';
  const useFullScreenMode = !legacyAssistant && fullScreenMode;

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const calculateIconSize = useCallback(() => {
    const size = iconSize ? iconSize : 80;
    const percentage = size / 100;
    return Math.min(rect.width, rect.height) * percentage;
  }, [iconSize, rect.height, rect.width]);

  const actualIconSize = calculateIconSize();

  const loadIcon = useCallback(
    (iconName: string | undefined) => {
      if (iconName === 'None') return null;
      const finalIconName = !iconName ? 'ChatOutline' : iconName;
      const NestedObject = (Icons as any)[`${finalIconName}Icon`] as unknown as {
        default: React.ComponentType<{
          height: string | number;
          width: string | number;
          color: string;
        }>;
      };
      if (NestedObject && NestedObject.default) {
        const color = !iconColor || iconColor.color === '' ? '#000000' : iconColor.color;
        return React.createElement(NestedObject.default, {
          height: actualIconSize,
          width: actualIconSize,
          color,
        });
      }
      console.error(`Icon ${iconName} not found`);
      return null;
    },
    [actualIconSize, iconColor]
  );

  const getIconPosition = useCallback(() => {
    const position = !iconPosition ? 'center' : iconPosition;
    switch (position) {
      case 'top-left':
        return { justifyContent: 'flex-start', alignItems: 'flex-start' };
      case 'top-right':
        return { justifyContent: 'flex-end', alignItems: 'flex-start' };
      case 'center-left':
        return { justifyContent: 'flex-start', alignItems: 'center' };
      case 'center-right':
        return { justifyContent: 'flex-end', alignItems: 'center' };
      case 'bottom-left':
        return { justifyContent: 'flex-start', alignItems: 'flex-end' };
      case 'bottom-right':
        return { justifyContent: 'flex-end', alignItems: 'flex-end' };
      case 'center-center':
      default:
        return { justifyContent: 'center', alignItems: 'center' };
    }
  }, [iconPosition]);

  const clampDrawerWidth = useCallback((width: number) => {
    const { min, max } = computeDrawerWidthBounds();
    return Math.min(Math.max(width, min), max);
  }, []);

  const [drawerWidth, setDrawerWidth] = useState(() => clampDrawerWidth(computeInitialDrawerWidth()));
  const [isResizingDrawer, setIsResizingDrawer] = useState(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(drawerWidth);

  useEffect(() => {
    if (!isResizingDrawer) {
      resizeStartWidthRef.current = drawerWidth;
    }
  }, [drawerWidth, isResizingDrawer]);

  const updateDrawerWidth = useCallback(
    (clientX: number) => {
      const delta =
        drawerPosition === 'left'
          ? clientX - resizeStartXRef.current
          : resizeStartXRef.current - clientX;
      const proposed = resizeStartWidthRef.current + delta;
      setDrawerWidth(clampDrawerWidth(proposed));
    },
    [clampDrawerWidth, drawerPosition]
  );

  const handleDrawerResizeMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsResizingDrawer(true);
      resizeStartXRef.current = event.clientX;
      resizeStartWidthRef.current = drawerWidth;
    },
    [drawerWidth]
  );

  const handleDrawerResizeTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      event.preventDefault();
      event.stopPropagation();
      setIsResizingDrawer(true);
      resizeStartXRef.current = touch.clientX;
      resizeStartWidthRef.current = drawerWidth;
    },
    [drawerWidth]
  );

  useEffect(() => {
    if (!isResizingDrawer) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      updateDrawerWidth(event.clientX);
    };

    const handleMouseUp = () => {
      setIsResizingDrawer(false);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      updateDrawerWidth(event.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      setIsResizingDrawer(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    const body = document.body;
    if (body) {
      body.style.userSelect = 'none';
      body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (body) {
        body.style.userSelect = '';
        body.style.cursor = '';
      }
    };
  }, [isResizingDrawer, updateDrawerWidth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setDrawerWidth(prev => clampDrawerWidth(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampDrawerWidth]);

  const assistantUi = legacyAssistant ? 'ai/assistant' : 'ai/agentic-assistant';
  const assistantVariant = useFullScreenMode ? 'dashboard' : undefined;
  const nonLegacyFullDrawerWidth = useFullScreenMode && dialogMode === 'drawer';
  const nonLegacyAssistantWidthOverrides = useMemo(
    () =>
      useFullScreenMode
        ? {
            // Fallback for runtimes where `variant="dashboard"` is ignored.
            '& .answers-for-sense-embed-root [data-testid="universal-assistant-paginated-box"]': {
              width: '100% !important',
              maxWidth: 'none !important',
              minWidth: '0 !important',
              margin: '0 !important',
            },
            '& .answers-for-sense-embed-root [id="universal-assistant-paginated-box"]': {
              width: '100% !important',
              maxWidth: 'none !important',
              minWidth: '0 !important',
              margin: '0 !important',
            },
            '& .answers-for-sense-embed-root qmfe-embed-react': {
              width: '100% !important',
              maxWidth: 'none !important',
            },
            '& .answers-for-sense-embed-root qmfe-root': {
              width: '100% !important',
              maxWidth: 'none !important',
            },
            '& .answers-for-sense-embed-root > qmfe-root > div': {
              width: '100% !important',
              maxWidth: 'none !important',
              alignItems: 'stretch !important',
            },
            '& .answers-for-sense-embed-root > qmfe-root > div > div': {
              width: '100% !important',
              maxWidth: 'none !important',
              minWidth: '0 !important',
            },
            '& .answers-for-sense-embed-root [style*="min-height: 250px"][style*="width:"]': {
              width: '100% !important',
              maxWidth: 'none !important',
              minWidth: '0 !important',
            },
            '& .answers-for-sense-embed-root #ua-resize-container': {
              width: '100% !important',
              minWidth: '0 !important',
              maxWidth: '100% !important',
            },
            '& .answers-for-sense-embed-root #ua-main-container': {
              width: '100% !important',
              maxWidth: '100% !important',
            },
          }
        : undefined,
    [useFullScreenMode]
  );

  const dialogMaxWidth = useMemo((): false | 'sm' | 'md' | 'lg' => {
    const preset = (dialogSizePreset ?? 'standard') as DialogSizePreset;
    switch (preset) {
      case 'compact':
        return 'sm';
      case 'wide':
        return 'lg';
      case 'full':
        return false;
      case 'standard':
      default:
        return 'md';
    }
  }, [dialogSizePreset]);

  const embedContent = useMemo(
    () => (
      <QlikEmbedAssistant
        appearance={theme}
        assistantId={assistantId}
        hostConfig={hostConfig}
        ui={assistantUi}
        variant={assistantVariant}
      />
    ),
    [assistantId, assistantUi, assistantVariant, hostConfig, theme]
  );

  if (assistantId === '') {
    return (
      <ThemeProvider theme={baseTheme}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" className="answers-for-sense-empty-state">
          <Typography variant="body1" color="text.secondary">
            Please select an Assistant
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!useDialog) {
    return (
      <ThemeProvider theme={baseTheme}>
        <Box
          className="answers-for-sense-embed-container"
          sx={{
            height: '100%',
            width: '100%',
            ...nonLegacyAssistantWidthOverrides,
          }}
        >
          {embedContent}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={baseTheme}>
      <Box position="relative" width="100%" height="100%" className="answers-for-sense-container">
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
              pointerEvents: interactions.edit ? 'none' : 'auto',
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
            <span className="answers-for-sense-icon">{loadIcon(icon)}</span>
          </IconButton>
        </Box>

        <ThemeProvider theme={dialogTheme}>
          {dialogMode === 'drawer' ? (
            <Drawer
              anchor={drawerPosition}
              open={open}
              onClose={handleClose}
              className="answers-for-sense-drawer"
              keepMounted
              PaperProps={{
                sx: {
                  width: nonLegacyFullDrawerWidth ? '100vw' : drawerWidth,
                  minWidth: nonLegacyFullDrawerWidth ? '100vw' : MIN_DRAWER_WIDTH,
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: nonLegacyFullDrawerWidth || isResizingDrawer ? 'none' : 'width 0.2s ease',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  p: 1,
                  borderBottom: themeObj => `1px solid ${themeObj.palette.divider}`,
                }}
              >
                <IconButton
                  onClick={handleClose}
                  aria-label="close drawer"
                  disabled={interactions.edit}
                  className="answers-for-sense-close-button"
                  size="small"
                >
                  <CloseIcon height="16px" color={isDarkMode ? '#FFFFFF' : '#000000'} />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {open && !nonLegacyFullDrawerWidth && (
                  <Box
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize drawer"
                    onMouseDown={handleDrawerResizeMouseDown}
                    onTouchStart={handleDrawerResizeTouchStart}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: 8,
                      cursor: 'col-resize',
                      zIndex: 10,
                      touchAction: 'none',
                      ...(drawerPosition === 'left' ? { right: -4 } : { left: -4 }),
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 2,
                        borderRadius: 3,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                      },
                      '&:hover::after, &:focus-visible::after, &:active::after': {
                        opacity: 1,
                      },
                    }}
                  />
                )}
                <Box
                  height="100%"
                  overflow="auto"
                  className="answers-for-sense-embed-container"
                  sx={nonLegacyAssistantWidthOverrides}
                >
                  {embedContent}
                </Box>
              </Box>
            </Drawer>
          ) : (
            <Dialog
              fullScreen={fullScreenDialog}
              open={open}
              onClose={handleClose}
              maxWidth={dialogMaxWidth}
              fullWidth
              aria-labelledby="assistant-dialog-title"
              PaperComponent={draggable ? DraggablePaper : Paper}
              PaperProps={{
                sx: {
                  height: fullScreenDialog ? '100%' : '90vh',
                  maxHeight: fullScreenDialog ? '100%' : '90vh',
                  resize: resizable ? 'both' : 'none',
                  overflow: resizable ? 'auto' : 'hidden',
                  position: 'relative',
                },
              }}
              className="answers-for-sense-dialog"
            >
              <DialogTitle id="assistant-dialog-title" className="answers-for-sense-dialog-title dialog-header">
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
                  <CloseIcon height="16px" color={isDarkMode ? '#FFFFFF' : '#000000'} />
                </IconButton>
              </DialogTitle>
              <DialogContent className="answers-for-sense-dialog-content">
                <Box
                  height="100%"
                  overflow="auto"
                  className="answers-for-sense-embed-container"
                  sx={nonLegacyAssistantWidthOverrides}
                >
                  {embedContent}
                </Box>
              </DialogContent>
            </Dialog>
          )}
        </ThemeProvider>

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
