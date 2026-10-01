import { createClient } from '@/lib/supabase/client';
import { Order, OrderItem, Rental } from '@/types/database';

export interface CreateOrderParams {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  salesSubtotal: number;
  rentalFeesTotal: number;
  securityDepositTotal: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: Array<{
    bookId: string;
    bookTitle: string;
    bookAuthor: string;
    coverImage?: string;
    itemType: 'buy' | 'rent';
    quantity: number;
    unitPrice: number;
    rentalDays?: number | null;
    securityDeposit: number;
  }>;
}

export async function createOrder(params: CreateOrderParams) {
  const orderNumber = `BN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // 1. Prepare Order Object
  const localOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    user_id: params.userId || null,
    customer_name: params.customerName,
    customer_email: params.customerEmail,
    customer_phone: params.customerPhone || null,
    sales_subtotal: params.salesSubtotal,
    rental_fees_total: params.rentalFeesTotal,
    security_deposit_total: params.securityDepositTotal,
    shipping_fee: params.shippingFee,
    grand_total: params.grandTotal,
    payment_method: params.paymentMethod,
    payment_status: 'pending',
    order_status: 'confirmed',
    shipping_address: params.shippingAddress,
    order_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const localItems: OrderItem[] = params.items.map((i) => ({
    id: `item-${Date.now()}-${i.bookId}`,
    order_id: localOrder.id,
    book_id: i.bookId,
    item_type: i.itemType,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    rental_days: i.rentalDays || null,
    security_deposit_per_unit: i.securityDeposit,
    created_at: new Date().toISOString(),
  }));

  // 2. Persist to LocalStorage for reliable continuity
  if (typeof window !== 'undefined') {
    const existingOrders = JSON.parse(localStorage.getItem('booknest_user_orders') || '[]');
    const enrichedOrder = {
      ...localOrder,
      items: params.items.map((i) => ({
        id: `item-${Date.now()}-${i.bookId}`,
        book_id: i.bookId,
        book_title: i.bookTitle,
        book_author: i.bookAuthor,
        cover_image: i.coverImage,
        item_type: i.itemType,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        rental_days: i.rentalDays || null,
        security_deposit: i.securityDeposit,
      })),
    };
    existingOrders.unshift(enrichedOrder);
    localStorage.setItem('booknest_user_orders', JSON.stringify(existingOrders));

    // Handle rentals
    const rentItems = params.items.filter((i) => i.itemType === 'rent');
    if (rentItems.length > 0) {
      const activeRentals = JSON.parse(localStorage.getItem('booknest_user_rentals') || '[]');
      rentItems.forEach((ri) => {
        activeRentals.unshift({
          id: `rent-${Date.now()}-${ri.bookId}`,
          order_id: localOrder.id,
          order_number: orderNumber,
          book_id: ri.bookId,
          book_title: ri.bookTitle,
          book_author: ri.bookAuthor,
          cover_image: ri.coverImage,
          rental_days: ri.rentalDays || 14,
          start_date: new Date().toISOString(),
          due_date: new Date(Date.now() + (ri.rentalDays || 14) * 86400000).toISOString(),
          rental_fee: ri.unitPrice * ri.quantity,
          deposit_amount: ri.securityDeposit * ri.quantity,
          status: 'active',
          deposit_status: 'held',
        });
      });
      localStorage.setItem('booknest_user_rentals', JSON.stringify(activeRentals));
    }
  }

  // 3. Sync to Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([
          {
            order_number: localOrder.order_number,
            user_id: localOrder.user_id,
            customer_name: localOrder.customer_name,
            customer_email: localOrder.customer_email,
            customer_phone: localOrder.customer_phone,
            sales_subtotal: localOrder.sales_subtotal,
            rental_fees_total: localOrder.rental_fees_total,
            security_deposit_total: localOrder.security_deposit_total,
            shipping_fee: localOrder.shipping_fee,
            grand_total: localOrder.grand_total,
            payment_method: localOrder.payment_method,
            payment_status: localOrder.payment_status,
            order_status: localOrder.order_status,
            shipping_address: localOrder.shipping_address,
            order_notes: localOrder.order_notes,
          },
        ])
        .select()
        .single();

      if (!orderErr && dbOrder) {
        // Insert order items
        const dbItems = params.items.map((i) => ({
          order_id: dbOrder.id,
          book_id: i.bookId,
          item_type: i.itemType,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          rental_days: i.rentalDays || null,
          security_deposit_per_unit: i.securityDeposit,
        }));
        await supabase.from('order_items').insert(dbItems);

        // Process order in database
        try {
          await supabase.rpc('process_order_placement', { order_record_id: dbOrder.id });
        } catch {
          // RPC may be called automatically by trigger if configured
        }

        return { order: dbOrder, orderNumber, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase order sync error (local copy preserved):', err);
  }

  return { order: localOrder, orderNumber, error: null };
}

export async function getUserOrders(userId?: string): Promise<any[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder') && userId) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, book:books(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch orders failed, reading local storage', err);
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('booknest_user_orders') || '[]');
  }
  return [];
}

export async function getUserRentals(userId?: string): Promise<any[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder') && userId) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('rentals')
        .select('*, book:books(*), order:orders(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          order_id: r.order_id,
          order_number: r.order?.order_number || 'BN-2026-ACTIVE',
          book_id: r.book_id,
          book_title: r.book?.title || 'Active Title',
          book_author: r.book?.author || 'BookNest Author',
          cover_image: r.book?.cover_image,
          rental_days: r.rental_duration_days || 14,
          start_date: r.start_date,
          due_date: r.due_date,
          rental_fee: r.rental_fee,
          deposit_amount: r.deposit_amount,
          status: r.status,
          deposit_status: r.deposit_status,
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase fetch rentals failed, reading local storage', err);
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('booknest_user_rentals') || '[]');
  }
  return [];
}
