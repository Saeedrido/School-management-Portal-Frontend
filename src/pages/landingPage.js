import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  ArrowForward,
  Analytics,
  Security,
  Groups,
  MenuBook,
  Science,
  CheckCircle,
  Star,
  TrendingUp,
  School,
} from '@mui/icons-material';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// Reveal Animation Component
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Dr. Amanda Richardson',
      role: 'Principal, Westfield Academy',
      content: 'EduFlow Pro revolutionized how we manage our institution. The analytics dashboard alone saved our admin team 15 hours per week.',
      rating: 5,
      avatar: 'AR'
    },
    {
      name: 'Prof. James Morrison',
      role: 'Academic Director, Lincoln High',
      content: 'The student tracking and grade management features are exceptional. Our teachers can now focus on what matters most - teaching.',
      rating: 5,
      avatar: 'JM'
    },
    {
      name: 'Sarah Chen',
      role: 'Vice Principal, Riverside International',
      content: 'Implementation was seamless, and the support team was incredible. Parent communication improved by 200% within the first month.',
      rating: 5,
      avatar: 'SC'
    }
  ];

  const features = [
    {
      icon: <Groups sx={{ fontSize: 36 }} />,
      title: 'Smart Student Management',
      description: 'Comprehensive student profiles with automated enrollment, attendance tracking, and academic history.',
      color: '#5FAF8F'
    },
    {
      icon: <Analytics sx={{ fontSize: 36 }} />,
      title: 'Advanced Analytics',
      description: 'Real-time insights into student performance, attendance patterns, and institutional metrics.',
      color: '#2E8B57'
    },
    {
      icon: <MenuBook sx={{ fontSize: 36 }} />,
      title: 'Curriculum Management',
      description: 'Design and manage curricula with intuitive tools. Align lessons with standards.',
      color: '#5FAF8F'
    },
    {
      icon: <Science sx={{ fontSize: 36 }} />,
      title: 'Assessment Platform',
      description: 'Create, administer, and grade exams effortlessly. Support for multiple question types.',
      color: '#2E8B57'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 36 }} />,
      title: 'Progress Tracking',
      description: 'Monitor student growth with granular progress reports. Identify learning gaps early.',
      color: '#5FAF8F'
    },
    {
      icon: <Security sx={{ fontSize: 36 }} />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, role-based access control, and complete audit trails.',
      color: '#2E8B57'
    }
  ];

  const stats = [
    { value: 2500, suffix: '+', label: 'Schools Worldwide' },
    { value: 850, suffix: 'K+', label: 'Active Students' },
    { value: 99, suffix: '%', label: 'Uptime Guarantee' },
    { value: 24, suffix: '/7', label: 'Expert Support' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Box sx={{ overflow: 'hidden', bgcolor: '#EAF5F1' }}>
      {/* Navbar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(111, 175, 143, 0.1)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(111, 175, 143, 0.35)',
                }}
              >
                <School sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 800, fontSize: '1.3rem' }}>
                <Box component="span" sx={{ color: '#6FAF8F' }}>EduFlow</Box> Pro
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  color: '#4B5563',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { color: '#6FAF8F', background: 'transparent' },
                }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  color: '#ffffff',
                  px: 3,
                  fontWeight: 600,
                  borderRadius: '50px',
                  boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(111, 175, 143, 0.5)',
                    background: 'linear-gradient(135deg, #5FA08A 0%, #3D7B5F 100%)',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #F5F7F6 0%, #EAF3EE 100%)',
          position: 'relative',
        }}
      >
        <Container maxWidth="xl" sx={{ pt: 8, pb: 8 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Side - Content */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Reveal delay={0.2}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#6FAF8F',
                      letterSpacing: 4,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Next-Generation Education Platform
                  </Typography>
                </Reveal>

                <Reveal delay={0.4}>
                  <Typography
                    variant="h1"
                    sx={{
                      color: '#1F2937',
                      fontWeight: 900,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.1,
                    }}
                  >
                    Transform Your
                    <Box component="span" sx={{ color: '#6FAF8F', display: 'block' }}>School Into</Box>
                    A Digital Powerhouse
                  </Typography>
                </Reveal>

                <Reveal delay={0.6}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#4B5563',
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      lineHeight: 1.8,
                      maxWidth: '500px',
                    }}
                  >
                    Streamline operations, enhance learning outcomes, and empower stakeholders with AI-driven insights.
                  </Typography>
                </Reveal>

                <Reveal delay={0.8}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
                    <Button
                      onClick={() => navigate('/register')}
                      endIcon={<ArrowForward />}
                      sx={{
                        background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                        color: '#ffffff',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '50px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(111, 175, 143, 0.5)',
                          background: 'linear-gradient(135deg, #5FA08A 0%, #3D7B5F 100%)',
                        }
                      }}
                    >
                      Start Free Trial
                    </Button>
                    <Button
                      onClick={() => {
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{
                        border: '2px solid #6FAF8F',
                        color: '#4E8C70',
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '50px',
                        textTransform: 'none',
                        '&:hover': {
                          border: '2px solid #4E8C70',
                          background: 'rgba(111, 175, 143, 0.1)',
                        }
                      }}
                    >
                      Explore Platform
                    </Button>
                  </Stack>
                </Reveal>

                {/* Stats */}
                <Stack direction="row" spacing={4} sx={{ mt: 4, flexWrap: 'wrap' }}>
                  {stats.map((stat, index) => (
                    <Reveal key={index} delay={1 + index * 0.1}>
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            color: '#6FAF8F',
                            fontWeight: 800,
                          }}
                        >
                          {stat.value}{stat.suffix}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#6B7280', fontWeight: 500 }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Reveal>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Right Side - Image */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="/images/school-building.jpg"
                alt="Modern School"
                sx={{
                  width: '100%',
                  borderRadius: '24px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trusted By Section */}
      <Box sx={{ py: 6, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Reveal>
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: '#6B7280',
                mb: 4,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              Trusted by Leading Educational Institutions Worldwide
            </Typography>
          </Reveal>

          <Grid container spacing={4} justifyContent="center">
            {[
              'Westfield Academy',
              'Lincoln International',
              'Riverside School',
              'Oak Creek Education',
              'Summit Learning',
            ].map((school, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 2,
                    px: 3,
                    background: '#F5F7F6',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography sx={{ color: '#4B5563', fontWeight: 600 }}>
                    {school}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F5F7F6' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Reveal>
              <Typography
                variant="overline"
                sx={{
                  color: '#6FAF8F',
                  letterSpacing: 4,
                  fontWeight: 700,
                  mb: 2,
                  display: 'block',
                }}
              >
                Powerful Features
              </Typography>
            </Reveal>

            <Reveal delay={0.2}>
              <Typography
                variant="h2"
                sx={{
                  color: '#1F2937',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2
                }}
              >
                Everything You Need to <Box component="span" sx={{ color: '#6FAF8F' }}>Excel</Box>
              </Typography>
            </Reveal>

            <Reveal delay={0.4}>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B7280',
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                A comprehensive suite of tools designed specifically for modern educational institutions.
              </Typography>
            </Reveal>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(111, 175, 143, 0.15)',
                      border: `1px solid ${feature.color}40`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}CC 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ color: '#ffffff' }}>
                        {feature.icon}
                      </Box>
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        color: '#1F2937',
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B7280',
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Reveal>
              <Typography
                variant="overline"
                sx={{
                  color: '#6FAF8F',
                  letterSpacing: 4,
                  fontWeight: 700,
                  mb: 2,
                  display: 'block',
                }}
              >
                Success Stories
              </Typography>
            </Reveal>

            <Reveal delay={0.2}>
              <Typography
                variant="h2"
                sx={{
                  color: '#1F2937',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Loved by Educators <Box component="span" sx={{ color: '#6FAF8F' }}>Worldwide</Box>
              </Typography>
            </Reveal>
          </Box>

          <Card
            sx={{
              p: 5,
              background: '#F5F7F6',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} sx={{ color: '#F59E0B', fontSize: 24 }} />
              ))}
            </Stack>

            <Typography
              variant="h5"
              sx={{
                color: '#1F2937',
                fontWeight: 600,
                lineHeight: 1.5,
                mb: 4,
                fontStyle: 'italic'
              }}
            >
              "{testimonials[currentTestimonial].content}"
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                }}
              >
                {testimonials[currentTestimonial].avatar}
              </Avatar>
              <Box>
                <Typography sx={{ color: '#1F2937', fontWeight: 700 }}>
                  {testimonials[currentTestimonial].name}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
                  {testimonials[currentTestimonial].role}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Navigation Dots */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            {testimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                sx={{
                  width: index === currentTestimonial ? 32 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: index === currentTestimonial
                    ? '#6FAF8F'
                    : '#E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 12 },
          background: 'linear-gradient(135deg, #5FAF8F 0%, #2E8B57 100%)',
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Reveal>
            <Typography
              variant="h2"
              sx={{
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 3,
              }}
            >
              Ready to Transform Your Institution?
            </Typography>
          </Reveal>

          <Reveal delay={0.2}>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                fontSize: '1.1rem',
              }}
            >
              Join thousands of educational institutions already using our platform.
            </Typography>
          </Reveal>

          <Reveal delay={0.4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
                sx={{
                  background: '#FFFFFF',
                  color: '#4E8C70',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  textTransform: 'none',
                  '&:hover': {
                    background: '#F5F7F6',
                  }
                }}
              >
                Start Your Free Trial
              </Button>

              <Button
                onClick={() => navigate('/payment')}
                sx={{
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  color: '#FFFFFF',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  textTransform: 'none',
                  '&:hover': {
                    border: '2px solid #FFFFFF',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                View Pricing
              </Button>
            </Stack>
          </Reveal>

          <Reveal delay={0.6}>
            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 4, flexWrap: 'wrap', gap: 2 }}>
              {[
                'No credit card required',
                '14-day free trial',
                'Cancel anytime',
              ].map((feature, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: '#FFFFFF', fontSize: 18 }} />
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, fontSize: '0.9rem' }}>
                    {feature}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Reveal>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 8, bgcolor: '#1F2937', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Container maxWidth="xl">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h5"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  mb: 2,
                }}
              >
                <Box component="span" sx={{ color: '#6FAF8F' }}>EduFlow</Box> Pro
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.8, mb: 3 }}>
                The next-generation school management platform built for modern educational institutions.
              </Typography>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1.5}>
                {['Features', 'Pricing', 'Integrations', 'Updates'].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      '&:hover': { color: '#6FAF8F' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1.5}>
                {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      '&:hover': { color: '#6FAF8F' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                Resources
              </Typography>
              <Stack spacing={1.5}>
                {['Documentation', 'Help Center', 'API', 'Community'].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      '&:hover': { color: '#6FAF8F' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1.5}>
                {['Privacy', 'Terms', 'Security'].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      '&:hover': { color: '#6FAF8F' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
              © 2026 EduFlow Pro. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', cursor: 'pointer' }}>
                Privacy Policy
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', cursor: 'pointer' }}>
                Terms of Service
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
