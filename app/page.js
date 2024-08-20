'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Card, CircularProgress,
  AppBar, Toolbar, Paper, ThemeProvider, createTheme,
  Snackbar, Alert
} from '@mui/material';
import { styled } from '@mui/system';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs';
import WavesIcon from '@mui/icons-material/Waves';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SupportIcon from '@mui/icons-material/Support';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import SubscriptionTab from '../components/SubscriptionTab'; // Import SubscriptionTab

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();
const auth = firebase.auth();
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff', secondary: '#bdbdbd' }
  }
});

const FlashCard = styled(Card)(({ theme }) => ({
  width: '300px',
  height: '200px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: '#fff',
  transition: 'transform 0.6s ease-out, box-shadow 0.3s ease, filter 0.3s ease',
  perspective: '1000px',
  cursor: 'pointer',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  filter: 'brightness(1.1)',
  '&:hover': {
    transform: 'scale(1.1) rotateY(5deg)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
    filter: 'brightness(1.2)',
  },
}));

const FlashCardInner = styled(Box)(({ flipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.6s ease-out',
}));

const FlashCardSide = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  color: '#fff',
  fontSize: '18px',
  padding: '10px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
}));

const FrontSide = styled(FlashCardSide)({
  background: '#42a5f5',
  animation: 'fadeIn 1s ease-out',
});

const BackSide = styled(FlashCardSide)({
  background: '#ef5350',
  transform: 'rotateY(180deg)',
  animation: 'fadeIn 1s ease-out',
});

function FlashCardComponent({ question, answer }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <FlashCard onClick={() => setFlipped(!flipped)}>
      <FlashCardInner flipped={flipped}>
        <FrontSide>
          <Typography variant="h6">{question}</Typography>
        </FrontSide>
        <BackSide>
          <Typography variant="h6">{answer}</Typography>
        </BackSide>
      </FlashCardInner>
    </FlashCard>
  );
}

const LandingPageBackground = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e1e1e, #121212)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url(https://images.unsplash.com/photo-1483597011661-19e35b80dfe6?fit=crop&w=1920&h=1080) center/cover no-repeat',
    opacity: 0.6,
    zIndex: -1,
  },
}));

function LandingPage({ onStart }) {
  return (
    <LandingPageBackground>
      <Typography variant="h3" gutterBottom sx={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
        Welcome to FlashStudy ✨
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' }, mb: 4, maxWidth: '1200px', mx: 'auto' }}>
        <Paper elevation={12} sx={{ p: 4, textAlign: 'center', width: { xs: '80%', sm: '300px' }, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px' }}>
          <EmojiEmotionsIcon fontSize="large" color="secondary" />
          <Typography variant="h6" mt={2} sx={{ color: '#fff' }}>Create Flashcards Easily</Typography>
          <Typography sx={{ color: '#fff' }}>Generate flashcards effortlessly for any topic.</Typography>
        </Paper>
        <Paper elevation={12} sx={{ p: 4, textAlign: 'center', width: { xs: '80%', sm: '300px' }, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px' }}>
          <WavesIcon fontSize="large" color="primary" />
          <Typography variant="h6" mt={2} sx={{ color: '#fff' }}>Study Smarter</Typography>
          <Typography sx={{ color: '#fff' }}>Review important questions and answers quickly.</Typography>
        </Paper>
        <Paper elevation={12} sx={{ p: 4, textAlign: 'center', width: { xs: '80%', sm: '300px' }, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px' }}>
          <SupportIcon fontSize="large" color="action" />
          <Typography variant="h6" mt={2} sx={{ color: '#fff' }}>Subscription Benefits</Typography>
          <Typography sx={{ color: '#fff' }}>Unlock exclusive features with our subscription plan.</Typography>
        </Paper>
      </Box>
      <Button onClick={onStart} variant="contained" color="primary" sx={{ mt: 4 }}>
        Get Started
      </Button>
    </LandingPageBackground>
  );
}

function NewFlashcardApp() {
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState(false); // Mock subscription state
  const [flashcardsCreated, setFlashcardsCreated] = useState(0); // Track number of flashcards created

  const generateFlashcards = async () => {
    if (!prompt.trim()) return;
    
    if (flashcardsCreated >= 3 && !userSubscription) {
      setShowLandingPage(true);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `Create 10 flashcards about ${prompt}. Format each flashcard as a JSON object with 'question' and 'answer' fields.` },
          ],
          model: "llama3-8b-8192",
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate flashcards');

      const data = await response.json();
      const rawContent = data.choices[0]?.message?.content;
      const start = rawContent.indexOf('[');
      const end = rawContent.lastIndexOf(']') + 1;
      const jsonString = rawContent.slice(start, end);
      const generatedFlashcards = JSON.parse(jsonString);

      setFlashcards(generatedFlashcards);
      setFlashcardsCreated(prev => prev + 1); // Increment flashcards count

    } catch (error) {
      console.error('Error generating flashcards:', error);
      setFlashcards([{ question: "What is the tallest mountain?", answer: "Mount Everest" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>FlashStudy ✨</Typography>
          <UserButton afterSignOutUrl="/" />
        </Toolbar>
      </AppBar>

      {showLandingPage ? (
        <LandingPage onStart={() => setShowLandingPage(false)} />
      ) : (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
          {!userSubscription && flashcardsCreated >= 3 ? ( // Show subscription tab if not subscribed and limit reached
            <SubscriptionTab />
          ) : (
            <>
              <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Your Study Topic"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={generateFlashcards}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating Flashcards...' : 'Generate Flashcards'}
                </Button>
              </Box>

              {isLoading && <CircularProgress />}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                {flashcards.map((card, index) => (
                  <FlashCardComponent key={index} question={card.question} answer={card.answer} />
                ))}
              </Box>
            </>
          )}
        </Box>
      )}

      <Snackbar open={isSnackbarOpen} autoHideDuration={4000} onClose={() => setIsSnackbarOpen(false)}>
        <Alert onClose={() => setIsSnackbarOpen(false)} severity="success">Flashcards saved successfully!</Alert>
      </Snackbar>
    </Box>
  );
}

function SignInPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" align="center" mb={4}>Please sign in to access FlashStudy ✨</Typography>
      <RedirectToSignIn />
    </Box>
  );
}

export default function App() {
  return (
    <ClerkProvider>
      <SignedIn>
        <ThemeProvider theme={modernTheme}>
          <NewFlashcardApp />
        </ThemeProvider>
      </SignedIn>
      <SignedOut>
        <SignInPage />
      </SignedOut>
    </ClerkProvider>
  );
}
