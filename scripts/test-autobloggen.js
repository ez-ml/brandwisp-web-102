// Test script to verify AutoBlogGen features with real data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCZsDhKQ8zo4JIUP55a4w7WcL55G2-iciQ",
  authDomain: "brandwisp-dev.firebaseapp.com",
  projectId: "brandwisp-dev",
  storageBucket: "brandwisp-dev.appspot.com",
  messagingSenderId: "113523194662785221424",
  appId: "1:426241866355:web:362162eaaf2f1ce7f60806",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAutoBlogGenData() {
  try {
    console.log('🧪 Testing AutoBlogGen Real Data Integration...\n');

    // Test 1: Check connected stores
    console.log('1️⃣ Testing Store Connections:');
    const storesRef = collection(db, 'stores');
    const storesSnap = await getDocs(storesRef);
    
    console.log(`   ✅ Found ${storesSnap.size} total stores`);
    
    const connectedStores = [];
    storesSnap.forEach(doc => {
      const store = { id: doc.id, ...doc.data() };
      if (store.status === 'connected') {
        connectedStores.push(store);
        console.log(`   🔗 ${store.storeName} (${store.provider}) - ${store.status}`);
      }
    });
    
    console.log(`   ✅ ${connectedStores.length} connected stores available for blog generation\n`);

    // Test 2: Check products for blog content (from store subcollections)
    console.log('2️⃣ Testing Product Data for Blog Generation:');
    
    const productsByStore = {};
    let totalProducts = 0;
    
    // Fetch products from each store's subcollection
    for (const store of connectedStores) {
      const storeProductsRef = collection(db, 'stores', store.id, 'products');
      const storeProductsSnap = await getDocs(storeProductsRef);
      
      if (storeProductsSnap.size > 0) {
        productsByStore[store.id] = [];
        storeProductsSnap.forEach(doc => {
          const product = { id: doc.id, storeId: store.id, ...doc.data() };
          productsByStore[store.id].push(product);
          totalProducts++;
        });
      }
    }
    
    Object.entries(productsByStore).forEach(([storeId, products]) => {
      const store = connectedStores.find(s => s.id === storeId);
      if (store) {
        console.log(`   📦 ${store.storeName}: ${products.length} products`);
        
        // Show sample products for blog generation
        products.slice(0, 3).forEach(product => {
          console.log(`      - ${product.title} (${product.productType || 'No category'})`);
        });
      }
    });
    
    console.log(`   ✅ ${totalProducts} products available for blog content generation\n`);

    // Test 3: Check existing blogs
    console.log('3️⃣ Testing Existing Blog Data:');
    const blogsRef = collection(db, 'blogs');
    const blogsSnap = await getDocs(blogsRef);
    
    console.log(`   ✅ Found ${blogsSnap.size} existing blogs`);
    
    if (blogsSnap.size > 0) {
      const blogs = [];
      blogsSnap.forEach(doc => {
        blogs.push({ id: doc.id, ...doc.data() });
      });
      
      // Analyze blog data
      const platformStats = {};
      const statusStats = {};
      let totalViews = 0;
      let totalShares = 0;
      
      blogs.forEach(blog => {
        // Platform stats
        platformStats[blog.platform] = (platformStats[blog.platform] || 0) + 1;
        
        // Status stats
        statusStats[blog.status] = (statusStats[blog.status] || 0) + 1;
        
        // Analytics
        if (blog.analytics) {
          totalViews += blog.analytics.views || 0;
          totalShares += blog.analytics.shares || 0;
        }
      });
      
      console.log('   📊 Blog Analytics:');
      console.log(`      Total Views: ${totalViews.toLocaleString()}`);
      console.log(`      Total Shares: ${totalShares.toLocaleString()}`);
      console.log(`      Avg Views per Blog: ${Math.round(totalViews / blogs.length)}`);
      
      console.log('   🌐 Platform Distribution:');
      Object.entries(platformStats).forEach(([platform, count]) => {
        console.log(`      ${platform}: ${count} blogs`);
      });
      
      console.log('   📝 Status Distribution:');
      Object.entries(statusStats).forEach(([status, count]) => {
        console.log(`      ${status}: ${count} blogs`);
      });
      
      // Show recent blogs
      const recentBlogs = blogs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
        
      console.log('   📰 Recent Blogs:');
      recentBlogs.forEach(blog => {
        console.log(`      - "${blog.title}" (${blog.platform}, ${blog.status})`);
        console.log(`        Created: ${new Date(blog.createdAt).toLocaleDateString()}`);
        if (blog.analytics) {
          console.log(`        Views: ${blog.analytics.views || 0}, Shares: ${blog.analytics.shares || 0}`);
        }
      });
    } else {
      console.log('   ℹ️  No existing blogs found - ready for first blog generation');
    }
    
    console.log('\n4️⃣ Testing Blog Generation Readiness:');
    
    // Check if we have enough data for blog generation
    const readinessChecks = {
      'Connected Stores': connectedStores.length > 0,
      'Available Products': totalProducts > 0,
      'Product Descriptions': false,
      'Product Images': false,
      'Product Categories': false
    };
    
    // Check product data quality
    if (totalProducts > 0) {
      let productsWithDescriptions = 0;
      let productsWithImages = 0;
      let productsWithCategories = 0;
      
      Object.values(productsByStore).flat().forEach(product => {
        if (product.description && product.description.length > 50) {
          productsWithDescriptions++;
        }
        if (product.images && product.images.length > 0) {
          productsWithImages++;
        }
        if (product.productType || product.tags?.length > 0) {
          productsWithCategories++;
        }
      });
      
      readinessChecks['Product Descriptions'] = productsWithDescriptions > 0;
      readinessChecks['Product Images'] = productsWithImages > 0;
      readinessChecks['Product Categories'] = productsWithCategories > 0;
      
      console.log(`   📝 Products with good descriptions: ${productsWithDescriptions}/${totalProducts}`);
      console.log(`   🖼️  Products with images: ${productsWithImages}/${totalProducts}`);
      console.log(`   🏷️  Products with categories: ${productsWithCategories}/${totalProducts}`);
    }
    
    console.log('\n   ✅ AutoBlogGen Readiness Check:');
    Object.entries(readinessChecks).forEach(([check, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allReady = Object.values(readinessChecks).every(check => check);
    
    if (allReady) {
      console.log('\n🎉 AutoBlogGen is ready for blog generation!');
      console.log('   You can now:');
      console.log('   - Generate blogs from product data');
      console.log('   - Publish to Shopify blogs');
      console.log('   - Configure WordPress publishing');
      console.log('   - Track blog performance metrics');
    } else {
      console.log('\n⚠️  AutoBlogGen needs more data for optimal blog generation');
      console.log('   Consider:');
      console.log('   - Adding more product descriptions');
      console.log('   - Uploading product images');
      console.log('   - Categorizing products properly');
    }

    // Test 5: Sample blog generation data
    console.log('\n5️⃣ Sample Blog Generation Data:');
    if (connectedStores.length > 0 && totalProducts > 0) {
      const sampleStore = connectedStores[0];
      const sampleProducts = productsByStore[sampleStore.id]?.slice(0, 3) || [];
      
      console.log(`   🏪 Sample Store: ${sampleStore.storeName}`);
      console.log('   📦 Sample Products for Blog Generation:');
      
      sampleProducts.forEach((product, index) => {
        console.log(`      ${index + 1}. ${product.title}`);
        console.log(`         Price: $${product.price || 'N/A'}`);
        console.log(`         Category: ${product.productType || 'Uncategorized'}`);
        console.log(`         Description: ${(product.description || '').substring(0, 100)}...`);
        console.log(`         Images: ${product.images?.length || 0}`);
        console.log(`         Tags: ${product.tags?.join(', ') || 'None'}`);
        console.log('');
      });
      
      // Generate sample blog topics
      console.log('   💡 Suggested Blog Topics:');
      sampleProducts.forEach((product, index) => {
        const topics = [
          `"The Ultimate Guide to ${product.title}"`,
          `"Why ${product.title} is Perfect for Your ${product.productType || 'Lifestyle'}"`,
          `"5 Ways to Style ${product.title}"`,
          `"Customer Spotlight: How ${product.title} Changed Everything"`
        ];
        console.log(`      ${index + 1}. ${topics[index] || topics[0]}`);
      });
    }
    
    console.log('\n✅ AutoBlogGen Real Data Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing AutoBlogGen data:', error);
  }
}

testAutoBlogGenData(); 