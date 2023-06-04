import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    customButton: "#F0E5CF",
    signupButton: "#FF4C00",
    passresetButton: "#6100FF",
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: "lato",
        fontSize: "16px",
        width: "full",
        textAlign: "center"
      }
    }
  }
});

export default theme;
