// Run this script to make yourself admin
// Replace 'your-user-id' with your actual Firebase user ID

import { db } from '../lib/firebase.js';
import { doc, updateDoc } from 'firebase/firestore';

async function makeAdmin() {
  const userId = 'your-user-id-here'; // Replace with your user ID
  
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'super_admin',
      updatedAt: new Date(),
    });
    
    console.log('✅ Admin role assigned successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

makeAdmin();