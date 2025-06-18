import Markdown from "react-native-markdown-display";
import {
  H1 as ExpoH1,
  H2 as ExpoH2,
  H3 as ExpoH3,
  H4 as ExpoH4,
  H5 as ExpoH5,
  H6 as ExpoH6,
  Code as ExpoCode,
  Pre as ExpoPre,
  UL as ExpoUl,
  LI as ExpoLI,
  Strong as ExpoStrong,
  A as ExpoA,
  P as ExpoP,
  Div as ExpoDiv,
  Table as ExpoTable,
  THead as ExpoTHead,
  TBody as ExpoTBody,
  TR as ExpoTR,
  TH as ExpoTH,
  TD as ExpoTD,
  I as ExpoI,
  Del as ExpoDel,
} from "@expo/html-elements";
import { cssInterop } from "nativewind";
import { ScrollView, Image, View, Text, StyleSheet, Pressable, Platform, useColorScheme } from "react-native";
import type { MarkdownProps, RenderRules } from "react-native-markdown-display";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import CodeHighlighter from "react-native-code-highlighter";
import { atomOneDarkReasonable } from "react-syntax-highlighter/dist/esm/styles/hljs";
const styles = StyleSheet.create({
  baseFont: {
    fontFamily: 'Ubuntu',
  },
  mediumFont: {
    fontFamily: 'Ubuntu-Medium',
  },
  semiBoldFont: {
    fontFamily: 'Ubuntu-Bold',
  },
  boldFont: {
    fontFamily: 'Ubuntu-Bold',
  },
  italicFont: {
    fontFamily: 'Ubuntu-Italic',
  },
  codeFont: {
    fontFamily: 'Ubuntu-Medium',
  }
});

// CSS interop for all components with style prop
const H1 = cssInterop(ExpoH1, { className: "style", style: true });
const H2 = cssInterop(ExpoH2, { className: "style", style: true });
const H3 = cssInterop(ExpoH3, { className: "style", style: true });
const H4 = cssInterop(ExpoH4, { className: "style", style: true });
const H5 = cssInterop(ExpoH5, { className: "style", style: true });
const H6 = cssInterop(ExpoH6, { className: "style", style: true });
const Code = cssInterop(ExpoCode, { className: "style", style: true });
const Pre = cssInterop(ExpoPre, { className: "style", style: true });
const Ol = cssInterop(ExpoUl, { className: "style", style: true });
const Ul = cssInterop(ExpoUl, { className: "style", style: true });
const Li = cssInterop(ExpoLI, { className: "style", style: true });
const Strong = cssInterop(ExpoStrong, { className: "style", style: true });
const A = cssInterop(ExpoA, { className: "style", style: true });
const P = cssInterop(ExpoP, { className: "style", style: true });
const Div = cssInterop(ExpoDiv, { className: "style", style: true });
const Table = cssInterop(ExpoTable, { className: "style", style: true });
const THead = cssInterop(ExpoTHead, { className: "style", style: true });
const TBody = cssInterop(ExpoTBody, { className: "style", style: true });
const TR = cssInterop(ExpoTR, { className: "style", style: true });
const TH = cssInterop(ExpoTH, { className: "style", style: true });
const TD = cssInterop(ExpoTD, { className: "style", style: true });
const I = cssInterop(ExpoI, { className: "style", style: true });
const Del = cssInterop(ExpoDel, { className: "style", style: true });

type MarkdownNode = {
  type: string;
  key?: string;
  content?: string;
  attributes?: Record<string, string>;
  index?: number;
};

