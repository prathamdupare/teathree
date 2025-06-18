"use client"

import type React from "react"

import { View, Pressable, ScrollView, TextInput } from "react-native"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Text } from "~/components/ui/text"
import { Button } from "~/components/ui/button"
import { AI_PROVIDERS } from "~/lib/ai-providers"
import { Ionicons } from "@expo/vector-icons"
import { ClaudeLogo } from "~/components/icons/ClaudeLogo"
import { GeminiLogo } from "~/components/icons/GeminiLogo"
import { OpenAILogo } from "~/components/icons/OpenAILogo"
import { useState } from "react"

const MODEL_LOGOS: { [key: string]: React.FC<any> } = {
  google: GeminiLogo,
  anthropic: ClaudeLogo,
  openai: OpenAILogo,
}

interface ModelSelectorProps {
  selectedProvider: string
  selectedModel: string
  onModelSelect: (provider: string, model: string) => void
}

const CompactModelItem = ({
  provider,
  model,
  isSelected,
  onSelect,
  isNew = false,
  isPro = false,
}: {
  provider: string
  model: any
  isSelected: boolean
  onSelect: () => void
  isNew?: boolean
  isPro?: boolean
}) => {
  const LogoComponent = MODEL_LOGOS[provider]

  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center justify-between px-4 py-3.5 hover:bg-[#f8f2f8] dark:hover:bg-[#1a1a1a] active:bg-[#f8f2f8] dark:active:bg-[#1a1a1a]"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View className="flex-row items-center gap-3">
          {LogoComponent ? (
            <LogoComponent width={16} height={16} />
          ) : (
            <Ionicons name="cube-outline" size={16} color="#b02372" />
          )}
          <Text className="text-[#560f2b] dark:text-[#ffffff] text-[14px] font-medium" style={{ fontFamily: 'Ubuntu-Medium' }}>
            {model.name}
          </Text>
          {isNew && (
            <View className="bg-[#ffd700] px-1.5 py-0.5 rounded-sm">
              <Text className="text-[10px] text-black font-bold" style={{ fontFamily: 'Ubuntu-Medium' }}>✨</Text>
            </View>
          )}
          {isPro && <Ionicons name="diamond" size={12} color="#b02372" />}
        </View>
      </View>
      <View className="flex-row items-center gap-2.5">
        <Ionicons name="eye-outline" size={16} color="#888888" />
        <Ionicons name="globe-outline" size={16} color="#888888" />
        <Ionicons name="document-text-outline" size={16} color="#888888" />
        {model.canAnalyze && <Ionicons name="analytics-outline" size={16} color="#888888" />}
      </View>
    </Pressable>
  )
}

