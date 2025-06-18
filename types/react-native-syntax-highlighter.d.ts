declare module 'react-native-syntax-highlighter' {
  import { ComponentType } from 'react';

  interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: any;
    children: string;
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

declare module 'react-native-syntax-highlighter/dist/cjs/styles/hljs/tomorrow' {
  const style: any;
  export default style;
}

declare module 'react-native-syntax-highlighter/dist/styles/prism' {
  export const atomDark: any;
} 