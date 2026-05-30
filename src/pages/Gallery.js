import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  PhotoLibrary,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import schoolLogo from '../assets/school logo imj/school-logo bck.png';

const allImages = [
  { src: '1.jpg', category: 'Events' },
  { src: '2.jpg', category: 'Events' },
  { src: '3.jpg', category: 'Events' },
  { src: '4.jpg', category: 'Events' },
  { src: '5.jpg', category: 'Events' },
  { src: '6.jpg', category: 'Events' },
  { src: '7.jpg', category: 'Events' },
  { src: '8.jpg', category: 'Events' },
  { src: '9.jpg', category: 'Events' },
  { src: '10.jpg', category: 'Events' },
  { src: '11.jpg', category: 'Events' },
  { src: '12.jpg', category: 'Events' },
  { src: '13.jpg', category: 'Events' },
  { src: '14.jpg', category: 'Events' },
  { src: '15.jpg', category: 'Events' },
  { src: '16.jpg', category: 'Events' },
  { src: '17.jpg', category: 'Events' },
  { src: '18.jpg', category: 'Events' },
  { src: '19.jpg', category: 'Events' },
  { src: '20.jpg', category: 'Events' },
  { src: '21.jpg', category: 'Events' },
  { src: '22.jpg', category: 'Events' },
  { src: '23.jpg', category: 'Events' },
  { src: '24.jpg', category: 'Events' },
  { src: '25.jpg', category: 'Events' },
  { src: '26.jpg', category: 'Events' },
  { src: '27.jpg', category: 'Events' },
  { src: '28.jpg', category: 'Events' },
  { src: '29.jpg', category: 'Events' },
  { src: '30.jpg', category: 'Events' },
  { src: '31.jpg', category: 'Events' },
  { src: '32.jpg', category: 'Events' },
  { src: '33.jpg', category: 'Events' },
  { src: '34.jpg', category: 'Events' },
  { src: '35.jpg', category: 'Events' },
  { src: '36.jpg', category: 'Events' },
  { src: '37.jpg', category: 'Events' },
  { src: '38.jpg', category: 'Events' },
  { src: '39.jpg', category: 'Events' },
  { src: '40.jpg', category: 'Events' },
  { src: '41.jpg', category: 'Events' },
  { src: '42.jpg', category: 'Events' },
  { src: '43.jpg', category: 'Events' },
  { src: '44.jpg', category: 'Events' },
  { src: '45.jpg', category: 'Events' },
  { src: '46.jpg', category: 'Events' },
  { src: '47.jpg', category: 'Events' },
  { src: '48.jpg', category: 'Events' },
  { src: '49.jpg', category: 'Events' },
  { src: '50.jpg', category: 'Events' },
  { src: '51.jpg', category: 'Events' },
  { src: '52.jpg', category: 'Events' },
  { src: '53.jpg', category: 'Events' },
  { src: 'classroom.jpg', category: 'Classrooms' },
  { src: 'computer-lab.jpg', category: 'Classrooms' },
  { src: 'library.jpg', category: 'Classrooms' },
  { src: 'science-lab.jpg', category: 'Classrooms' },
  { src: 'graduation.jpg', category: 'Events' },
  { src: 'sports-activity.jpg', category: 'Events' },
  { src: 'students-learning.jpg', category: 'Students' },
  { src: 'students-studying.jpg', category: 'Students' },
  { src: 'hero-school-1.jpg', category: 'Students' },
  { src: 'school-building.jpg', category: 'Buildings' },
  { src: 'school-campus.jpg', category: 'Buildings' },
];

