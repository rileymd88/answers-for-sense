import { createTheme, type Direction, ThemeOptions } from "@mui/material/styles";
import theme from "@qlik-trial/sprout/theme/theme";

export default function muiSetup(direction: Direction | undefined, lightOrDark: "light" | "dark") {
  const baseTheme = createTheme({ ...theme(lightOrDark), direction });

  // Ensure that typography and transitions are properly defined
  const extendedBaseTheme = createTheme({
    ...baseTheme,
    typography: {
      ...baseTheme.typography,
    },
    transitions: {
      ...baseTheme.transitions,
      create: (props: string | string[], options?: object) => {
        return baseTheme.transitions?.create?.(props, options) || '';
      },
    },
  });

  const dialogTheme = createTheme({
    ...extendedBaseTheme,
    components: {
      ...extendedBaseTheme.components,
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: lightOrDark === 'dark' ? extendedBaseTheme.palette.grey[900] : extendedBaseTheme.palette.background.paper,
            color: lightOrDark === 'dark' ? extendedBaseTheme.palette.common.white : extendedBaseTheme.palette.common.black,
          },
        },
      },
    },
  });

  return { baseTheme: extendedBaseTheme, dialogTheme };
}