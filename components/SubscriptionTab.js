// components/SubscriptionTab.js
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/system';

const SubscriptionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  maxWidth: '600px',
  margin: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
}));

const SubscriptionTab = () => {
  const handleSubscribe = () => {
    // Handle subscription logic here
    alert('Redirecting to subscription page...');
    window.location.href = 'https://www.patreon.com/checkout/FunkyDev?rid=23718594';  // Redirect to the Patreon page
  };

  return (
    <SubscriptionContainer elevation={6}>
      <Typography variant="h4" gutterBottom>
        Upgrade to Premium
      </Typography>
      <Typography variant="body1" paragraph>
        Enjoy unlimited access to create and save as many flashcards as you like with our premium subscription plan.
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Current Plan: Free (Up to 3 Flashcards)
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubscribe}
        sx={{ mt: 3 }}
      >
        Subscribe Now
      </Button>
    </SubscriptionContainer>
  );
};

export default SubscriptionTab;
