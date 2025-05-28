const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "brandwisp-dev.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "brandwisp-dev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "brandwisp-dev.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdefghijklmnop"
};

// Sample image data
const sampleImages = [
  {
    userId: 'test-user-id',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    filename: 'fashion-store-front.jpg',
    fileSize: 2048000,
    dimensions: { width: 1920, height: 1080 },
    format: 'jpg',
    status: 'completed',
    analysis: {
      tags: [
        { label: 'fashion', confidence: 0.95, category: 'category' },
        { label: 'store', confidence: 0.89, category: 'object' },
        { label: 'clothing', confidence: 0.87, category: 'product' },
        { label: 'retail', confidence: 0.82, category: 'business' }
      ],
      objects: [
        { name: 'storefront', confidence: 0.91, boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 } },
        { name: 'mannequin', confidence: 0.85, boundingBox: { x: 0.3, y: 0.2, width: 0.2, height: 0.6 } }
      ],
      colors: [
        { hex: '#2C3E50', percentage: 35, name: 'Dark Blue' },
        { hex: '#ECF0F1', percentage: 30, name: 'Light Gray' },
        { hex: '#E74C3C', percentage: 20, name: 'Red' },
        { hex: '#F39C12', percentage: 15, name: 'Orange' }
      ],
      text: [
        { content: 'SALE 50% OFF', confidence: 0.92, language: 'en' },
        { content: 'Fashion Store', confidence: 0.88, language: 'en' }
      ]
    },
    seo: {
      currentAltText: 'store image',
      suggestedAltText: 'Modern fashion store front with sale signage and clothing displays',
      currentCaption: '',
      suggestedCaption: 'Stylish fashion boutique offering 50% off sale on trendy clothing',
      currentDescription: '',
      suggestedDescription: 'Contemporary fashion retail store featuring modern storefront design with prominent sale signage, clothing displays, and mannequins showcasing the latest trends',
      score: 85
    },
    accessibility: {
      score: 78,
      issues: ['Low contrast text', 'Missing alt text'],
      suggestions: ['Improve text contrast ratio', 'Add descriptive alt text', 'Include proper heading structure']
    }
  },
  {
    userId: 'test-user-id',
    url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
    filename: 'product-shoes.jpg',
    fileSize: 1536000,
    dimensions: { width: 1600, height: 1200 },
    format: 'jpg',
    status: 'completed',
    analysis: {
      tags: [
        { label: 'shoes', confidence: 0.98, category: 'product' },
        { label: 'footwear', confidence: 0.94, category: 'category' },
        { label: 'sneakers', confidence: 0.91, category: 'type' },
        { label: 'fashion', confidence: 0.86, category: 'category' }
      ],
      objects: [
        { name: 'sneaker', confidence: 0.96, boundingBox: { x: 0.2, y: 0.3, width: 0.6, height: 0.4 } }
      ],
      colors: [
        { hex: '#FFFFFF', percentage: 45, name: 'White' },
        { hex: '#000000', percentage: 25, name: 'Black' },
        { hex: '#3498DB', percentage: 20, name: 'Blue' },
        { hex: '#95A5A6', percentage: 10, name: 'Gray' }
      ]
    },
    seo: {
      suggestedAltText: 'White and blue athletic sneakers on clean background',
      suggestedCaption: 'Premium athletic sneakers perfect for sports and casual wear',
      suggestedDescription: 'High-quality athletic sneakers featuring white and blue colorway with modern design elements, suitable for both athletic activities and everyday casual wear',
      score: 92
    },
    accessibility: {
      score: 88,
      issues: ['Missing alt text'],
      suggestions: ['Add descriptive alt text', 'Ensure proper color contrast']
    }
  },
  {
    userId: 'test-user-id',
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
    filename: 'electronics-gadgets.jpg',
    fileSize: 1792000,
    dimensions: { width: 1800, height: 1200 },
    format: 'jpg',
    status: 'completed',
    analysis: {
      tags: [
        { label: 'electronics', confidence: 0.93, category: 'category' },
        { label: 'gadgets', confidence: 0.89, category: 'product' },
        { label: 'technology', confidence: 0.87, category: 'category' },
        { label: 'devices', confidence: 0.84, category: 'object' }
      ],
      objects: [
        { name: 'smartphone', confidence: 0.92, boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.5 } },
        { name: 'laptop', confidence: 0.88, boundingBox: { x: 0.4, y: 0.1, width: 0.5, height: 0.6 } }
      ],
      colors: [
        { hex: '#34495E', percentage: 40, name: 'Dark Gray' },
        { hex: '#ECF0F1', percentage: 30, name: 'Light Gray' },
        { hex: '#3498DB', percentage: 20, name: 'Blue' },
        { hex: '#E74C3C', percentage: 10, name: 'Red' }
      ]
    },
    seo: {
      suggestedAltText: 'Collection of modern electronic devices including smartphone and laptop',
      suggestedCaption: 'Latest technology gadgets and electronic devices for modern lifestyle',
      suggestedDescription: 'Comprehensive collection of cutting-edge electronic devices and gadgets including smartphones, laptops, and accessories designed for the modern digital lifestyle',
      score: 79
    },
    accessibility: {
      score: 72,
      issues: ['Low contrast elements', 'Missing alt text', 'Small text size'],
      suggestions: ['Improve color contrast', 'Add descriptive alt text', 'Increase text size for better readability']
    }
  },
  {
    userId: 'test-user-id',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    filename: 'running-shoes-red.jpg',
    fileSize: 1280000,
    dimensions: { width: 1400, height: 1050 },
    format: 'jpg',
    status: 'pending',
    analysis: {
      tags: [],
      objects: [],
      colors: []
    },
    seo: {
      suggestedAltText: '',
      suggestedCaption: '',
      suggestedDescription: '',
      score: 0
    },
    accessibility: {
      score: 0,
      issues: [],
      suggestions: []
    }
  },
  {
    userId: 'test-user-id',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    filename: 'headphones-audio.jpg',
    fileSize: 1920000,
    dimensions: { width: 1920, height: 1280 },
    format: 'jpg',
    status: 'completed',
    analysis: {
      tags: [
        { label: 'headphones', confidence: 0.97, category: 'product' },
        { label: 'audio', confidence: 0.92, category: 'category' },
        { label: 'music', confidence: 0.88, category: 'concept' },
        { label: 'electronics', confidence: 0.85, category: 'category' }
      ],
      objects: [
        { name: 'headphones', confidence: 0.95, boundingBox: { x: 0.25, y: 0.2, width: 0.5, height: 0.6 } }
      ],
      colors: [
        { hex: '#000000', percentage: 50, name: 'Black' },
        { hex: '#FFFFFF', percentage: 25, name: 'White' },
        { hex: '#C0392B', percentage: 15, name: 'Red' },
        { hex: '#BDC3C7', percentage: 10, name: 'Silver' }
      ]
    },
    seo: {
      suggestedAltText: 'Professional black headphones with red accents on white background',
      suggestedCaption: 'High-quality audio headphones for music lovers and professionals',
      suggestedDescription: 'Premium over-ear headphones featuring sleek black design with red accent details, engineered for superior sound quality and comfort for extended listening sessions',
      score: 88
    },
    accessibility: {
      score: 85,
      issues: ['Missing alt text'],
      suggestions: ['Add descriptive alt text', 'Ensure proper heading structure']
    }
  }
];

async function createSampleData() {
  try {
    console.log('🔧 Creating sample VisionTagger data...\n');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📊 Adding sample images to Firestore...');

    for (let i = 0; i < sampleImages.length; i++) {
      const imageData = {
        ...sampleImages[i],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        analyzedAt: sampleImages[i].status === 'completed' ? Timestamp.now() : null
      };

      const docRef = await addDoc(collection(db, 'images'), imageData);
      console.log(`✅ Added image ${i + 1}: ${imageData.filename} (ID: ${docRef.id})`);
    }

    console.log('\n🎉 Sample data created successfully!');
    console.log(`📈 Created ${sampleImages.length} sample images`);
    console.log('🔍 Data includes:');
    console.log('  - Fashion store front');
    console.log('  - Athletic sneakers');
    console.log('  - Electronics gadgets');
    console.log('  - Running shoes (pending analysis)');
    console.log('  - Audio headphones');
    console.log('\n💡 You can now test the VisionTagger dashboard with real data!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run the script
createSampleData().then(() => {
  console.log('\n🏁 Sample data creation completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 