import { WebsiteComponent, WebsitePage, ComponentType, createComponent } from '@/types';

interface AIResponse {
  components: Array<{
    type: ComponentType;
    content: Record<string, unknown>;
    styles: Record<string, unknown>;
  }>;
}

const SYSTEM_PROMPT = `You are an expert website designer and developer AI assistant. Your role is to generate professional, modern, and visually appealing website components based on user descriptions.

When generating components, always respond with valid JSON in this exact format:
{
  "components": [
    {
      "type": "component_type",
      "content": { ... component-specific content ... },
      "styles": { ... optional styles ... }
    }
  ]
}

Available component types:
- hero: Hero section with title, subtitle, button, and optional image
- navbar: Navigation bar with logo and links
- footer: Footer section with links and copyright
- heading: Text heading (h1-h6)
- text: Paragraph text
- button: Clickable button
- image: Image with alt text
- card: Content card with title, description, and optional image
- pricing: Pricing table with plans and features
- testimonial: Customer testimonials
- faq: Frequently asked questions accordion
- contact-form: Contact form section
- gallery: Image gallery grid
- feature: Feature showcase with icons
- cta: Call to action section

For styles, you can provide:
- margin and padding values
- backgroundColor, color
- borderRadius
- fontSize, fontWeight, fontFamily
- textAlign
- boxShadow
- border

Design guidelines:
- Use modern, clean designs
- Ensure good contrast and readability
- Apply appropriate spacing
- Use professional color schemes
- Keep layouts responsive-friendly
- Follow current web design trends

Always consider the context and purpose of the website when generating components.`;

function parseAIResponse(text: string): AIResponse | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*"components"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return null;
  }
}

export async function generateComponents(prompt: string): Promise<WebsiteComponent[]> {
  // Mock AI generation - in production, this would call OpenAI or similar API
  // For now, we'll return intelligent defaults based on the prompt

  const lowerPrompt = prompt.toLowerCase();

  // Detect component types from prompt
  const components: WebsiteComponent[] = [];

  if (lowerPrompt.includes('nav') || lowerPrompt.includes('header') || lowerPrompt.includes('menu')) {
    components.push(createComponent('navbar'));
  }

  if (lowerPrompt.includes('hero') || lowerPrompt.includes('landing') || lowerPrompt.includes('banner')) {
    components.push(createComponent('hero'));
  }

  if (lowerPrompt.includes('feature') || lowerPrompt.includes('benefit') || lowerPrompt.includes('service')) {
    components.push(createComponent('feature'));
  }

  if (lowerPrompt.includes('price') || lowerPrompt.includes('plan') || lowerPrompt.includes('subscription')) {
    components.push(createComponent('pricing'));
  }

  if (lowerPrompt.includes('testimonial') || lowerPrompt.includes('review') || lowerPrompt.includes('quote')) {
    components.push(createComponent('testimonial'));
  }

  if (lowerPrompt.includes('faq') || lowerPrompt.includes('question') || lowerPrompt.includes('help')) {
    components.push(createComponent('faq'));
  }

  if (lowerPrompt.includes('contact') || lowerPrompt.includes('form') || lowerPrompt.includes('get in touch')) {
    components.push(createComponent('contact-form'));
  }

  if (lowerPrompt.includes('gallery') || lowerPrompt.includes('portfolio') || lowerPrompt.includes('showcase')) {
    components.push(createComponent('gallery'));
  }

  if (lowerPrompt.includes('cta') || lowerPrompt.includes('call to action') || lowerPrompt.includes('get started')) {
    components.push(createComponent('cta'));
  }

  if (lowerPrompt.includes('footer') || lowerPrompt.includes('bottom')) {
    components.push(createComponent('footer'));
  }

  // If no specific components detected, create a basic landing page structure
  if (components.length === 0) {
    if (lowerPrompt.includes('landing page') || lowerPrompt.includes('website') || lowerPrompt.includes('site')) {
      components.push(
        createComponent('navbar'),
        createComponent('hero'),
        createComponent('feature'),
        createComponent('cta'),
        createComponent('footer')
      );
    } else {
      // Default to a simple hero section
      components.push(createComponent('hero'));
    }
  }

  // Update content based on detected context
  updateContentBasedOnPrompt(components, prompt);

  return components;
}

