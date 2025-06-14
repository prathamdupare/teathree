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
import { ScrollView, Image, View, Text } from "react-native";
import type { MarkdownProps, RenderRules } from "react-native-markdown-display";

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

const rules: RenderRules = {
  heading1: (_node: MarkdownNode, children: React.ReactNode) => (
    <H1 key="h1" className="text-2xl font-bold text-foreground mb-4">{children}</H1>
  ),
  heading2: (_node: MarkdownNode, children: React.ReactNode) => (
    <H2 key="h2" className="text-xl font-bold text-foreground mb-3">{children}</H2>
  ),
  heading3: (_node: MarkdownNode, children: React.ReactNode) => (
    <H3 key="h3" className="text-lg font-bold text-foreground mb-3">{children}</H3>
  ),
  heading4: (_node: MarkdownNode, children: React.ReactNode) => (
    <H4 key="h4" className="text-base font-bold text-foreground mb-2">{children}</H4>
  ),
  heading5: (_node: MarkdownNode, children: React.ReactNode) => (
    <H5 key="h5" className="text-sm font-bold text-foreground mb-2">{children}</H5>
  ),
  heading6: (_node: MarkdownNode, children: React.ReactNode) => (
    <H6 key="h6" className="text-sm font-bold text-foreground mb-2">{children}</H6>
  ),
  paragraph: (_node: MarkdownNode, children: React.ReactNode) => (
    <P key={_node.key} className="text-base text-foreground leading-relaxed mb-4 last:mb-0">{children}</P>
  ),
  code_block: (_node: MarkdownNode, children: React.ReactNode) => (
    <ScrollView key="code-block" horizontal showsHorizontalScrollIndicator={false}>
      <Pre className="my-4 w-full rounded-lg bg-secondary/20 p-4">
        <Code className="font-mono text-sm text-foreground">{children}</Code>
      </Pre>
    </ScrollView>
  ),
  code_inline: (_node: MarkdownNode, children: React.ReactNode) => (
    <Code key={_node.key} className="font-mono text-sm bg-secondary/20 px-1.5 py-0.5 rounded">{children}</Code>
  ),
  list_item: (node: MarkdownNode, children: React.ReactNode) => (
    <View key={`li-${node.index}`} className="flex-row items-start mb-1 last:mb-0 pl-4">
      <Text className="text-primary mr-2 mt-1.5">•</Text>
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
    <I key={_node.key} className="italic text-foreground">{children}</I>
  ),
  strong: (_node: MarkdownNode, children: React.ReactNode) => (
    <Strong key={_node.key} className="font-bold text-foreground">{children}</Strong>
  ),
  del: (_node: MarkdownNode, children: React.ReactNode) => (
    <Del key={_node.key} className="line-through text-muted-foreground">{children}</Del>
  ),
  link: (node: MarkdownNode, children: React.ReactNode) => (
    <A
      key={node.key}
      className="text-primary underline decoration-primary/30 hover:decoration-primary"
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
    return <Text key={node.key} className="text-foreground">{node.content}</Text>;
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
  return (
    <View className="w-full">
      <Markdown rules={rules}>{content}</Markdown>
    </View>
  );
}