import React, { useState, useEffect, useRef } from 'react';

// Custom smooth scroll function to match original UX
const smoothScrollTo = (targetPosition, duration) => {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

export default function App() {
  const [activeSection, setActiveSection] = useState('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('coding');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Theme state and toggle logic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fullscreen word animation loader states
  const [introProgress, setIntroProgress] = useState(0);
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [isIntroExiting, setIsIntroExiting] = useState(false);

  useEffect(() => {
    if (!isIntroActive) return;
    const interval = setInterval(() => {
      setIntroProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsIntroExiting(true);
            setTimeout(() => {
              setIsIntroActive(false);
            }, 850); // slide-up transition duration
          }, 800); // show "WELCOME" at 100% for 800ms
          return 100;
        }
        return prev + 1;
      });
    }, 60); // ~6s total loading animation (slower transitions)
    return () => clearInterval(interval);
  }, [isIntroActive]);

  const getIntroWord = (progress) => {
    if (progress < 14) return "HELLO";
    if (progress < 28) return "UI/UX DESIGN";
    if (progress < 42) return "FULLSTACK DEVELOPMENT";
    if (progress < 56) return "QA ENGINEERING";
    if (progress < 70) return "SOFTWARE ENGINEERING";
    if (progress < 85) return "I AM IQBAL APRIAND JUARTONO";
    return "WELCOME";
  };
  const currentIntroWord = getIntroWord(introProgress);
  
  // Mouse position state for spotlight glow
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isSpotlightHovered, setIsSpotlightHovered] = useState(false);

  // Modal Gallery state for Design projects
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');

  // High performance GPU-accelerated zoom/pan/swipe states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const isZoomed = scale > 1;
  const setIsZoomed = (val) => {
    if (!val) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    } else {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    }
  };

  const touchStartPos = useRef({ x: 0, y: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (scale === 1) {
      swipeStart.current = { x: clientX, y: clientY };
      return;
    }
    
    if (e.cancelable) e.preventDefault();
    
    setIsDragging(true);
    touchStartPos.current = { x: clientX - position.x, y: clientY - position.y };
    dragMoved.current = false;
  };

  const handlePointerMove = (e) => {
    if (scale === 1) return;
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - touchStartPos.current.x;
    const newY = clientY - touchStartPos.current.y;
    
    const container = containerRef.current;
    const img = imageRef.current;
    
    let boundedX = newX;
    let boundedY = newY;
    
    if (container && img) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const limitX = Math.max(0, (img.clientWidth * scale - containerWidth) / 2);
      const limitY = Math.max(0, (img.clientHeight * scale - containerHeight) / 2);
      
      boundedX = Math.max(-limitX, Math.min(limitX, newX));
      boundedY = Math.max(-limitY, Math.min(limitY, newY));
    }
    
    const distance = Math.sqrt(
      Math.pow(newX - position.x, 2) + Math.pow(newY - position.y, 2)
    );
    if (distance > 5) {
      dragMoved.current = true;
    }
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    
    if (scale === 1 && swipeStart.current.x !== 0) {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      
      const diffX = clientX - swipeStart.current.x;
      const diffY = clientY - swipeStart.current.y;
      
      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 100) {
        if (diffX > 0) {
          setSlideDirection('prev');
          setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1));
        } else {
          setSlideDirection('next');
          setCurrentImageIndex((prev) => (prev === selectedProject.images.length - 1 ? 0 : prev + 1));
        }
      }
      swipeStart.current = { x: 0, y: 0 };
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleImageClick = (e) => {
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    
    if (scale === 1) {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Words for typing animation in hero
  const words = ["Fullstack Dev", "Product Designer", "QA Engineer"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // Mouse move and hover listener for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.project-card') || 
        target.closest('.expertise-card') || 
        target.closest('.floating-badge') || 
        target.closest('.marquee-item') ||
        target.closest('.social-icon')
      ) {
        setIsSpotlightHovered(true);
      } else {
        setIsSpotlightHovered(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Typing animation loop
  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const fullWord = words[currentWordIndex];
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(80);

        if (currentText === fullWord) {
          timer = setTimeout(() => setIsDeleting(true), 2500);
          return;
        }
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(40);

        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProject) return;
      if (e.key === 'Escape') {
        setSelectedProject(null);
      } else if (e.key === 'ArrowRight' && selectedProject.images && selectedProject.images.length > 1) {
        setSlideDirection('next');
        setCurrentImageIndex((prev) => (prev === selectedProject.images.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'ArrowLeft' && selectedProject.images && selectedProject.images.length > 1) {
        setSlideDirection('prev');
        setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  // Lock body scroll when modal or intro is open
  useEffect(() => {
    if (selectedProject || isIntroActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject, isIntroActive]);

  // Reset zoom when project or slide changes
  useEffect(() => {
    setIsZoomed(false);
    setImgLoading(true);
  }, [selectedProject, currentImageIndex]);

  // Projects list
  const projects = [
    {
      id: 6,
      title: "UI/UX",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/UIUXX.png",
      description: "UI/UX mobile app design focusing on real-world problem solving, created for national competitions and professional portfolios.",
      link: "https://drive.google.com/file/d/19yDtoJ_cIgSxUag6gOZK14zJK1pDi9w9/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/UIUX.png",
        "/Portofolio/UI/UX 1.png",
        "/Portofolio/UI/UX 2.png",
        "/Portofolio/UI/UX 3.png",
        "/Portofolio/UI/UX 4.png",
        "/Portofolio/UI/UX 5.png",
        "/Portofolio/UI/UX 6.png"
      ],
      slideDescriptions: [
        "UI/UX Portfolio Cover - Interactive digital solution concept. Mobile application designs designed for national UI/UX competitions to solve everyday user problems through a user-centered design approach.",
        "UX Research & Wireframing: The research process started with the Empathize stage by interviewing target users to map their pain points. Based on these findings, I designed Low-Fidelity Wireframes in Figma to structure the layout first, ensuring logical information architecture and user flow before visual design.",
        "Thundr Grow & Figma Website: Interface design of an MSME business acceleration app (Thundr Grow) to simplify sales management, along with a modern, responsive personal portfolio landing page design built in Figma.",
        "TernakCare & Career Platform: UI/UX design exploration of a smart livestock management app (TernakCare) to track farm animals, and a project-based learning career development platform for university students.",
        "BiViTas & TrackHub: Digital school administration interface design (BiViTas) to monitor student data, and a real-time logistic delivery tracking app (TrackHub).",
        "Dark Theme UI Showcase: Dark Mode interface design exploration for various app pages, optimizing user visual comfort in low-light environments."
      ]
    },
    {
      id: 1,
      title: "Feeds",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Feeds.png",
      description: "A collection of aesthetic social media content designs for student organization promotions, freelance clients, and design contests.",
      link: "https://drive.google.com/file/d/1wLVgF1hyQv6PyaUJKsO_SLVFwequcZf8/view?usp=sharing",
      images: [
        "/Portofolio/Cover/Feeds.png",
        "/Portofolio/Feeds/Feeds 1.png",
        "/Portofolio/Feeds/Feeds 2.png",
        "/Portofolio/Feeds/Feeds 3.png",
        "/Portofolio/Feeds/Feeds 4.png",
        "/Portofolio/Feeds/Feeds 5.png"
      ],
      slideDescriptions: [
        "Feeds Portfolio Cover - A collection of social media visual designs categorized by publication purposes, ranging from campus organization branding to commercial product promotion.",
        "Feed Design for Campus Organizations: Specifically created for official student organization accounts. Focused on delivering event information in a clean, formal, yet modern and engaging manner.",
        "Feed Design for Client Projects (Freelance): Commercial designs to promote client products. Uses a minimalist visual approach and layouts that highlight product features to boost sales conversion.",
        "Feed Design for Competitions & Personal Exploration: Experimental projects to test dynamic layouts, bold typography, and high-contrast color combinations for graphic design contests.",
        "Seamless Carousel Design: Interactive layouts where images flow continuously across slides. Highly effective to increase visitor dwell-time on Instagram.",
        "Aesthetic Grid Template: Cohesive feed planning (puzzle or alternating layout) to ensure that the profile overall aesthetic looks consistent, professional, and matching."
      ]
    },
    {
      id: 2,
      title: "Poster",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Poster.png",
      description: "Creative poster designs with a modern, minimalist style for social campaigns, organizational events, and competition entries.",
      link: "https://drive.google.com/file/d/1rZGm7wWA3mtX1HZrVeFXZPH-c1SQlYQH/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/Poster.png",
        "/Portofolio/Poster/Poster 1.png",
        "/Portofolio/Poster/Poster 2.png",
        "/Portofolio/Poster/Poster 3.png",
        "/Portofolio/Poster/Poster 4.png",
        "/Portofolio/Poster/Poster 5.png",
        "/Portofolio/Poster/Poster 6.png"
      ],
      slideDescriptions: [
        "Poster Portfolio Cover - A collection of public and commercial poster designs with diverse visual themes.",
        "Educational & Campaign Posters: Infographics to share public info or social campaigns for campus organizations. Prioritizes clean layouts and high text readability.",
        "Competition & Artistic Posters: Dramatic posters utilizing advanced photo manipulation, created specifically for national poster design competitions.",
        "Client Event Promotion Posters: Made for webinars, concerts, or events. Visual emphasis is placed on guest stars, dates, and a clear Call-to-Action.",
        "Social Awareness Posters (Social Campaign): Designs with deep messages using symbolic illustrations to raise awareness on important issues like environment or mental health.",
        "Experimental Texturing Posters: Personal practice projects exploring grain textures, halftone effects, and retro-modern styles for unique poster aesthetics.",
        "Commercial Product Promotion Posters: Designs focusing on product photography paired with minimalist typography to attract buyers."
      ]
    },
    {
      id: 3,
      title: "Printing",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/printing.png",
      description: "Print media designs including brochures, promotional t-shirts, and stage banners for organization events and commercial clients.",
      link: "https://drive.google.com/file/d/1KkLQFGpxiSVWoWRzezyON1sifRBCVNqE/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/printing.png",
        "/Portofolio/Printing/Printing 1.png",
        "/Portofolio/Printing/Printing 2.png",
        "/Portofolio/Printing/Printing 3.png"
      ],
      slideDescriptions: [
        "Printing Portfolio Cover - A collection of print designs. Projects in this category are prepared in high-resolution CMYK color profiles to ensure sharp print output.",
        "Tri-fold Brochure Design: Informative organization brochure for recruitment, designed with accurate fold placement for easy reading.",
        "T-shirt & Merchandise Design: Screenprint-ready vector designs for community shirts and client business merchandise, emphasizing casual daily wear.",
        "Banners & Event Backdrops: Large-scale outdoor billboards and backdrops for campus event stages."
      ]
    },
    {
      id: 4,
      title: "Thumbnail",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Thumb.png",
      description: "High-resolution, eye-catching thumbnail designs to optimize click-through rates (CTR) on YouTube.",
      link: "https://drive.google.com/file/d/1F__Ii1wOpShC8EK5vEcfyluyxQBlVPw1/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/Thumb.png",
        "/Portofolio/Thumbnail/Thumbnail.png"
      ],
      slideDescriptions: [
        "Thumbnail Portfolio Cover - A collection of preview thumbnail designs for digital video content.",
        "YouTube Thumbnails (Client & Personal): Designed with high contrast, clear subject expressions, and bold short texts to make the videos stand out on the YouTube feed."
      ]
    },
    {
      id: 5,
      title: "NFT",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Product.png",
      description: "Digital artwork and unique character designs created for blockchain digital assets or client commissions.",
      link: "https://drive.google.com/file/d/1sxauHbbrU5zB8-hqWfAyU2lsg37lwm64/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/Product.png",
        "/Portofolio/NFT/NFT 1.png",
        "/Portofolio/NFT/NFT 2.png"
      ],
      slideDescriptions: [
        "NFT & Digital Art Portfolio Cover - Vector and raster-based digital art assets.",
        "Community NFT Collection: Character designs with science fiction and futuristic themes featuring unique accessories for community collections.",
        "Digital Art Commission: Custom character illustrations for personal profiles or commercial merchandise."
      ]
    },
    {
      id: 7,
      title: "Nutrify Scan",
      category: "coding",
      badge: "AI / FULLSTACK",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
      description: "Food nutrition detector web app using camera photos. Employs AI for personal health recommendations and calorie history tracking graphs.",
      link: "https://github.com/iqbalapriand",
      github: "https://github.com/iqbalapriand"
    },
    {
      id: 8,
      title: "Bookshelf API",
      category: "coding",
      badge: "BACKEND",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=450&fit=crop",
      description: "RESTful API for book data management built with Node.js and Hapi. Features book queries and automated test suite validation.",
      link: "https://github.com/iqbalapriand/bookshelf-api",
      github: "https://github.com/iqbalapriand/bookshelf-api"
    },
    {
      id: 9,
      title: "E-Commerce Market",
      category: "coding",
      badge: "FULLSTACK",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=450&fit=crop",
      description: "Responsive e-commerce site featuring a product catalog, interactive cart, automated price calculations, and secure user login.",
      link: "https://github.com/iqbalapriand/e-commerce",
      github: "https://github.com/iqbalapriand/e-commerce"
    },
    {
      id: 10,
      title: "OpenJob RESTful API",
      category: "coding",
      badge: "BACKEND",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=450&fit=crop",
      description: "Job board backend API built on Express.js. Manages jobseeker registrations, JWT login, job postings, and CV uploads.",
      link: "https://github.com/iqbalapriand/openjob-restful-api",
      github: "https://github.com/iqbalapriand/openjob-restful-api"
    },
    {
      id: 11,
      title: "Notes Login App",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=450&fit=crop",
      description: "Web note-taking app utilizing React JS and JWT authentication to securely store personal text entries.",
      link: "https://github.com/iqbalapriand/notes-login-app",
      github: "https://github.com/iqbalapriand/notes-login-app"
    },
    {
      id: 12,
      title: "Web Apotek",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=450&fit=crop",
      description: "Web-based pharmacy inventory system to track drug stock levels, daily transactions, and generate sales reports.",
      link: "https://github.com/iqbalapriand/web-apotek",
      github: "https://github.com/iqbalapriand/web-apotek"
    },
    {
      id: 13,
      title: "SmartFan IoT System",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=450&fit=crop",
      description: "IoT-based automatic smart fan built with C++ and temperature sensors. Automatically adjusts fan speed based on room temperature.",
      link: "https://github.com/iqbalapriand/smartfan-app",
      github: "https://github.com/iqbalapriand/smartfan-app"
    },
    {
      id: 14,
      title: "Game Development",
      category: "coding",
      badge: "UNITY / BLENDER",
      image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&h=450&fit=crop",
      description: "3D action game prototype built in Unity. Character and environment assets modeled in Blender, with custom mechanics programmed in C#.",
      link: "https://github.com/iqbalapriand",
      github: "https://github.com/iqbalapriand"
    },
    {
      id: 15,
      title: "Suwit Jawa Game",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=450&fit=crop",
      description: "Interactive traditional Javanese finger game (suwit Jawa) using HTML, CSS, and DOM manipulation logic.",
      link: "https://github.com/iqbalapriand/suwit-jawa",
      github: "https://github.com/iqbalapriand/suwit-jawa"
    },
    {
      id: 16,
      title: "Aplikasi Quiz",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=450&fit=crop",
      description: "Interactive web quiz app featuring an admin panel for question management, exam timers, and automatic score tallying.",
      link: "https://github.com/iqbalapriand/aplikasiquiz.io",
      github: "https://github.com/iqbalapriand/aplikasiquiz.io"
    },
    {
      id: 17,
      title: "CRUD Web Apps",
      category: "coding",
      badge: "REACT / JS",
      image: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=600&h=450&fit=crop",
      description: "A collection of React JS CRUD micro-applications built to practice state management and local storage data persistence.",
      link: "https://github.com/iqbalapriand",
      github: "https://github.com/iqbalapriand"
    }
  ];

  // Tech stack logo rows for scrolling marquee
  const row1 = [
    { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "React JS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" }
  ];

  const row2 = [
    { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "SQLite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
    { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg" },
    { name: "Supabase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
    { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "Photoshop", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg" },
    { name: "Illustrator", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-original.svg" },
    { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    { name: "VS Code", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
    { name: "Postman", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" }
  ];

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    const animatedElements = document.querySelectorAll(
      ".fade-up, .fade-left, .fade-right, .scale-up"
    );
    
    animatedElements.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.02}s`; // auto stagger
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, [activeFilter]); // re-run when filter changes to apply observer to filtered cards

  // Scroll listener for active link highlight and scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "about";

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute("id");
        }
      });

      setActiveSection(current);

      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const navbarHeight = 80;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      smoothScrollTo(targetPosition, 1000);
    }
    setMobileMenuOpen(false);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const filteredProjects = projects.filter(project => {
    return project.category === activeFilter;
  });

  return (
    <>
      {isIntroActive && (
        <div className={`intro-overlay ${isIntroExiting ? 'exiting' : ''}`}>
          {/* Top branding */}
          <div className="intro-header">
            <span className="font-semibold tracking-widest text-[12px] opacity-60">IQBAL APRIAND JUARTONO</span>
            <span className="font-mono text-[12px] opacity-60">PORTFOLIO ©2026</span>
          </div>

          {/* Main changing text */}
          <div className="intro-body">
            <div className="intro-glow"></div>
            <h1 key={currentIntroWord} className="intro-word-text">
              {currentIntroWord}
            </h1>
          </div>

          {/* Bottom minimal footer */}
          <div className="intro-footer flex justify-center">
            <span className="font-mono text-xs opacity-35 tracking-widest">INITIALIZING EXPERIENCE</span>
          </div>
        </div>
      )}

      <div className={`overflow-x-hidden spotlight-container ${isIntroActive ? 'h-screen overflow-hidden' : ''}`}>
        {/* Scroll to Top Button */}
        <button 
          id="scrollTopBtn" 
          onClick={handleScrollToTop}
          className={`scroll-top-btn ${showScrollTop ? 'show' : ''}`}
        >
          <i className="fas fa-arrow-up"></i>
        </button>

        {/* Spotlight Cursor Glow */}
        <div 
          className={`spotlight-glow ${isSpotlightHovered ? 'spotlight-active' : ''}`} 
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        ></div>

        {/* Glow Effects Background */}
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>

        {/* Navigation */}
        <nav 
          className="fixed w-full top-0 z-50 backdrop-blur-xl"
          style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--nav-border)" }}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="text-2xl font-bold nav-logo tracking-wide">Vaalls</div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-12">
                <a 
                  href="#about" 
                  onClick={(e) => handleNavLinkClick(e, '#about')}
                  className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                >
                  About
                </a>
                <a 
                  href="#experience" 
                  onClick={(e) => handleNavLinkClick(e, '#experience')}
                  className={`nav-link ${activeSection === 'experience' ? 'active' : ''}`}
                >
                  Experience
                </a>
                <a 
                  href="#projects" 
                  onClick={(e) => handleNavLinkClick(e, '#projects')}
                  className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                >
                  Projects
                </a>
                <a 
                  href="#skills" 
                  onClick={(e) => handleNavLinkClick(e, '#skills')}
                  className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`}
                >
                  Skills
                </a>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavLinkClick(e, '#contact')}
                  className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                >
                  Contact
                </a>

                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme} 
                  className="theme-toggle-btn"
                  aria-label="Toggle Theme"
                >
                  <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
                </button>
              </div>

              {/* Mobile Controls */}
              <div className="flex items-center space-x-4 md:hidden">
                {/* Theme Toggle Button (Mobile) */}
                <button 
                  onClick={toggleTheme} 
                  className="theme-toggle-btn"
                  aria-label="Toggle Theme"
                >
                  <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
                </button>

                {/* Hamburger Button (Mobile) */}
                <button 
                  id="menuBtn" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-2xl nav-hamburger"
                >
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
          </div>

        {/* Mobile Menu */}
        <div 
          id="mobileMenu"
          className={`md:hidden absolute top-full left-0 w-full bg-[#070708] border-t border-[rgba(255,255,255,0.08)] transition-all duration-300 ${
            mobileMenuOpen ? 'show opacity-100 pointer-events-auto transform translate-y-0' : 'opacity-0 pointer-events-none transform -translate-y-4'
          }`}
        >
          <div className="flex flex-col items-center py-6 space-y-6">
            <a 
              href="#about" 
              onClick={(e) => handleNavLinkClick(e, '#about')}
              className={`nav-link mobile-link ${activeSection === 'about' ? 'active' : ''}`}
            >
              About
            </a>
            <a 
              href="#experience" 
              onClick={(e) => handleNavLinkClick(e, '#experience')}
              className={`nav-link mobile-link ${activeSection === 'experience' ? 'active' : ''}`}
            >
              Experience
            </a>
            <a 
              href="#projects" 
              onClick={(e) => handleNavLinkClick(e, '#projects')}
              className={`nav-link mobile-link ${activeSection === 'projects' ? 'active' : ''}`}
            >
              Projects
            </a>
            <a 
              href="#skills" 
              onClick={(e) => handleNavLinkClick(e, '#skills')}
              className={`nav-link mobile-link ${activeSection === 'skills' ? 'active' : ''}`}
            >
              Skills
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavLinkClick(e, '#contact')}
              className={`nav-link mobile-link ${activeSection === 'contact' ? 'active' : ''}`}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="pt-32 pb-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-left">
              <p className="text-sm mb-4 accent-text">Hi, I am</p>
              <h1 className="text-6xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Iqbal Apriand Juartono</h1>
              <h2 className="text-3xl font-semibold mb-6 h-[40px] flex items-center">
                <span className="gradient-text">{currentText}</span>
                <span className="animate-pulse ml-1" style={{ color: "var(--text-primary)" }}>|</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8" style={{ fontSize: "15px", lineHeight: "1.8" }}>
                I'm an <span className="highlight-text">Informatics student</span> at <span className="highlight-text">Gunadarma University</span> with a strong background in <span className="highlight-text">Fullstack Development</span>, <span className="highlight-text">Product Design</span>, and <span className="highlight-text">QA Engineering</span>. I focus on engineering robust web applications, crafting intuitive interfaces in Figma, and ensuring high-quality software reliability from development to production.
              </p>
              
              {/* Social Icons */}
              <div className="flex gap-4 mb-8">
                <a href="https://github.com/iqbalapriand" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/iqbalapriand/" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://www.instagram.com/vaallstud/" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-dribbble"></i>
                </a>
                <a href="https://www.youtube.com/@vaallsyt" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4">
                <a 
                  href="#projects" 
                  onClick={(e) => handleNavLinkClick(e, '#projects')}
                  className="btn-primary"
                >
                  Projects <i className="fas fa-arrow-right"></i>
                </a>
                <a 
                  href="https://drive.google.com/drive/folders/1rU_Ak8fGHJS-QF4NkWFPtgOXnY59SCbo?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Resume <i className="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
            
            {/* Profile Image */}
            <div className="flex justify-center md:justify-end relative fade-right lg:pr-10">
              <div className="profile-container">
                {/* Background Glow */}
                <div className="profile-glow-blob"></div>
                
                {/* Outline Frame Box */}
                <div className="profile-frame-box"></div>
                
                {/* User Portrait Image */}
                <div className="profile-img-wrap">
                  <img src="img/Profile.png" alt="Iqbal Apriand Juartono" className="profile-img-element" />
                </div>
                
                {/* Floating Tech Badges */}
                <div className="floating-badge badge-ps">
                  <span className="font-sans font-bold text-[16px]">Ps</span>
                </div>
                
                <div className="floating-badge badge-js">
                  <i className="fab fa-js text-[18px]"></i>
                </div>
                
                <div className="floating-badge badge-github">
                  <i className="fab fa-github text-[18px]"></i>
                </div>
                
                <div className="floating-badge badge-vscode">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" className="w-5 h-5 object-contain" />
                </div>
                
                <div className="floating-badge badge-figma">
                  <i className="fab fa-figma text-[16px]"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="experience" className="py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <p className="section-subtitle">About Me</p>
            <h2 className="section-title gradient-text">My Core Expertise</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="expertise-card fade-up stagger-1">
              <div className="expertise-icon">
                <i className="fas fa-code text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Fullstack Dev</h3>
              <p className="text-gray-400 leading-relaxed">
                Building responsive, scalable web applications and high-fidelity interactive user interfaces with modern front-end technologies.
              </p>
            </div>
            
            <div className="expertise-card fade-up stagger-2">
              <div className="expertise-icon">
                <i className="fab fa-figma text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Product Designer</h3>
              <p className="text-gray-400 leading-relaxed">
                Designing user-centered mobile and web application layouts, wireframes, and interactive prototypes in Figma with a focus on problem-solving.
              </p>
            </div>

            <div className="expertise-card fade-up stagger-3">
              <div className="expertise-icon">
                <i className="fas fa-bug text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">QA Engineer</h3>
              <p className="text-gray-400 leading-relaxed">
                Ensuring software quality, writing automated test scripts, conducting manual verification, and maintaining high reliability standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <p className="section-subtitle">My Portfolio</p>
            <h2 className="section-title gradient-text">Featured Projects</h2>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-12 fade-up">
            <button 
              className={`filter-btn ${activeFilter === 'coding' ? 'active' : ''}`}
              onClick={() => setActiveFilter('coding')}
            >
              Coding
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'design' ? 'active' : ''}`}
              onClick={() => setActiveFilter('design')}
            >
              Design
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-3 gap-8" id="projectsGrid">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="project-card scale-up"
              >
                <div 
                  className={`project-image ${project.category === 'coding' ? 'flex items-center justify-center p-4' : ''}`}
                  style={project.category === 'coding' ? { background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-main) 100%)" } : {}}
                >
                  <span 
                    className={`project-badge ${project.category === 'coding' ? 'project-badge-coding' : ''}`}
                  >
                    {project.badge}
                  </span>
                  {project.category === 'coding' ? (
                    <div className="laptop-mockup-container">
                      <div className="laptop-screen">
                        <div className="laptop-camera"></div>
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="laptop-screen-content" 
                        />
                        <div className="laptop-screen-glass"></div>
                      </div>
                      <div className="laptop-base">
                        <div className="laptop-base-notch"></div>
                      </div>
                      <div className="laptop-shadow"></div>
                    </div>
                  ) : (
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover opacity-80" 
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <a 
                      href={project.link} 
                      target={project.category === 'coding' ? "_blank" : undefined}
                      rel={project.category === 'coding' ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        if (project.category === 'design' && project.images) {
                          e.preventDefault();
                          setSelectedProject(project);
                          setCurrentImageIndex(0);
                        }
                      }}
                      className="text-sm font-semibold inline-flex items-center gap-2 see-project-link cursor-pointer"
                    >
                      <i className={project.category === 'coding' ? "fas fa-external-link-alt" : "fas fa-images"}></i> See Project{project.category === 'design' ? 's' : ''}
                    </a>
                    {project.github && (
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-semibold inline-flex items-center gap-2 github-link"
                      >
                        <i className="fab fa-github"></i> GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="skills" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
          <div className="text-center fade-up">
            <p className="section-subtitle">Technologies I Work With</p>
            <h2 className="section-title gradient-text">Tech Stack</h2>
          </div>
        </div>
        
        {/* Infinite Scrolling Marquee Track 1 (Left) */}
        <div className="marquee-container mb-8 fade-up stagger-1">
          <div className="marquee-track marquee-scroll-left">
            {[...row1, ...row1, ...row1].map((tech, index) => (
              <div key={`row1-${index}`} className="marquee-item">
                <img src={tech.icon} alt={tech.name} loading="lazy" />
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Infinite Scrolling Marquee Track 2 (Right) */}
        <div className="marquee-container fade-up stagger-2">
          <div className="marquee-track marquee-scroll-right">
            {[...row2, ...row2, ...row2].map((tech, index) => (
              <div key={`row2-${index}`} className="marquee-item">
                <img src={tech.icon} alt={tech.name} loading="lazy" />
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <p className="section-subtitle">Let's Work Together</p>
            <h2 className="section-title gradient-text">Get In Touch</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            {/* Left Side */}
            <div className="fade-left">
              <h3 className="text-3xl font-bold mb-6">Let’s build something great</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Interested in collaborating, freelance work, or discussing a project?
                Just drop a message and I’ll get back to you as soon as possible.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center contact-icon-bg">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-semibold">iqbalapriand@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center contact-icon-bg">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-semibold">Depok, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Form */}
            <div className="fade-right">
              <form 
                action="https://formsubmit.co/iqbalapriand@gmail.com" 
                method="POST" 
                className="space-y-6"
              >
                {/* FormSubmit Config */}
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_subject" value="New Message from Portfolio" />
                <input type="hidden" name="_replyto" />

                <div className="grid md:grid-cols-2 gap-6">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Your Name" 
                    className="contact-input" 
                    required 
                  />

                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Your Email" 
                    className="contact-input" 
                    required 
                  />
                </div>

                <input 
                  type="text" 
                  name="subject" 
                  placeholder="Subject" 
                  className="contact-input" 
                  required 
                />

                <textarea 
                  name="message" 
                  rows="6" 
                  placeholder="Write your message here..." 
                  className="contact-input" 
                  required
                ></textarea>

                <button type="submit" className="send-btn">
                  Send Message
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              ©2026 Iqbal Apriand Juartono. All rights reserved.<br />
              <span className="text-xs">Built with ReactJS & TailwindCSS</span>
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/iqbalapriand" target="_blank" rel="noopener noreferrer" className="social-icon text-sm">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/iqbalapriand/" target="_blank" rel="noopener noreferrer" className="social-icon text-sm">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://www.instagram.com/vaallstud/" target="_blank" rel="noopener noreferrer" className="social-icon text-sm">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Design Portfolio Modal Gallery */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSelectedProject(null)}
        >
          {/* Close button with circular glassmorphism */}
          <button 
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white z-[110] backdrop-blur-md transition-all transform active:scale-95 focus:outline-none"
            onClick={() => setSelectedProject(null)}
          >
            <i className="fas fa-times text-lg"></i>
          </button>

          {/* Modal Content Wrapper */}
          <div 
            className="relative w-full max-w-5xl h-[90vh] md:h-[85vh] flex flex-col items-center justify-between p-2 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title and Counter */}
            <div className="flex flex-col items-center gap-1.5 mb-2 select-none text-center">
              <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/90 tracking-widest uppercase">
                {selectedProject.title}
              </span>
              <span className="text-sm font-medium text-zinc-400">
                {currentImageIndex === 0 ? "Cover / Judul" : `Desain ${currentImageIndex}`} — {currentImageIndex + 1} dari {selectedProject.images.length}
              </span>
              <span className="text-[10px] md:text-xs text-zinc-500 flex items-center gap-1.5">
                <i className="fas fa-search-plus"></i> {isZoomed ? "Klik/sentuh gambar untuk memperkecil" : "Klik/sentuh gambar untuk memperbesar detail"}
              </span>
            </div>

            {/* Main Area: Image and Navigation Buttons */}
            <div className="relative flex-1 w-full flex items-center justify-center group px-1">
              {/* Prev Button (Desktop only) */}
              {selectedProject.images.length > 1 && !isZoomed && (
                <button 
                  onClick={() => {
                    setSlideDirection('prev');
                    setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1));
                  }}
                  className="hidden md:flex absolute left-4 z-20 w-12 h-12 rounded-xl bg-black/40 hover:bg-zinc-900 border border-white/5 hover:border-white/20 items-center justify-center text-white/70 hover:text-white backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
                >
                  <i className="fas fa-chevron-left text-lg"></i>
                </button>
              )}

              {/* Image Container with dynamic slide direction and GPU zoom/pan */}
              <div 
                ref={containerRef}
                className="w-full h-full max-h-[50vh] md:max-h-[55vh] rounded-2xl bg-zinc-950/20 border border-white/10 shadow-2xl relative flex items-center justify-center overflow-hidden"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                {/* Background soft glow inside image wrapper */}
                {!isZoomed && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-0" 
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 70%)' }}
                  ></div>
                )}

                {/* Loading spinner */}
                {imgLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-zinc-950/40">
                    <div className="w-10 h-10 border-4 border-t-white border-white/20 rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Slide Wrapper for Slide Transition */}
                <div 
                  key={`${currentImageIndex}-${slideDirection}`}
                  className={`w-full h-full flex items-center justify-center gallery-slide-${slideDirection}`}
                >
                  <img 
                    ref={imageRef}
                    src={selectedProject.images[currentImageIndex]} 
                    alt={`${selectedProject.title} - ${currentImageIndex === 0 ? "Cover" : `Slide ${currentImageIndex}`}`}
                    decoding="async"
                    onLoad={() => setImgLoading(false)}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onClick={handleImageClick}
                    style={{
                      transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
                      transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      willChange: 'transform',
                      touchAction: scale > 1 ? 'none' : 'pan-y',
                    }}
                    className={`max-w-full max-h-full object-contain select-none z-10 ${
                      scale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                    }`}
                  />
                </div>
              </div>

              {/* Next Button (Desktop only) */}
              {selectedProject.images.length > 1 && !isZoomed && (
                <button 
                  onClick={() => {
                    setSlideDirection('next');
                    setCurrentImageIndex((prev) => (prev === selectedProject.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="hidden md:flex absolute right-4 z-20 w-12 h-12 rounded-xl bg-black/40 hover:bg-zinc-900 border border-white/5 hover:border-white/20 items-center justify-center text-white/70 hover:text-white backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
                >
                  <i className="fas fa-chevron-right text-lg"></i>
                </button>
              )}
            </div>

            {/* Footer Area: Pagination Indicator & Mobile Navigation */}
            {selectedProject.images.length > 1 && (
              <div className="flex items-center gap-4 mt-4 w-full justify-center select-none">
                {/* Mobile Prev Button */}
                {!isZoomed && (
                  <button 
                    onClick={() => {
                      setSlideDirection('prev');
                      setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1));
                    }}
                    className="flex md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-white/70 active:bg-white/10"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                )}

                {/* Pagination Dots */}
                <div className="flex gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  {selectedProject.images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        if (idx === currentImageIndex) return;
                        setSlideDirection(idx > currentImageIndex ? 'next' : 'prev');
                        setCurrentImageIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                      title={idx === 0 ? "Cover" : `Slide ${idx}`}
                    />
                  ))}
                </div>

                {/* Mobile Next Button */}
                {!isZoomed && (
                  <button 
                    onClick={() => {
                      setSlideDirection('next');
                      setCurrentImageIndex((prev) => (prev === selectedProject.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="flex md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-white/70 active:bg-white/10"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </>
  );
}
