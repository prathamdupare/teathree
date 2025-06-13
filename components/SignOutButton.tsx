import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <Button onPress={handleSignOut} className="bg-destructive">
      <Text className="text-destructive-foreground">Sign out</Text>
    </Button>
  )
}