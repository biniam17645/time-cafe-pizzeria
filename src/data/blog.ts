import { BlogPost } from '../types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of 72-Hour Fermented Wood-Fired Pizza in Asela',
    slug: 'wood-fired-pizza-asela',
    excerpt:
      'How our bakers combine stone-ground highland flour, long cold-fermentation, and Arsi acacia wood fire to create airy, digestible crusts.',
    content: `At Time Cafe & Pizzeria, pizza is not fast food—it is a traditional culinary craft. Situated over 2,400 meters high on the slopes of Mount Chilalo, our baking environment demands precise temperature and hydration control.

We ferment our dough for a full 72 hours using natural yeast cultures. This long maturation breaks down complex gluten structures, yielding a light, airy, and easily digestible crust with distinctive blistered leopard spots.

Our oven is stoked with seasoned local woods, reaching blisteringly hot temperatures of 450°C. In just 90 seconds, the mozzarella melts to perfection while fresh basil and savory seasoned beef lock in their natural flavors.`,
    author: 'Chef Henok T.',
    date: 'October 8, 2026',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    readTime: '4 min read',
    category: 'Kitchen Secrets',
    featuredItemId: 1, // Time Special Pizza
  },
  {
    id: '2',
    title: 'Highland Beans & Steamed Milk Foam: The Soul of the Ethiopian Macchiato',
    slug: 'ethiopian-special-macchiato',
    excerpt:
      'In Asela, a macchiato is more than a quick caffeine fix; it is a ritual of friendship, conversation, and artisanal extraction.',
    content: `Ethiopia is the birthplace of coffee, and in towns across the Rift Valley and Oromia highlands, the special macchiato reigns supreme. At Time Cafe, we source direct single-origin washed heirloom beans from nearby Sidama and Guji cooperatives.

We pull concentrated double ristretto shots layered against rich, locally sourced steamed milk with velvety micro-foam. The visual gradient between dark espresso and golden foam reflects our dedication to the craft. 

Whether you are studying for exams at Arsi University or meeting colleagues before heading to Piazza, our baristas craft each cup with genuine love.`,
    author: 'Master Barista Selamawit',
    date: 'October 3, 2026',
    image:
      'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1000&q=80',
    readTime: '3 min read',
    category: 'Coffee Culture',
    featuredItemId: 4, // Special Macchiato
  },
  {
    id: '3',
    title: 'Layered Avocado & Mango: Asela’s Vibrant Fresh Juice Tradition',
    slug: 'layered-avocado-mango-juice',
    excerpt:
      'Discover why fresh Arsi avocados, blended thick with sweet seasonal mango puree, have become a staple Ethiopian comfort beverage.',
    content: `Travelers stepping off buses from Robe or Adama often make their first stop at Time Cafe for one thing: our signature layered "Spris" avocado and mango juice.

Arsi zone produces some of the butteriest, most flavorful organic avocados in the Horn of Africa. We blend them into a dense, creamy mousse topped with a golden layer of freshly squeezed mango and a squeeze of mountain lime.

No preservatives, no artificial syrups—just 100% natural highland fruit bursting with healthy fats, vitamins, and refreshing goodness.`,
    author: 'Kitchen Team',
    date: 'September 26, 2026',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
    readTime: '3 min read',
    category: 'Stories',
    featuredItemId: 6, // Layered Avocado Juice
  },
  {
    id: '4',
    title: 'Weekend Acoustic Sessions & Community Evenings at Time Cafe',
    slug: 'weekend-live-music-asela',
    excerpt:
      'Every Saturday evening, our cozy lounge turns into a vibrant gathering spot for local musicians, poets, and pizza lovers.',
    content: `Community is the heartbeat of Time Cafe. What started as an espresso bar and pizzeria has grown into a cherished cultural hub for the town of Asela.

Every Saturday from 6:30 PM, our outdoor terrace and glass dining room host intimate acoustic guitar sets, traditional Masinqo melodies, and friendly chess matches over hot herbal teas and gourmet dessert pizzas.

Join us this weekend with your friends and family—the ovens are blazing, the coffee is fresh, and all are welcome!`,
    author: 'Time Cafe Events',
    date: 'September 18, 2026',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    readTime: '5 min read',
    category: 'Events',
  },
];
