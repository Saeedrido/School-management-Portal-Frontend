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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Phone,
  WhatsApp,
  ContentCopy,
  CheckCircle,
  ArrowBack,
  Payment as PaymentIcon,
  AccountBalance,
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
  const [copied, setCopied] = useState('');
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [paymentTypeModalOpen, setPaymentTypeModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedWhatsAppNumber, setSelectedWhatsAppNumber] = useState('');

  const whatsAppNumbers = ['08023233594', '08135460603', '08023186047'];
  const paymentTypes = ['SCH. FEES', 'BOOKS', 'UNIFORM', 'SCHOOL BUS', 'MISCELLANEOUS'];
  const bankAccounts = [
    { label: 'SCH. FEES', number: '4240065190' },
    { label: 'BOOKS', number: '4240065200' },
    { label: 'UNIFORM', number: '4240065217' },
    { label: 'SCHOOL BUS', number: '4240065224' },
    { label: 'MISCELLANEOUS', number: '4240065231' },
  ];

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleWhatsAppClick = () => setNumberModalOpen(true);

  const handleNumberSelect = (num) => {
    setSelectedWhatsAppNumber(num);
    setNumberModalOpen(false);
    setPaymentTypeModalOpen(true);
  };

  const handlePaymentTypeSelect = (type) => {
    setPaymentTypeModalOpen(false);
    const greeting = getGreeting();
    const message = encodeURIComponent(
      `${greeting},\n\nI have made a payment for ${type}.\n\nBelow is my transaction receipt for confirmation.\n\nThank you.`
    );
    const whatsappNum = '234' + selectedWhatsAppNumber.slice(1);
    window.open(`https://wa.me/${whatsappNum}?text=${message}`, '_blank');
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCallClick = () => setCallModalOpen(true);

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
        <Container maxWidth="md">
          <FadeIn delay={0.2}>
            <Card sx={{ borderRadius: '20px', border: '1px solid #eee', overflow: 'hidden', mb: 4 }}>
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalance sx={{ color: 'white', fontSize: 28 }} />
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.3rem' }, fontFamily: 'Georgia, serif' }}>
                    SCHOOL BANK DETAILS
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      Bank Name
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: '12px', background: '#faf9f7' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a' }}>
                        ECO BANK
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      Account Name
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: '12px', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        300 ARUNDEL LEARNING LIMITED
                      </Typography>
                      <IconButton onClick={() => handleCopy('300 ARUNDEL LEARNING LIMITED', 'Account Name')} sx={{ color: '#6FAF8F' }}>
                        <ContentCopy />
                      </IconButton>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography sx={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 2, mt: 4 }}>
                  ACCOUNT DETAILS
                </Typography>
                <Grid container spacing={2}>
                  {bankAccounts.map((account) => (
                    <Grid item xs={12} sm={6} key={account.label}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -3 }}
                      >
                        <Paper sx={{ 
                          p: 2.5, 
                          borderRadius: '16px', 
                          background: '#faf9f7',
                          border: '1px solid #eee',
                          transition: 'all 0.3s ease',
                          '&:hover': { borderColor: '#6FAF8F', boxShadow: '0 5px 20px rgba(111, 175, 143, 0.1)' }
                        }}>
                          <Typography sx={{ color: '#6FAF8F', fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>
                            {account.label}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.3rem' }, color: '#1a1a1a', fontFamily: 'monospace', letterSpacing: 2 }}>
                              {account.number}
                            </Typography>
                            <IconButton onClick={() => handleCopy(account.number, account.label)} sx={{ color: '#6FAF8F' }}>
                              <ContentCopy />
                            </IconButton>
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card sx={{ borderRadius: '20px', border: '1px solid #eee', p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2, fontFamily: 'Georgia, serif', fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
                After Making Payment
              </Typography>
              <Typography sx={{ color: '#666', mb: 4, lineHeight: 1.8, maxWidth: 500, mx: 'auto' }}>
                After making payment, please send your transaction receipt via WhatsApp or call us.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    startIcon={<WhatsApp />}
                    onClick={handleWhatsAppClick}
                    sx={{ 
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: 'white', 
                      px: 4, 
                      py: 1.5, 
                      fontWeight: 600, 
                      borderRadius: '12px',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Message on WhatsApp
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    startIcon={<Phone />}
                    onClick={handleCallClick}
                    sx={{ 
                      border: '2px solid #333',
                      color: '#333', 
                      px: 4, 
                      py: 1.5, 
                      fontWeight: 600, 
                      borderRadius: '12px',
                      '&:hover': { background: '#f5f5f5' }
                    }}
                  >
                    Call Us
                  </Button>
                </motion.div>
              </Stack>
            </Card>
          </FadeIn>
        </Container>
      </Box>

      {/* WhatsApp Number Modal */}
      <Dialog open={numberModalOpen} onClose={() => setNumberModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#1a1a1a' }}>
          Select a number to contact
        </DialogTitle>
        <DialogContent>
          <List>
            {whatsAppNumbers.map((num) => (
              <ListItemButton
                key={num}
                onClick={() => handleNumberSelect(num)}
                sx={{ borderRadius: '12px', mb: 1, '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.08)' } }}
              >
                <ListItemText primary={num} primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }} />
                <WhatsApp sx={{ color: '#25D366', fontSize: 28 }} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Payment Type Modal */}
      <Dialog open={paymentTypeModalOpen} onClose={() => setPaymentTypeModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#1a1a1a' }}>
          What payment did you make?
        </DialogTitle>
        <DialogContent>
          <List>
            {paymentTypes.map((type) => (
              <ListItemButton
                key={type}
                onClick={() => handlePaymentTypeSelect(type)}
                sx={{ borderRadius: '12px', mb: 1, '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.08)' } }}
              >
                <ListItemText primary={type} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Call Number Modal */}
      <Dialog open={callModalOpen} onClose={() => setCallModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#1a1a1a' }}>
          Select a number to call
        </DialogTitle>
        <DialogContent>
          <List>
            {whatsAppNumbers.map((num) => (
              <ListItemButton
                key={num}
                component="a"
                href={`tel:${num}`}
                sx={{ borderRadius: '12px', mb: 1, '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.08)' } }}
              >
                <ListItemText primary={num} primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }} />
                <Phone sx={{ color: '#6FAF8F', fontSize: 24 }} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

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