const ModelCard = ({
  provider,
  model,
  isSelected,
  onSelect,
  isNew = false,
  isPro = false,
  isHighlighted = false,
}: {
  provider: string
  model: any
  isSelected: boolean
  onSelect: () => void
  isNew?: boolean
  isPro?: boolean
  isHighlighted?: boolean
}) => {
  const LogoComponent = MODEL_LOGOS[provider]

  return (
    <Pressable
      onPress={onSelect}
      className={`p-4 rounded-xl bg-[#fcf3fc] dark:bg-[#090608] border ${
        isHighlighted ? "border-[#ffd700]" : "border-[#fadcfd] dark:border-[#2a2a2a]"
      } min-w-[130px] max-w-[140px] flex-1 relative`}
      style={{ minHeight: 110 }}
    >
      {isNew && (
        <View className="absolute top-3 right-3 bg-[#ffd700] px-2 py-1 rounded-sm z-10">
          <Text className="text-[9px] text-black font-bold">NEW</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {LogoComponent ? (
            <LogoComponent width={20} height={20} />
          ) : (
            <Ionicons name="cube-outline" size={20} color="#b02372" />
          )}
        </View>
        {isPro && <Ionicons name="diamond" size={14} color="#b02372" />}
      </View>

      <View className="flex-1 justify-between">
        <Text className="text-[#560f2b] dark:text-[#ffffff] font-semibold text-[13px] leading-4 mb-3" style={{ fontFamily: 'Ubuntu-Medium' }}>
          {model.name}
        </Text>

        <View className="flex-row items-center gap-2.5 mt-auto">
          <Ionicons name="eye-outline" size={14} color="#888888" />
          <Ionicons name="globe-outline" size={14} color="#888888" />
          <Ionicons name="document-text-outline" size={14} color="#888888" />
          {model.canAnalyze && <Ionicons name="analytics-outline" size={14} color="#888888" />}
        </View>
      </View>
    </Pressable>
  )
}

export function ModelSelector({ selectedProvider, selectedModel, onModelSelect }: ModelSelectorProps) {
  const [showExpanded, setShowExpanded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const currentProviderData = AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS]
  const currentModel = currentProviderData.models.find((m) => m.id === selectedModel)

  const renderProviderLogo = (providerId: string, size = 16) => {
    const LogoComponent = MODEL_LOGOS[providerId]
    if (LogoComponent) {
      return (
        <View style={{ width: size, height: size }}>
          <LogoComponent width={size} height={size} />
        </View>
      )
    }
    return <Ionicons name="cube-outline" size={size} color="#e91e63" />
  }

  const CompactView = () => (
    <View className="w-[320px] bg-[#fcf3fc] dark:bg-[#100a0e] rounded-lg overflow-hidden">
      <View className="px-4 py-3 border-b border-[#fadcfd] dark:border-[#2a2a2a]">
        <View className="flex-row items-center bg-[#f8f2f8] dark:bg-[#1a1a1a] rounded-lg px-3 py-2.5">
          <Ionicons name="search" size={16} color="#888888" />
          <TextInput
            placeholder="Search models..."
            placeholderTextColor="#888888"
            className="flex-1 ml-3 text-[#560f2b] dark:text-[#ffffff] text-[14px]"
            style={{ fontFamily: 'Ubuntu' , outline: 'none'}}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
        {Object.entries(AI_PROVIDERS).map(([providerId, provider]) =>
          provider.models
            .filter((model) => searchQuery === "" || model.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((model) => (
              <CompactModelItem
                key={model.id}
                provider={providerId}
                model={model}
                isSelected={selectedProvider === providerId && selectedModel === model.id}
                onSelect={() => {
                  onModelSelect(providerId, model.id)
                  setIsOpen(false)
                }}
                isNew={model.id.includes("flash-lite")}
                isPro={model.id.includes("pro")}
              />
            )),
        )}
      </ScrollView>

      <Pressable
        onPress={() => setShowExpanded(true)}
        className="flex-row items-center justify-between px-4 py-4 border-t border-[#fadcfd] dark:border-[#2a2a2a] bg-[#fcf3fc] dark:bg-[#100a0e]"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="chevron-up" size={14} color="#560f2b" className="dark:text-[#ffffff]" />
          <Text className="text-[#560f2b] dark:text-[#ffffff] text-[14px] font-medium" style={{ fontFamily: 'Ubuntu-Medium' }}>Show all</Text>
          <View className="w-1.5 h-1.5 bg-[#b02372] rounded-full" />
        </View>
        <Ionicons name="funnel-outline" size={16} color="#888888" />
      </Pressable>
    </View>
  )

  const ExpandedView = () => {
    const favoriteModels = Object.entries(AI_PROVIDERS).flatMap(([providerId, provider]) =>
      provider.models.slice(0, 2).map((model) => ({ providerId, model })),
    )

    const otherModels = Object.entries(AI_PROVIDERS).flatMap(([providerId, provider]) =>
      provider.models.slice(2).map((model) => ({ providerId, model })),
    )

    return (
      <View className="w-[650px] border-none bg-[#fcf3fc] dark:bg-[#100a0e] rounded-lg overflow-hidden">
        <View className="px-4 py-4 border-b border-[#fadcfd] dark:border-[#2a2a2a]">
          <View className="flex-row items-center justify-between mb-3">
            <Pressable onPress={() => setShowExpanded(false)} className="flex-row items-center gap-2">
              <Ionicons name="chevron-back" size={16} color="#560f2b" className="dark:text-[#ffffff]" />
              <Text className="text-[#b02372] text-[14px] font-medium" style={{ fontFamily: 'Ubuntu-Medium' }}>Favorites</Text>
              <View className="w-1.5 h-1.5 bg-[#b02372] rounded-full" />
            </Pressable>
            <Ionicons name="funnel-outline" size={16} color="#888888" />
          </View>

          <View className="flex-row items-center bg-[#f8f2f8] dark:bg-[#1a1a1a] rounded-lg px-3 py-2.5">
            <Ionicons name="search" size={16} color="#888888" />
            <TextInput
              placeholder="Search models..."
              placeholderTextColor="#888888"
              className="flex-1 ml-3 text-[#560f2b] dark:text-[#ffffff] text-[14px]"
              style={{ fontFamily: 'Ubuntu' , outline: 'none'}}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[480px]">
          <View className="p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="star" size={14} color="#b02372" />
              <Text className="text-[#b02372] font-semibold text-[14px]" style={{ fontFamily: 'Ubuntu-Medium' }}>Favorites</Text>
            </View>

            <View className="flex-row flex-wrap gap-3 mb-6">
              {favoriteModels
                .filter(
                  ({ model }) => searchQuery === "" || model.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map(({ providerId, model }) => (
                  <ModelCard
                    key={model.id}
                    provider={providerId}
                    model={model}
                    isSelected={selectedProvider === providerId && selectedModel === model.id}
                    onSelect={() => {
                      onModelSelect(providerId, model.id)
                      setIsOpen(false)
                    }}
                    isNew={model.id.includes("flash-lite")}
                    isPro={model.id.includes("pro")}
                    isHighlighted={model.id.includes("flash-lite24")}
                  />
                ))}
            </View>

            <Text className="text-[#888888] font-semibold text-[14px] mb-4" style={{ fontFamily: 'Ubuntu-Medium' }}>Others</Text>
            <View className="flex-row flex-wrap gap-3">
              {otherModels
                .filter(
                  ({ model }) => searchQuery === "" || model.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map(({ providerId, model }) => (
                  <ModelCard
                    key={model.id}
                    provider={providerId}
                    model={model}
                    isSelected={selectedProvider === providerId && selectedModel === model.id}
                    onSelect={() => {
                      onModelSelect(providerId, model.id)
                      setIsOpen(false)
                    }}
                    isPro={model.id.includes("pro")}
                    isHighlighted={model.id.includes("flash-lite")}
                  />
                ))}
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View>
      <DropdownMenu
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setShowExpanded(false)
            setSearchQuery("")
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            
            className="bg-[#f8f2f8] dark:bg-[#2b2431] border-[#fadcfd] dark:border-[#333333] hover:bg-[#f5ebf5] dark:hover:bg-[#2a242f] flex-row items-center gap-2 px-3 py-2 rounded-lg"
          >
            {renderProviderLogo(selectedProvider, 18)}
            <Text className="text-sm text-[#560f2b] dark:text-[#ffffff] flex-1 font-medium" style={{ fontFamily: 'Ubuntu-Medium' }}>
              {currentModel?.name || "Select Model"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#888888" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-transparent border-none shadow-2xl p-0" align="start">
          {showExpanded ? <ExpandedView /> : <CompactView />}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  )
}
