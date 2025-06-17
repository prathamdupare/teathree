import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, Sun, Info, Sparkles, AlertCircle, Users, Shield, FileText, ChevronRight } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('account');

  const ProfileSection = () => (
    <View className="items-center mb-8">
      <View className="relative mb-4">
        <Image
          source={{ uri: 'https://via.placeholder.com/128x128' }}
          className="w-32 h-32 rounded-full border-4 border-orange-400"
        />
      </View>
      <Text className="text-xl font-semibold text-white mb-1">
        Prathmesh Dupare
      </Text>
      <Text className="text-gray-400 mb-3">prathmeshdupare@gmail.com</Text>
      <Badge className="bg-pink-600">
        <Text className="text-white font-medium">Pro Plan</Text>
      </Badge>
    </View>
  );

  const MessageUsageSection = () => (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-medium text-white">Message Usage</Text>
        <Text className="text-sm text-gray-400">Resets 06/29/2025</Text>
      </View>

      <View className="space-y-4">
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-white">Standard</Text>
            <Text className="text-sm text-white">160/1500</Text>
          </View>
          <Progress value={10.67} className="h-2 bg-gray-800">
            <View className="h-full bg-pink-600 rounded-full" style={{ width: '10.67%' }} />
          </Progress>
          <Text className="text-xs text-gray-400 mt-1">1340 messages remaining</Text>
        </View>

        <View>
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-white">Premium</Text>
              <Info size={12} color="#9CA3AF" />
            </View>
            <Text className="text-sm text-white">0/100</Text>
          </View>
          <Progress value={0} className="h-2 bg-gray-800">
            <View className="h-full bg-pink-600 rounded-full" style={{ width: '0%' }} />
          </Progress>
          <Text className="text-xs text-gray-400 mt-1">100 messages remaining</Text>
        </View>
      </View>
    </View>
  );

  const PurchasedCreditsSection = () => (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="font-medium text-white">Purchased Credits</Text>
        <Info size={16} color="#9CA3AF" />
      </View>
      <Text className="text-sm text-gray-400 mb-2">0 messages remaining.</Text>
      <Text className="text-sm text-gray-400 mb-4">Purchased credits never expire.</Text>
      <Button className="w-full bg-pink-600">
        <View className="flex-row items-center">
          <Text className="text-white font-medium">Buy more premium credits</Text>
          <ChevronRight size={16} color="white" style={{ marginLeft: 8 }} />
        </View>
      </Button>
    </View>
  );

  const AccountTabContent = () => (
    <ScrollView className="flex-1 p-6">
      {/* Pro Plan Benefits */}
      <View className="mb-8">
        <Text className="text-2xl font-semibold text-white mb-6">Pro Plan Benefits</Text>
        
        <View className="space-y-4 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color="#EC4899" />
                <CardTitle className="text-white">Access to All Models</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Get access to our full suite of models including Claude, o3-mini-high, and more!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color="#EC4899" />
                <CardTitle className="text-white">Generous Limits</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Receive <Text className="text-white font-medium">1500 standard credits</Text> per month, plus{" "}
                <Text className="text-white font-medium">100 premium credits</Text>* per month.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <View className="flex-row items-center gap-2">
                <AlertCircle size={20} color="#EC4899" />
                <CardTitle className="text-white">Priority Support</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Get faster responses and dedicated assistance from the T3 team whenever you need help!
              </CardDescription>
            </CardContent>
          </Card>
        </View>

        <Button className="bg-pink-600 mb-4">
          <Text className="text-white font-medium">Manage Subscription</Text>
        </Button>

        <Text className="text-sm text-gray-400">
          * Premium credits are used for GPT Image Gen, o3, Claude Sonnet, and Grok 3. Additional Premium
          credits can be purchased separately.
        </Text>
      </View>

      {/* Danger Zone */}
      <View className="border-t border-gray-800 pt-8">
        <Text className="text-2xl font-semibold text-white mb-4">Danger Zone</Text>
        <Text className="text-gray-400 mb-4">Permanently delete your account and all associated data.</Text>
        <Button className="bg-red-600">
          <Text className="text-white font-medium">Delete Account</Text>
        </Button>
      </View>
    </ScrollView>
  );

  const ContactTabContent = () => (
    <ScrollView className="flex-1 p-6">
      <Text className="text-2xl font-semibold text-white mb-6">We're here to help!</Text>
      <View className="space-y-4">
        {[
          {
            icon: Sparkles,
            title: "Have a cool feature idea?",
            description: "Vote on upcoming features or suggest your own"
          },
          {
            icon: Sparkles,
            title: "Found a non-critical bug?",
            description: "UI glitches or formatting issues? Report them here :)"
          },
          {
            icon: AlertCircle,
            title: "Having account or billing issues?",
            description: "Email us for priority support - support@ping.gg"
          },
          {
            icon: Users,
            title: "Want to join the community?",
            description: "Come hang out in our Discord! Chat with the team and other users"
          },
          {
            icon: Shield,
            title: "Privacy Policy",
            description: "Read our privacy policy and data handling practices"
          },
          {
            icon: FileText,
            title: "Terms of Service",
            description: "Review our terms of service and usage guidelines"
          }
        ].map((item, index) => (
          <TouchableOpacity key={index}>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <View className="flex-row items-start gap-3">
                  <item.icon size={20} color="#EC4899" style={{ marginTop: 4 }} />
                  <View className="flex-1">
                    <Text className="font-medium text-white mb-1">{item.title}</Text>
                    <Text className="text-gray-400 text-sm">{item.description}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const PlaceholderTabContent = ({ title }: { title: string }) => (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-semibold text-white mb-4">{title}</Text>
      <Text className="text-gray-400">This section is coming soon...</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <TouchableOpacity className="flex-row items-center">
          <ArrowLeft size={16} color="white" />
          <Text className="text-white ml-2">Back to Chat</Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="p-2">
            <Sun size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-white">Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Left Sidebar */}
        <View className="w-80 p-6 border-r border-gray-800">
          <ProfileSection />
          <MessageUsageSection />
          <PurchasedCreditsSection />
        </View>

        {/* Main Content */}
        <View className="flex-1">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1"
          >
            <TabsList className="flex-row bg-transparent border-b border-gray-800 rounded-none">
              {[
                { value: 'account', label: 'Account' },
                { value: 'customization', label: 'Customization' },
                { value: 'history', label: 'History & Sync' },
                { value: 'models', label: 'Models' },
                { value: 'api-keys', label: 'API Keys' },
                { value: 'attachments', label: 'Attachments' },
                { value: 'contact', label: 'Contact Us' }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`px-4 py-2 border-b-2 ${
                    activeTab === tab.value
                      ? 'border-white bg-gray-800'
                      : 'border-transparent'
                  }`}
                >
                  <Text className={activeTab === tab.value ? 'text-white' : 'text-gray-400'}>
                    {tab.label}
                  </Text>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="account">
              <AccountTabContent />
            </TabsContent>

            <TabsContent value="customization">
              <PlaceholderTabContent title="Customization" />
            </TabsContent>

            <TabsContent value="history">
              <PlaceholderTabContent title="History & Sync" />
            </TabsContent>

            <TabsContent value="models">
              <PlaceholderTabContent title="Models" />
            </TabsContent>

            <TabsContent value="api-keys">
              <PlaceholderTabContent title="API Keys" />
            </TabsContent>

            <TabsContent value="attachments">
              <PlaceholderTabContent title="Attachments" />
            </TabsContent>

            <TabsContent value="contact">
              <ContactTabContent />
            </TabsContent>
          </Tabs>
        </View>
      </View>
    </SafeAreaView>
  );
}