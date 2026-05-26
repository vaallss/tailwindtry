import React, { useState, useEffect } from 'react';

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Mouse position state for spotlight glow
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  // Words for typing animation in hero
  const words = ["Designer & Web Developer", "UI/UX & Frontend Engineer", "Creative Thinker & Coder"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // Mouse move listener for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  // Projects list
  const projects = [
    {
      id: 1,
      title: "Feeds",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Feeds.png",
      description: "Social media feed designs with consistent visuals that enhance brand identity and user engagement.",
      link: "https://drive.google.com/file/d/1wLVgF1hyQv6PyaUJKsO_SLVFwequcZf8/view?usp=sharing"
    },
    {
      id: 2,
      title: "Poster",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Poster.png",
      description: "Creative poster designs with a modern and minimalist style for strong and aesthetic visual messaging.",
      link: "https://drive.google.com/file/d/1rZGm7wWA3mtX1HZrVeFXZPH-c1SQlYQH/view?usp=drive_link"
    },
    {
      id: 3,
      title: "Printing",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/printing.png",
      description: "High-quality print designs for branding and promotional needs—professional, eye-catching, and impactful.",
      link: "https://drive.google.com/file/d/1KkLQFGpxiSVWoWRzezyON1sifRBCVNqE/view?usp=drive_link"
    },
    {
      id: 4,
      title: "Thumbnail",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Thumb.png",
      description: "Eye-catching and consistent thumbnails that boost content appeal across digital and social platforms.",
      link: "https://drive.google.com/file/d/1F__Ii1wOpShC8EK5vEcfyluyxQBlVPw1/view?usp=drive_link"
    },
    {
      id: 5,
      title: "NFT",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Product.png",
      description: "Unique and illustrative NFT artworks designed for collectible digital assets with character and value.",
      link: "https://drive.google.com/file/d/1sxauHbbrU5zB8-hqWfAyU2lsg37lwm64/view?usp=drive_link"
    },
    {
      id: 6,
      title: "UI/UX",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/UIUXX.png",
      description: "User interface and experience designs that are intuitive, aesthetic, and focused on seamless interaction.",
      link: "https://drive.google.com/file/d/19yDtoJ_cIgSxUag6gOZK14zJK1pDi9w9/view?usp=drive_link"
    },
    {
      id: 7,
      title: "OpenJob RESTful API",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=450&fit=crop",
      description: "A robust and structured Node.js/Express RESTful API for job recruitment, handling user authentication and application flows.",
      link: "https://github.com/iqbalapriand/openjob-restful-api",
      github: "https://github.com/iqbalapriand/openjob-restful-api"
    },
    {
      id: 8,
      title: "Notes Login App",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=450&fit=crop",
      description: "A secure note-taking web application featuring React, JWT authentication, user registration, and clean session management.",
      link: "https://github.com/iqbalapriand/notes-login-app",
      github: "https://github.com/iqbalapriand/notes-login-app"
    },
    {
      id: 9,
      title: "Web Apotek",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=450&fit=crop",
      description: "Pharmacy inventory management web application for tracking medical stock, record-keeping, and transaction reports.",
      link: "https://github.com/iqbalapriand/web-apotek",
      github: "https://github.com/iqbalapriand/web-apotek"
    },
    {
      id: 10,
      title: "SmartFan IoT System",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=450&fit=crop",
      description: "An IoT system built with C++ for microcontrollers that dynamically adjusts cooling fan speeds based on real-time temperature data.",
      link: "https://github.com/iqbalapriand/smartfan-app",
      github: "https://github.com/iqbalapriand/smartfan-app"
    },
    {
      id: 11,
      title: "Suwit Jawa Game",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=450&fit=crop",
      description: "An interactive web game featuring classic Indonesian finger-matching suwit gameplay with animations and score tracking.",
      link: "https://github.com/iqbalapriand/suwit-jawa",
      github: "https://github.com/iqbalapriand/suwit-jawa"
    },
    {
      id: 12,
      title: "Aplikasi Quiz",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=450&fit=crop",
      description: "Interactive online quiz platform built using PHP and MySQL, complete with category management and grading system.",
      link: "https://github.com/iqbalapriand/aplikasiquiz.io",
      github: "https://github.com/iqbalapriand/aplikasiquiz.io"
    }
  ];

  // Tech stack logo rows for scrolling marquee
  const row1 = [
    { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "React JS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" }
  ];

  const row2 = [
    { name: "SQLite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
    { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg" },
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
    if (activeFilter === 'all') return true;
    return project.category === activeFilter;
  });

  return (
    <div className="overflow-x-hidden spotlight-container">
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
        className="spotlight-glow" 
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      ></div>

      {/* Glow Effects Background */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      {/* Navigation */}
      <nav 
        className="fixed w-full top-0 z-50 backdrop-blur-xl"
        style={{ background: "rgba(7, 7, 8, 0.9)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
      >
        <div className="max-w-[1400px] mx-auto px-10 py-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="text-2xl font-bold text-white tracking-wide">Vaalls</div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-12">
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
            </div>

            {/* Hamburger Button (Mobile) */}
            <button 
              id="menuBtn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white text-2xl"
            >
              <i className="fas fa-bars"></i>
            </button>
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
      <section id="about" className="pt-32 pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-left">
              <p className="text-sm mb-4 accent-text">Hi, I am</p>
              <h1 className="text-6xl font-bold mb-4" style={{ color: "#F1F5F9" }}>Iqbal Apriand J</h1>
              <h2 className="text-3xl font-semibold mb-6 h-[40px] flex items-center">
                <span className="gradient-text">{currentText}</span>
                <span className="text-white animate-pulse ml-1">|</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8" style={{ fontSize: "15px", lineHeight: "1.8" }}>
                I'm a <span className="text-white font-semibold">Designer</span> and <span className="text-white font-semibold">Web Developer</span> with experience in creating user-centered designs and modern web interfaces, specializing in UI/UX, visual consistency, and responsive web development to turn ideas into intuitive, functional digital experiences.
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
                  href="resume/Resume_Iqbal.pdf"
                  download="Resume_Iqbal.pdf"
                  className="btn-secondary"
                >
                  Resume <i className="fas fa-download"></i>
                </a>
              </div>
            </div>
            
            {/* Profile Image */}
            <div className="flex justify-center md:justify-end relative fade-right">
              <div className="profile-image">
                <img src="img/Profile.png" alt="Profile" className="w-full h-full object-cover" />
                <i className="fab fa-adobe profile-icons icon-ps"></i>
                <i className="fab fa-adobe profile-icons icon-ai"></i>
                <i className="fab fa-figma profile-icons icon-figma"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="experience" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <p className="section-subtitle">About Me</p>
            <h2 className="section-title gradient-text">My Dual Expertise</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="expertise-card fade-up stagger-1">
              <div className="expertise-icon">
                <i className="fas fa-code text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Web Developer</h3>
              <p className="text-gray-400 leading-relaxed">
                Building responsive, scalable web applications with modern technologies that deliver seamless user experiences and robust functionality.
              </p>
            </div>
            
            <div className="expertise-card fade-up stagger-2">
              <div className="expertise-icon">
                <i className="fas fa-palette text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Designer</h3>
              <p className="text-gray-400 leading-relaxed">
                Building user-centered UI/UX designs and graphics that deliver visually appealing content that meet brand guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <p className="section-subtitle">My Portfolio</p>
            <h2 className="section-title gradient-text">Featured Projects</h2>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-12 fade-up">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Projects
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'design' ? 'active' : ''}`}
              onClick={() => setActiveFilter('design')}
            >
              Design
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'coding' ? 'active' : ''}`}
              onClick={() => setActiveFilter('coding')}
            >
              Coding
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
                  className="project-image"
                  style={project.category === 'coding' ? { background: "linear-gradient(135deg, #FFFFFF 0%, #27272A 100%)" } : {}}
                >
                  <span 
                    className={`project-badge ${project.category === 'coding' ? 'project-badge-coding' : ''}`}
                  >
                    {project.badge}
                  </span>
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover opacity-80" 
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-semibold inline-flex items-center gap-2 see-project-link"
                    >
                      <i className="fas fa-external-link-alt"></i> See Project{project.category === 'design' ? 's' : ''}
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
      <section id="skills" className="py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16">
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
      <section id="contact" className="py-24 px-8">
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
      <footer className="py-8 px-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              ©2025 Iqbal Apriand. All rights reserved.<br />
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
    </div>
  );
}
