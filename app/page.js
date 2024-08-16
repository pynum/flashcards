'use client'

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, CircularProgress, AppBar, Toolbar, useMediaQuery, Paper, ThemeProvider, createTheme, Link, Container, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, useUser, useClerk, UserButton } from '@clerk/nextjs';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import CoffeeIcon from '@mui/icons-material/LocalCafe';

const API_URL = 'https://api.openai.com/v1/chat/completions';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1c2331', // Dark blue background
        color: '#ffffff', // White text for better contrast
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              © {new Date().getFullYear()} Tamzid Ullah. All rights reserved.
            </Typography>
            <Link href="https://tamzidullah.com" target="_blank" rel="noopener noreferrer" color="inherit" sx={{ textDecoration: 'none' }}>
              tamzidullah.com
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton color="inherit" aria-label="GitHub" component="a" href="https://github.com/tamzid2001" target="_blank">
              <GitHubIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="LinkedIn" component="a" href="hhttps://www.linkedin.com/in/tamzid-ullah-8a50a2234/" target="_blank">
              <LinkedInIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function SupportDeveloper() {
  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Link 
        href="https://donate.stripe.com/4gwcOCg7abFQatO3cc" 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          color: 'text.secondary',
          textDecoration: 'none',
          '&:hover': { color: 'primary.main' }
        }}
      >
        <CoffeeIcon sx={{ mr: 1 }} />
        <Typography variant="body2">
          Buy the developer a coffee
        </Typography>
      </Link>
    </Box>
  );
}

// Define a default theme
const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

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

const defaultFlashcards = [
  { question: "What is the capital of France?", answer: "Paris" },
  { question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
  { question: "What's the chemical symbol for gold?", answer: "Au" },
  { question: "In what year did World War II end?", answer: "1945" },
  { question: "What's the largest planet in our solar system?", answer: "Jupiter" }
];

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

function InstructionSection({ icon, title, content }) {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, maxWidth: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 2 }}>{title}</Typography>
      </Box>
      <Typography variant="body1">{content}</Typography>
    </Paper>
  );
}

function FlashcardApp() {
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const isMobile = useMediaQuery(defaultTheme.breakpoints.down('sm'));

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
          model: "gpt-4o-mini",
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
      //alert('Failed to generate custom flashcards. Using default set instead.');
      setFlashcards(defaultFlashcards);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Flashcards 🧠
          </Typography>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </Toolbar>
      </AppBar>
      
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
      }}>
        <SignedOut>
          <Box sx={{ 
            textAlign: 'center', 
            my: 4, 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 2,
            maxWidth: 600,
            mx: 'auto'
          }}>
            <Typography variant="h4" gutterBottom color="primary">
              Welcome to AI Flashcards 🚀
            </Typography>
            
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper elevation={3} sx={{ p: 2, backgroundColor: 'primary.light' }}>
                <Typography variant="h6" gutterBottom>
                  🧠 Boost Your Learning
                </Typography>
                <Typography>
                  AI Flashcards uses cutting-edge AI to create custom flashcards on any topic you choose!
                </Typography>
              </Paper>

              <Paper elevation={3} sx={{ p: 2, backgroundColor: 'secondary.light' }}>
                <Typography variant="h6" gutterBottom>
                  🔒 Secure & Personalized
                </Typography>
                <Typography>
                  Sign in to save your flashcards, track your progress, and access advanced features.
                </Typography>
              </Paper>

              <Paper elevation={3} sx={{ p: 2, backgroundColor: 'success.light' }}>
                <Typography variant="h6" gutterBottom>
                  🌟 Get Started in Seconds
                </Typography>
                <Typography>
                  Just sign in, enter a topic, and let AI create your perfect study materials!
                </Typography>
              </Paper>
            </Box>

            <SignInButton mode="modal">
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  fontSize: '1.2rem', 
                  py: 1.5, 
                  px: 4,
                  boxShadow: 3,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 5,
                  },
                }}
              >
                Sign In to Start Learning 📚
              </Button>
            </SignInButton>
          </Box>
        </SignedOut>

        <SignedIn>
          <InstructionSection
            icon={<EmojiObjectsIcon fontSize="large" color="primary" />}
            title="Welcome to AI Flashcards! 👋"
            content="Boost your learning with AI-generated flashcards on any topic. Just enter a subject, and we'll create custom flashcards for you!"
          />
          
          <InstructionSection
            icon={<SchoolIcon fontSize="large" color="secondary" />}
            title="How to Use 📚"
            content="1. Enter a topic in the text field below.
                     2. Click 'Generate Flashcards' to create your set.
                     3. Hover over or tap the cards to reveal answers."
          />
          
          <InstructionSection
            icon={<PsychologyIcon fontSize="large" color="error" />}
            title="Study Tips 🎓"
            content="• Review cards regularly for better retention.
                     • Try explaining answers in your own words.
                     • Use these cards as a starting point for deeper learning."
          />

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
                '&:hover .front, &:active .front': { 
                  transform: 'rotateY(180deg)',
                },
                '&:hover .back, &:active .back': { 
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
      <SupportDeveloper />
      <Footer />
    </Box>
  );
}

function Home() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider theme={defaultTheme}>
        <FlashcardApp />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default Home;