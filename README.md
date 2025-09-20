# Festival de Otoño Cuauhtémoc Website

A modern, responsive website for the Festival de Otoño Cuauhtémoc, built with Astro and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Multi-page Structure**: Home, Itinerary, Success Stories, and Contact pages
- **Festival Branding**: Custom color scheme matching the festival theme
- **Contact Form**: Functional contact form with validation
- **Accessibility**: Semantic HTML and proper ARIA labels

## Pages

- **Home** (`/`): Main landing page with festival information, activities, and impact statistics
- **Itinerario** (`/itinerario`): Festival schedule and program details
- **Historias de éxito** (`/historias`): Success stories and testimonials
- **Contáctanos** (`/contacto`): Contact information and form

## Technology Stack

- **Astro**: Static site generator
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and better development experience

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and visit `http://localhost:4321`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── layouts/
│   └── Layout.astro          # Main layout component
├── pages/
│   ├── index.astro           # Home page
│   ├── itinerario.astro      # Itinerary page
│   ├── historias.astro       # Success stories page
│   └── contacto.astro        # Contact page
├── styles/
│   └── global.css            # Global styles and Tailwind imports
└── components/               # Reusable components (if needed)
```

## Content

The website content is based on the original Festival de Otoño Cuauhtémoc website, including:

- Festival mission, vision, and objectives
- Community impact statistics
- Activity categories and descriptions
- Contact information and form
- Social cause information

## Customization

The website uses a custom color palette defined in `tailwind.config.mjs`:

- `festival-orange`: #FF6B35
- `festival-brown`: #8B4513
- `festival-gold`: #FFD700
- `festival-green`: #228B22

## License

This project is for the Festival de Otoño Cuauhtémoc community.
