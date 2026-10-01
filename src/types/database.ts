export type UserRole = 'customer' | 'admin';
export type BookCondition = 'new' | 'like_new' | 'good' | 'acceptable';
export type OrderItemType = 'buy' | 'rent';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded';
export type RentalStatus = 'active' | 'due_soon' | 'overdue' | 'return_pending' | 'returned' | 'extension_requested';
export type DepositStatus = 'held' | 'refund_pending' | 'refunded' | 'partially_refunded' | 'forfeited';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_postal_code: string | null;
  address_country: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  publication_year: number | null;
  description: string;
  cover_image: string | null;
  language: string;
  pages: number | null;
  category_id: string | null;
  category?: Category;
  condition: BookCondition;
  
  // Buying
  is_available_for_sale: boolean;
  sale_price: number;
  stock_sale: number;
  
  // Renting
  is_available_for_rent: boolean;
  rent_price_7_days: number;
  rent_price_14_days: number;
  rent_price_30_days: number;
  security_deposit: number; // 100% refundable upon return
  daily_late_fee: number;
  stock_rent: number;
  
  // Stats
  rating_average: number;
  ratings_count: number;
  is_featured: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string; // unique item id in cart (e.g. bookId + type + duration)
  bookId: string;
  book: Book;
  itemType: OrderItemType; // 'buy' or 'rent'
  quantity: number;
  rentalDays?: 7 | 14 | 30; // if itemType === 'rent'
  unitPrice: number; // sale price or rental fee for chosen days
  securityDeposit: number; // refundable deposit per unit (if rent)
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  
  sales_subtotal: number;
  rental_fees_total: number;
  security_deposit_total: number;
  shipping_fee: number;
  grand_total: number;
  
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  order_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  book?: Book;
  item_type: OrderItemType;
  quantity: number;
  unit_price: number;
  rental_days: number | null;
  security_deposit_per_unit: number;
  created_at: string;
}

export interface Rental {
  id: string;
  order_id: string;
  order_item_id: string;
  user_id: string;
  book_id: string;
  book?: Book;
  
  rental_duration_days: number;
  start_date: string;
  due_date: string;
  return_date: string | null;
  
  rental_fee: number;
  deposit_amount: number;
  deposit_status: DepositStatus;
  deposit_refunded_amount: number;
  late_fee_charged: number;
  damage_fee_charged: number;
  
  status: RentalStatus;
  return_tracking_number: string | null;
  inspection_notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  user?: Profile;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'rental_reminder' | 'due_date_warning' | 'deposit_refund' | 'system';
  link: string | null;
  is_read: boolean;
  created_at: string;
}
