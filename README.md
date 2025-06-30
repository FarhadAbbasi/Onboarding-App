# AppRamps - Onboarding Page Builder

A serverless, client-side onboarding page builder that allows users to create beautiful, responsive onboarding pages using AI-generated content. Built with React, Supabase, and OpenAI.

## 🚀 Features

### Foundation
- **Fully Client-Side**: No server required - everything runs in the browser
- **Supabase Integration**: Authentication, database, and file storage
- **Row-Level Security**: Each user can only access their own data
- **Real-time Sync**: Changes are automatically saved to Supabase

### Experience
- **AI Content Generation**: Use OpenAI to generate headlines, features, and testimonials
- **Block-Based Editor**: Notion-style editing with drag-and-drop reordering
- **Live Previews**: Switch between mobile and desktop views instantly
- **In-Place Editing**: Click any text to edit directly

### Growth
- **Static Site Generation**: Export to optimized HTML with Tailwind CSS
- **CDN Distribution**: Published pages served from Supabase's global CDN
- **Custom Slugs**: Create memorable URLs for your onboarding pages
- **Analytics Ready**: Built-in tracking for page views and interactions

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI GPT-3.5 Turbo
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onboarding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_DOMAIN=appramps.site
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
   - Enable Google OAuth in Authentication > Providers (optional)

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

The application uses three main tables:

### Projects
- Stores app information (name, URL, category, notes)
- Each user can have multiple projects

### Content Blocks
- Stores individual content pieces (headlines, features, etc.)
- Supports drag-and-drop reordering
- Linked to projects via foreign key

### Published Pages
- Tracks published static sites
- Stores custom slugs and file URLs
- Supports multiple versions per project

## 🎨 Components Architecture

```
src/
├── components/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Project management
│   ├── editor/         # Block-based editor
│   ├── preview/        # Mobile/desktop previews
│   ├── publish/        # Publishing workflow
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts (Auth)
├── lib/              # Utilities (Supabase, OpenAI)
└── App.tsx           # Main application
```

## 🚀 Usage

### Creating a Project
1. Sign in with email/password or Google
2. Click "New Project" 
3. Fill in your app details
4. Optionally add your OpenAI API key for AI generation
5. Click "Generate" to create your project with AI content

### Editing Content
1. Select a project from your dashboard
2. Use the block editor to modify content
3. Drag blocks to reorder them
4. Add new blocks using the "Add Block" menu
5. Switch between mobile and desktop previews

### Publishing
1. Click "Publish" when you're ready
2. Choose a custom slug for your page
3. Your page will be generated as static HTML
4. Share the public URL with your users

## 🔧 Configuration

### OpenAI Integration
Users provide their own OpenAI API keys for content generation. Keys are never stored and only used for the generation request.

### Supabase Setup
The application requires the following Supabase features:
- Authentication (Email + Google OAuth)
- Database with RLS enabled
- Storage bucket for published pages

### Custom Domain
To use your own domain instead of `appramps.site`:
1. Update `VITE_APP_DOMAIN` in your environment variables
2. Configure DNS to point to your Supabase storage bucket
3. Set up SSL certificates

## 🎯 Project Goals

### Simplicity
- One-click content generation
- Intuitive drag-and-drop editing
- No technical knowledge required

### Performance
- Static site generation for fast loading
- CDN distribution for global reach
- Optimized mobile experience

### Scalability
- Serverless architecture
- Client-side only (no server costs)
- Scales with Supabase infrastructure

## 🔐 Security

- **Row-Level Security**: Users can only access their own data
- **Client-Side Auth**: Secure authentication with Supabase Auth
- **API Key Safety**: OpenAI keys are never stored or logged
- **HTTPS Only**: All communication is encrypted

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual
1. Run `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Configure environment variables

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the issues page for common problems
- Join our Discord community
- Email support@appramps.com

## 🗺 Roadmap

- [ ] Custom themes and color palettes
- [ ] Advanced analytics dashboard
- [ ] A/B testing for different versions
- [ ] Custom domain integration
- [ ] Template marketplace
- [ ] Team collaboration features

---

Built with ❤️ by the AppRamps team
# onboarding
