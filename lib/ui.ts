import { createSystem } from "frog/ui";

export const { Box, Image, Heading, Text, VStack, Spacer, vars } = createSystem({
  colors: {
    white: "white",
    black: "black",
    red: "red",
    fcPurple: "rgb(71,42,145)",
    bg: "rgb(0,138,7)",
    grey: "rgb(136,191,130)"
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