const categories = ['All', 'Classrooms', 'Events', 'Students', 'Buildings'];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log('Gallery loaded, total images:', allImages.length);

  const filteredImages = activeCategory === 'All'
    ? allImages
    : allImages.filter((img) => img.category === activeCategory);

  console.log('Category:', activeCategory, '| Images:', filteredImages.length);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const getCategoryCount = (cat) => {
    return cat === 'All' ? allImages.length : allImages.filter((img) => img.category === cat).length;
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #faf9f7 0%, #f0efe9 100%)', pt: { xs: 10, md: 12 }, pb: 8 }}>
      {/* Header */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
              <Box sx={{ width: 45, height: 45, borderRadius: '50%', overflow: 'hidden' }}>
                <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#1a1a1a', fontWeight: 800, fontSize: '1rem' }}>300 Arundel</Typography>
                <Typography sx={{ color: '#6FAF8F', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Learning Limited</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => window.location.href = '/'} sx={{ color: '#333' }}>
              <Typography sx={{ fontWeight: 500 }}>Back to Home</Typography>
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Title Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2, px: 3, py: 1, borderRadius: '20px', background: 'rgba(111, 175, 143, 0.1)' }}>
              <PhotoLibrary sx={{ color: '#6FAF8F' }} />
              <Typography sx={{ color: '#6FAF8F', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Photo Gallery</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' }, color: '#1a1a1a', fontFamily: 'Georgia, serif', mb: 2 }}>
              Explore Our Campus Life
            </Typography>
            <Typography sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.8, fontSize: '1.05rem', fontFamily: 'Georgia, serif' }}>
              Discover the vibrant learning environment, state-of-the-art facilities, and memorable moments at 300 Arundel Learning Limited.
            </Typography>
          </motion.div>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 5, overflowX: 'auto', pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((category) => (
              <Box
                key={category}
                onClick={() => {
                  console.log('Category clicked:', category);
                  setActiveCategory(category);
                }}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  background: activeCategory === category ? '#6FAF8F' : '#fff',
                  color: activeCategory === category ? 'white' : '#666',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid',
                  borderColor: activeCategory === category ? '#6FAF8F' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': { background: activeCategory === category ? '#6FAF8F' : '#f5f5f5' },
                }}
              >
                <span>{category}</span>
                <Box sx={{ 
                  background: activeCategory === category ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  color: activeCategory === category ? 'white' : '#666',
                  borderRadius: '10px',
                  px: 1,
                  py: 0.25,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {getCategoryCount(category)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Images Grid using CSS */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3
        }}>
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div 
                key={image.src} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ duration: 0.3 }} 
                layout
              >
                <Box 
                  onClick={() => openLightbox(index)} 
                  sx={{ 
                    position: 'relative', 
                    paddingTop: '75%', 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-5px) scale(1.02)', 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.18)', 
                      '& img': { transform: 'scale(1.1)' }, 
                      '& .overlay': { opacity: 1 } 
                    } 
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#f5f5f5' }}>
                    <img 
                      src={`/images/${image.src}`} 
                      alt={image.category} 
                      loading="lazy"
                      onLoad={() => console.log('Loaded:', image.src)}
                      onError={(e) => console.error('Failed:', image.src, e)}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        transition: 'transform 0.4s ease' 
                      }} 
                    />
                  </Box>
                  <Box className="overlay" sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', 
                    opacity: 0, 
                    transition: 'opacity 0.3s ease', 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    p: 2 
                  }}>
                    <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{image.category}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography sx={{ color: '#999', fontSize: '0.9rem' }}>
            Showing {filteredImages.length} of {allImages.length} images
            {activeCategory !== 'All' && ` in ${activeCategory}`}
          </Typography>
        </Box>
      </Container>

      {/* Lightbox */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: lightboxOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 20, right: 20, color: 'white', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
          <Close />
        </IconButton>
        {filteredImages.length > 1 && (
          <>
            <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 20, color: 'white', background: 'rgba(0,0,0,0.5)' }}><ChevronLeft /></IconButton>
            <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 20, color: 'white', background: 'rgba(0,0,0,0.5)' }}><ChevronRight /></IconButton>
          </>
        )}
        {filteredImages[currentImageIndex] && (
          <img 
            src={`/images/${filteredImages[currentImageIndex].src}`} 
            alt={filteredImages[currentImageIndex].category}
            style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} 
          />
        )}
        <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', px: 2, py: 1, borderRadius: '20px' }}>
          <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>{currentImageIndex + 1} / {filteredImages.length}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Gallery;