const CodeBlock = ({ children }: { children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const copyToClipboard = async () => {
    if (typeof children === 'string') {
      await Clipboard.setStringAsync(children);
      setHasCopied(true);
    }
  };

  return (
    <View className="relative">
      <View className="rounded-lg overflow-hidden bg-[#f5dbef]/30 dark:bg-[#1b1219] border border-[#f5dbef]/50 dark:border-[#2b2431]">
        <Pre className="p-4">
          <Code className="font-mono text-sm text-[#560f2b] dark:text-[#f5dbef]">
            {typeof children === 'string' ? children.trim() : ''}
          </Code>
        </Pre>
      </View>
      <View 
        className={`absolute top-2 right-2 ${Platform.OS === 'web' ? 'opacity-0 hover:opacity-100' : ''} transition-opacity duration-200`}
      >
        <Pressable
          onPress={copyToClipboard}
          onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
          onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
          className={`flex-row items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
            hasCopied
              ? 'bg-[#b02372] dark:bg-[#d7c2ce]'
              : isHovered 
                ? 'bg-[#ecc7e4] dark:bg-[#362d3c]' 
                : 'bg-[#f5dbef] dark:bg-[#2b2431]'
          }`}
        >
          <Ionicons 
            name={hasCopied ? "checkmark" : "copy-outline"} 
            size={18}
            color={hasCopied 
              ? (Platform.OS === 'web' ? '#ffffff' : '#2b2431')
              : (Platform.OS === 'web' ? '#b02372' : '#d7c2ce')
            }
          />
        </Pressable>
      </View>
    </View>
  );
};

const rules: RenderRules = {
  heading1: (_node: MarkdownNode, children: React.ReactNode) => (
    <H1 key="h1" className="font-semibold text-2xl text-foreground mb-4 tracking-tight">{children}</H1>
  ),
  heading2: (_node: MarkdownNode, children: React.ReactNode) => (
    <H2 key="h2" className="font-semibold text-xl text-foreground mb-3 tracking-tight">{children}</H2>
  ),
  heading3: (_node: MarkdownNode, children: React.ReactNode) => (
    <H3 key="h3" className="font-semibold text-lg text-foreground mb-3 tracking-tight">{children}</H3>
  ),
  heading4: (_node: MarkdownNode, children: React.ReactNode) => (
    <H4 key="h4" className="font-semibold text-base text-foreground mb-2 tracking-tight">{children}</H4>
  ),
  heading5: (_node: MarkdownNode, children: React.ReactNode) => (
    <H5 key="h5" className="font-semibold text-sm text-foreground mb-2 tracking-tight">{children}</H5>
  ),
  heading6: (_node: MarkdownNode, children: React.ReactNode) => (
    <H6 key="h6" className="font-semibold text-sm text-foreground mb-2 tracking-tight">{children}</H6>
  ),
  paragraph: (_node: MarkdownNode, children: React.ReactNode) => (
    <P key={_node.key} className="font-sans text-base text-foreground leading-relaxed mb-4 last:mb-0 tracking-tight">{children}</P>
  ),
  code_block: (node: MarkdownNode, children: React.ReactNode) => {
    return (
      <ScrollView key="code-block" horizontal showsHorizontalScrollIndicator={false}>
        <View className="my-4 w-full">
          <CodeBlock>{children}</CodeBlock>
        </View>
      </ScrollView>
    );
  },
  code_inline: (node: MarkdownNode, children: React.ReactNode) => (
    <Code 
      key={node.key} 
      className="font-mono text-sm bg-[#f5dbef]/30 dark:bg-[#1b1219] text-[#560f2b] dark:text-[#f5dbef] px-1.5 py-0.5 rounded border border-[#f5dbef]/50 dark:border-[#2b2431]"
    >
      {children}
    </Code>
  ),
  list_item: (node: MarkdownNode, children: React.ReactNode) => (
    <View key={`li-${node.index}`} className="flex-row items-start mb-1 last:mb-0 pl-4">
      <Text className="text-[#b02372] dark:text-[#d7c2ce] mr-2 mt-1">•</Text>
      <View className="flex-1">{children}</View>
    </View>
  ),
  ordered_list: (_node: MarkdownNode, children: React.ReactNode) => (
    <Ol key="ol" className="space-y-1 mb-4 pl-4">{children}</Ol>
  ),
  unordered_list: (_node: MarkdownNode, children: React.ReactNode) => (
    <Ul key="ul" className="space-y-1 mb-4">{children}</Ul>
  ),
  em: (_node: MarkdownNode, children: React.ReactNode) => (
    <I key={_node.key} className="font-italic text-foreground">{children}</I>
  ),
  strong: (_node: MarkdownNode, children: React.ReactNode) => (
    <Strong key={_node.key} className="font-semibold text-foreground">{children}</Strong>
  ),
  del: (_node: MarkdownNode, children: React.ReactNode) => (
    <Del key={_node.key} className="line-through text-muted-foreground">{children}</Del>
  ),
  link: (node: MarkdownNode, children: React.ReactNode) => (
    <A
      key={node.key}
      className="text-[#b02372] dark:text-[#d7c2ce] underline decoration-[#b02372]/30 dark:decoration-[#d7c2ce]/30 hover:decoration-[#b02372] dark:hover:decoration-[#d7c2ce]"
      target="_blank"
      rel="noreferrer"
      href={node.attributes?.href}
    >
      {children}
    </A>
  ),
  image: (node: MarkdownNode) => (
    <Image
      key={`img-${node.attributes?.src}`}
      source={{ uri: node.attributes?.src }}
      className="rounded-lg my-4 w-full"
      style={{ height: 200 }}
      resizeMode="cover"
    />
  ),
  blockquote: (_node: MarkdownNode, children: React.ReactNode) => (
    <View key="blockquote" className="border-l-2 border-primary/30 pl-4 my-4 italic text-muted-foreground">
      {children}
    </View>
  ),
  table: (_node: MarkdownNode, children: React.ReactNode) => (
    <ScrollView key="table" horizontal showsHorizontalScrollIndicator={false}>
      <Table className="my-4 border-collapse">
        {children}
      </Table>
    </ScrollView>
  ),
  thead: (_node: MarkdownNode, children: React.ReactNode) => (
    <THead key="thead" className="bg-secondary/10">{children}</THead>
  ),
  tbody: (_node: MarkdownNode, children: React.ReactNode) => (
    <TBody key="tbody">{children}</TBody>
  ),
  tr: (node: MarkdownNode, children: React.ReactNode) => (
    <TR key={`tr-${node.index}`} className="border-b border-border/50">{children}</TR>
  ),
  th: (node: MarkdownNode, children: React.ReactNode) => (
    <TH key={`th-${node.index}`} className="p-2 text-left font-medium text-foreground">{children}</TH>
  ),
  td: (node: MarkdownNode, children: React.ReactNode) => (
    <TD key={`td-${node.index}`} className="p-2 text-foreground">{children}</TD>
  ),
  text: (node: MarkdownNode) => {
    return <Text key={node.key} className="font-sans text-foreground leading-relaxed tracking-tight">{node.content}</Text>;
  },
  body: (_node: MarkdownNode, children: React.ReactNode) => {
    return <View key="body" className="space-y-2">{children}</View>;
  },
  hr: () => <View key="hr" className="my-6 h-px bg-border/50" />,
};

export interface CustomMarkdownProps {
  content: string;
}

export function CustomMarkdown({ content }: CustomMarkdownProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const markdownStyles = {
    body: {
      fontFamily: 'Ubuntu',
      color: isDark ? '#E4E4E7' : '#560f2b',  // Light gray for dark mode
    },
    code_block: {
      backgroundColor: isDark ? '#27272A' : 'rgba(245, 219, 239, 0.3)', // Darker background
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#3F3F46' : 'rgba(245, 219, 239, 0.5)', // Subtle border
      marginVertical: 16,
    },
    code_inline: {
      backgroundColor: isDark ? '#27272A' : 'rgba(245, 219, 239, 0.3)',
      color: isDark ? '#E4E4E7' : '#560f2b',
      fontFamily: 'Ubuntu-Medium',
      padding: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: isDark ? '#3F3F46' : 'rgba(245, 219, 239, 0.5)',
    },
    fence: {
      marginVertical: 16,
      padding: 16,
      backgroundColor: isDark ? '#27272A' : 'rgba(245, 219, 239, 0.3)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#3F3F46' : 'rgba(245, 219, 239, 0.5)',
    },
    heading1: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 24,
      marginBottom: 16,
      color: isDark ? '#FAFAFA' : '#560f2b', // Almost white for headings
    },
    heading2: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 20,
      marginBottom: 12,
      color: isDark ? '#FAFAFA' : '#560f2b',
    },
    heading3: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 18,
      marginBottom: 12,
      color: isDark ? '#FAFAFA' : '#560f2b',
    },
    heading4: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 16,
      marginBottom: 8,
      color: isDark ? '#FAFAFA' : '#560f2b',
    },
    heading5: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 14,
      marginBottom: 8,
      color: isDark ? '#FAFAFA' : '#560f2b',
    },
    heading6: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 14,
      marginBottom: 8,
      color: isDark ? '#FAFAFA' : '#560f2b',
    },
    paragraph: {
      marginBottom: 16,
      lineHeight: 24,
      color: isDark ? '#E4E4E7' : '#560f2b',
    },
    list_item: {
      marginBottom: 8,
      color: isDark ? '#E4E4E7' : '#560f2b',
    },
    blockquote: {
      backgroundColor: isDark ? '#18181B' : 'rgba(245, 219, 239, 0.2)', // Darker background
      borderLeftWidth: 4,
      borderLeftColor: isDark ? '#A1A1AA' : '#b02372', // Subtle accent
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginVertical: 16,
    },
    link: {
      color: isDark ? '#D4D4D8' : '#b02372',
      textDecorationLine: 'underline' as const,
    },
    list_item_bullet: {
      color: isDark ? '#A1A1AA' : '#b02372',
    },
    hr: {
      backgroundColor: isDark ? '#3F3F46' : 'rgba(245, 219, 239, 0.5)',
      height: 1,
      marginVertical: 16,
    }
  };

  return (
    <View className="w-full">
      <Markdown 
        style={markdownStyles}
        rules={rules}
      >
        {content}
      </Markdown>
    </View>
  );
}