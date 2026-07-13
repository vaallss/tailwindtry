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
  const [activeFilter, setActiveFilter] = useState('design');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
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
  const words = ["UI/UX Designer", "Creative Designer", "UI/UX Developer"];
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

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
      description: "Perancangan UI/UX aplikasi mobile yang berfokus pada problem solving nyata, dibuat untuk kebutuhan lomba tingkat nasional dan portofolio profesional.",
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
        "Cover Portofolio UI/UX - Konsep solusi digital interaktif. Proyek ini merupakan hasil perancangan desain aplikasi mobile yang diikutsertakan dalam kompetisi UI/UX tingkat nasional, di mana tantangannya adalah memecahkan problem nyata pengguna sehari-hari lewat pendekatan user-centered design.",
        "UX Research & Wireframing: Proses riset dimulai dari tahap Empathize dengan mewawancarai target pengguna untuk memetakan pain points mereka. Berdasarkan temuan ini, saya merancang Low-Fidelity Wireframes di Figma untuk menyusun tata letak kasarnya terlebih dahulu, memastikan arsitektur informasi dan user flow berjalan logis sebelum masuk to visual design.",
        "TemanCare Mobile App Design - High Fidelity UI: Halaman utama dan fitur pelacak kesehatan mental yang intuitif, dirancang dengan pendekatan user-centered untuk mempermudah akses konsultasi dan jurnal harian pengguna.",
        "TrackHub Logistics App Design - High Fidelity UI: Tampilan dashboard dan pelacakan kurir real-time untuk aplikasi logistik, mengoptimalkan efisiensi manajemen pengiriman barang bagi pengguna personal maupun bisnis.",
        "UMORA & SiaGas App Design: Eksplorasi antarmuka aplikasi pemesanan layanan rumah tangga (UMORA) dan aplikasi tanggap darurat bencana (SiaGas) dengan tata letak yang bersih dan navigasi cepat.",
        "Nutrify & KreatifCloud Dashboard Design: Perancangan dashboard web untuk analisis nutrisi harian (Nutrify) dan manajemen proyek kreatif kolaboratif (KreatifCloud) dengan visualisasi data yang informatif.",
        "Final Design Showcase: Tampilan komprehensif dari seluruh screen utama aplikasi yang menunjukkan alur perjalanan pengguna (user journey) yang mulus dari awal hingga akhir."
      ]
    },
    {
      id: 1,
      title: "Feeds",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Feeds.png",
      description: "Kumpulan desain konten media sosial yang estetik untuk kebutuhan promosi organisasi mahasiswa, klien freelance, dan lomba.",
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
        "Cover Portofolio Feeds - Kumpulan karya desain visual media sosial. Di sini saya mengelompokkan desain feed berdasarkan tujuan publikasinya, mulai dari branding organisasi kampus hingga promosi produk komersial.",
        "Desain Feed untuk Kebutuhan Organisasi Kampus: Dibuat khusus untuk akun media sosial resmi organisasi mahasiswa. Fokus utamanya adalah penyampaian informasi kegiatan yang rapi, formal, namun tetap terlihat kekinian dan menarik minat mahasiswa lain.",
        "Desain Feed untuk Proyek Klien (Freelance): Desain komersial untuk mempromosikan produk klien. Menggunakan pendekatan visual minimalis dan penataan layout yang menonjolkan keunggulan produk untuk meningkatkan konversi penjualan.",
        "Desain Feed untuk Lomba & Eksplorasi Mandiri: Proyek eksperimental untuk menguji ide-ide layout baru yang lebih dinamis, tipografi yang berani (bold typography), serta kombinasi warna yang kontras untuk lomba desain grafis.",
        "Desain Carousel Menyambung (Seamless Carousel): Teknik layout interaktif di mana gambar berlanjut tanpa putus saat digeser. Efektif banget untuk menaikkan dwell-time (waktu bertahan) pengunjung di akun Instagram.",
        "Aesthetic Grid Template: Perancangan visual feed secara keseluruhan (puzzle/alternating layout) supaya ketika profil Instagram dikunjungi, tampilan keseluruhan feed terlihat senada, profesional, dan estetik."
      ]
    },
    {
      id: 2,
      title: "Poster",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Poster.png",
      description: "Desain poster kreatif dengan gaya modern dan minimalis untuk keperluan kampanye sosial, acara organisasi, dan proyek lomba.",
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
        "Cover Portofolio Poster - Kumpulan karya desain poster publik dan komersial dengan berbagai tema visual.",
        "Poster Edukasi & Kampanye Organisasi: Poster infografis untuk menyebarkan info publik atau materi kampanye sosial dari organisasi kampus. Mengedepankan tata letak yang bersih dan keterbacaan teks yang tinggi.",
        "Poster Perlombaan / Eksplorasi Seni: Karya poster dengan visualisasi dramatis dan manipulasi foto tingkat lanjut (photo manipulation) yang dibuat khusus untuk bersaing di kompetisi desain poster nasional.",
        "Poster Promosi Acara Klien: Dibuat untuk klien komersial yang sedang mengadakan webinar atau konser. Penekanan visual ada pada nama pembicara/bintang tamu, waktu acara, serta Call-to-Action (pembelian tiket) yang jelas.",
        "Poster Kesadaran Sosial (Social Campaign): Desain dengan pesan mendalam menggunakan ilustrasi simbolis untuk meningkatkan kesadaran masyarakat terhadap isu-isu penting seperti lingkungan atau kesehatan mental.",
        "Poster Eksperimental Texturing: Proyek latihan mandiri mengeksplorasi penggunaan grain textures, efek halftone, dan gaya retro modern untuk menciptakan estetika poster yang unik.",
        "Poster Promosi Produk Komersial: Desain yang berfokus pada keindahan produk (product photography) dipadukan dengan tipografi minimalis untuk menarik perhatian calon pembeli."
      ]
    },
    {
      id: 3,
      title: "Printing",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/printing.png",
      description: "Desain media cetak seperti brosur, kaos promosi, dan banner panggung untuk event organisasi maupun klien bisnis.",
      link: "https://drive.google.com/file/d/1KkLQFGpxiSVWoWRzezyON1sifRBCVNqE/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/printing.png",
        "/Portofolio/Printing/Printing 1.png",
        "/Portofolio/Printing/Printing 2.png",
        "/Portofolio/Printing/Printing 3.png"
      ],
      slideDescriptions: [
        "Cover Portofolio Printing - Kumpulan desain cetak. Proyek di kategori ini disiapkan dengan format warna CMYK dan resolusi tinggi agar hasil cetaknya tajam dan tidak pecah saat masuk ke percetakan.",
        "Desain Brosur Lipat Tiga Organisasi: Brosur profil organisasi untuk dibagikan saat penerimaan anggota baru. Desain dibuat informatif dengan pembagian lipatan yang pas agar nyaman dibaca dan tidak membingungkan.",
        "Desain Kaos & Merchandise Klien: Desain grafis siap sablon (vektor) untuk kaos komunitas dan merchandise promosi bisnis klien, mengutamakan estetika yang kasual agar nyaman dipakai harian.",
        "Desain Spanduk & Banner Event: Desain baliho outdoor skala besar untuk promosi acara di jalan raya serta banner backdrop panggung event organisasi kampus."
      ]
    },
    {
      id: 4,
      title: "Thumbnail",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Thumb.png",
      description: "Desain thumbnail video digital yang mencolok dan beresolusi tinggi untuk meningkatkan CTR (Click-Through Rate) di YouTube.",
      link: "https://drive.google.com/file/d/1F__Ii1wOpShC8EK5vEcfyluyxQBlVPw1/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/Thumb.png",
        "/Portofolio/Thumbnail/Thumbnail.png"
      ],
      slideDescriptions: [
        "Cover Portofolio Thumbnail - Kumpulan desain gambar pratinjau (thumbnail) untuk konten video digital.",
        "YouTube Thumbnail (Klien & Proyek Pribadi): Didesain dengan kontras warna yang sangat tinggi, ekspresi subjek yang diperjelas, dan teks ringkas berukuran besar agar video menonjol di halaman beranda YouTube."
      ]
    },
    {
      id: 5,
      title: "NFT",
      category: "design",
      badge: "DESIGN",
      image: "Thumbnail/Product.png",
      description: "Karya seni digital dan ilustrasi karakter unik yang dirancang khusus untuk aset digital di blockchain atau proyek klien.",
      link: "https://drive.google.com/file/d/1sxauHbbrU5zB8-hqWfAyU2lsg37lwm64/view?usp=drive_link",
      images: [
        "/Portofolio/Cover/Product.png",
        "/Portofolio/NFT/NFT 1.png",
        "/Portofolio/NFT/NFT 2.png"
      ],
      slideDescriptions: [
        "Cover Portofolio NFT & Digital Art - Kumpulan aset seni digital berbasis vektor dan raster.",
        "Koleksi NFT Komunitas: Desain karakter bertema fiksi ilmiah dan futuristik dengan variasi aksesoris unik untuk koleksi digital komunitas.",
        "Digital Art Commission (Klien): Ilustrasi karakter kustom yang dipesan oleh klien untuk kebutuhan profil pribadi atau merchandise dengan lisensi komersial."
      ]
    },
    {
      id: 7,
      title: "Nutrify Scan",
      category: "coding",
      badge: "AI / FULLSTACK",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
      description: "Aplikasi web full-stack pendeteksi nutrisi makanan. Sistem ini menggunakan model deep learning (CNN) untuk mendeteksi jenis makanan dari foto kamera, lalu memanfaatkan Google Gemini AI untuk memberikan rekomendasi kesehatan personal, lengkap dengan visualisasi grafik riwayat kalori pengguna.",
      link: "https://github.com/iqbalapriand",
      github: "https://github.com/iqbalapriand"
    },
    {
      id: 8,
      title: "Bookshelf API",
      category: "coding",
      badge: "BACKEND",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=450&fit=crop",
      description: "RESTful API bersih dan teruji untuk manajemen buku digital. Dibuat menggunakan Node.js dengan framework Hapi, memiliki fitur validasi request yang ketat, operasi CRUD lengkap, pencarian buku berdasarkan status, serta pengujian otomatis menggunakan Postman untuk menjamin keandalan API.",
      link: "https://github.com/iqbalapriand/bookshelf-api",
      github: "https://github.com/iqbalapriand/bookshelf-api"
    },
    {
      id: 9,
      title: "E-Commerce Market",
      category: "coding",
      badge: "FULLSTACK",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=450&fit=crop",
      description: "Website e-commerce responsif dengan fitur lengkap. Menyediakan katalog produk dinamis, keranjang belanja interaktif, kalkulasi harga otomatis, serta sistem autentikasi sesi user yang aman untuk mensimulasikan alur belanja online nyata.",
      link: "https://github.com/iqbalapriand/e-commerce",
      github: "https://github.com/iqbalapriand/e-commerce"
    },
    {
      id: 10,
      title: "OpenJob RESTful API",
      category: "coding",
      badge: "BACKEND",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=450&fit=crop",
      description: "Backend API untuk platform rekrutmen kerja online. Dibangun menggunakan Express.js dan database relasional, menangani pendaftaran pelamar kerja, autentikasi JWT, sistem kelola lowongan oleh admin perusahaan, serta pengunggahan file CV.",
      link: "https://github.com/iqbalapriand/openjob-restful-api",
      github: "https://github.com/iqbalapriand/openjob-restful-api"
    },
    {
      id: 11,
      title: "Notes Login App",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=450&fit=crop",
      description: "Aplikasi catatan digital aman berbasis web. Menggunakan React JS untuk antarmuka pengguna yang responsif, terintegrasi dengan autentikasi JSON Web Token (JWT) pada sisi client untuk memastikan catatan hanya bisa diakses oleh pemiliknya.",
      link: "https://github.com/iqbalapriand/notes-login-app",
      github: "https://github.com/iqbalapriand/notes-login-app"
    },
    {
      id: 12,
      title: "Web Apotek",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=450&fit=crop",
      description: "Sistem informasi inventory apotek berbasis web. Membantu apoteker melacak stok obat masuk dan keluar, mencatat transaksi harian, serta menghasilkan laporan penjualan bulanan secara otomatis guna meminimalkan kesalahan pencatatan manual.",
      link: "https://github.com/iqbalapriand/web-apotek",
      github: "https://github.com/iqbalapriand/web-apotek"
    },
    {
      id: 13,
      title: "SmartFan IoT System",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=450&fit=crop",
      description: "Sistem IoT pengatur kecepatan kipas angin otomatis. Dibuat menggunakan mikrokontroler (C++) dan sensor suhu. Sistem akan membaca suhu ruangan secara real-time lalu otomatis mengatur kecepatan kipas lewat modul driver motor agar hemat energi.",
      link: "https://github.com/iqbalapriand/smartfan-app",
      github: "https://github.com/iqbalapriand/smartfan-app"
    },
    {
      id: 14,
      title: "Game Development",
      category: "coding",
      badge: "UNITY / BLENDER",
      image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&h=450&fit=crop",
      description: "Proyek demo game aksi 3D menggunakan Unity Engine. Seluruh aset lingkungan (environment) dan karakter dalam game dimodelkan dari nol memakai Blender, kemudian diprogram pergerakannya menggunakan bahasa C# di Unity.",
      link: "https://github.com/iqbalapriand",
      github: "https://github.com/iqbalapriand"
    },
    {
      id: 15,
      title: "Suwit Jawa Game",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=450&fit=crop",
      description: "Game interaktif sederhana adaptasi dari permainan tradisional suwit Jawa. Dikembangkan dengan HTML5, CSS3, dan Vanilla JavaScript untuk melatih logika manipulasi DOM, lengkap dengan animasi interaktif dan sistem pencatat skor.",
      link: "https://github.com/iqbalapriand/suwit-jawa",
      github: "https://github.com/iqbalapriand/suwit-jawa"
    },
    {
      id: 16,
      title: "Aplikasi Quiz",
      category: "coding",
      badge: "CODING",
      image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&h=450&fit=crop",
      description: "Platform ujian online interaktif untuk sekolah atau komunitas. Dikembangkan menggunakan PHP native dan database MySQL, memiliki dashboard khusus admin untuk membuat bank soal, mengatur durasi kuis, serta rekapitulasi nilai otomatis.",
      link: "https://github.com/iqbalapriand/aplikasiquiz.io",
      github: "https://github.com/iqbalapriand/aplikasiquiz.io"
    },
    {
      id: 17,
      title: "CRUD Web Apps",
      category: "coding",
      badge: "REACT / JS",
      image: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=600&h=450&fit=crop",
      description: "Kumpulan aplikasi manajemen data (CRUD) menggunakan React JS. Berfokus pada implementasi state management lokal (useState/useReducer), validasi form sisi klien, serta integrasi penyimpanan lokal (localStorage) untuk persistensi data.",
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
        className={`spotlight-glow ${isSpotlightHovered ? 'spotlight-active' : ''}`} 
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
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5">
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
      <section id="about" className="pt-32 pb-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-left">
              <p className="text-sm mb-4 accent-text">Hi, I am</p>
              <h1 className="text-6xl font-bold mb-4" style={{ color: "#F1F5F9" }}>Iqbal Apriand Juartono</h1>
              <h2 className="text-3xl font-semibold mb-6 h-[40px] flex items-center">
                <span className="gradient-text">{currentText}</span>
                <span className="text-white animate-pulse ml-1">|</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8" style={{ fontSize: "15px", lineHeight: "1.8" }}>
                I'm an <span className="text-white font-semibold">Informatics student</span> at <span className="text-white font-semibold">Gunadarma University</span> with hands-on experience across <span className="text-white font-semibold">UI/UX design</span>, <span className="text-white font-semibold">graphic design</span>, and <span className="text-white font-semibold">web development</span>. I enjoy working at the intersection of design and code — crafting interfaces that look great and work well, from initial wireframes in Figma through to production-ready front-end implementation.
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
                  href="/resume/CV_Iqbal_Apriand_Juartono.pdf"
                  download="CV_Iqbal_Apriand_Juartono.pdf"
                  className="btn-secondary"
                >
                  Resume <i className="fas fa-download"></i>
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
                
                <div className="floating-badge badge-pr">
                  <span className="font-sans font-bold text-[16px]">Pr</span>
                </div>
                
                <div className="floating-badge badge-ai">
                  <span className="font-sans font-bold text-[16px]">Ai</span>
                </div>
                
                <div className="floating-badge badge-code">
                  <i className="fas fa-code text-[16px]"></i>
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
              <h3 className="text-2xl font-bold mb-4">Fullstack Developer</h3>
              <p className="text-gray-400 leading-relaxed">
                Building responsive, scalable web applications and high-fidelity interactive user interfaces with modern front-end technologies.
              </p>
            </div>
            
            <div className="expertise-card fade-up stagger-2">
              <div className="expertise-icon">
                <i className="fab fa-figma text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">UI/UX Designer</h3>
              <p className="text-gray-400 leading-relaxed">
                Designing user-centered mobile and web application layouts, wireframes, and interactive prototypes in Figma with a focus on problem-solving.
              </p>
            </div>

            <div className="expertise-card fade-up stagger-3">
              <div className="expertise-icon">
                <i className="fas fa-palette text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Creative Designer</h3>
              <p className="text-gray-400 leading-relaxed">
                Crafting visually stunning graphic designs, media feeds, posters, merchandise, and digital art that follow professional branding guidelines.
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

            {/* Slide-specific detailed description overlay */}
            {selectedProject.slideDescriptions?.[currentImageIndex] && !isZoomed && (
              <div className="w-full max-w-3xl mt-4 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-center transition-all duration-300">
                <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                  {selectedProject.slideDescriptions[currentImageIndex]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