function updateContentBasedOnPrompt(components: WebsiteComponent[], prompt: string): void {
  const lowerPrompt = prompt.toLowerCase();

  // Detect industry/niche
  let industry = 'general';
  if (lowerPrompt.includes('tech') || lowerPrompt.includes('software') || lowerPrompt.includes('app')) {
    industry = 'technology';
  } else if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('e-commerce') || lowerPrompt.includes('ecommerce')) {
    industry = 'ecommerce';
  } else if (lowerPrompt.includes('agency') || lowerPrompt.includes('creative') || lowerPrompt.includes('design')) {
    industry = 'agency';
  } else if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('food') || lowerPrompt.includes('cafe')) {
    industry = 'restaurant';
  } else if (lowerPrompt.includes('real estate') || lowerPrompt.includes('property') || lowerPrompt.includes('realty')) {
    industry = 'realestate';
  } else if (lowerPrompt.includes('fitness') || lowerPrompt.includes('gym') || lowerPrompt.includes('health')) {
    industry = 'fitness';
  } else if (lowerPrompt.includes('education') || lowerPrompt.includes('course') || lowerPrompt.includes('learn')) {
    industry = 'education';
  }

  // Update content based on industry
  for (const component of components) {
    if (component.type === 'hero') {
      component.content = getHeroContent(industry);
    } else if (component.type === 'navbar') {
      component.content = getNavbarContent(industry);
    } else if (component.type === 'feature') {
      component.content = getFeatureContent(industry);
    } else if (component.type === 'pricing') {
      component.content = getPricingContent(industry);
    }
  }
}

function getHeroContent(industry: string): Record<string, unknown> {
  const content = {
    technology: {
      title: 'Build the Future with Innovation',
      subtitle: 'Transform your ideas into reality with cutting-edge technology solutions. Accelerate development and scale effortlessly.',
      buttonText: 'Start Building',
    },
    ecommerce: {
      title: 'Shop the Latest Trends',
      subtitle: 'Discover amazing products at unbeatable prices. Free shipping on orders over $50.',
      buttonText: 'Shop Now',
    },
    agency: {
      title: 'Creative Solutions for Modern Brands',
      subtitle: 'We craft digital experiences that captivate, engage, and convert. Let us bring your vision to life.',
      buttonText: 'View Our Work',
    },
    restaurant: {
      title: 'Authentic Flavors, Memorable Moments',
      subtitle: 'Experience culinary excellence in every bite. Book your table today for an unforgettable dining experience.',
      buttonText: 'Reserve a Table',
    },
    realestate: {
      title: 'Find Your Dream Home Today',
      subtitle: 'Explore premium properties in the best locations. Expert guidance for buyers and sellers.',
      buttonText: 'Browse Properties',
    },
    fitness: {
      title: 'Transform Your Body & Mind',
      subtitle: 'Join our community and achieve your fitness goals with expert trainers and state-of-the-art equipment.',
      buttonText: 'Start Your Journey',
    },
    education: {
      title: 'Learn Without Limits',
      subtitle: 'Access world-class courses taught by industry experts. Start learning today and advance your career.',
      buttonText: 'Explore Courses',
    },
    general: {
      title: 'Build Something Amazing',
      subtitle: 'Create beautiful websites without coding. Our AI-powered platform makes it easy to bring your ideas to life.',
      buttonText: 'Get Started',
    },
  };

  return content[industry as keyof typeof content] || content.general;
}

