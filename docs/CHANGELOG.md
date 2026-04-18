# Changelog

All notable changes to the World of BrandForge project.

## [1.0.0] - April 18, 2026

### Added
- **SEO Optimization**
  - Comprehensive metadata on all pages with OpenGraph URLs
  - SEO-friendly sitemap with 20+ pages
  - robots.txt with proper crawl rules
  - Custom 404 page with navigation

- **Branding**
  - Consistent "World of BrandForge" messaging across all components
  - Brand logo integrated in navbar, sidebar, and footer
  - SEO-friendly image filenames for public assets

- **Leaderboard Enhancements**
  - Honor and Conquest points tracking with timestamps
  - Recent activity feed showing point earnings
  - Top earners sections (Honor and Conquest)
  - Achievement badges display

- **Pages**
  - Custom 404 error page
  - Updated all landing and app pages with proper SEO

### Changed
- **UI/UX Improvements**
  - Sidebar cleaned up — removed Settings and Logout buttons
  - AI Tools simplified — removed "My Agents" tab
  - Register page removed — consolidated authentication with login
  - Logo displayed at larger size with zoom effect

- **Performance**
  - CSS optimization enabled (experimental)
  - Scroll restoration enabled
  - Removed production browser source maps

### Fixed
- **Database**
  - Squad members schema fixed — added user_id and member_type columns
  - Role constraints updated for proper squad join functionality
  - Schema cache refresh triggers added

- **Consistency**
  - All email references standardized to hello@brandforge.gg
  - Privacy page and cookies page updated

### Removed
- `/register` page — consolidated with login flow
- Settings button from sidebar footer
- Logout button from sidebar
- "My Agents" tab from AI Tools page

---

## [0.9.0] - April 2026

### Added
- Initial leaderboard implementation with RP rankings
- Season system with prize pools
- Tier system (Challenger → Undisputed)
- Basic Honor and Conquest point tracking

### Features
- Marketplace with services and requests
- Deal rooms for negotiations
- Chat system for communication
- Squad creation and management
- AI Tools (Brief Generator, Proposal Writer, Contract Review)

---

## Contact

For questions or support, contact us at hello@brandforge.gg
