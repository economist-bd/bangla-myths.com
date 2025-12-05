import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  LogOut, 
  Menu,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

// Firebase Imports (Standard Package Imports)
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from "firebase/firestore";

// --- ফায়ারবেস সেটআপ ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyCDr8j4mCOZnygHnw8qnmHm_-5SasuqhvY",
      authDomain: "sample-firebase-ai-app-e155b.firebaseapp.com",
      databaseURL: "https://sample-firebase-ai-app-e155b-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "sample-firebase-ai-app-e155b",
      storageBucket: "sample-firebase-ai-app-e155b.firebasestorage.app",
      messagingSenderId: "189674121794",
      appId: "1:189674121794:web:7c6d901ee3d882980e9bdb",
      measurementId: "G-BCMZ2MYZT1"
    };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- বিশাল মক ডেটা (২৫+ নতুন মিথ সহ) ---
const INITIAL_MYTHS = [
  {
    title: "জোড়া কলা খেলে যমজ বাচ্চা হয়",
    description: "অনেকের ধারণা, কেউ যদি জোড়া লাগানো কলা খায়, তবে ভবিষ্যতে তার যমজ সন্তান হবে। এটি সম্পূর্ণ অবৈজ্ঞানিক।",
    category: "খাবার",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600",
    isSlider: true
  },
  {
    title: "রাতে ঘর ঝাড়ু দিলে লক্ষ্মী চলে যায়",
    description: "রাতে ঘর ঝাড়ু দিলে নাকি ঘরের বরকত কমে যায়। আসলে আগে বিদ্যুৎ ছিল না বলে ছোট জিনিস হারানোর ভয়ে এটি বলা হতো।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=600",
    isSlider: true
  },
  {
    title: "কাক ডাকলে মেহমান আসে",
    description: "বাড়ির চালে বা বারান্দায় কাক ডাকলে সেদিন বাড়িতে কোনো অতিথি আসার সম্ভাবনা থাকে বলে মনে করা হয়।",
    category: "প্রকৃতি",
    image: "https://images.unsplash.com/photo-1555663784-5a91ae19f94d?auto=format&fit=crop&q=80&w=600",
    isSlider: true
  },
  {
    title: "পরীক্ষার আগে ডিম খাওয়া অশুভ",
    description: "ডিম খেলে পরীক্ষায় 'গোল্লা' বা শূন্য পাবে - এই ভয়ে অনেক শিক্ষার্থী পরীক্ষার আগে ডিম এড়িয়ে চলে।",
    category: "শিক্ষা",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "দাঁত পড়লে ইঁদুরের গর্তে ফেলা",
    description: "দাঁত ইঁদুরের গর্তে ফেললে নাকি নতুন দাঁত ইঁদুরের দাঁতের মতো মজবুত হয়।",
    category: "শারীরিক",
    image: "https://images.unsplash.com/photo-1599687267812-35c05ff70ee9?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "হাতের তালু চুলকালে টাকা আসে",
    description: "ডান হাতের তালু চুলকালে টাকা আসে এবং বাম হাতের তালু চুলকালে টাকা খরচ হয়।",
    category: "ভাগ্য",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "বিড়াল রাস্তা পার হলে যাত্রা অশুভ",
    description: "বিড়াল রাস্তা কাটলে অনেকে কিছুক্ষণ অপেক্ষা করেন বা পিছিয়ে যান।",
    category: "যাত্রা",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "দুধ ও আনারস একসাথে খেলে বিষ হয়",
    description: "দুধ এবং আনারস একসাথে খেলে মানুষ মারা যায় - এটি একটি ভুল ধারণা। এসিডিটি হতে পারে, তবে বিষ নয়।",
    category: "খাবার",
    image: "https://images.unsplash.com/photo-1589820296156-2454bb8a6d54?auto=format&fit=crop&q=80&w=600",
    isSlider: true
  },
  {
    title: "নিশি ডাক",
    description: "রাতে কেউ নাম ধরে তিনবার না ডাকলে সাড়া দিতে নেই, একে নিশি ডাক বা অশুভ আত্মার ডাক বলা হয়।",
    category: "ভৌতিক",
    image: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?auto=format&fit=crop&q=80&w=600",
    isSlider: true
  },
  {
    title: "মাছের মাথা খেলে বুদ্ধি বাড়ে",
    description: "শিশুদের মাছের মাথা খাওয়ানো হয় এই বিশ্বাসে যে এতে মেধা বিকশিত হয়।",
    category: "খাবার",
    image: "https://images.unsplash.com/photo-1615141982880-1313d443a3ec?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "রাতে নখ কাটতে নেই",
    description: "রাতে নখ কাটলে অমঙ্গল হয়। আসলে আগে আলো কম ছিল বলে নখ কাটতে গিয়ে চামড়া কাটার ভয়ে বারণ করা হতো।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "শূন্য ঘরে কাঁচি চালালে ঝগড়া হয়",
    description: "অকারণে কাঁচি চালালে নাকি পরিবারে ঝগড়া বা বিবাদ বাধে।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1533090623907-7b3b44840b3c?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "আয়না ভাঙলে ৭ বছর দুর্ভাগ্য",
    description: "আয়না ভেঙে ফেলাকে অত্যন্ত অশুভ লক্ষণ হিসেবে দেখা হয়।",
    category: "ভাগ্য",
    image: "https://images.unsplash.com/photo-1516644026850-8b066f20486c?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "খাওয়ার সময় বিষম খাওয়া",
    description: "খাওয়ার সময় বিষম খেলে মনে করা হয় কেউ আপনাকে স্মরণ করছে বা আপনার নাম নিচ্ছে।",
    category: "ভাগ্য",
    image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "বাম চোখের পাতা লাফালে বিপদ",
    description: "ডান চোখ লাফালে ভালো খবর, আর বাম চোখ লাফালে বিপদ বা দুঃসংবাদ - এমন বিশ্বাস প্রচলিত।",
    category: "শারীরিক",
    image: "https://images.unsplash.com/photo-1563236756-3f04494916a2?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "তিন রাস্তার মোড়ে ভূত থাকে",
    description: "তিন রাস্তার মিলনস্থলে নাকি খারাপ বাতাস বা অশুভ আত্মা থাকে, বিশেষ করে ভরদুপুরে বা গভীর রাতে।",
    category: "ভৌতিক",
    image: "https://images.unsplash.com/photo-1447014421976-7fec21d26d86?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "কারও উপর দিয়ে ডিঙ্গিয়ে যাওয়া",
    description: "ঘুমন্ত বা বসা মানুষের উপর দিয়ে ডিঙ্গিয়ে গেলে নাকি তার উচ্চতা বৃদ্ধি বন্ধ হয়ে যায়।",
    category: "শারীরিক",
    image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "সূর্যাস্তের সময় ঘুমানো মানা",
    description: "গোধূলি বা মাগরিবের সময় ঘুমালে শরীর খারাপ হয় এবং ঘরে অলক্ষ্মী প্রবেশ করে বলে বিশ্বাস করা হয়।",
    category: "স্বাস্থ্য",
    image: "https://images.unsplash.com/photo-1455642305367-68834a1da7ab?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "রাতে গাছের নিচে যাওয়া মানা",
    description: "রাতে গাছ কার্বন ডাই অক্সাইড ছাড়ে, তাই বিজ্ঞানসম্মত কারণেই মানা করা হয়, তবে মিথ হলো গাছে ভূত থাকে।",
    category: "প্রকৃতি",
    image: "https://images.unsplash.com/photo-1463130456064-5a2d60b73c46?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "ভাঙা আয়নায় মুখ দেখা",
    description: "ভাঙা আয়নায় মুখ দেখলে চেহারার শ্রী নষ্ট হয় বা ভাগ্য খারাপ হয়।",
    category: "ভাগ্য",
    image: "https://images.unsplash.com/photo-1590502160462-2115c3d23158?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "বটগাছে যক্ষ থাকে",
    description: "পুরানো বটগাছে নাকি যক্ষ বা ধনপিশাচ থাকে যে গুপ্তধন পাহারা দেয়।",
    category: "ভৌতিক",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "রাতে কাউকে সুচ বা নুন দেওয়া মানা",
    description: "রাতে সরাসরি হাতে সুচ বা লবণ দিলে নাকি সেই ব্যক্তির সাথে সম্পর্কের অবনতি বা ঝগড়া হয়।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "হাঁচি দিলে যাত্রা বিরতি",
    description: "বাড়ি থেকে বের হওয়ার সময় কেউ হাঁচি দিলে কিছুক্ষণ বসে পানি খেয়ে তারপর বের হতে হয়।",
    category: "যাত্রা",
    image: "https://images.unsplash.com/photo-1585250003058-2947262c5b3c?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "প্লেটে খাবার রেখে উঠলে ঋণ হয়",
    description: "খাওয়ার সময় পাতে খাবার রেখে উঠে গেলে নাকি ঋণী হতে হয়।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1549488391-2a694d9136dc?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "উপুড় হয়ে শুলে পেট ব্যথা হয়",
    description: "শিশুদের উপুড় হয়ে শুতে মানা করা হয়, বলা হয় এতে পেটে ব্যথা বা অমঙ্গল হয়।",
    category: "শারীরিক",
    image: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "পরীক্ষার আগে চুল/দাড়ি কাটা",
    description: "পরীক্ষার আগের দিন চুল বা দাড়ি কাটলে নাকি পড়া সব ভুলে যায়।",
    category: "শিক্ষা",
    image: "https://images.unsplash.com/photo-1621645541997-c25cb73a5d09?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "শকুন বাড়ির চালে বসা",
    description: "শকুন বাড়ির চালে বসলে বা কান্না করলে বাড়িতে কারোর মৃত্যু হতে পারে বলে ভয় পাওয়া হয়।",
    category: "প্রকৃতি",
    image: "https://images.unsplash.com/photo-1515264366635-c89c8a984021?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "গায়ে নুন ছিটিয়ে দেওয়া",
    description: "ভুলে কারও গায়ে নুন ছিটিয়ে দিলে তার সাথে মারামারি হওয়ার সম্ভাবনা থাকে।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1518110925418-8422956d5ae7?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "সন্ধ্যায় চুল আচড়ানো",
    description: "সন্ধ্যাবেলায় বা রাতে চুল আচড়ালে বা খোলা রাখলে অশুভ দৃষ্টি পড়ে।",
    category: "সংসার",
    image: "https://images.unsplash.com/photo-1522337360705-8754d79770d2?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  },
  {
    title: "মৃত ব্যক্তির নাম বারবার নেওয়া",
    description: "মৃত ব্যক্তির নাম বারবার নিলে তার আত্মা কষ্ট পায় বা ফিরে আসার চেষ্টা করে।",
    category: "ভৌতিক",
    image: "https://images.unsplash.com/photo-1596767356247-f421f66c91e0?auto=format&fit=crop&q=80&w=600",
    isSlider: false
  }
];

export default function BangladeshMythsApp() {
  const [myths, setMyths] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // লগইন ফর্ম স্টেট
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // এডিট/অ্যাড স্টেট
  const [editingMyth, setEditingMyth] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    image: '',
    isSlider: false 
  });
  
  const fileInputRef = useRef(null);

  // --- ফায়ারবেস অথেনটিকেশন ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- ফায়ারবেস ডাটা লোডিং ---
  useEffect(() => {
    if (!user) return;

    // পাবলিক ডাটা কালেকশন (সবাই দেখতে পাবে)
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'myths'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMyths = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // যদি ডাটাবেস খালি থাকে, তাহলে ইনিশিয়াল ডাটা সিড করুন (একবার)
      if (loadedMyths.length === 0 && !loading) {
        seedDatabase();
      } else {
        setMyths(loadedMyths);
        setLoading(false);
      }
    }, (error) => {
      console.error("Data fetch error:", error);
      setLoading(false);
      // ফলব্যাক হিসেবে লোকাল ডাটা ব্যবহার করুন
      if(myths.length === 0) setMyths(INITIAL_MYTHS);
    });

    return () => unsubscribe();
  }, [user]);

  // ডাটাবেস সিডিং ফাংশন
  const seedDatabase = async () => {
    setLoading(true);
    const batch = writeBatch(db);
    const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'myths');
    
    // প্রথম ২০টা মিথ আপলোড করি যাতে কোটা লিমিট ক্রস না করে
    INITIAL_MYTHS.slice(0, 30).forEach(myth => {
      const docRef = doc(collectionRef); // নতুন আইডি জেনারেট
      batch.set(docRef, myth);
    });

    try {
      await batch.commit();
      console.log("Database seeded successfully!");
    } catch (e) {
      console.error("Seeding failed:", e);
      setMyths(INITIAL_MYTHS); // এরর হলে লোকাল ডাটা
    } finally {
      setLoading(false);
    }
  };

  // স্লাইডার অটো-প্লে এবং লজিক
  const sliderMyths = myths.filter(m => m.isSlider);
  
  useEffect(() => {
    if (sliderMyths.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderMyths.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderMyths.length]);

  // হ্যান্ডলার ফাংশনসমূহ
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "himel452@gmail.com" && password === "Bank@200") {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError("");
      setEmail("");
      setPassword("");
    } else {
      setLoginError("ভুল ইমেইল বা পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm("আপনি কি নিশ্চিত এই মিথটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'myths', id));
      } catch (e) {
        console.error("Delete failed:", e);
        alert("ডিলিট করা সম্ভব হয়নি।");
      }
    }
  };

  const handleEditClick = (myth) => {
    setEditingMyth(myth.id);
    setFormData(myth);
    setIsAddingNew(false);
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setEditingMyth(null);
    setFormData({ 
      title: '', 
      description: '', 
      category: '', 
      image: 'https://images.unsplash.com/photo-1461301214746-1e790926d323?auto=format&fit=crop&q=80&w=600',
      isSlider: false
    });
  };

  // লোকাল ফাইল থেকে ছবি হ্যান্ডলিং
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Base64 স্ট্রিং হিসেবে সেভ করছি
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("ডাটাবেস কানেকশন নেই। পেজটি রিফ্রেশ দিন।");
      return;
    }

    try {
      if (isAddingNew) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'myths'), formData);
        setIsAddingNew(false);
      } else {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'myths', editingMyth), formData);
        setEditingMyth(null);
      }
      setFormData({ title: '', description: '', category: '', image: '', isSlider: false });
    } catch (e) {
      console.error("Save failed:", e);
      alert("সেভ করা সম্ভব হয়নি। আবার চেষ্টা করুন।");
    }
  };

  // ফিল্টার করা মিথ
  const filteredMyths = myths.filter(myth => 
    myth.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    myth.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- নেভিগেশন বার --- */}
      <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-2 rounded-lg">
                <Menu size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">
                বাংলার মিথ
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="মিথ খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>

              {isAdmin ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition text-sm font-medium"
                >
                  <LogOut size={16} /> লগআউট
                </button>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition shadow-sm text-sm font-medium"
                >
                  <Lock size={16} /> অ্যাডমিন
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- হিরো স্লাইডার --- */}
      {!isAddingNew && !editingMyth && sliderMyths.length > 0 && (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-slate-900 group">
          {sliderMyths.map((myth, index) => (
            <div
              key={myth.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img 
                src={myth.image} 
                alt={myth.title} 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                <span className="text-emerald-400 font-semibold tracking-wider mb-2 uppercase text-sm">
                  ফিচারড মিথ
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-4xl drop-shadow-lg">
                  {myth.title}
                </h2>
                <p className="text-slate-200 text-lg max-w-2xl line-clamp-2 drop-shadow-md">
                  {myth.description}
                </p>
              </div>
            </div>
          ))}
          
          {/* স্লাইডার কন্ট্রোল */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? sliderMyths.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderMyths.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 right-6 flex gap-2">
            {sliderMyths.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 w-8 rounded-full transition-all ${
                  currentSlide === idx ? "bg-emerald-500 w-12" : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- মেইন কনটেন্ট --- */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* অ্যাডমিন কন্ট্রোল বার */}
        {isAdmin && !isAddingNew && !editingMyth && (
          <div className="mb-8 flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div>
              <h3 className="text-emerald-800 font-bold text-lg">অ্যাডমিন ড্যাশবোর্ড</h3>
              <p className="text-sm text-emerald-600">মোট মিথ সংখ্যা: {myths.length} টি</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={seedDatabase}
                className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                title="ডাটাবেস রিসেট/সিড করুন"
              >
                <RefreshCw size={18} />
              </button>
              <button 
                onClick={handleAddNewClick}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-md transition"
              >
                <Plus size={18} /> নতুন যোগ করুন
              </button>
            </div>
          </div>
        )}

        {/* এডিট/অ্যাড ফর্ম */}
        {(isAddingNew || editingMyth) && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mb-12 animate-fade-in-up relative">
             <button 
                onClick={() => { setIsAddingNew(false); setEditingMyth(null); }}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X size={24} />
              </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b">
              {isAddingNew ? "নতুন মিথ যোগ করুন" : "মিথ এডিট করুন"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">শিরোনাম</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="মিথের শিরোনাম..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">ক্যাটাগরি</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="খাবার">খাবার ও পানীয়</option>
                      <option value="সংসার">সংসার ও ঘরোয়া</option>
                      <option value="প্রকৃতি">প্রকৃতি ও প্রাণী</option>
                      <option value="শিক্ষা">শিক্ষা ও পরীক্ষা</option>
                      <option value="ভাগ্য">ভাগ্য ও ভবিষ্যৎ</option>
                      <option value="যাত্রা">যাত্রা ও ভ্রমণ</option>
                      <option value="শারীরিক">শারীরিক ও স্বাস্থ্য</option>
                      <option value="ভৌতিক">ভৌতিক ও অলৌকিক</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="isSlider"
                      checked={formData.isSlider || false}
                      onChange={e => setFormData({...formData, isSlider: e.target.checked})}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="isSlider" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                      এটি স্লাইডারে দেখান (Featured)
                    </label>
                  </div>
                </div>

                <div className="col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">ছবি (URL অথবা আপলোড)</label>
                    
                    {/* ইমেজ প্রিভিউ */}
                    <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-dashed border-slate-300 mb-2 group">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <ImageIcon size={32} />
                          <span className="text-xs mt-2">কোনো ছবি নেই</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                         <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            className="bg-white text-slate-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                         >
                           <Upload size={14} /> পরিবর্তন করুন
                         </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs mb-2"
                      placeholder="ছবির লিংক পেস্ট করুন..."
                    />
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">অথবা কম্পিউটার থেকে:</span>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="মিথ সম্পর্কে বিস্তারিত লিখুন..."
                />
              </div>

              <div className="pt-4 flex gap-3 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium flex justify-center items-center gap-2 shadow-lg shadow-emerald-200 transition-transform active:scale-95"
                >
                  <Save size={18} /> {isAddingNew ? "প্রকাশ করুন" : "আপডেট করুন"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* লোডিং স্টেট */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-slate-500">মিথ লোড হচ্ছে...</p>
          </div>
        )}

        {/* মিথ গ্রিড */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMyths.map((myth) => (
              <div 
                key={myth.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group flex flex-col h-full relative"
              >
                {/* স্লাইডার ব্যাজ */}
                {myth.isSlider && (
                  <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <CheckCircle size={10} /> FEATURED
                  </div>
                )}

                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img 
                    src={myth.image || "https://placehold.co/600x400?text=No+Image"} 
                    alt={myth.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {e.target.src = 'https://placehold.co/600x400?text=Image+Error'}}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 shadow-sm z-10">
                    {myth.category}
                  </div>
                  
                  {/* অ্যাডমিন অ্যাকশন বাটনস (ইমেজের উপর) */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-[2px]">
                      <button 
                        onClick={() => handleEditClick(myth)}
                        className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-500 hover:text-white transition shadow-lg transform hover:scale-110"
                        title="এডিট করুন"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(myth.id)}
                        className="p-3 bg-white text-red-600 rounded-full hover:bg-red-500 hover:text-white transition shadow-lg transform hover:scale-110"
                        title="ডিলিট করুন"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {myth.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {myth.description}
                  </p>
                  <div className="pt-4 border-t border-slate-100 mt-auto flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">
                      {myth.id ? `ID: ...${myth.id.slice(-4)}` : 'Local'}
                    </span>
                    <button className="text-emerald-600 text-sm font-medium hover:underline">বিস্তারিত</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredMyths.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700">কোনো মিথ পাওয়া যায়নি</h3>
            <p className="text-slate-500 mt-2">অন্য কোনো শব্দ দিয়ে খুঁজুন</p>
          </div>
        )}
      </main>

      {/* --- লগইন মডাল --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in transform scale-100">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">অ্যাডমিন প্যানেল</h2>
              <p className="text-emerald-100 text-sm mt-1">কন্টেন্ট এডিট করতে লগইন করুন</p>
            </div>
            
            <form onSubmit={handleLogin} className="p-8 pt-6">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center flex items-center justify-center gap-2">
                   ⚠️ {loginError}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">ইমেইল</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white"
                    placeholder="admin@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowLoginModal(false); setLoginError(""); }}
                  className="flex-1 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-600 transition"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200 transition"
                >
                  প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ফুটার */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">বাংলার মিথ</h2>
          <p className="mb-8 max-w-lg mx-auto text-slate-400 leading-relaxed">
            বাংলাদেশের আনাচে-কানাচে ছড়িয়ে থাকা হাজারো মিথ, কুসংস্কার আর লোকবিশ্বাস এক জায়গায়।<br/>
            আমাদের সংস্কৃতি ও বিশ্বাসকে জানুন।
          </p>
          <div className="flex justify-center gap-6 mb-8">
             <a href="#" className="hover:text-emerald-400 transition">ফেসবুক</a>
             <a href="#" className="hover:text-emerald-400 transition">ইন্সটাগ্রাম</a>
             <a href="#" className="hover:text-emerald-400 transition">টুইটার</a>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <span>&copy; ২০২৪ বাংলার মিথ পোর্টাল। সর্বস্বত্ব সংরক্ষিত।</span>
            <span className="text-slate-600 flex items-center gap-1">
               Made with <span className="text-red-500">♥</span> in Bangladesh
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}