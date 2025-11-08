// Simple test to verify backend connection
async function testBackend() {
    console.log('🧪 Testing backend connection...');
    
    try {
        const response = await fetch('http://localhost:3001/auth/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        
        console.log('✅ Response status:', response.status);
        console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        if (response.ok) {
            console.log('🎉 SUCCESS: Backend connection working!');
        } else {
            console.log('⚠️  Backend error:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Test the backend
testBackend();