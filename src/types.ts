export type MenuCategory = 'burgers' | 'pizzas' | 'cakes' | 'hot_drinks' | 'cold_drinks';

export interface ExtraTopping {
  name: string;
  price: number;
}

export interface MenuItem {
  id: number;
  category: MenuCategory;
  name: string;
  desc: string;
  price: number;
  hasSizes?: boolean;
  priceLarge?: number;
  img: string;
  tag?: string;
  inStock?: boolean;
  availableIngredients?: string[]; // Standard ingredients that can be removed
  extraToppings?: ExtraTopping[]; // Add-ons that can be added
}

export interface CartItemCustomization {
  selectedAdditions: ExtraTopping[];
  removedIngredients: string[];
  specialInstructions?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  size: 'Standard' | 'Large';
  customization?: CartItemCustomization;
}

export interface OrderItem {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  customization?: CartItemCustomization;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'chapa' | 'cash';

export type PaymentStatus = 'paid' | 'pending_cash';

export interface DeliveryLocation {
  address: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  table_or_address: string;
  delivery_coordinates?: { lat: number; lng: number };
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_txn_ref?: string;
  source: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
  category: 'Coffee Culture' | 'Kitchen Secrets' | 'Events' | 'Stories';
  featuredItemId?: number;
}
