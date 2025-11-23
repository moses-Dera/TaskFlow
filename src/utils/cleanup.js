// Clean up old localStorage data - only keep token and settings
export const cleanupOldData = () => {
  // Remove all old data except essential
  const keepKeys = [
    'taskflow_token',
    'taskManagerSettings'
  ];
  
  // Get all localStorage keys
  const allKeys = Object.keys(localStorage);
  
  // Remove any task manager related keys that aren't in keep list
  allKeys.forEach(key => {
    if (!keepKeys.includes(key) && !key.startsWith('_')) {
      if (key.toLowerCase().includes('task') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('user') ||
          key === 'token') {
        localStorage.removeItem(key);
        console.log(`Cleaned up localStorage key: ${key}`);
      }
    }
  });
};

// Run cleanup on app start
if (typeof window !== 'undefined') {
  cleanupOldData();
}