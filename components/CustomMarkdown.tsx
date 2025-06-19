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
import { ScrollView, Image, View, Text, StyleSheet, Pressable, Platform } from "react-native";
import type { MarkdownProps, RenderRules } from "react-native-markdown-display";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { useColorScheme } from '~/lib/useColorScheme';

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

const CodeBlock = ({ children, language = 'javascript' }: { children: React.ReactNode; language?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { isDarkColorScheme } = useColorScheme();

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

  const codeString = typeof children === 'string' ? children.trim() : String(children || '');

  return (
    <View style={{ marginVertical: 16 }}>
      <View 
        style={{
          backgroundColor: isDarkColorScheme ? '#2a2830' : 'rgba(245, 219, 239, 0.3)',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDarkColorScheme ? '#3d3a47' : 'rgba(245, 219, 239, 0.5)',
          padding: 16,
          position: 'relative',
        }}
      >
        <Text 
          style={{
            fontFamily: 'Ubuntu-Medium',
            fontSize: 18,
            color: isDarkColorScheme ? '#e8e6f0' : '#560f2b',
            lineHeight: 24,
          }}
        >
          {codeString}
        </Text>
        
        <Pressable
          onPress={copyToClipboard}
          onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
          onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            backgroundColor: hasCopied
              ? (isDarkColorScheme ? '#8b7aa8' : '#b02372')
              : isHovered 
                ? (isDarkColorScheme ? '#4a4556' : '#ecc7e4')
                : (isDarkColorScheme ? '#3d3a47' : '#f5dbef'),
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons 
            name={hasCopied ? "checkmark" : "copy-outline"} 
            size={18}
            color={hasCopied 
              ? (isDarkColorScheme ? '#ffffff' : '#ffffff')
              : (isDarkColorScheme ? '#c8c4d4' : '#b02372')
            }
          />
        </Pressable>
      </View>
    </View>
  );
};

const rules: RenderRules = {
  heading1: (node: MarkdownNode, children: React.ReactNode) => (
    <H1 key={`h1-${node.key || Math.random()}`} className="font-semibold text-3xl text-foreground mb-4 tracking-tight">{children}</H1>
  ),
  heading2: (node: MarkdownNode, children: React.ReactNode) => (
    <H2 key={`h2-${node.key || Math.random()}`} className="font-semibold text-2xl text-foreground mb-3 tracking-tight">{children}</H2>
  ),
  heading3: (node: MarkdownNode, children: React.ReactNode) => (
    <H3 key={`h3-${node.key || Math.random()}`} className="font-semibold text-xl text-foreground mb-3 tracking-tight">{children}</H3>
  ),
  heading4: (node: MarkdownNode, children: React.ReactNode) => (
    <H4 key={`h4-${node.key || Math.random()}`} className="font-semibold text-lg text-foreground mb-2 tracking-tight">{children}</H4>
  ),
  heading5: (node: MarkdownNode, children: React.ReactNode) => (
    <H5 key={`h5-${node.key || Math.random()}`} className="font-semibold text-lg text-foreground mb-2 tracking-tight">{children}</H5>
  ),
  heading6: (node: MarkdownNode, children: React.ReactNode) => (
    <H6 key={`h6-${node.key || Math.random()}`} className="font-semibold text-lg text-foreground mb-2 tracking-tight">{children}</H6>
  ),
  paragraph: (node: MarkdownNode, children: React.ReactNode) => (
    <P key={`p-${node.key || Math.random()}`} className="font-sans text-lg text-foreground leading-relaxed mb-4 last:mb-0 tracking-tight">{children}</P>
  ),
  code_block: (node: MarkdownNode, children: React.ReactNode) => {
    const language = node.attributes?.language || node.attributes?.class?.replace('language-', '') || 'javascript';
    return <CodeBlock key={`code-${node.key || Math.random()}`} language={language}>{children}</CodeBlock>;
  },
  code_inline: (node: MarkdownNode, children: React.ReactNode) => (
    <Code key={`inline-code-${node.key || Math.random()}`} className="font-mono text-base bg-[#f5dbef]/30 dark:bg-[#2a2830] text-[#560f2b] dark:text-[#e8e6f0] px-1.5 py-0.5 rounded border border-[#f5dbef]/50 dark:border-[#3d3a47]">{children}</Code>
  ),
  list_item: (node: MarkdownNode, children: React.ReactNode) => (
    <View key={`li-${node.key || node.index || Math.random()}`} className="flex-row items-start mb-1 last:mb-0 pl-4">
      <Text className="text-[#b02372] dark:text-[#d7c2ce] mr-2 mt-1 text-lg">•</Text>
      <View className="flex-1">{children}</View>
    </View>
  ),
  ordered_list: (node: MarkdownNode, children: React.ReactNode) => (
    <Ol key={`ol-${node.key || Math.random()}`} className="space-y-1 mb-4 pl-4">{children}</Ol>
  ),
  unordered_list: (node: MarkdownNode, children: React.ReactNode) => (
    <Ul key={`ul-${node.key || Math.random()}`} className="space-y-1 mb-4">{children}</Ul>
  ),
  em: (node: MarkdownNode, children: React.ReactNode) => (
    <I key={`em-${node.key || Math.random()}`} className="font-italic text-foreground">{children}</I>
  ),
  strong: (node: MarkdownNode, children: React.ReactNode) => (
    <Strong key={`strong-${node.key || Math.random()}`} className="font-semibold text-foreground">{children}</Strong>
  ),
  del: (node: MarkdownNode, children: React.ReactNode) => (
    <Del key={`del-${node.key || Math.random()}`} className="line-through text-muted-foreground">{children}</Del>
  ),
  link: (node: MarkdownNode, children: React.ReactNode) => (
    <A
      key={`link-${node.key || Math.random()}`}
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
      key={`img-${node.key || node.attributes?.src || Math.random()}`}
      source={{ uri: node.attributes?.src }}
      className="rounded-lg my-4 w-full"
      style={{ height: 200 }}
      resizeMode="cover"
    />
  ),
  blockquote: (node: MarkdownNode, children: React.ReactNode) => (
    <View key={`blockquote-${node.key || Math.random()}`} className="border-l-2 border-primary/30 pl-4 my-4 italic text-muted-foreground">
      {children}
    </View>
  ),
  table: (node: MarkdownNode, children: React.ReactNode) => (
    <ScrollView key={`table-${node.key || Math.random()}`} horizontal showsHorizontalScrollIndicator={false}>
      <Table className="my-4 border-collapse">
        {children}
      </Table>
    </ScrollView>
  ),
  thead: (node: MarkdownNode, children: React.ReactNode) => (
    <THead key={`thead-${node.key || Math.random()}`} className="bg-secondary/10">{children}</THead>
  ),
  tbody: (node: MarkdownNode, children: React.ReactNode) => (
    <TBody key={`tbody-${node.key || Math.random()}`}>{children}</TBody>
  ),
  tr: (node: MarkdownNode, children: React.ReactNode) => (
    <TR key={`tr-${node.key || node.index || Math.random()}`} className="border-b border-border/50">{children}</TR>
  ),
  th: (node: MarkdownNode, children: React.ReactNode) => (
    <TH key={`th-${node.key || node.index || Math.random()}`} className="p-2 text-left font-medium text-foreground">{children}</TH>
  ),
  td: (node: MarkdownNode, children: React.ReactNode) => (
    <TD key={`td-${node.key || node.index || Math.random()}`} className="p-2 text-foreground">{children}</TD>
  ),
  text: (node: MarkdownNode) => {
    return <Text key={`text-${node.key || Math.random()}`} className="font-sans text-lg text-foreground leading-relaxed tracking-tight">{node.content}</Text>;
  },
  body: (node: MarkdownNode, children: React.ReactNode) => {
    return <View key={`body-${node.key || Math.random()}`} className="space-y-2">{children}</View>;
  },
  hr: (node: MarkdownNode) => <View key={`hr-${node.key || Math.random()}`} className="my-6 h-px bg-border/50" />,
};

export interface CustomMarkdownProps {
  content: string;
}

export function CustomMarkdown({ content }: CustomMarkdownProps) {
  const { isDarkColorScheme } = useColorScheme();

  const markdownStyles = {
    body: {
      fontFamily: 'Ubuntu',
      fontSize: 16,
      color: isDarkColorScheme ? '#E4E4E7' : '#560f2b',  // Light gray for dark mode
    },
    heading1: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 28,
      marginBottom: 16,
      color: isDarkColorScheme ? '#FAFAFA' : '#560f2b', // Almost white for headings
    },
    heading2: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 24,
      marginBottom: 12,
      color: isDarkColorScheme ? '#FAFAFA' : '#560f2b',
    },
    heading3: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 20,
      marginBottom: 12,
      color: isDarkColorScheme ? '#FAFAFA' : '#560f2b',
    },
    heading4: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 18,
      marginBottom: 8,
      color: isDarkColorScheme ? '#FAFAFA' : '#560f2b',
    },
    heading5: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 16,
      marginBottom: 8,
      color: isDarkColorScheme ? '#FAFAFA' : '#560f2b',
    },
    heading6: {
      fontFamily: 'Ubuntu-Bold',
      fontSize: 16,
      marginBottom: 8,
      color: isDarkColorScheme ? '#FAFAFA' : '#560f2b',
    },
    paragraph: {
      marginBottom: 16,
      lineHeight: 26,
      fontSize: 16,
      color: isDarkColorScheme ? '#E4E4E7' : '#560f2b',
    },
    list_item: {
      marginBottom: 8,
      fontSize: 16,
      color: isDarkColorScheme ? '#E4E4E7' : '#560f2b',
    },
    blockquote: {
      backgroundColor: isDarkColorScheme ? '#18181B' : 'rgba(245, 219, 239, 0.2)', // Darker background
      borderLeftWidth: 4,
      borderLeftColor: isDarkColorScheme ? '#A1A1AA' : '#b02372', // Subtle accent
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginVertical: 16,
    },
    link: {
      color: isDarkColorScheme ? '#D4D4D8' : '#b02372',
      textDecorationLine: 'underline' as const,
    },
    list_item_bullet: {
      color: isDarkColorScheme ? '#A1A1AA' : '#b02372',
    },
    hr: {
      backgroundColor: isDarkColorScheme ? '#3F3F46' : 'rgba(245, 219, 239, 0.5)',
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