function getNavbarContent(industry: string): Record<string, unknown> {
  const content = {
    technology: {
      logo: 'TechFlow',
      links: [
        { label: 'Products', href: '/products' },
        { label: 'Solutions', href: '/solutions' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Docs', href: '/docs' },
      ],
      buttonText: 'Get Started',
    },
    ecommerce: {
      logo: 'ShopStyle',
      links: [
        { label: 'New Arrivals', href: '/new' },
        { label: 'Categories', href: '/categories' },
        { label: 'Sale', href: '/sale' },
        { label: 'About', href: '/about' },
      ],
      buttonText: 'Account',
    },
    agency: {
      logo: 'Studio Creative',
      links: [
        { label: 'Work', href: '/work' },
        { label: 'Services', href: '/services' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
      buttonText: 'Start Project',
    },
    restaurant: {
      logo: 'The Kitchen',
      links: [
        { label: 'Menu', href: '/menu' },
        { label: 'Reservations', href: '/reservations' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
      buttonText: 'Book Table',
    },
    realestate: {
      logo: 'Prime Realty',
      links: [
        { label: 'Buy', href: '/buy' },
        { label: 'Sell', href: '/sell' },
        { label: 'Rent', href: '/rent' },
        { label: 'Agents', href: '/agents' },
      ],
      buttonText: 'List Property',
    },
    fitness: {
      logo: 'FitZone',
      links: [
        { label: 'Classes', href: '/classes' },
        { label: 'Trainers', href: '/trainers' },
        { label: 'Membership', href: '/membership' },
        { label: 'Schedule', href: '/schedule' },
      ],
      buttonText: 'Join Now',
    },
    education: {
      logo: 'LearnHub',
      links: [
        { label: 'Courses', href: '/courses' },
        { label: 'Programs', href: '/programs' },
        { label: 'Instructors', href: '/instructors' },
        { label: 'Community', href: '/community' },
      ],
      buttonText: 'Sign Up',
    },
    general: {
      logo: 'Brand',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' },
      ],
      buttonText: 'Get Started',
    },
  };

  return content[industry as keyof typeof content] || content.general;
}

function getFeatureContent(industry: string): Record<string, unknown> {
  const content = {
    technology: {
      title: 'Powerful Technology',
      items: [
        { title: 'Cloud Native', description: 'Built for scale with modern cloud infrastructure', icon: 'cloud' },
        { title: 'AI-Powered', description: 'Intelligent features that adapt to your needs', icon: 'sparkles' },
        { title: 'Secure', description: 'Enterprise-grade security protecting your data', icon: 'shield' },
      ],
    },
    ecommerce: {
      title: 'Why Shop With Us',
      items: [
        { title: 'Fast Shipping', description: 'Free delivery on orders over $50', icon: 'truck' },
        { title: 'Easy Returns', description: '30-day return policy, no questions asked', icon: 'refresh' },
        { title: 'Secure Payment', description: 'Multiple payment options, 100% secure', icon: 'credit-card' },
      ],
    },
    agency: {
      title: 'Our Services',
      items: [
        { title: 'Brand Strategy', description: 'Define your unique market position', icon: 'target' },
        { title: 'Web Design', description: 'Beautiful, conversion-focused websites', icon: 'monitor' },
        { title: 'Marketing', description: 'Data-driven campaigns that deliver results', icon: 'trending-up' },
      ],
    },
    restaurant: {
      title: 'What We Offer',
      items: [
        { title: 'Fresh Ingredients', description: 'Locally sourced, farm-to-table dining', icon: 'leaf' },
        { title: 'Expert Chefs', description: 'Award-winning culinary team', icon: 'award' },
        { title: 'Private Events', description: 'Host your special occasions with us', icon: 'users' },
      ],
    },
    realestate: {
      title: 'Why Choose Us',
      items: [
        { title: 'Expert Agents', description: 'Knowledgeable guides for your journey', icon: 'users' },
        { title: 'Wide Selection', description: 'Hundreds of verified properties', icon: 'home' },
        { title: 'Easy Process', description: 'Streamlined buying and selling', icon: 'check-circle' },
      ],
    },
    fitness: {
      title: 'What You Get',
      items: [
        { title: 'Expert Trainers', description: 'Certified professionals to guide you', icon: 'user-check' },
        { title: 'Modern Equipment', description: 'State-of-the-art machines and weights', icon: 'dumbbell' },
        { title: 'Flexible Plans', description: 'Membership options to fit your lifestyle', icon: 'calendar' },
      ],
    },
    education: {
      title: 'Learning Features',
      items: [
        { title: 'Expert Instructors', description: 'Learn from industry leaders', icon: 'user' },
        { title: 'Certificates', description: 'Earn recognized credentials', icon: 'award' },
        { title: 'Community', description: 'Connect with fellow learners', icon: 'users' },
      ],
    },
    general: {
      title: 'Why Choose Us',
      items: [
        { title: 'Fast & Easy', description: 'Get started in minutes, not hours', icon: 'zap' },
        { title: 'Professional', description: 'Modern designs that look amazing', icon: 'star' },
        { title: 'Support', description: '24/7 expert assistance when you need it', icon: 'headphones' },
      ],
    },
  };

  return content[industry as keyof typeof content] || content.general;
}

function getPricingContent(industry: string): Record<string, unknown> {
  const content = {
    technology: {
      title: 'Simple, Transparent Pricing',
      items: [
        { title: 'Starter', price: '$0/mo', features: ['5 Projects', 'Basic Analytics', 'Community Support'] },
        { title: 'Pro', price: '$29/mo', features: ['Unlimited Projects', 'Advanced Analytics', 'Priority Support', 'API Access'] },
        { title: 'Enterprise', price: '$99/mo', features: ['Everything in Pro', 'Custom Integrations', 'Dedicated Manager', 'SLA'] },
      ],
    },
    ecommerce: {
      title: 'Membership Perks',
      items: [
        { title: 'Bronze', price: 'Free', features: ['Standard Shipping', 'Basic Rewards', 'Email Updates'] },
        { title: 'Silver', price: '$9/mo', features: ['Free Shipping', '2x Points', 'Early Access', 'Exclusive Sales'] },
        { title: 'Gold', price: '$19/mo', features: ['All Silver Benefits', 'VIP Events', 'Personal Shopper', 'Free Returns'] },
      ],
    },
    fitness: {
      title: 'Membership Plans',
      items: [
        { title: 'Basic', price: '$29/mo', features: ['Gym Access', 'Locker Room', 'Basic Equipment'] },
        { title: 'Premium', price: '$59/mo', features: ['All Basic Features', 'Group Classes', 'Sauna & Spa', 'Personal Trainer (2/mo)'] },
        { title: 'VIP', price: '$99/mo', features: ['All Premium Features', 'Unlimited PT Sessions', 'Nutrition Plan', 'VIP Lounge'] },
      ],
    },
    education: {
      title: 'Choose Your Plan',
      items: [
        { title: 'Free', price: '$0', features: ['Access to Free Courses', 'Community Forums', 'Basic Support'] },
        { title: 'Pro', price: '$19/mo', features: ['All Courses', 'Certificates', 'Downloadable Resources', 'Priority Support'] },
        { title: 'Teams', price: '$49/user/mo', features: ['Everything in Pro', 'Team Management', 'Analytics Dashboard', 'Custom Learning Paths'] },
      ],
    },
    general: {
      title: 'Pricing Plans',
      items: [
        { title: 'Starter', price: '$9/mo', features: ['5 Websites', 'Basic Templates', 'Email Support'] },
        { title: 'Pro', price: '$29/mo', features: ['Unlimited Websites', 'Premium Templates', 'Priority Support', 'Custom Domain'] },
        { title: 'Enterprise', price: '$99/mo', features: ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Support'] },
      ],
    },
  };

  return content[industry as keyof typeof content] || content.general;
}

export async function improveSection(component: WebsiteComponent, instruction: string): Promise<WebsiteComponent> {
  const lowerInstruction = instruction.toLowerCase();

  // Copy the component
  const improved = { ...component, content: { ...component.content }, styles: { ...component.styles } };

  // Apply improvements based on instruction
  if (lowerInstruction.includes('modern') || lowerInstruction.includes('premium')) {
    improved.styles.borderRadius = '16px';
    improved.styles.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
  }

  if (lowerInstruction.includes('minimal') || lowerInstruction.includes('clean')) {
    improved.styles.padding = { top: 40, right: 60, bottom: 40, left: 60 };
    improved.styles.margin = { top: 20, right: 0, bottom: 20, left: 0 };
  }

  if (lowerInstruction.includes('dark')) {
    improved.styles.backgroundColor = '#1a1a2e';
    improved.styles.color = '#ffffff';
  }

  if (lowerInstruction.includes('mobile') || lowerInstruction.includes('responsive')) {
    improved.styles.padding = { top: 20, right: 20, bottom: 20, left: 20 };
  }

  if (lowerInstruction.includes('bold') || lowerInstruction.includes('strong')) {
    if (improved.content.title) {
      improved.styles.fontWeight = '800';
    }
  }

  if (lowerInstruction.includes('larger') || lowerInstruction.includes('bigger')) {
    improved.styles.fontSize = '1.25rem';
  }

  if (lowerInstruction.includes('smaller') || lowerInstruction.includes('compact')) {
    improved.styles.fontSize = '0.875rem';
    improved.styles.padding = { top: 16, right: 24, bottom: 16, left: 24 };
  }

  return improved;
}

export function generateChatResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Simple AI chat responses
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return 'I can help you build your website. Just describe what you want, and I will generate the components for you. For example, you can say "add a hero section with a blue background" or "create a pricing table with 3 plans".';
  }

  if (lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('modify')) {
    return 'To modify an existing component, select it in the editor and adjust the properties in the settings panel. You can also describe the changes you want, and I will help you implement them.';
  }

  if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('thanks')) {
    return "You're welcome! Is there anything else you would like to add or modify on your website?";
  }

  if (lowerMessage.includes('more') || lowerMessage.includes('add')) {
    return "Tell me what section you would like to add. I can create hero sections, features, pricing tables, testimonials, contact forms, FAQs, galleries, and more.";
  }

  // Default response
  return "I understand you want to make changes. Could you be more specific about what you would like to modify or add? For example, 'add a contact form' or 'make the hero section more modern'.";
}
