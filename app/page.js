'use client'

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, CircularProgress, AppBar, Toolbar, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs';
import LogoutIcon from '@mui/icons-material/Logout';

const API_URL = 'https://api.openai.com/v1/chat/completions';

const FlashCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '300px',
  height: '200px',
  perspective: '1000px',
  cursor: 'pointer',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const CardFace = styled(CardContent)(({ theme, isBack }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: isBack ? theme.palette.secondary.light : theme.palette.primary.light,
  color: theme.palette.getContrastText(isBack ? theme.palette.secondary.light : theme.palette.primary.light),
  transform: isBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
}));

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h5" sx={{ mt: 2 }}>
        Loading AI Flashcards...
      </Typography>
    </Box>
  );
}

function FlashcardApp() {
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const generateFlashcards = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that creates flashcards." },
            { role: "user", content: `Create 10 flashcards about ${prompt}. Format each flashcard as a JSON object with 'question' and 'answer' fields.` }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      const generatedFlashcards = JSON.parse(data.choices[0].message.content);
      setFlashcards(generatedFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Flashcards
          </Typography>
          {isSignedIn && (
            <Button color="inherit" onClick={() => clerk.signOut()} startIcon={<LogoutIcon />}>
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
      }}>
        <SignedOut>
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Please sign in to use AI Flashcards
            </Typography>
            <SignInButton mode="modal">
              <Button variant="contained" color="primary">
                Sign In
              </Button>
            </SignInButton>
          </Box>
        </SignedOut>

        <SignedIn>
          <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Enter a topic for flashcards"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={generateFlashcards}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generate Flashcards'}
            </Button>
          </Box>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            width: '100%',
          }}>
            {flashcards.map((card, index) => (
              <FlashCard key={index} sx={{ 
                width: isMobile ? '100%' : '300px',
                '& .front, & .back': { 
                  position: 'absolute',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.6s',
                  width: '100%',
                  height: '100%',
                },
                '& .back': { 
                  transform: 'rotateY(180deg)',
                },
                '&:hover .front': { 
                  transform: 'rotateY(180deg)',
                },
                '&:hover .back': { 
                  transform: 'rotateY(0deg)',
                },
              }}>
                <CardFace className="front">
                  <Typography variant="body1">{card.question}</Typography>
                </CardFace>
                <CardFace className="back" isBack>
                  <Typography variant="body1">{card.answer}</Typography>
                </CardFace>
              </FlashCard>
            ))}
          </Box>
        </SignedIn>
      </Box>
    </Box>
  );
}

export default function Home() {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <FlashcardApp />
    </ClerkProvider>
  );
}