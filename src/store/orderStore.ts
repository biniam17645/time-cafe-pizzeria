import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem } from '../types';

const INITIAL_ORDERS: Order[] = [
  {
    id: 101,
    customer_name: 'Abebe Kebede',
    customer_phone: '+251 91 123 4567',
    order_type: 'dine_in',
    table_or_address: 'Table 04 (Window)',
    total_amount: 510,
    payment_method: 'telebirr',
    payment_status: 'paid',
    payment_txn_ref: 'TB-928172948',
    source: 'web',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    items: [
      { id: 1, name: 'Time Special Pizza (Large)', quantity: 1, price: 580 },
      { id: 4, name: 'Special Macchiato', quantity: 2, price: 50 },
    ],
  },
  {
    id: 102,
    customer_name: 'Sara Tadesse',
    customer_phone: '+251 92 876 5432',
    order_type: 'delivery',
    table_or_address: 'Arsi University Main Campus, Gate 2',
    delivery_coordinates: { lat: 7.988200, lng: 39.143894 },
    total_amount: 540,
    payment_method: 'cbe_birr',
    payment_status: 'paid',
    payment_txn_ref: 'CBE-66281923',
    source: 'web',
    status: 'confirmed',
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    items: [
      { id: 3, name: 'Chicken BBQ Pizza', quantity: 1, price: 430 },
      { id: 6, name: 'Fresh Layered Avocado Juice', quantity: 1, price: 90 },
    ],
  },
  {
    id: 103,
    customer_name: 'Dawit Mengistu',
    customer_phone: '+251 94 333 8899',
    order_type: 'takeaway',
    table_or_address: 'Pickup in 15 mins',
    total_amount: 240,
    payment_method: 'cash',
    payment_status: 'pending_cash',
    source: 'web',
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    items: [
      { id: 8, name: 'Chocolate Croissant', quantity: 3, price: 80 },
    ],
  },
];

const STORAGE_KEY = 'time_cafe_orders';

export class OrderStore {
  private static instance: OrderStore;
  private orders: Order[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.load();
  }

  public static getInstance(): OrderStore {
    if (!OrderStore.instance) {
      OrderStore.instance = new OrderStore();
    }
    return OrderStore.instance;
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.orders = JSON.parse(stored);
      } else {
        this.orders = [...INITIAL_ORDERS];
        this.save();
      }
    } catch {
      this.orders = [...INITIAL_ORDERS];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
    } catch {
      // In-memory fallback if quota exceeded
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getOrders(): Order[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getOrder(id: number): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public createOrder(data: {
    customer_name: string;
    customer_phone: string;
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    table_or_address: string;
    delivery_coordinates?: { lat: number; lng: number };
    total_amount: number;
    payment_method: PaymentMethod;
    payment_status?: PaymentStatus;
    payment_txn_ref?: string;
    items: OrderItem[];
  }): Order {
    const nextId =
      this.orders.length > 0 ? Math.max(...this.orders.map((o) => o.id)) + 1 : 1001;

    const newOrder: Order = {
      id: nextId,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      order_type: data.order_type,
      table_or_address: data.table_or_address,
      delivery_coordinates: data.delivery_coordinates,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      payment_status:
        data.payment_status ??
        (data.payment_method === 'cash' ? 'pending_cash' : 'paid'),
      payment_txn_ref: data.payment_txn_ref,
      source: 'web',
      status: 'pending',
      created_at: new Date().toISOString(),
      items: data.items,
    };

    this.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateStatus(id: number, status: OrderStatus): boolean {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return false;
    order.status = status;
    this.save();
    return true;
  }

  public updatePaymentStatus(id: number, payment_status: PaymentStatus): boolean {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return false;
    order.payment_status = payment_status;
    this.save();
    return true;
  }

  public resetToSample(): void {
    this.orders = [...INITIAL_ORDERS];
    this.save();
  }
}

export const orderStore = OrderStore.getInstance();
