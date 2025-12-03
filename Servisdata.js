// ==================== DATA LAYANAN PER KATEGORI ====================
const ServiceData = {
    categories: {
        instagram: {
            name: "Instagram",
            icon: "fab fa-instagram",
            color: "#E1306C",
            subcategories: ['followers', 'likes', 'views', 'comments', 'story', 'reels']
        },
        tiktok: {
            name: "TikTok",
            icon: "fab fa-tiktok",
            color: "#000000",
            subcategories: ['followers', 'likes', 'views', 'comments', 'shares']
        },
        facebook: {
            name: "Facebook",
            icon: "fab fa-facebook",
            color: "#1877F2",
            subcategories: ['likes', 'followers', 'post', 'comments', 'shares']
        },
        youtube: {
            name: "YouTube",
            icon: "fab fa-youtube",
            color: "#FF0000",
            subcategories: ['subscribers', 'likes', 'views', 'comments', 'hours']
        },
        twitter: {
            name: "Twitter",
            icon: "fab fa-twitter",
            color: "#1DA1F2",
            subcategories: ['followers', 'likes', 'retweets', 'comments']
        },
        telegram: {
            name: "Telegram",
            icon: "fab fa-telegram",
            color: "#0088CC",
            subcategories: ['members', 'views', 'reactions']
        },
        spotify: {
            name: "Spotify",
            icon: "fab fa-spotify",
            color: "#1DB954",
            subcategories: ['plays', 'followers', 'saves']
        }
    },
    
    services: {
        'instagram-followers': [
            { 
                id: "ig-followers-1", 
                name: "Followers Indonesia Aktif", 
                price: 900, 
                min: 100, 
                max: 5000, 
                per: "100 followers", 
                profit: 800, 
                provider: "IG1",
                description: "Followers aktif dari Indonesia dengan real engagement"
            },
            { 
                id: "ig-followers-2", 
                name: "Followers Worldwide", 
                price: 750, 
                min: 100, 
                max: 10000, 
                per: "100 followers", 
                profit: 800, 
                provider: "IG2",
                description: "Followers dari seluruh dunia"
            },
            { 
                id: "ig-followers-3", 
                name: "Followers Real Indonesia", 
                price: 1200, 
                min: 100, 
                max: 3000, 
                per: "100 followers", 
                profit: 1200, 
                provider: "IG3",
                description: "Followers real dari Indonesia dengan profil lengkap"
            }
        ],
        
        'instagram-likes': [
            { 
                id: "ig-likes-1", 
                name: "Likes Instagram Post", 
                price: 700, 
                min: 50, 
                max: 10000, 
                per: "100 likes", 
                profit: 800, 
                provider: "IG4",
                description: "Likes untuk post Instagram"
            },
            { 
                id: "ig-likes-2", 
                name: "Likes Reels HD", 
                price: 800, 
                min: 100, 
                max: 50000, 
                per: "100 likes", 
                profit: 800, 
                provider: "IG5",
                description: "Likes khusus untuk Reels Instagram"
            }
        ],
        
        'tiktok-followers': [
            { 
                id: "tt-followers-1", 
                name: "Followers TikTok Indonesia", 
                price: 950, 
                min: 100, 
                max: 10000, 
                per: "100 followers", 
                profit: 800, 
                provider: "TT1",
                description: "Followers TikTok dari Indonesia"
            },
            { 
                id: "tt-followers-2", 
                name: "Followers TikTok Real", 
                price: 1200, 
                min: 100, 
                max: 5000, 
                per: "100 followers", 
                profit: 1200, 
                provider: "TT2",
                description: "Followers TikTok real dengan profil aktif"
            }
        ],
        
        'youtube-subscribers': [
            { 
                id: "yt-subs-1", 
                name: "Subscribers Indonesia", 
                price: 2500, 
                min: 100, 
                max: 5000, 
                per: "100 subscribers", 
                profit: 2500, 
                provider: "YT1",
                description: "Subscribers dari Indonesia"
            },
            { 
                id: "yt-subs-2", 
                name: "Subscribers Worldwide", 
                price: 2200, 
                min: 100, 
                max: 10000, 
                per: "100 subscribers", 
                profit: 2200, 
                provider: "YT2",
                description: "Subscribers dari seluruh dunia"
            }
        ],
        
        'facebook-likes': [
            { 
                id: "fb-likes-1", 
                name: "Page Likes Facebook", 
                price: 800, 
                min: 100, 
                max: 5000, 
                per: "100 likes", 
                profit: 800, 
                provider: "FB1",
                description: "Likes untuk halaman Facebook"
            }
        ]
    },
    
    // Method untuk mendapatkan layanan berdasarkan kategori dan subkategori
    getServices: function(categoryId, subcategoryId) {
        const key = `${categoryId}-${subcategoryId}`;
        return this.services[key] || [];
    },
    
    // Method untuk mendapatkan semua kategori
    getAllCategories: function() {
        return Object.keys(this.categories);
    },
    
    // Method untuk mendapatkan subkategori berdasarkan kategori
    getSubcategories: function(categoryId) {
        return this.categories[categoryId]?.subcategories || [];
    },
    
    // Method untuk mendapatkan informasi kategori
    getCategoryInfo: function(categoryId) {
        return this.categories[categoryId];
    },
    
    // Method untuk mencari service berdasarkan ID
    findServiceById: function(serviceId) {
        for (const key in this.services) {
            const service = this.services[key].find(s => s.id === serviceId);
            if (service) return service;
        }
        return null;
    }
};

// Export untuk module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceData;
                  }
