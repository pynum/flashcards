'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Card, CircularProgress,
  AppBar, Toolbar, Paper, ThemeProvider, createTheme,
  IconButton, Snackbar, Alert
} from '@mui/material';
import { styled } from '@mui/system';
import { ClerkProvider, SignedIn, SignedOut, useUser, UserButton } from '@clerk/nextjs';
import WavesIcon from '@mui/icons-material/Waves';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SupportIcon from '@mui/icons-material/Support';
import Groq from 'groq-sdk';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBYxPynPMMX-1u9TeWf0lKlkrV3gq33ZLI",
  authDomain: "flash-cards-887f0.firebaseapp.com",
  projectId: "flash-cards-887f0",
  storageBucket: "flash-cards-887f0.appspot.com",
  messagingSenderId: "93729663581",
  appId: "1:93729663581:web:2e7b62f12aa4fb8db97bb4",
  measurementId: "G-T2GVDJFKNY"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

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
  transition: 'transform 0.6s ease-out',
  perspective: '1000px',
  cursor: 'pointer',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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
}));

const FrontSide = styled(FlashCardSide)({
  background: '#42a5f5',
});

const BackSide = styled(FlashCardSide)({
  background: '#ef5350',
  transform: 'rotateY(180deg)',
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

function LandingPage({ onStart }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h3" gutterBottom>Welcome to FlashStudy ✨</Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '300px' }}>
          <EmojiEmotionsIcon fontSize="large" color="secondary" />
          <Typography variant="h6" mt={2}>Create Flashcards Easily</Typography>
          <Typography>Generate flashcards effortlessly for any topic.</Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '300px' }}>
          <WavesIcon fontSize="large" color="primary" />
          <Typography variant="h6" mt={2}>Study Smarter</Typography>
          <Typography>Review important questions and answers quickly.</Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '300px' }}>
          <SupportIcon fontSize="large" color="action" />
          <Typography variant="h6" mt={2}>Subscription Benefits</Typography>
          <Typography>Unlock exclusive features with our subscription plan.</Typography>
        </Paper>
      </Box>
      <Button onClick={onStart} variant="contained" color="primary" sx={{ mt: 4 }}>Get Started</Button>
    </Box>
  );
}

function NewFlashcardApp() {
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const { user } = useUser();

  const generateFlashcards = async () => {
    if (!prompt.trim()) return;
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
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setFlashcards([{ question: "What is the tallest mountain?", answer: "Mount Everest" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFlashcards = async () => {
    if (!user || !flashcards.length || !prompt.trim()) return;
  
    try {
      await firestore.collection('flashcards').add({
        userId: user.id,
        topic: prompt,
        flashcards: flashcards,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setIsSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving flashcards:', error);
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
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={saveFlashcards}
              sx={{ mt: 2 }}
            >
              Save Flashcards
            </Button>
          </Box>

          {isLoading && <CircularProgress />}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {flashcards.map((card, index) => (
              <FlashCardComponent key={index} question={card.question} answer={card.answer} />
            ))}
          </Box>
        </Box>
      )}

      <Snackbar open={isSnackbarOpen} autoHideDuration={4000} onClose={() => setIsSnackbarOpen(false)}>
        <Alert onClose={() => setIsSnackbarOpen(false)} severity="success">Flashcards saved successfully!</Alert>
      </Snackbar>
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
        <Typography variant="h4" align="center" mt={8}>Please sign in to access FlashStudy ✨</Typography>
      </SignedOut>
    </ClerkProvider>
  );
}
