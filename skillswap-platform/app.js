// SkillSwap Application JavaScript
class SkillSwapApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'landing';
        this.isAuthenticated = false;
        this.showingProfileSetup = false;
        this.init();
    }

    init() {
        this.initializeData();
        this.setupEventListeners();
        this.loadUserSession();
        this.updateUI();
        this.startAnimations();
        this.populateTestimonials(); // Ensure testimonials are loaded immediately
    }

    // Initialize sample data
    initializeData() {
        // Sample data from application_data_json
        this.sampleUsers = [
            {
                id: 1,
                username: "sarah_designs",
                name: "Sarah Chen",
                email: "sarah@example.com",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b48a?w=150&h=150&fit=crop&crop=face",
                location: "San Francisco, CA",
                bio: "UX Designer passionate about creating intuitive digital experiences. Love trading design skills for coding knowledge!",
                rating: 4.8,
                tradesCompleted: 23,
                badges: ["Top Teacher", "5-Star Mentor", "First Trade"],
                skills: {
                    offering: [
                        {id: 1, name: "UI/UX Design", category: "Design", level: "Expert"},
                        {id: 2, name: "Figma", category: "Design", level: "Expert"},
                        {id: 3, name: "User Research", category: "Research", level: "Intermediate"}
                    ],
                    seeking: [
                        {id: 4, name: "React Development", category: "Programming", level: "Beginner"},
                        {id: 5, name: "Data Analysis", category: "Analytics", level: "Beginner"}
                    ]
                }
            },
            {
                id: 2,
                username: "alex_codes",
                name: "Alex Rivera",
                email: "alex@example.com",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                location: "Austin, TX",
                bio: "Full-stack developer with 5+ years experience. Always eager to learn new technologies and share knowledge!",
                rating: 4.9,
                tradesCompleted: 31,
                badges: ["Frequent Swapper", "Top Teacher", "Skill Explorer"],
                skills: {
                    offering: [
                        {id: 6, name: "React Development", category: "Programming", level: "Expert"},
                        {id: 7, name: "Node.js", category: "Programming", level: "Expert"},
                        {id: 8, name: "Database Design", category: "Programming", level: "Intermediate"}
                    ],
                    seeking: [
                        {id: 9, name: "UI/UX Design", category: "Design", level: "Beginner"},
                        {id: 10, name: "Digital Marketing", category: "Marketing", level: "Intermediate"}
                    ]
                }
            },
            {
                id: 3,
                username: "maria_music",
                name: "Maria Santos",
                email: "maria@example.com",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                location: "Miami, FL",
                bio: "Professional musician and music teacher. Love sharing the joy of music while learning other creative skills!",
                rating: 4.7,
                tradesCompleted: 18,
                badges: ["Community Builder", "First Trade"],
                skills: {
                    offering: [
                        {id: 11, name: "Piano", category: "Music", level: "Expert"},
                        {id: 12, name: "Music Theory", category: "Music", level: "Expert"},
                        {id: 13, name: "Spanish", category: "Languages", level: "Expert"}
                    ],
                    seeking: [
                        {id: 14, name: "Photography", category: "Visual Arts", level: "Beginner"},
                        {id: 15, name: "Video Editing", category: "Media", level: "Intermediate"}
                    ]
                }
            }
        ];

        this.allSkills = [
            {id: 1, name: "UI/UX Design", category: "Design", description: "User interface and experience design principles"},
            {id: 2, name: "React Development", category: "Programming", description: "Building modern web applications with React"},
            {id: 3, name: "Piano", category: "Music", description: "Piano playing techniques and music theory"},
            {id: 4, name: "Photography", category: "Visual Arts", description: "Digital photography and composition techniques"},
            {id: 5, name: "Spanish", category: "Languages", description: "Conversational and written Spanish language skills"},
            {id: 6, name: "Data Analysis", category: "Analytics", description: "Data visualization and statistical analysis"},
            {id: 7, name: "Digital Marketing", category: "Marketing", description: "Social media marketing and content strategy"},
            {id: 8, name: "Video Editing", category: "Media", description: "Video production and post-production techniques"},
            {id: 9, name: "Figma", category: "Design", description: "Advanced Figma design and prototyping"},
            {id: 10, name: "Node.js", category: "Programming", description: "Backend development with Node.js"},
            {id: 11, name: "Music Theory", category: "Music", description: "Understanding musical composition and theory"},
            {id: 12, name: "User Research", category: "Research", description: "Methods for understanding user needs"},
            {id: 13, name: "Database Design", category: "Programming", description: "Designing efficient database structures"}
        ];

        this.badges = [
            {id: 1, name: "First Trade", description: "Complete your first skill exchange", icon: "🎯", rarity: "common"},
            {id: 2, name: "Top Teacher", description: "Maintain a 4.5+ star rating", icon: "⭐", rarity: "rare"},
            {id: 3, name: "Frequent Swapper", description: "Complete 10+ skill trades", icon: "🔄", rarity: "rare"},
            {id: 4, name: "5-Star Mentor", description: "Receive 5 five-star reviews", icon: "🌟", rarity: "epic"},
            {id: 5, name: "Skill Explorer", description: "Learn 5+ different skill categories", icon: "🗺️", rarity: "rare"},
            {id: 6, name: "Community Builder", description: "Help 20+ people learn new skills", icon: "🏗️", rarity: "legendary"}
        ];

        this.testimonials = [
            {
                name: "Sarah Chen",
                role: "UX Designer",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b48a?w=60&h=60&fit=crop&crop=face",
                text: "SkillSwap transformed how I learn new skills. I traded my design expertise for React development and landed my dream job!",
                rating: 5
            },
            {
                name: "Alex Rivera",
                role: "Full Stack Developer", 
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
                text: "The platform is incredibly intuitive. I've learned more in 3 months through skill trading than in years of online courses.",
                rating: 5
            },
            {
                name: "Maria Santos",
                role: "Music Teacher",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
                text: "Teaching piano while learning photography has been amazing. The community here is so supportive and passionate!",
                rating: 5
            }
        ];

        this.sampleTrades = [
            {
                id: 1,
                requester: "sarah_designs",
                provider: "alex_codes",
                requesterSkill: "UI/UX Design",
                providerSkill: "React Development",
                status: "completed",
                title: "Design consultation for coding lessons",
                createdAt: "2024-01-15",
                completedAt: "2024-01-30"
            },
            {
                id: 2,
                requester: "maria_music",
                provider: "sarah_designs",
                requesterSkill: "Piano",
                providerSkill: "Figma",
                status: "in_progress",
                title: "Piano lessons for Figma training",
                createdAt: "2024-02-01"
            }
        ];

        // Initialize localStorage if empty
        if (!localStorage.getItem('skillswap_users')) {
            localStorage.setItem('skillswap_users', JSON.stringify(this.sampleUsers));
        }
        if (!localStorage.getItem('skillswap_trades')) {
            localStorage.setItem('skillswap_trades', JSON.stringify(this.sampleTrades));
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });

        // Auth buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => this.openAuthModal('login'));
        document.getElementById('registerBtn')?.addEventListener('click', () => this.openAuthModal('register'));
        document.getElementById('heroGetStarted')?.addEventListener('click', () => this.openAuthModal('register'));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Auth modal
        document.getElementById('authSwitchLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });
        document.getElementById('authForm')?.addEventListener('submit', (e) => this.handleAuth(e));

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Modal close handlers
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target === element) {
                    this.closeAllModals();
                }
            });
        });

        // Dashboard tabs
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchDashboardTab(link.dataset.tab);
            });
        });

        // Profile tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchProfileTab(btn.dataset.tab);
            });
        });

        // Search functionality
        document.getElementById('skillSearch')?.addEventListener('input', (e) => {
            this.searchSkills(e.target.value);
        });

        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.filterSkillsByCategory(e.target.value);
        });

        // Trade filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterTrades(btn.dataset.filter);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Chat functionality
        document.getElementById('sendMessage')?.addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        document.getElementById('minimizeChat')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('closeChat')?.addEventListener('click', () => this.closeChat());

        // Trade form
        document.getElementById('tradeForm')?.addEventListener('submit', (e) => this.handleTradeRequest(e));

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Load user session
    loadUserSession() {
        const savedUser = localStorage.getItem('skillswap_currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
        }
    }

    // Navigation
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // Update page-specific content
            this.updatePageContent(page);
        }

        // Update navigation state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    }

    updatePageContent(page) {
        switch (page) {
            case 'landing':
                this.populateTestimonials();
                break;
            case 'dashboard':
                if (this.isAuthenticated) {
                    this.updateDashboard();
                } else {
                    this.navigateTo('landing');
                }
                break;
            case 'discover':
                this.populateSkillsGrid();
                break;
            case 'profile':
                if (this.isAuthenticated) {
                    this.updateProfile();
                } else {
                    this.navigateTo('landing');
                }
                break;
            case 'trades':
                if (this.isAuthenticated) {
                    this.updateTrades();
                } else {
                    this.navigateTo('landing');
                }
                break;
            case 'admin':
                if (this.isAuthenticated && this.currentUser.role === 'admin') {
                    this.updateAdmin();
                } else {
                    this.navigateTo('landing');
                }
                break;
        }
    }

    // Authentication
    openAuthModal(mode) {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authModalTitle');
        const submitBtn = document.getElementById('authSubmit');
        const switchText = document.getElementById('authSwitchText');
        const switchLink = document.getElementById('authSwitchLink');
        const registerFields = document.querySelectorAll('.register-only');

        if (mode === 'login') {
            title.textContent = 'Sign In';
            submitBtn.textContent = 'Sign In';
            switchText.textContent = "Don't have an account?";
            switchLink.textContent = 'Sign up';
            registerFields.forEach(field => field.classList.add('hidden'));
        } else {
            title.textContent = 'Create Account';
            submitBtn.textContent = 'Create Account';
            switchText.textContent = 'Already have an account?';
            switchLink.textContent = 'Sign in';
            registerFields.forEach(field => field.classList.remove('hidden'));
        }

        modal.classList.remove('hidden');
        modal.classList.add('scale-in');
    }

    toggleAuthMode() {
        const title = document.getElementById('authModalTitle');
        const isLogin = title.textContent === 'Sign In';
        this.openAuthModal(isLogin ? 'register' : 'login');
    }

    async handleAuth(e) {
        e.preventDefault();
        this.showLoading();

        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const isLogin = document.getElementById('authModalTitle').textContent === 'Sign In';

        // Simulate API call
        await this.delay(1000);

        if (isLogin) {
            // Find user by email
            const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
            const user = users.find(u => u.email === email);
            
            if (user) {
                this.login(user);
                this.showToast('Welcome back!', 'success');
            } else {
                this.showToast('Invalid credentials. Try alex@example.com', 'error');
            }
        } else {
            // Register new user
            const name = document.getElementById('authName').value;
            const username = document.getElementById('authUsername').value;
            
            const newUser = {
                id: Date.now(),
                name,
                username,
                email,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                location: 'New York, NY',
                bio: 'New to SkillSwap and excited to start trading skills!',
                rating: 0,
                tradesCompleted: 0,
                badges: ["First Trade"], // Award welcome badge
                skills: { offering: [], seeking: [] }
            };

            const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
            users.push(newUser);
            localStorage.setItem('skillswap_users', JSON.stringify(users));

            this.login(newUser);
            this.showToast('Account created successfully!', 'success');
            
            // Show profile setup after brief delay
            setTimeout(() => {
                this.showProfileSetupGuide();
            }, 1500);
        }

        this.hideLoading();
        this.closeAllModals();
    }

    showProfileSetupGuide() {
        if (this.showingProfileSetup) return;
        this.showingProfileSetup = true;

        this.showToast('🎉 Welcome! Let\'s set up your profile and add some skills to get started!', 'success');
        
        setTimeout(() => {
            this.showToast('💡 Tip: Add skills you can teach and skills you want to learn in your profile', 'info');
        }, 3000);

        setTimeout(() => {
            this.navigateTo('profile');
            this.showingProfileSetup = false;
        }, 5000);
    }

    login(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        localStorage.setItem('skillswap_currentUser', JSON.stringify(user));
        this.updateUI();
        this.navigateTo('dashboard');
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('skillswap_currentUser');
        this.updateUI();
        this.navigateTo('landing');
        this.showToast('Logged out successfully', 'info');
    }

    // UI Updates
    updateUI() {
        const authButtons = document.querySelector('.nav-auth');
        const userSection = document.querySelector('.nav-user');
        const adminLink = document.getElementById('adminLink');

        if (this.isAuthenticated && this.currentUser) {
            authButtons.classList.add('hidden');
            userSection.classList.remove('hidden');
            document.getElementById('userAvatar').src = this.currentUser.avatar;
            
            // Show admin link if user is admin
            if (this.currentUser.email === 'alex@example.com') {
                this.currentUser.role = 'admin';
                adminLink.classList.remove('hidden');
            }
        } else {
            authButtons.classList.remove('hidden');
            userSection.classList.add('hidden');
            adminLink.classList.add('hidden');
        }
    }

    // Dashboard
    updateDashboard() {
        if (!this.currentUser) return;

        document.getElementById('dashboardUserName').textContent = this.currentUser.name;
        document.getElementById('totalTrades').textContent = this.currentUser.tradesCompleted;
        document.getElementById('averageRating').textContent = this.currentUser.rating.toFixed(1);
        document.getElementById('totalBadges').textContent = this.currentUser.badges.length;
        document.getElementById('skillsOffering').textContent = this.currentUser.skills.offering.length;

        this.populateRecommendations();
        this.populateActivity();
        this.populateUserBadges();
    }

    switchDashboardTab(tab) {
        // Update sidebar
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.tab === tab) {
                link.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.dashboard-tab').forEach(tabContent => {
            tabContent.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');
    }

    populateRecommendations() {
        const container = document.getElementById('recommendationsContainer');
        if (!container) return;

        // Simple recommendation algorithm based on seeking skills or popular skills
        let recommendations = [];
        
        if (this.currentUser.skills.seeking.length > 0) {
            recommendations = this.allSkills.filter(skill => 
                this.currentUser.skills.seeking.some(seeking => 
                    seeking.category === skill.category || seeking.name === skill.name
                )
            ).slice(0, 6);
        } else {
            // Show popular skills if user hasn't specified seeking skills
            recommendations = this.allSkills.slice(0, 6);
        }

        container.innerHTML = recommendations.map(skill => `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <h3>${skill.name}</h3>
                    <span class="recommendation-match">95% Match</span>
                </div>
                <p>${skill.description}</p>
                <div class="skill-category">${skill.category}</div>
            </div>
        `).join('');
    }

    populateActivity() {
        const container = document.getElementById('activityFeed');
        if (!container) return;

        const activities = [
            {
                icon: 'fas fa-user-plus',
                iconBg: 'teal',
                text: 'Welcome to SkillSwap! Start by exploring skills or adding your own.',
                time: 'Just now'
            },
            {
                icon: 'fas fa-trophy',
                iconBg: 'orange',
                text: 'Earned your first badge: "First Trade"',
                time: '1 minute ago'
            },
            {
                icon: 'fas fa-lightbulb',
                iconBg: 'purple',
                text: 'Pro tip: Add skills you can teach to start receiving trade requests',
                time: '2 minutes ago'
            }
        ];

        // Show more activity for existing users
        if (this.currentUser.tradesCompleted > 0) {
            activities.unshift(
                {
                    icon: 'fas fa-handshake',
                    iconBg: 'teal',
                    text: 'Completed trade with Alex Rivera',
                    time: '2 hours ago'
                },
                {
                    icon: 'fas fa-star',
                    iconBg: 'orange',
                    text: 'Received 5-star review for UI/UX Design',
                    time: '1 day ago'
                }
            );
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.iconBg}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    populateUserBadges() {
        const container = document.getElementById('userBadges');
        if (!container || !this.currentUser) return;

        const userBadges = this.badges.filter(badge => 
            this.currentUser.badges.includes(badge.name)
        );

        container.innerHTML = `
            <h3>Your Badges</h3>
            <div class="badges-showcase">
                ${userBadges.map(badge => `
                    <div class="badge ${badge.rarity}" title="${badge.description}">
                        <span class="badge-icon">${badge.icon}</span>
                        <span class="badge-name">${badge.name}</span>
                    </div>
                `).join('')}
                ${userBadges.length === 0 ? '<p>Complete your first trade to earn badges!</p>' : ''}
            </div>
        `;
    }

    // Skills Discovery
    populateSkillsGrid() {
        const container = document.getElementById('skillsGrid');
        if (!container) return;

        const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
        const skillsWithProviders = [];

        users.forEach(user => {
            user.skills.offering.forEach(skill => {
                skillsWithProviders.push({
                    ...skill,
                    provider: user
                });
            });
        });

        this.renderSkills(skillsWithProviders);
    }

    renderSkills(skills) {
        const container = document.getElementById('skillsGrid');
        if (!container) return;

        if (skills.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>No skills found</h3>
                    <p>Try adjusting your search or filters to find more skills.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = skills.map(skill => `
            <div class="skill-card" data-skill-id="${skill.id}" data-provider-id="${skill.provider.id}">
                <div class="skill-card-header">
                    <span class="skill-category">${skill.category}</span>
                    <span class="skill-level ${skill.level.toLowerCase()}">${skill.level}</span>
                </div>
                <h3>${skill.name}</h3>
                <p>${this.allSkills.find(s => s.name === skill.name)?.description || 'Learn this valuable skill'}</p>
                <div class="skill-provider">
                    <img src="${skill.provider.avatar}" alt="${skill.provider.name}" class="provider-avatar">
                    <div class="provider-info">
                        <div class="provider-name">${skill.provider.name}</div>
                        <div class="provider-rating">
                            <i class="fas fa-star"></i>
                            ${skill.provider.rating.toFixed(1)} (${skill.provider.tradesCompleted} trades)
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('click', () => {
                const skillId = card.dataset.skillId;
                const providerId = card.dataset.providerId;
                this.openSkillModal(skillId, providerId);
            });
        });
    }

    searchSkills(query) {
        const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
        const skillsWithProviders = [];

        users.forEach(user => {
            user.skills.offering.forEach(skill => {
                skillsWithProviders.push({
                    ...skill,
                    provider: user
                });
            });
        });

        const filtered = skillsWithProviders.filter(skill =>
            skill.name.toLowerCase().includes(query.toLowerCase()) ||
            skill.category.toLowerCase().includes(query.toLowerCase()) ||
            skill.provider.name.toLowerCase().includes(query.toLowerCase())
        );

        this.renderSkills(filtered);
    }

    filterSkillsByCategory(category) {
        const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
        const skillsWithProviders = [];

        users.forEach(user => {
            user.skills.offering.forEach(skill => {
                skillsWithProviders.push({
                    ...skill,
                    provider: user
                });
            });
        });

        const filtered = category ? 
            skillsWithProviders.filter(skill => skill.category === category) :
            skillsWithProviders;

        this.renderSkills(filtered);
    }

    openSkillModal(skillId, providerId) {
        const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
        const provider = users.find(u => u.id == providerId);
        const skill = provider.skills.offering.find(s => s.id == skillId);
        const skillInfo = this.allSkills.find(s => s.name === skill.name);

        const modal = document.getElementById('skillModal');
        const content = document.getElementById('skillDetailContent');

        content.innerHTML = `
            <div class="skill-detail-header">
                <img src="${provider.avatar}" alt="${provider.name}" class="skill-detail-avatar">
                <div class="skill-detail-info">
                    <h3>${skill.name}</h3>
                    <p>Taught by ${provider.name}</p>
                </div>
            </div>
            <div class="skill-detail-meta">
                <span class="skill-category">${skill.category}</span>
                <span class="skill-level ${skill.level.toLowerCase()}">${skill.level}</span>
                <span class="provider-rating">
                    <i class="fas fa-star"></i>
                    ${provider.rating.toFixed(1)}
                </span>
            </div>
            <p>${skillInfo?.description || 'Learn this valuable skill from an experienced instructor.'}</p>
            <p><strong>About the instructor:</strong> ${provider.bio}</p>
            <div class="skill-detail-actions">
                <button class="btn btn-primary" onclick="app.openTradeModal('${skill.name}', ${providerId})">
                    Request Trade
                </button>
                <button class="btn btn-outline" onclick="app.openChat(${providerId})">
                    Message ${provider.name.split(' ')[0]}
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('scale-in');
    }

    // Trading System
    openTradeModal(skillName, providerId) {
        if (!this.isAuthenticated) {
            this.openAuthModal('login');
            return;
        }

        const modal = document.getElementById('tradeModal');
        const offerSelect = document.getElementById('offerSkill');
        const requestInput = document.getElementById('requestSkill');

        // Populate user's offering skills
        offerSelect.innerHTML = '<option value="">Select a skill...</option>' +
            this.currentUser.skills.offering.map(skill => 
                `<option value="${skill.name}">${skill.name}</option>`
            ).join('');

        if (this.currentUser.skills.offering.length === 0) {
            offerSelect.innerHTML = '<option value="">No skills added yet - add some in your profile first</option>';
        }

        requestInput.value = skillName;
        modal.dataset.providerId = providerId;

        this.closeAllModals();
        modal.classList.remove('hidden');
        modal.classList.add('scale-in');
    }

    async handleTradeRequest(e) {
        e.preventDefault();
        this.showLoading();

        const offerSkill = document.getElementById('offerSkill').value;
        const requestSkill = document.getElementById('requestSkill').value;
        const message = document.getElementById('tradeMessage').value;
        const providerId = document.getElementById('tradeModal').dataset.providerId;

        if (!offerSkill) {
            this.hideLoading();
            this.showToast('Please select a skill to offer first', 'error');
            return;
        }

        // Create new trade
        const trades = JSON.parse(localStorage.getItem('skillswap_trades') || '[]');
        const newTrade = {
            id: Date.now(),
            requester: this.currentUser.username,
            provider: this.sampleUsers.find(u => u.id == providerId)?.username,
            requesterSkill: offerSkill,
            providerSkill: requestSkill,
            status: 'pending',
            title: `${offerSkill} for ${requestSkill}`,
            message,
            createdAt: new Date().toISOString().split('T')[0]
        };

        trades.push(newTrade);
        localStorage.setItem('skillswap_trades', JSON.stringify(trades));

        await this.delay(1000);
        this.hideLoading();
        this.closeAllModals();
        this.showToast('Trade request sent successfully!', 'success');
    }

    // Profile Management
    updateProfile() {
        if (!this.currentUser) return;

        document.getElementById('profileAvatar').src = this.currentUser.avatar;
        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileUsername').textContent = `@${this.currentUser.username}`;
        document.getElementById('profileLocation').textContent = this.currentUser.location;
        document.getElementById('profileTrades').textContent = this.currentUser.tradesCompleted;
        document.getElementById('profileRating').textContent = this.currentUser.rating.toFixed(1);
        document.getElementById('profileBadges').textContent = this.currentUser.badges.length;

        this.populateProfileBadges();
        this.populateProfileSkills();
        this.populateProfileReviews();
    }

    switchProfileTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');
    }

    populateProfileBadges() {
        const container = document.getElementById('profileBadgesList');
        const allBadgesContainer = document.getElementById('allBadges');
        
        if (container) {
            const userBadges = this.badges.filter(badge => 
                this.currentUser.badges.includes(badge.name)
            );

            container.innerHTML = userBadges.map(badge => `
                <div class="badge ${badge.rarity}" title="${badge.description}">
                    ${badge.icon}
                </div>
            `).join('');
        }

        if (allBadgesContainer) {
            allBadgesContainer.innerHTML = this.badges.map(badge => {
                const earned = this.currentUser.badges.includes(badge.name);
                return `
                    <div class="badge ${badge.rarity} ${earned ? '' : 'badge-locked'}" title="${badge.description}">
                        <span class="badge-icon">${badge.icon}</span>
                        <span class="badge-name">${badge.name}</span>
                        <span class="badge-description">${badge.description}</span>
                        ${earned ? '<i class="fas fa-check badge-check"></i>' : '<i class="fas fa-lock badge-lock"></i>'}
                    </div>
                `;
            }).join('');
        }
    }

    populateProfileSkills() {
        const offeringContainer = document.getElementById('offeringSkills');
        const seekingContainer = document.getElementById('seekingSkills');

        if (offeringContainer) {
            offeringContainer.innerHTML = this.currentUser.skills.offering.map(skill => `
                <div class="skill-item">
                    <div>
                        <strong>${skill.name}</strong>
                        <div class="skill-category">${skill.category}</div>
                    </div>
                    <span class="skill-level ${skill.level.toLowerCase()}">${skill.level}</span>
                </div>
            `).join('') || '<p>No skills listed yet. <strong>Tip:</strong> Add skills you can teach to start receiving trade requests!</p>';
        }

        if (seekingContainer) {
            seekingContainer.innerHTML = this.currentUser.skills.seeking.map(skill => `
                <div class="skill-item">
                    <div>
                        <strong>${skill.name}</strong>
                        <div class="skill-category">${skill.category}</div>
                    </div>
                    <span class="skill-level ${skill.level.toLowerCase()}">${skill.level}</span>
                </div>
            `).join('') || '<p>No learning goals set yet. <strong>Tip:</strong> Add skills you want to learn to get better recommendations!</p>';
        }
    }

    populateProfileReviews() {
        const container = document.getElementById('userReviews');
        if (!container) return;

        if (this.currentUser.tradesCompleted > 0) {
            const sampleReviews = [
                {
                    reviewer: 'Alex Rivera',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                    rating: 5,
                    text: 'Excellent design skills and great communication!',
                    date: '2 weeks ago'
                },
                {
                    reviewer: 'Maria Santos',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
                    rating: 5,
                    text: 'Very patient teacher, learned so much about Figma.',
                    date: '1 month ago'
                }
            ];

            container.innerHTML = sampleReviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <img src="${review.avatar}" alt="${review.reviewer}">
                        <div>
                            <strong>${review.reviewer}</strong>
                            <div class="review-rating">
                                ${Array.from({length: 5}, (_, i) => 
                                    `<i class="fas fa-star ${i < review.rating ? '' : 'star-empty'}"></i>`
                                ).join('')}
                            </div>
                        </div>
                        <span class="review-date">${review.date}</span>
                    </div>
                    <p>${review.text}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No reviews yet. Complete some trades to start receiving feedback!</p>';
        }
    }

    // Trades Management
    updateTrades() {
        const trades = JSON.parse(localStorage.getItem('skillswap_trades') || '[]');
        const userTrades = trades.filter(trade => 
            trade.requester === this.currentUser.username || 
            trade.provider === this.currentUser.username
        );

        this.renderTrades(userTrades);
    }

    renderTrades(trades) {
        const container = document.getElementById('tradesList');
        if (!container) return;

        container.innerHTML = trades.map(trade => `
            <div class="trade-card" data-status="${trade.status}">
                <div class="trade-header">
                    <h3>${trade.title}</h3>
                    <span class="trade-status ${trade.status}">${this.formatStatus(trade.status)}</span>
                </div>
                <div class="trade-details">
                    <div class="trade-skill">
                        <strong>${trade.requesterSkill}</strong>
                        <div>by ${trade.requester}</div>
                    </div>
                    <div class="trade-arrow">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <div class="trade-skill">
                        <strong>${trade.providerSkill}</strong>
                        <div>by ${trade.provider}</div>
                    </div>
                </div>
                <div class="trade-actions">
                    ${this.getTradeActions(trade)}
                </div>
            </div>
        `).join('') || '<p>No trades yet. <a href="#" data-page="discover">Discover skills</a> to get started!</p>';
    }

    formatStatus(status) {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getTradeActions(trade) {
        if (trade.status === 'pending' && trade.provider === this.currentUser.username) {
            return `
                <button class="btn btn-primary btn-sm" onclick="app.acceptTrade(${trade.id})">Accept</button>
                <button class="btn btn-outline btn-sm" onclick="app.rejectTrade(${trade.id})">Decline</button>
            `;
        } else if (trade.status === 'in_progress') {
            return `
                <button class="btn btn-primary btn-sm" onclick="app.completeTrade(${trade.id})">Mark Complete</button>
                <button class="btn btn-outline btn-sm" onclick="app.openChat()">Chat</button>
            `;
        } else if (trade.status === 'completed') {
            return `
                <button class="btn btn-outline btn-sm" onclick="app.leaveFeedback(${trade.id})">Leave Review</button>
            `;
        }
        return '<span class="trade-status pending">Waiting for response</span>';
    }

    filterTrades(filter) {
        const trades = JSON.parse(localStorage.getItem('skillswap_trades') || '[]');
        const userTrades = trades.filter(trade => 
            trade.requester === this.currentUser.username || 
            trade.provider === this.currentUser.username
        );

        const filtered = filter === 'all' ? 
            userTrades : 
            userTrades.filter(trade => trade.status === filter);

        this.renderTrades(filtered);
    }

    async acceptTrade(tradeId) {
        this.showLoading();
        const trades = JSON.parse(localStorage.getItem('skillswap_trades') || '[]');
        const trade = trades.find(t => t.id === tradeId);
        
        if (trade) {
            trade.status = 'in_progress';
            localStorage.setItem('skillswap_trades', JSON.stringify(trades));
            
            await this.delay(500);
            this.updateTrades();
            this.showToast('Trade accepted! Start learning together.', 'success');
        }
        this.hideLoading();
    }

    async completeTrade(tradeId) {
        this.showLoading();
        const trades = JSON.parse(localStorage.getItem('skillswap_trades') || '[]');
        const trade = trades.find(t => t.id === tradeId);
        
        if (trade) {
            trade.status = 'completed';
            trade.completedAt = new Date().toISOString().split('T')[0];
            localStorage.setItem('skillswap_trades', JSON.stringify(trades));
            
            // Update user stats
            this.currentUser.tradesCompleted += 1;
            this.updateUserInStorage();
            
            // Check for badge unlocks
            this.checkAndUnlockBadge('Frequent Swapper');
            
            await this.delay(500);
            this.updateTrades();
            this.showToast('Trade completed! Leave a review to help others.', 'success');
        }
        this.hideLoading();
    }

    // Chat System
    openChat(userId) {
        const chatContainer = document.getElementById('floatingChat');
        const user = this.sampleUsers.find(u => u.id == userId) || this.sampleUsers[1];
        
        document.getElementById('chatAvatar').src = user.avatar;
        document.getElementById('chatUserName').textContent = user.name.split(' ')[0];
        
        chatContainer.classList.remove('hidden');
        this.populateChat();
        this.closeAllModals();
    }

    populateChat() {
        const container = document.getElementById('chatMessages');
        const sampleMessages = [
            {
                text: "Hi! I'm interested in learning React. When would be a good time to start?",
                sent: true,
                time: '10:30 AM'
            },
            {
                text: "Great! I'm available this week. How about we start with the basics on Wednesday?",
                sent: false,
                time: '10:32 AM'
            },
            {
                text: "Perfect! I'll prepare some design resources to trade for the React lessons.",
                sent: true,
                time: '10:35 AM'
            }
        ];

        container.innerHTML = sampleMessages.map(msg => `
            <div class="message ${msg.sent ? 'sent' : 'received'}">
                ${msg.text}
                <div class="message-time">${msg.time}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        const container = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'message sent';
        messageEl.innerHTML = `
            ${message}
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
        input.value = '';

        // Simulate typing and response
        this.simulateTyping();
        
        setTimeout(() => {
            this.sendBotResponse(message);
        }, 2000);
    }

    simulateTyping() {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.remove('hidden');
        
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 2000);
    }

    sendBotResponse(userMessage) {
        const responses = [
            "That sounds great! I'm excited to work together.",
            "Thanks for reaching out. Let me know if you have any questions!",
            "Perfect! Looking forward to our skill exchange session.",
            "Absolutely! I think this will be a great learning experience for both of us.",
            "Great suggestion! When would work best for your schedule?"
        ];

        const container = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'message received';
        messageEl.innerHTML = `
            ${responses[Math.floor(Math.random() * responses.length)]}
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }

    toggleChat() {
        document.getElementById('floatingChat').classList.toggle('minimized');
    }

    closeChat() {
        document.getElementById('floatingChat').classList.add('hidden');
    }

    // Admin Dashboard
    updateAdmin() {
        const container = document.getElementById('adminUsersTable');
        if (!container) return;

        const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
        
        container.innerHTML = users.map(user => `
            <div class="table-row">
                <div class="user-cell">
                    <img src="${user.avatar}" alt="${user.name}">
                    <div>
                        <div>${user.name}</div>
                        <div style="font-size: 12px; color: var(--color-text-secondary)">@${user.username}</div>
                    </div>
                </div>
                <div>${user.email}</div>
                <div>${user.tradesCompleted}</div>
                <div>${user.rating.toFixed(1)}</div>
                <div class="admin-actions">
                    <button class="btn btn-outline btn-sm">View</button>
                    <button class="btn btn-outline btn-sm">Edit</button>
                </div>
            </div>
        `).join('');
    }

    // Badge System
    checkAndUnlockBadge(badgeName) {
        if (!this.currentUser || this.currentUser.badges.includes(badgeName)) return;

        const badge = this.badges.find(b => b.name === badgeName);
        if (!badge) return;

        let shouldUnlock = false;

        switch (badgeName) {
            case 'First Trade':
                shouldUnlock = true; // Unlock on registration
                break;
            case 'Frequent Swapper':
                shouldUnlock = this.currentUser.tradesCompleted >= 10;
                break;
            case 'Top Teacher':
                shouldUnlock = this.currentUser.rating >= 4.5;
                break;
            case '5-Star Mentor':
                shouldUnlock = this.currentUser.rating === 5.0;
                break;
            case 'Community Builder':
                shouldUnlock = this.currentUser.tradesCompleted >= 20;
                break;
        }

        if (shouldUnlock) {
            this.unlockBadge(badge);
        }
    }

    unlockBadge(badge) {
        this.currentUser.badges.push(badge.name);
        this.updateUserInStorage();
        
        // Show confetti animation
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // Show badge unlock notification
        setTimeout(() => {
            this.showToast(`🎉 Badge unlocked: ${badge.name}!`, 'success');
        }, 500);
    }

    updateUserInStorage() {
        localStorage.setItem('skillswap_currentUser', JSON.stringify(this.currentUser));
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('skillswap_users', JSON.stringify(users));
        }
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('skillswap_theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Testimonials - Fixed to ensure they always load
    populateTestimonials() {
        const container = document.getElementById('testimonialsContainer');
        if (!container) return;

        container.innerHTML = this.testimonials.map(testimonial => `
            <div class="testimonial-card fade-in">
                <div class="testimonial-header">
                    <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar">
                    <div class="testimonial-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.role}</p>
                    </div>
                </div>
                <div class="testimonial-rating">
                    ${Array.from({length: 5}, (_, i) => 
                        `<i class="fas fa-star ${i < testimonial.rating ? 'star' : ''}"></i>`
                    ).join('')}
                </div>
                <p class="testimonial-text">"${testimonial.text}"</p>
            </div>
        `).join('');
    }

    // Utility functions
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');

        toast.className = `toast ${type}`;
        
        switch(type) {
            case 'success':
                icon.className = 'toast-icon fas fa-check-circle';
                break;
            case 'error':
                icon.className = 'toast-icon fas fa-exclamation-circle';
                break;
            case 'info':
            default:
                icon.className = 'toast-icon fas fa-info-circle';
                break;
        }

        messageEl.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animations
        document.querySelectorAll('.feature-card, .step, .testimonial-card').forEach(el => {
            observer.observe(el);
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('skillswap_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) {
                themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SkillSwapApp();
});

// Global functions for onclick handlers
window.acceptTrade = (id) => window.app.acceptTrade(id);
window.completeTrade = (id) => window.app.completeTrade(id);
window.openChat = (id) => window.app.openChat(id);
window.openTradeModal = (skill, providerId) => window.app.openTradeModal(skill, providerId);