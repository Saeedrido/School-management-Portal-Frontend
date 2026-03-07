import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Phone,
  WhatsApp,
  ContentCopy,
  CheckCircle,
  ArrowBack,
  Payment as PaymentIcon,
  AccountBalance,
  QrCode,
  CreditScore,
  Receipt,
  Security,
  Lock,
  TrendingUp,
  SupportAgent
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// Animation Components
const FadeInUp = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

const ScaleIn = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

const SlideInLeft = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -100 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ icon, title, description, selected, onClick, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <ScaleIn delay={index * 0.1}>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: '24px',
          border: `2px solid ${selected ? '#FF3E8A' : 'rgba(255, 255, 255, 0.1)'}`,
          background: selected
            ? 'linear-gradient(135deg, rgba(255, 62, 138, 0.15) 0%, rgba(255, 62, 138, 0.05) 100%)'
            : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2)',
          transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 20px 60px rgba(255, 62, 138, 0.3)'
            : selected
            ? '0 12px 40px rgba(255, 62, 138, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: selected
              ? 'linear-gradient(90deg, #FF3E8A 0%, #FF6B9D 100%)'
              : 'linear-gradient(90deg, #2196F3 0%, #9C27B0 100%)',
            transform: selected ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.4s ease',
          },
        }}
      >
        {selected && (
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF3E8A 0%, #FF6B9D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 62, 138, 0.4)',
            }}
          >
            <CheckCircle sx={{ fontSize: 18, color: '#ffffff' }} />
          </Box>
        )}

        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: selected
                ? 'linear-gradient(135deg, #FF3E8A 0%, #FF6B9D 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              transition: 'all 0.3s ease',
            }}
          >
            <Box
              sx={{
                color: selected ? '#ffffff' : '#FF3E8A',
                fontSize: 32,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: 1.5,
              fontSize: '1.2rem',
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </ScaleIn>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [copied, setCopied] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentDetails = {
    accountNumber: '1234567890',
    accountName: 'School Management System',
    accountHolder: 'School Bursar Office',
    phoneNumber: '+2347041718422',
  };

  const paymentMethods = [
    {
      id: 'bank',
      icon: <AccountBalance />,
      title: 'Bank Transfer',
      description: 'Direct bank transfer to our school account. Safe, secure, and instantly confirmed.',
    },
    {
      id: 'card',
      icon: <CreditScore />,
      title: 'Credit/Debit Card',
      description: 'Pay using your Visa, MasterCard, or other major credit/debit cards securely.',
    },
    {
      id: 'upi',
      icon: <QrCode />,
      title: 'QR Code Payment',
      description: 'Quick and easy payment using QR code scanning with your mobile banking app.',
    },
    {
      id: 'wallet',
      icon: <PaymentIcon />,
      title: 'Mobile Wallet',
      description: 'Pay using popular mobile wallets including Apple Pay, Google Pay, and Samsung Pay.',
    },
  ];

  const features = [
    {
      icon: <Security />,
      title: 'Bank-Level Security',
      description: '256-bit SSL encryption protects every transaction.',
    },
    {
      icon: <Receipt />,
      title: 'Instant Receipt',
      description: 'Get immediate confirmation after payment.',
    },
    {
      icon: <TrendingUp />,
      title: 'Payment History',
      description: 'Track all your past payments in one place.',
    },
    {
      icon: <SupportAgent />,
      title: '24/7 Support',
      description: 'Our team is always here to help you.',
    },
  ];

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello, I would like to make a payment for school fees.\n\n` +
      `Payment Method: ${selectedMethod?.title || 'Selected'}\n` +
      `Amount: NGN 50,000 (Tuition)\n` +
      `Student ID: STU-2024-001\n\n` +
      `Please confirm receipt. Thank you!`
    );

    window.open(`https://wa.me/${paymentDetails.phoneNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    window.open(`tel:${paymentDetails.phoneNumber}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a192f 0%, #0d1b2a 50%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 62, 138, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(33, 150, 243, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Section */}
      <Box
        sx={{
          pt: { xs: 12, md: 16 },
          pb: 6,
          px: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container maxWidth="lg">
          <FadeInUp delay={0.2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Button
                component={motion.button}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{
                  borderColor: 'rgba(255, 62, 138, 0.5)',
                  color: '#FF3E8A',
                  borderWidth: 2,
                  borderRadius: '50px',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#FF3E8A',
                    background: 'rgba(255, 62, 138, 0.1)',
                  },
                }}
              >
                Back
              </Button>
            </Box>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
              <Box
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #FF3E8A 0%, #FF6B9D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(255, 62, 138, 0.4)',
                }}
              >
                <PaymentIcon sx={{ fontSize: { xs: 40, md: 50 }, color: '#ffffff' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: { xs: '2rem', md: '3rem' },
                    mb: 1,
                    background: 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Secure Payment Portal
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 300,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                  }}
                >
                  Safe, fast, and reliable school fee payment
                </Typography>
              </Box>
            </Stack>
          </FadeInUp>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={4}>
            {/* Payment Methods Section */}
            <Grid item xs={12} lg={8}>
              <FadeInUp delay={0.6}>
                <Box sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FF3E8A 0%, #FF6B9D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PaymentIcon sx={{ fontSize: 24, color: '#ffffff' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: { xs: '1.5rem', md: '1.8rem' },
                        }}
                      >
                        Select Payment Method
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5 }}
                      >
                        Choose your preferred payment option
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    {paymentMethods.map((method, index) => (
                      <Grid item xs={12} sm={6} key={method.id}>
                        <PaymentMethodCard
                          {...method}
                          selected={selectedMethod?.id === method.id}
                          onClick={() =>
                            setSelectedMethod(
                              method.id === selectedMethod?.id ? null : method
                            )
                          }
                          index={index}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </FadeInUp>

              {/* Security Features */}
              <FadeInUp delay={0.8}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 800,
                      mb: 4,
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                    }}
                  >
                    Why Trust Our Payment System?
                  </Typography>
                  <Grid container spacing={3}>
                    {features.map((feature, index) => (
                      <Grid item xs={12} sm={6} md={6} key={index}>
                        <SlideInLeft delay={index * 0.1}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '20px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.06)',
                                transform: 'translateY(-4px)',
                                borderColor: 'rgba(255, 62, 138, 0.3)',
                              },
                            }}
                          >
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Box
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: '14px',
                                  background: 'linear-gradient(135deg, #FF3E8A 0%, #FF6B9D 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Box sx={{ color: '#ffffff', fontSize: 24 }}>
                                  {feature.icon}
                                </Box>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    mb: 0.5,
                                  }}
                                >
                                  {feature.title}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.5 }}
                                >
                                  {feature.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </SlideInLeft>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </FadeInUp>
            </Grid>

            {/* Payment Details Sidebar */}
            <Grid item xs={12} lg={4}>
              <FadeInUp delay={1}>
                <Box
                  sx={{
                    position: 'sticky',
                    top: 20,
                  }}
                >
                  {/* Selected Method Alert */}
                  <AnimatePresence>
                    {selectedMethod && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert
                          severity="success"
                          icon={<CheckCircle />}
                          sx={{
                            mb: 4,
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            borderRadius: '16px',
                            color: '#ffffff',
                            '& .MuiAlert-icon': {
                              color: '#4CAF50',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            You selected <strong>{selectedMethod.title}</strong>
                          </Typography>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment Details Card */}
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      mb: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 800,
                        mb: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Receipt sx={{ fontSize: 24, color: '#FF3E8A' }} />
                      Payment Details
                    </Typography>

                    <Stack spacing={3}>
                      {/* Account Number */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            mb: 1.5,
                            display: 'block',
                          }}
                        >
                          Account Number
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#FF3E8A',
                              letterSpacing: 3,
                              fontSize: { xs: '1.1rem', md: '1.3rem' },
                            }}
                          >
                            {paymentDetails.accountNumber}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(paymentDetails.accountNumber)}
                            sx={{
                              color: '#FF3E8A',
                              '&:hover': {
                                background: 'rgba(255, 62, 138, 0.1)',
                              },
                            }}
                          >
                            <ContentCopy sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Paper>
                      </Box>

                      {/* Account Name */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            mb: 1.5,
                            display: 'block',
                          }}
                        >
                          Account Name
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: '#ffffff',
                              fontSize: '1rem',
                            }}
                          >
                            {paymentDetails.accountName}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(paymentDetails.accountName)}
                            sx={{
                              color: '#2196F3',
                              '&:hover': {
                                background: 'rgba(33, 150, 243, 0.1)',
                              },
                            }}
                          >
                            <ContentCopy sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Paper>
                      </Box>

                      {/* Account Holder */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            mb: 1.5,
                            display: 'block',
                          }}
                        >
                          Account Holder
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: '#ffffff',
                              fontSize: '1rem',
                            }}
                          >
                            {paymentDetails.accountHolder}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(paymentDetails.accountHolder)}
                            sx={{
                              color: '#2196F3',
                              '&:hover': {
                                background: 'rgba(33, 150, 243, 0.1)',
                              },
                            }}
                          >
                            <ContentCopy sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Paper>
                      </Box>

                      {/* Amount Input */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            mb: 1.5,
                            display: 'block',
                          }}
                        >
                          Payment Amount
                        </Typography>
                        <TextField
                          fullWidth
                          defaultValue="50000"
                          type="number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography sx={{ color: '#FF3E8A', fontWeight: 700, fontSize: '1.1rem' }}>
                                  ₦
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#ffffff',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '16px',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 62, 138, 0.3)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#FF3E8A',
                              },
                            },
                            '& .MuiInputBase-input::placeholder': {
                              color: 'rgba(255, 255, 255, 0.3)',
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {/* Action Buttons */}
                  <Stack spacing={2}>
                    {selectedMethod && (
                      <Button
                        component={motion.button}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={processing}
                        onClick={() => {
                          setProcessing(true);
                          setTimeout(() => {
                            setProcessing(false);
                          }, 2000);
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #FF3E8A 0%, #FF6B9D 100%)',
                          color: '#ffffff',
                          py: 2.5,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          borderRadius: '16px',
                          boxShadow: '0 10px 40px rgba(255, 62, 138, 0.4)',
                          '&:hover': {
                            boxShadow: '0 15px 50px rgba(255, 62, 138, 0.6)',
                          },
                          '&:disabled': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        {processing ? (
                          <>
                            <CircularProgress size={20} sx={{ color: '#ffffff', mr: 2 }} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock sx={{ mr: 1, fontSize: 20 }} />
                            Confirm & Pay
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setSelectedMethod(null)}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        py: 2,
                        fontWeight: 600,
                        borderRadius: '16px',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: 'rgba(255, 62, 138, 0.5)',
                          background: 'rgba(255, 62, 138, 0.1)',
                        },
                      }}
                    >
                      Clear Selection
                    </Button>
                  </Stack>

                  {/* Contact Buttons */}
                  <Box sx={{ mt: 5 }}>
                    <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Support Section with Animation */}
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      sx={{
                        p: 3,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(255, 62, 138, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        mb: 4,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 700,
                          mb: 2,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <SupportAgent sx={{ color: '#FF3E8A' }} />
                        Need Assistance?
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.85rem', md: '0.95rem' },
                        }}
                      >
                        You can call or message us on WhatsApp. After completing your payment,
                        please send the following details:
                      </Typography>
                      <Box
                        component="ul"
                        sx={{
                          mt: 2,
                          pl: 2,
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                          lineHeight: 1.8,
                        }}
                      >
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography component="span" sx={{ color: '#FF3E8A', fontWeight: 600 }}>
                            •
                          </Typography>
                          {' '}The transaction receipt image
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Typography component="span" sx={{ color: '#2196F3', fontWeight: 600 }}>
                            •
                          </Typography>
                          {' '}The name of the student
                        </Box>
                        <Box component="li">
                          <Typography component="span" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                            •
                          </Typography>
                          {' '}The name on the account used for payment
                        </Box>
                      </Box>
                    </Box>

                    {/* Contact Buttons with Slide-in Animation */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button
                        component={motion.button}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        fullWidth
                        variant="contained"
                        startIcon={<WhatsApp />}
                        onClick={handleWhatsAppClick}
                        sx={{
                          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                          color: '#ffffff',
                          py: 2.5,
                          fontWeight: 700,
                          fontSize: '1rem',
                          borderRadius: '16px',
                          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
                          '&:hover': {
                            boxShadow: '0 8px 30px rgba(37, 211, 102, 0.5)',
                            background: 'linear-gradient(135deg, #128C7E 0%, #25D366 100%)',
                          },
                        }}
                      >
                        Message on WhatsApp
                      </Button>
                      <Button
                        component={motion.button}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        fullWidth
                        variant="outlined"
                        startIcon={<Phone />}
                        onClick={handleCallClick}
                        sx={{
                          borderColor: '#2196F3',
                          color: '#2196F3',
                          py: 2.5,
                          fontWeight: 700,
                          fontSize: '1rem',
                          borderRadius: '16px',
                          borderWidth: 2,
                          '&:hover': {
                            borderColor: '#1976D2',
                            background: 'rgba(33, 150, 243, 0.15)',
                            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)',
                          },
                        }}
                      >
                        Call Us
                      </Button>
                    </Stack>

                    {/* Phone Number Display */}
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.6 }}
                      sx={{
                        mt: 3,
                        p: 2.5,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          mb: 1,
                          display: 'block',
                        }}
                      >
                        Our Phone Number
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#FF3E8A',
                          fontWeight: 700,
                          fontSize: { xs: '1.2rem', md: '1.4rem' },
                          fontFamily: 'monospace',
                          letterSpacing: 1,
                        }}
                      >
                        07041718422
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </FadeInUp>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Copied Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
          >
            <Alert
              severity="success"
              icon={<CheckCircle />}
              onClose={() => setCopied('')}
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(76, 175, 80, 0.85) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(76, 175, 80, 0.5)',
                borderRadius: '16px',
                color: '#ffffff',
                boxShadow: '0 10px 40px rgba(76, 175, 80, 0.4)',
                '& .MuiAlert-icon': {
                  color: '#ffffff',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {copied} copied to clipboard!
              </Typography>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PaymentPage;
