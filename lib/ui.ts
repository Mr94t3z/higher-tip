import { createSystem } from "frog/ui";

export const { Box, Image, Heading, Text, VStack, Spacer, vars } = createSystem({
  colors: {
    white: "white",
    black: "black",
    red: "red",
    fcPurple: "rgb(123,101,193)",
    bg: "rgb(0,138,7)",
    grey: "rgb(136,191,130)",
    yellow: "yellow"
  },
  fonts: {
    default: [
      {
        name: "Space Mono",
        source: "google",
      },
    ],
  },
});