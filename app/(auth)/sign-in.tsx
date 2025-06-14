import React, { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { View, Text, SafeAreaView } from 'react-native'
import { Button } from '~/components/ui/button'
import { ThemeToggle } from '~/components/ui/theme-toggle'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Preloads the browser for Android devices to reduce authentication load time
      // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
      void WebBrowser.warmUpAsync()
      return () => {
        // Cleanup: closes browser when component unmounts
        void WebBrowser.coolDownAsync()
      }
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  console.log('Sign-in page rendered')
  useWarmUpBrowser()

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO()

  const onPress = useCallback(async () => {
    console.log('Google sign-in button pressed')
    try {
      console.log('Starting SSO flow...')
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      console.log('SSO flow completed:', { createdSessionId })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        console.log('Setting active session:', createdSessionId)
        setActive!({ session: createdSessionId })
      } else {
        console.log('No session created, additional steps needed')
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error('Sign-in error:', JSON.stringify(err, null, 2))
    }
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with theme toggle */}
      <View className="flex-row justify-end p-4">
        <ThemeToggle />
      </View>
      
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-bold text-center mb-4 text-foreground">
          Sign In
        </Text>
        <Text className="text-lg text-muted-foreground text-center mb-8">
          Continue with your Google account
        </Text>
        
        <Button 
          onPress={onPress}
          className="px-8 py-4 w-full max-w-sm"
        >
          <Text className="text-primary-foreground font-semibold text-lg">
            🔐 Sign in with Google
          </Text>
        </Button>
        
        <Text className="text-sm text-muted-foreground text-center mt-6">
          By signing in, you agree to our Terms of Service
        </Text>
    </View>
    </SafeAreaView>
  )
}
