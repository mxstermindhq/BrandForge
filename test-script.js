// Test script for mxstermind platform
// Run this in browser console on http://127.0.0.1:3000

async function testMxstermind() {
    console.log('🧪 Starting mxstermind platform tests...');
    
    // Test 1: Check auth configuration
    console.log('\n=== Test 1: Auth Configuration ===');
    try {
        const authConfig = await fetch('/api/auth/config').then(r => r.json());
        console.log('✅ Auth config:', authConfig.enabled ? 'ENABLED' : 'DISABLED');
    } catch (error) {
        console.log('❌ Auth config failed:', error.message);
    }
    
    // Test 2: Check bootstrap data
    console.log('\n=== Test 2: Bootstrap Data ===');
    try {
        const bootstrap = await fetch('/api/bootstrap').then(r => r.json());
        console.log('✅ Bootstrap loaded');
        console.log('   - Profiles:', bootstrap.profiles?.length || 0);
        console.log('   - Services:', bootstrap.services?.length || 0);
        console.log('   - Requests:', bootstrap.requests?.length || 0);
        console.log('   - Projects:', bootstrap.projects?.length || 0);
        console.log('   - Storage mode:', bootstrap.storageMode);
    } catch (error) {
        console.log('❌ Bootstrap failed:', error.message);
    }
    
    // Test 3: Test user registration (if not authenticated)
    console.log('\n=== Test 3: Authentication ===');
    if (!window.mxAuthState?.user) {
        console.log('📝 Testing registration flow...');
        // This would need to be done manually in the UI
        console.log('→ Please test registration manually in the UI');
    } else {
        console.log('✅ Already authenticated as:', window.mxAuthState.user.email);
    }
    
    // Test 4: Test creating a service package (requires auth)
    console.log('\n=== Test 4: Service Package Creation ===');
    if (window.mxAuthState?.session) {
        try {
            const serviceData = {
                title: 'Test Logo Design Package',
                price: '299',
                category: 'Design',
                description: 'Professional logo design for SaaS companies'
            };
            
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.mxAuthState.session.access_token}`
                },
                body: JSON.stringify(serviceData)
            });
            
            if (response.ok) {
                const service = await response.json();
                console.log('✅ Service created:', service.service.title);
            } else {
                console.log('❌ Service creation failed:', await response.text());
            }
        } catch (error) {
            console.log('❌ Service creation error:', error.message);
        }
    } else {
        console.log('⚠️  Requires authentication');
    }
    
    // Test 5: Test creating a project request (requires auth)
    console.log('\n=== Test 5: Project Request Creation ===');
    if (window.mxAuthState?.session) {
        try {
            const requestData = {
                title: 'Test Branding Project',
                desc: 'Need complete branding for our new SaaS platform',
                budget: '$1000-2000',
                tags: ['branding', 'logo', 'design']
            };
            
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.mxAuthState.session.access_token}`
                },
                body: JSON.stringify(requestData)
            });
            
            if (response.ok) {
                const request = await response.json();
                console.log('✅ Request created:', request.request.title);
                console.log('   Request ID:', request.request.id);
            } else {
                console.log('❌ Request creation failed:', await response.text());
            }
        } catch (error) {
            console.log('❌ Request creation error:', error.message);
        }
    } else {
        console.log('⚠️  Requires authentication');
    }
    
    // Test 6: Test research run creation (requires auth)
    console.log('\n=== Test 6: Research Run Creation ===');
    if (window.mxAuthState?.session) {
        try {
            const researchData = {
                topic: 'SaaS Branding Trends 2024',
                mode: 'Quick'
            };
            
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.mxAuthState.session.access_token}`
                },
                body: JSON.stringify(researchData)
            });
            
            if (response.ok) {
                const research = await response.json();
                console.log('✅ Research run created:', research.research.topic);
                console.log('   Research ID:', research.research.id);
            } else {
                console.log('❌ Research creation failed:', await response.text());
            }
        } catch (error) {
            console.log('❌ Research creation error:', error.message);
        }
    } else {
        console.log('⚠️  Requires authentication');
    }
    
    console.log('\n🏁 Testing complete!');
    console.log('\n📋 Manual tests to perform:');
    console.log('   1. Registration flow (email/password)');
    console.log('   2. Login flow');
    console.log('   3. Profile editing');
    console.log('   4. Bid submission and acceptance');
    console.log('   5. Project status updates');
    console.log('   6. Messaging features');
    console.log('   7. UI navigation and responsiveness');
}

// Run the tests
testMxstermind();
