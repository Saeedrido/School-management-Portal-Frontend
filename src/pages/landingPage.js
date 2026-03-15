import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  ArrowForward,
  Groups,
  School,
  EmojiEvents,
  Phone,
  Email,
  LocationOn,
  Menu,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { motion, useInView } from 'framer-motion';
import schoolLogo from '../assets/school logo imj/school-logo bck.png';

const FadeIn = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedButton = ({ children, onClick, sx, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button onClick={onClick} sx={sx} {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

const AnimatedIcon = ({ children }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    transition={{ type: 'spring', stiffness: 400 }}
  >
    {children}
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: <School />, title: 'Academic Excellence', desc: 'Rigorous curriculum preparing students for future success' },
    { icon: <Groups />, title: 'Expert Faculty', desc: 'Qualified teachers committed to student growth' },
    { icon: <EmojiEvents />, title: 'Holistic Development', desc: 'Sports, arts, and character building programs' },
  ];

  const stats = [
    { num: '500+', label: 'Students' },
    { num: '25+', label: 'Teachers' },
    { num: '15+', label: 'Years Experience' },
    { num: '100%', label: 'Pass Rate' },
  ];

  const testimonials = [
    { name: 'Mrs. Adebayo', role: 'Parent', text: 'My daughter has flourished academically and socially. The teachers are dedicated and caring.' },
    { name: 'Mr. Okonkwo', role: 'Parent', text: 'The school provides a nurturing environment where every child is valued and challenged.' },
    { name: 'Dr. Williams', role: 'Educationist', text: '300 Arundel sets the standard for quality education in the region.' },
  ];

  return (
    <Box sx={{ overflowX: 'hidden', fontFamily: 'Georgia, serif' }}>
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
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
                <Box sx={{ width: 45, height: 45, borderRadius: '50%', overflow: 'hidden' }}>
                  <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#1a1a1a', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.5px' }}>
                    300 Arundel
                  </Typography>
                  <Typography sx={{ color: '#6FAF8F', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Learning Centre
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              {['Home', 'About', 'Programs', 'Testimonials', 'Contact'].map((item, index) => {
                const ids = ['', 'about', 'features', 'testimonials', 'contact'];
                const id = item === 'Home' ? '' : ids[index];
                return (
                  <motion.div key={item} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Button 
                      onClick={() => id ? document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' })} 
                      sx={{ 
                        color: '#333', 
                        fontWeight: 500, 
                        fontSize: '0.9rem',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          width: 0,
                          height: '2px',
                          background: '#6FAF8F',
                          transition: 'all 0.3s ease',
                          transform: 'translateX(-50%)',
                        },
                        '&:hover::after': {
                          width: '60%',
                        }
                      }}
                    >
                      {item}
                    </Button>
                  </motion.div>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AnimatedButton 
                onClick={() => navigate('/login')}
                sx={{ 
                  background: '#1a1a1a', 
                  color: 'white', 
                  px: 2.5, 
                  py: 1, 
                  fontWeight: 600, 
                  fontSize: '0.8rem',
                  borderRadius: '25px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  '&:hover': { background: '#333', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }
                }}
              >
                Staff Login
              </AnimatedButton>
              <AnimatedButton 
                onClick={() => navigate('/student-login')}
                sx={{ 
                  background: '#6FAF8F', 
                  color: 'white', 
                  px: 2.5, 
                  py: 1, 
                  fontWeight: 600, 
                  fontSize: '0.8rem',
                  borderRadius: '25px',
                  boxShadow: '0 4px 15px rgba(111, 175, 143, 0.3)',
                  '&:hover': { background: '#5FA08A', boxShadow: '0 6px 20px rgba(111, 175, 143, 0.4)' }
                }}
              >
                Student Portal
              </AnimatedButton>
              <AnimatedButton 
                onClick={() => navigate('/payment')} 
                sx={{ 
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)', 
                  color: 'white', 
                  px: 3, 
                  py: 1, 
                  fontWeight: 600, 
                  fontSize: '0.85rem',
                  borderRadius: '25px',
                  boxShadow: '0 4px 15px rgba(111, 175, 143, 0.3)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(111, 175, 143, 0.4)' }
                }}
              >
                Enroll Now
              </AnimatedButton>
              <Box sx={{ display: { xs: 'block', md: 'none' }}}>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button onClick={() => setMenuOpen(!menuOpen)} sx={{ color: '#333' }}>
                    <Menu />
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #faf9f7 0%, #f0efe9 50%, #e8e6df 100%)',
        pt: { xs: 12, md: 0 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating decorative elements */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '15%', left: '5%' }}
          >
            <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(111, 175, 143, 0.08)' }} />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '60%', right: '8%' }}
          >
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(111, 175, 143, 0.06)' }} />
          </motion.div>
        </Box>

        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <FadeIn>
                <Box>
                  <FadeIn delay={0.2}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Box sx={{ position: 'absolute', top: -20, left: 0, width: 80, height: 80, borderRadius: '50%', background: 'rgba(111, 175, 143, 0.1)' }} />
                    </Box>
                  </FadeIn>
                  <FadeIn delay={0.3}>
                    <Typography sx={{ color: '#6FAF8F', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', mb: 2 }}>
                      Welcome to
                    </Typography>
                  </FadeIn>
                  <FadeIn delay={0.4}>
                    <Box sx={{ fontWeight: 900, fontSize: { xs: '2.8rem', md: '4rem' }, color: '#1a1a1a', lineHeight: 1.1, mb: 3, fontFamily: 'Georgia, serif' }}>
                      <Box sx={{ display: 'block' }}>300 Arundel</Box>
                      <Box sx={{ color: '#6FAF8F' }}>Learning Centre</Box>
                    </Box>
                  </FadeIn>
                  <FadeIn delay={0.5}>
                    <Typography sx={{ color: '#666', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.8, maxWidth: 480, mb: 4, fontFamily: 'Georgia, serif' }}>
                      Nurturing minds, building character, and shaping the leaders of tomorrow through quality education and holistic development.
                    </Typography>
                  </FadeIn>
                  <FadeIn delay={0.6}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <AnimatedButton 
                        onClick={() => navigate('/payment')} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
                          color: 'white', 
                          px: 4, 
                          py: 1.5, 
                          fontWeight: 600, 
                          borderRadius: '25px',
                          boxShadow: '0 4px 15px rgba(111, 175, 143, 0.3)',
                          '&:hover': { boxShadow: '0 6px 20px rgba(111, 175, 143, 0.4)' }
                        }}
                      >
                        Start Enrollment
                      </AnimatedButton>
                      <AnimatedButton 
                        onClick={() => navigate('/parent-login')} 
                        sx={{ 
                          border: '2px solid #333', 
                          color: '#333', 
                          px: 4, 
                          py: 1.5, 
                          fontWeight: 600, 
                          borderRadius: '25px',
                          '&:hover': { background: 'rgba(0,0,0,0.02)' }
                        }}
                      >
                        Parent Portal
                      </AnimatedButton>
                    </Stack>
                  </FadeIn>
                </Box>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={6}>
              <FadeIn delay={0.2}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <FadeIn delay={0.3}>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      width: 400, 
                      height: 400, 
                      borderRadius: '50%', 
                      background: 'rgba(111, 175, 143, 0.1)',
                    }} />
                  </FadeIn>
                  <FadeIn delay={0.4}>
                    <Box sx={{ 
                      position: 'relative', 
                      display: 'inline-block', 
                      p: 4, 
                      borderRadius: '50%', 
                      background: 'white', 
                      boxShadow: '0 25px 60px rgba(0,0,0,0.1)',
                    }}>
                      <Box sx={{ width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                          <img 
                            src={schoolLogo} 
                            alt="School Logo" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  </FadeIn>
                  <FadeIn delay={0.6}>
                    <Box sx={{
                      position: 'absolute',
                      bottom: 20,
                      right: 0,
                      background: 'white',
                      p: 2,
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      display: { xs: 'none', md: 'block' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AnimatedIcon>
                          <Star sx={{ color: '#FFD700', fontSize: 28 }} />
                        </AnimatedIcon>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.1rem' }}>15+ Years</Typography>
                          <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>of Excellence</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </FadeIn>
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <FadeIn delay={i * 0.1}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '3rem' }, color: 'white', fontFamily: 'Georgia, serif' }}>
                      {stat.num}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: { xs: 8, md: 12 }, background: '#fff' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ color: '#6FAF8F', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                About Us
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, color: '#1a1a1a', fontFamily: 'Georgia, serif', mb: 3 }}>
                Building Futures Through Education
              </Typography>
              <Typography sx={{ color: '#666', maxWidth: 700, mx: 'auto', lineHeight: 1.9, fontSize: '1.05rem', fontFamily: 'Georgia, serif' }}>
                At 300 Arundel Learning Centre, we believe every child deserves access to quality education. 
                Our commitment to academic excellence, character development, and holistic growth has made us 
                a trusted name in education.
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={4}>
            {features.map((feature, i) => (
              <Grid item xs={12} md={4} key={i}>
                <FadeIn delay={i * 0.15}>
                  <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Card sx={{ 
                      height: '100%', 
                      borderRadius: '20px', 
                      p: 4, 
                      textAlign: 'center',
                      border: '1px solid #eee',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        borderColor: '#6FAF8F'
                      }
                    }}>
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <Box sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 70, 
                          height: 70, 
                          borderRadius: '50%', 
                          background: 'rgba(111, 175, 143, 0.1)',
                          mb: 3
                        }}>
                          <Box sx={{ color: '#6FAF8F', fontSize: '2rem' }}>{feature.icon}</Box>
                        </Box>
                      </motion.div>
                      <Typography sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2, fontFamily: 'Georgia, serif', fontSize: '1.25rem' }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: '#666', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
                        {feature.desc}
                      </Typography>
                    </Card>
                  </motion.div>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Programs Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, background: '#faf9f7' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ color: '#6FAF8F', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                Our Programs
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                Comprehensive Education for Every Level
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={4}>
            {['Primary', 'Secondary', 'Extracurricular'].map((program, i) => (
              <Grid item xs={12} md={4} key={i}>
                <FadeIn delay={0.1 * (i + 1)}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Card sx={{ 
                      borderRadius: '20px', 
                      overflow: 'hidden',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                      '&:hover': { boxShadow: '0 20px 45px rgba(0,0,0,0.12)' }
                    }}>
                      <Box sx={{ 
                        height: 200, 
                        background: i === 0 ? 'linear-gradient(135deg, #4a8c6f 0%, #6FAF8F 100%)' : i === 1 ? 'linear-gradient(135deg, #2d6a4f 0%, #4a8c6f 100%)' : 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'Georgia, serif' }}>{program}</Typography>
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ color: '#666', mb: 2, fontFamily: 'Georgia, serif' }}>
                          {i === 0 ? 'Building strong foundations with comprehensive basic education.' : i === 1 ? 'Preparing students for external examinations and higher education.' : 'Sports, arts, and clubs developing well-rounded students.'}
                        </Typography>
                        <Stack spacing={1}>
                          {(i === 0 ? ['Nursery', 'Primary 1-6'] : i === 1 ? ['JSS 1-3', 'SSS 1-3'] : ['Sports', 'Music & Drama', 'Debate Club']).map((item, idx) => (
                            <motion.div key={idx} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AnimatedIcon>
                                  <CheckCircle sx={{ color: '#6FAF8F', fontSize: 18 }} />
                                </AnimatedIcon>
                                <Typography sx={{ color: '#333', fontSize: '0.9rem' }}>{item}</Typography>
                              </Box>
                            </motion.div>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box id="testimonials" sx={{ py: { xs: 8, md: 12 }, background: '#fff' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography sx={{ color: '#6FAF8F', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                Testimonials
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                What Parents Say
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, i) => (
              <Grid item xs={12} md={4} key={i}>
                <FadeIn delay={i * 0.15}>
                  <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Card sx={{ 
                      height: '100%', 
                      borderRadius: '20px', 
                      p: 4, 
                      border: '1px solid #eee',
                      background: '#faf9f7',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        borderColor: '#6FAF8F'
                      }
                    }}>
                      <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                        {[1,2,3,4,5].map((s) => (
                          <AnimatedIcon key={s}>
                            <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                          </AnimatedIcon>
                        ))}
                      </Stack>
                      <Typography sx={{ color: '#555', lineHeight: 1.9, mb: 3, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                        "{testimonial.text}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Box sx={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography sx={{ color: 'white', fontWeight: 700 }}>{testimonial.name[0]}</Typography>
                          </Box>
                        </motion.div>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#1a1a1a' }}>{testimonial.name}</Typography>
                          <Typography sx={{ color: '#6FAF8F', fontSize: '0.85rem' }}>{testimonial.role}</Typography>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)' }}>
        <Container maxWidth="md">
          <FadeIn>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 800, color: 'white', mb: 3, fontFamily: 'Georgia, serif', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                Ready to Enroll Your Child?
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 500, mx: 'auto', fontSize: '1.1rem', fontFamily: 'Georgia, serif' }}>
                Take the first step towards giving your child a quality education that will shape their future.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <AnimatedButton 
                  onClick={() => navigate('/payment')} 
                  sx={{ 
                    background: '#6FAF8F', 
                    color: 'white', 
                    px: 5, 
                    py: 1.5, 
                    fontWeight: 700, 
                    borderRadius: '25px',
                    '&:hover': { background: '#5FA08A' }
                  }}
                >
                  Enroll Now
                </AnimatedButton>
                <AnimatedButton 
                  onClick={() => navigate('/contact')} 
                  sx={{ 
                    border: '2px solid white', 
                    color: 'white', 
                    px: 5, 
                    py: 1.5, 
                    fontWeight: 600, 
                    borderRadius: '25px',
                    '&:hover': { background: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Contact Us
                </AnimatedButton>
              </Stack>
            </Box>
          </FadeIn>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box id="contact" sx={{ py: { xs: 6, md: 8 }, background: '#faf9f7' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={5}>
              <FadeIn>
                <Typography sx={{ color: '#6FAF8F', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', mb: 2, fontSize: '0.85rem' }}>
                  Get in Touch
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 3, fontFamily: 'Georgia, serif', fontSize: '2rem' }}>
                  Contact Us
                </Typography>
                <Typography sx={{ color: '#666', mb: 4, lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
                  Have questions? We'd love to hear from you. Reach out to us through any of the channels below.
                </Typography>
                <Stack spacing={3}>
                  {[
                    { icon: <Phone />, label: 'Phone', value: '+234 XXX XXX XXXX' },
                    { icon: <Email />, label: 'Email', value: 'info@300arundel.edu' },
                    { icon: <LocationOn />, label: 'Location', value: 'Arundel, Nigeria' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AnimatedIcon>
                          <Box sx={{ 
                            width: 45, 
                            height: 45, 
                            borderRadius: '50%', 
                            background: 'rgba(111, 175, 143, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Box sx={{ color: '#6FAF8F' }}>{item.icon}</Box>
                          </Box>
                        </AnimatedIcon>
                        <Box>
                          <Typography sx={{ color: '#999', fontSize: '0.8rem' }}>{item.label}</Typography>
                          <Typography sx={{ color: '#1a1a1a', fontWeight: 600 }}>{item.value}</Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={7}>
              <FadeIn delay={0.2}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { label: 'Staff Login', path: '/login', bg: '#1a1a1a' },
                    { label: 'Student Portal', path: '/student-login', bg: '#1a1a1a' },
                    { label: 'Parent Portal', path: '/parent-login', bg: '#1a1a1a' },
                    { label: 'Pay Fees', path: '/payment', bg: 'linear-gradient(135deg, #6FAF8F 0%, #4a8c6f 100%)' },
                  ].map((btn, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Button 
                        onClick={() => navigate(btn.path)} 
                        sx={{ 
                          flex: '1 1 180px', 
                          py: 2.5, 
                          px: 3, 
                          borderRadius: '15px', 
                          background: btn.bg, 
                          color: 'white', 
                          fontWeight: 600,
                          '&:hover': { background: btn.bg === '#1a1a1a' ? '#333' : '#5FA08A' }
                        }}
                      >
                        {btn.label}
                      </Button>
                    </motion.div>
                  ))}
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, background: '#1a1a1a', borderTop: '1px solid #333' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden' }}>
                  <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
              </motion.div>
              <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
                © 2024 300 Arundel Learning Centre. All rights reserved.
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

export default LandingPage;
