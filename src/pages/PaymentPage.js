import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Phone,
  WhatsApp,
  ContentCopy,
  CheckCircle,
  ArrowBack,
  Payment as PaymentIcon,
  AccountBalance,
  School,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import schoolLogo from '../assets/school logo imj/school-logo bck.png';

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay }}
  >
    {children}
  </motion.div>
);

const PaymentPage = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [copied, setCopied] = useState('');

  const paymentDetails = {
    accountNumber: '1234567890',
    accountName: 'School Management System',
    accountHolder: 'School Bursar Office',
    phoneNumber: '+2347041718422',
  };

  const paymentMethods = [
    { id: 'bank', icon: <AccountBalance />, title: 'Bank Transfer', desc: 'Direct bank transfer to our school account' },
    { id: 'card', icon: <PaymentIcon />, title: 'Card Payment', desc: 'Pay with Visa, MasterCard, or other cards' },
    { id: 'cash', icon: <PaymentIcon />, title: 'Cash Payment', desc: 'Visit our office for cash payment' },
  ];

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello, I would like to make a payment for school fees.\n\n` +
      `Amount: NGN 50,000 (Tuition)\n` +
      `Please confirm receipt. Thank you!`
    );
    window.open(`https://wa.me/${paymentDetails.phoneNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <Box sx={{ overflowX: 'hidden', fontFamily: 'Georgia, serif', background: '#faf9f7' }}>
      {/* Header */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box component="img" src={schoolLogo} alt="Logo" sx={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '50%' }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.5px' }}>
                  300 Arundel
                </Typography>
                <Typography variant="caption" sx={{ color: '#6FAF8F', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Learning Limited
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                onClick={() => navigate('/')} 
                startIcon={<ArrowBack />}
                sx={{ color: '#333', fontWeight: 500 }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ pt: { xs: 12, md: 16 }, pb: 8, background: 'linear-gradient(135deg, #faf9f7 0%, #f0efe9 50%, #e8e6df 100%)' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
                mb: 3,
                boxShadow: '0 10px 30px rgba(111, 175, 143, 0.3)'
              }}>
                <PaymentIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, color: '#1a1a1a', mb: 2, fontFamily: 'Georgia, serif' }}>
                School Fees Payment
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '1.1rem', maxWidth: 500, mx: 'auto', fontFamily: 'Georgia, serif' }}>
                Secure and convenient payment options for your child's education
              </Typography>
            </Box>
          </FadeIn>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ py: { xs: 6, md: 8 }, mt: -4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Payment Methods */}
            <Grid item xs={12} lg={8}>
              <FadeIn delay={0.2}>
                <Box sx={{ mb: 6 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 4, fontFamily: 'Georgia, serif' }}>
                    Select Payment Method
                  </Typography>
                  <Grid container spacing={3}>
                    {paymentMethods.map((method, index) => (
                      <Grid item xs={12} sm={4} key={method.id}>
                        <Card
                          onClick={() => setSelectedMethod(method.id)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '20px',
                            border: `2px solid ${selectedMethod === method.id ? '#6FAF8F' : '#eee'}`,
                            background: selectedMethod === method.id ? 'rgba(111, 175, 143, 0.05)' : 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                              borderColor: '#6FAF8F'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: 60, 
                              height: 60, 
                              borderRadius: '50%', 
                              background: selectedMethod === method.id 
                                ? 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)' 
                                : 'rgba(111, 175, 143, 0.1)',
                              mb: 2,
                              color: selectedMethod === method.id ? 'white' : '#6FAF8F'
                            }}>
                              {method.icon}
                            </Box>
                            <Typography sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                              {method.title}
                            </Typography>
                            <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
                              {method.desc}
                            </Typography>
                            {selectedMethod === method.id && (
                              <Box sx={{ mt: 2 }}>
                                <CheckCircle sx={{ color: '#6FAF8F', fontSize: 24 }} />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </FadeIn>

              {/* Bank Details */}
              <FadeIn delay={0.3}>
                <Card sx={{ borderRadius: '20px', border: '1px solid #eee', overflow: 'hidden' }}>
                  <Box sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Georgia, serif' }}>
                      Bank Transfer Details
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                          Account Number
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: '12px', 
                          background: '#faf9f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#6FAF8F', fontFamily: 'monospace', letterSpacing: 2 }}>
                            {paymentDetails.accountNumber}
                          </Typography>
                          <IconButton onClick={() => handleCopy(paymentDetails.accountNumber, 'Account Number')} sx={{ color: '#6FAF8F' }}>
                            <ContentCopy />
                          </IconButton>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                          Account Name
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: '12px', 
                          background: '#faf9f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                            {paymentDetails.accountName}
                          </Typography>
                          <IconButton onClick={() => handleCopy(paymentDetails.accountName, 'Account Name')} sx={{ color: '#6FAF8F' }}>
                            <ContentCopy />
                          </IconButton>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                          Bank Name
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: '12px', 
                          background: '#faf9f7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                            {paymentDetails.accountHolder}
                          </Typography>
                          <IconButton onClick={() => handleCopy(paymentDetails.accountHolder, 'Bank Name')} sx={{ color: '#6FAF8F' }}>
                            <ContentCopy />
                          </IconButton>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Amount */}
              <FadeIn delay={0.4}>
                <Box sx={{ mt: 4 }}>
                  <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                    Payment Amount
                  </Typography>
                  <TextField
                    fullWidth
                    defaultValue="50000"
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ color: '#6FAF8F', fontWeight: 700, fontSize: '1.5rem' }}>
                            ₦
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        background: 'white',
                        borderRadius: '15px',
                        '& fieldset': { borderColor: '#eee' },
                        '&:hover fieldset': { borderColor: '#6FAF8F' },
                        '&.Mui-focused fieldset': { borderColor: '#6FAF8F' },
                      },
                    }}
                  />
                </Box>
              </FadeIn>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              <FadeIn delay={0.2}>
                <Card sx={{ borderRadius: '20px', border: '1px solid #eee', p: 3, position: 'sticky', top: 100 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <School sx={{ color: 'white' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem', fontFamily: 'Georgia, serif' }}>
                      300 Arundel Learning Limited
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3, p: 2, borderRadius: '12px', background: '#faf9f7' }}>
                    <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
                      Payment For
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                      School Fees - {new Date().getFullYear()}
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Button 
                      fullWidth 
                      variant="contained"
                      sx={{ 
                        background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
                        color: 'white', 
                        py: 1.5, 
                        fontWeight: 700, 
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(111, 175, 143, 0.3)',
                        '&:hover': { boxShadow: '0 6px 20px rgba(111, 175, 143, 0.4)' }
                      }}
                    >
                      Confirm Payment
                    </Button>
                  </Stack>
                </Card>
              </FadeIn>

              {/* Contact Support */}
              <FadeIn delay={0.3}>
                <Card sx={{ borderRadius: '20px', border: '1px solid #eee', p: 3, mt: 3 }}>
                  <Typography sx={{ fontWeight: 700, color: '#1a1a1a', mb: 3, fontFamily: 'Georgia, serif' }}>
                    Need Assistance?
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.9rem', mb: 3, lineHeight: 1.8 }}>
                    After making payment, please send your transaction receipt via WhatsApp or call us.
                  </Typography>
                  <Stack spacing={2}>
                    <Button 
                      fullWidth 
                      startIcon={<WhatsApp />}
                      onClick={handleWhatsAppClick}
                      sx={{ 
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        color: 'white', 
                        py: 1.5, 
                        fontWeight: 600, 
                        borderRadius: '12px',
                        '&:hover': { opacity: 0.9 }
                      }}
                    >
                      Message on WhatsApp
                    </Button>
                    <Button 
                      fullWidth 
                      startIcon={<Phone />}
                      href={`tel:${paymentDetails.phoneNumber}`}
                      sx={{ 
                        border: '2px solid #333',
                        color: '#333', 
                        py: 1.5, 
                        fontWeight: 600, 
                        borderRadius: '12px',
                        '&:hover': { background: '#f5f5f5' }
                      }}
                    >
                      Call Us
                    </Button>
                  </Stack>
                  <Box sx={{ mt: 3, p: 2, borderRadius: '12px', background: '#faf9f7', textAlign: 'center' }}>
                    <Typography sx={{ color: '#999', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Phone Number
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#6FAF8F', fontSize: '1.1rem' }}>
                      {paymentDetails.phoneNumber}
                    </Typography>
                  </Box>
                </Card>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Copied Notification */}
      {copied && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
        >
          <Paper sx={{ 
            p: 2, 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
            <Typography sx={{ color: 'white', fontWeight: 600 }}>
              {copied} copied!
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ py: 3, background: '#1a1a1a', borderTop: '1px solid #333' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src={schoolLogo} alt="Logo" sx={{ width: 30, height: 30, objectFit: 'contain', borderRadius: '50%' }} />
              <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                © {new Date().getFullYear()} 300 Arundel Learning Limited
              </Typography>
            </Box>
            <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
              Educating for Excellence
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PaymentPage;
