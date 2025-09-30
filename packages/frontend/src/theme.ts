import { extendTheme } from '@chakra-ui/react';

// Robotic theme: dark, metallic grays with neon cyan accents and techno font stack.
const theme = extendTheme({
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
      },
      body: {
        bg: '#0b0f14',
        color: '#c9f4ff',
        fontFamily:
          "'Roboto Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Segoe UI Mono', Roboto, 'Helvetica Neue', Arial",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      // Ensure preformatted text and labels have sufficient contrast
      'pre, code': {
        color: '#e6f9ff',
      },
      label: {
        color: '#9fe8ff',
      },
    },
  },
  colors: {
    robot: {
      50: '#e6fbff',
      100: '#c9f4ff',
      200: '#9fe8ff',
      500: '#00e6ff',
    },
    metal: {
      50: '#f4f6f8',
      100: '#e6eef4',
      700: '#2b3540',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '6px',
      },
      variants: {
        neon: {
          bg: 'transparent',
          color: 'robot.100',
          border: '1px solid',
          borderColor: 'robot.100',
          _hover: { bg: 'rgba(0,230,255,0.06)' },
          _active: { bg: 'rgba(0,230,255,0.12)' },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'robot.100',
        fontWeight: 700,
      },
    },
    Text: {
      baseStyle: {
        color: '#d7f8ff',
      },
    },
    FormLabel: {
      baseStyle: {
        color: 'robot.100',
        opacity: 0.9,
        fontSize: 'sm',
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'gray.800',
          color: '#e6f9ff',
          borderColor: 'gray.600',
          _placeholder: { color: 'gray.500' },
        },
      },
    },
    Textarea: {
      baseStyle: {
        bg: 'gray.800',
        color: '#e6f9ff',
        borderColor: 'gray.600',
        _placeholder: { color: 'gray.500' },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'gray.900',
          color: '#e6f9ff',
          borderColor: 'gray.700',
        },
      },
    },
  },
});

export default theme;
