import { MenuItem } from '../types';
import { MENU_ITEMS as DEFAULT_MENU } from '../data/menu';

const STORAGE_KEY = 'time_cafe_menu_items';

export class MenuStore {
  private static instance: MenuStore;
  private items: MenuItem[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.load();
  }

  public static getInstance(): MenuStore {
    if (!MenuStore.instance) {
      MenuStore.instance = new MenuStore();
    }
    return MenuStore.instance;
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: MenuItem[] = JSON.parse(stored);
        // Ensure new default items like burgers and cakes exist
        const missing = DEFAULT_MENU.filter((def) => !parsed.some((p) => p.name === def.name));
        if (missing.length > 0) {
          this.items = [...parsed, ...missing.map((m) => ({ ...m, inStock: true }))];
          this.save();
        } else {
          this.items = parsed;
        }
      } else {
        this.items = DEFAULT_MENU.map((item) => ({ ...item, inStock: true }));
        this.save();
      }
    } catch {
      this.items = DEFAULT_MENU.map((item) => ({ ...item, inStock: true }));
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // Quota fallback
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

  public getItems(): MenuItem[] {
    return [...this.items];
  }

  public getItem(id: number): MenuItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  public toggleStock(id: number): boolean {
    const item = this.items.find((i) => i.id === id);
    if (!item) return false;
    item.inStock = item.inStock === undefined ? false : !item.inStock;
    this.save();
    return true;
  }

  public addItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const nextId =
      this.items.length > 0 ? Math.max(...this.items.map((i) => i.id)) + 1 : 1;
    const newItem: MenuItem = {
      ...item,
      id: nextId,
      inStock: item.inStock ?? true,
    };
    this.items.push(newItem);
    this.save();
    return newItem;
  }

  public updateItem(id: number, data: Partial<MenuItem>): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.items[index] = { ...this.items[index], ...data };
    this.save();
    return true;
  }

  public deleteItem(id: number): boolean {
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    if (this.items.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public resetToDefaults(): void {
    this.items = DEFAULT_MENU.map((item) => ({ ...item, inStock: true }));
    this.save();
  }
}

export const menuStore = MenuStore.getInstance();
