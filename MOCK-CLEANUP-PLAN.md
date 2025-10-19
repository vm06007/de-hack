# 🧹 Mock Files Cleanup Plan

## ✅ **Mock Files We Can DELETE (Replaced by Backend API)**

### 🎯 **Core Data (Fully Replaced)**
- ✅ `hackers.tsx` → **DELETE** (replaced by `/api/users`)
- ✅ `products.tsx` → **DELETE** (replaced by `/api/hackathons`)
- ✅ `customers.tsx` → **DELETE** (replaced by `/api/users`)

### 📊 **Analytics & Dashboard Data**
- ✅ `dashboard.tsx` → **DELETE** (replaced by `/api/analytics/overview`)
- ✅ `charts.tsx` → **DELETE** (replaced by analytics API)
- ✅ `income.tsx` → **DELETE** (replaced by user earnings data)

### 🏢 **Organizations & Creators**
- ✅ `creators.tsx` → **DELETE** (replaced by `/api/organizations`)
- ✅ `followers.tsx` → **DELETE** (can be replaced by analytics)
- ✅ `followings.tsx` → **DELETE** (can be replaced by analytics)

### 💰 **Financial Data**
- ✅ `payouts.tsx` → **DELETE** (can be replaced by user earnings)
- ✅ `refunds.tsx` → **DELETE** (can be replaced by user earnings)
- ✅ `statements.tsx` → **DELETE** (can be replaced by user earnings)
- ✅ `transactions.tsx` → **DELETE** (can be replaced by user earnings)

### 🛒 **Shop & Products**
- ✅ `shopItems.tsx` → **DELETE** (replaced by hackathons)
- ✅ `pricing.tsx` → **DELETE** (can be replaced by hackathon prize pools)

## ⚠️ **Mock Files to KEEP (Not Yet Replaced)**

### 🔧 **UI/UX Data**
- ⚠️ `activeTimes.tsx` → **KEEP** (UI component data)
- ⚠️ `compatibility.tsx` → **KEEP** (technical compatibility data)
- ⚠️ `countries.tsx` → **KEEP** (static reference data)

### 💬 **Communication**
- ⚠️ `comments.tsx` → **KEEP** (comments system not implemented)
- ⚠️ `messages.tsx` → **KEEP** (messaging system not implemented)
- ⚠️ `notifications.tsx` → **KEEP** (notifications system not implemented)

### 📋 **Content**
- ⚠️ `faqs.tsx` → **KEEP** (FAQ content)
- ⚠️ `affiliate-center.tsx` → **KEEP** (affiliate system not implemented)

## 🎯 **Backend Data We Have**

### ✅ **Available via API**
- **Users**: 2 hackers (Alex Chen, Sarah Kim)
- **Hackathons**: 2 events (ETHGlobal Online 2025, Unite DeFi 2025)
- **Organizations**: 2 orgs (ETHGlobal, Token2049)
- **Applications**: 1 sample application
- **Analytics**: Views, likes, engagement data

### 📊 **API Endpoints Ready**
- `GET /api/hackathons` - Hackathon data
- `GET /api/users` - User profiles
- `GET /api/organizations` - Organizations
- `GET /api/analytics/overview` - Platform stats
- `POST /api/analytics/track` - Track events

## 🚀 **Cleanup Commands**

### **Phase 1: Delete Core Data Mocks**
```bash
# Delete files that are fully replaced by API
rm dashboard-builder/mocks/hackers.tsx
rm dashboard-builder/mocks/products.tsx
rm dashboard-builder/mocks/customers.tsx
rm dashboard-builder/mocks/dashboard.tsx
rm dashboard-builder/mocks/charts.tsx
rm dashboard-builder/mocks/income.tsx
rm dashboard-builder/mocks/creators.tsx
rm dashboard-builder/mocks/followers.tsx
rm dashboard-builder/mocks/followings.tsx
```

### **Phase 2: Delete Financial Mocks**
```bash
# Delete financial data mocks
rm dashboard-builder/mocks/payouts.tsx
rm dashboard-builder/mocks/refunds.tsx
rm dashboard-builder/mocks/statements.tsx
rm dashboard-builder/mocks/transactions.tsx
rm dashboard-builder/mocks/shopItems.tsx
rm dashboard-builder/mocks/pricing.tsx
```

### **Phase 3: Update Frontend**
- Replace mock imports with API calls
- Update components to use new data structure
- Add loading states and error handling

## 📈 **Benefits of Cleanup**

- ✅ **Reduced Bundle Size**: Fewer mock files to load
- ✅ **Real Data**: Components use actual API data
- ✅ **Dynamic Content**: Data updates automatically
- ✅ **Better Performance**: No static mock data
- ✅ **Easier Development**: Single source of truth

## 🎯 **Next Steps**

1. **Delete the mock files** (commands above)
2. **Update components** to use API calls
3. **Add error handling** for API failures
4. **Test the integration** thoroughly
5. **Add more sample data** to backend as needed

This cleanup will make your codebase much cleaner and more maintainable! 🎉
