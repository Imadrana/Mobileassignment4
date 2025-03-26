import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client
const supabaseUrl = 'https://peyvurbwqscvvnsrgjyb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleXZ1cmJ3cXNjdnZuc3JnanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTY5MjYsImV4cCI6MjA1ODU3MjkyNn0.0ghTwclcPRc9pqyprseWWZ3PZJAQenHS-biLgDTnsHE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Define TypeScript types for props
type SignInScreenProps = {
  onSignInSuccess: () => void
  goToSignUp: () => void
}

function SignInScreen({ onSignInSuccess, goToSignUp }: SignInScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      Alert.alert('Sign In Error', error.message)
    } else if (data?.user) {
      // Check if the email is verified
      if (!data.user.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified',
          'Please check your email for a verification link before signing in.'
        )
        return
      }
      onSignInSuccess()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Don't have an account? Sign Up" onPress={goToSignUp} />
    </View>
  )
}

type SignUpScreenProps = {
  goToSignIn: () => void
}

function SignUpScreen({ goToSignIn }: SignUpScreenProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async () => {
    // Sign up using Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      Alert.alert('Sign Up Error', error.message)
      return
    }

    if (data?.user) {
      // Insert additional details into user_details table
      const { error: insertError } = await supabase.from('user_details').insert([
        {
          uuid: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
      ])

      if (insertError) {
        Alert.alert('Database Error', insertError.message)
      } else {
        Alert.alert(
          'Success',
          'Account created! Please check your email to verify your account, then sign in.'
        )
        // Redirect to the Sign In screen
        goToSignIn()
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Already have an account? Sign In" onPress={goToSignIn} />
    </View>
  )
}

type LandingScreenProps = {
  goToSignIn: () => void
}

function LandingScreen({ goToSignIn }: LandingScreenProps) {
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData?.session) {
        Alert.alert('Error', 'No active session found')
        goToSignIn()
        return
      }
      const userId = sessionData.session.user.id

      const { data, error } = await supabase
        .from('user_details')
        .select('first_name, last_name')
        .eq('uuid', userId)
        .single()

      if (error) {
        Alert.alert('Error', error.message)
      } else if (data) {
        setFullName(`${data.first_name} ${data.last_name}`)
      }
    }

    fetchUserDetails()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    goToSignIn()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {fullName}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  )
}

export default function App() {
  // Manage screen state: 'SignIn', 'SignUp', or 'Landing'
  const [currentScreen, setCurrentScreen] = useState('SignIn')

  const renderScreen = () => {
    if (currentScreen === 'SignIn') {
      return (
        <SignInScreen
          onSignInSuccess={() => setCurrentScreen('Landing')}
          goToSignUp={() => setCurrentScreen('SignUp')}
        />
      )
    } else if (currentScreen === 'SignUp') {
      return <SignUpScreen goToSignIn={() => setCurrentScreen('SignIn')} />
    } else if (currentScreen === 'Landing') {
      return <LandingScreen goToSignIn={() => setCurrentScreen('SignIn')} />
    }
    return null
  }

  return <>{renderScreen()}</>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
})
