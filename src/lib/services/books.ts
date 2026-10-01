import { Book, Category } from '@/types/database';
import { INITIAL_BOOKS, INITIAL_CATEGORIES } from '@/lib/data/initial-data';
import { createClient } from '@/lib/supabase/client';

export async function getBooks(filters?: {
  categoryId?: string;
  condition?: string;
  type?: 'all' | 'sale' | 'rent';
  search?: string;
  featured?: boolean;
}): Promise<Book[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      let query = supabase.from('books').select('*, category:categories(*)');

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters?.type === 'sale') {
        query = query.eq('is_available_for_sale', true);
      } else if (filters?.type === 'rent') {
        query = query.eq('is_available_for_rent', true);
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Book[];
      }
    }
  } catch (err) {
    console.warn('Supabase query failed, falling back to local dataset', err);
  }

  // Graceful fallback to initial dataset + any custom uploaded books
  let customBooks: Book[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('booknest_custom_books');
      if (stored) {
        customBooks = JSON.parse(stored);
      }
    } catch {}
  }

  const customIds = new Set(customBooks.map((b) => b.id));
  let result = [...customBooks, ...INITIAL_BOOKS.filter((b) => !customIds.has(b.id))];

  if (filters?.categoryId) {
    result = result.filter((b) => b.category_id === filters.categoryId);
  }
  if (filters?.condition) {
    result = result.filter((b) => b.condition === filters.condition);
  }
  if (filters?.type === 'sale') {
    result = result.filter((b) => b.is_available_for_sale);
  } else if (filters?.type === 'rent') {
    result = result.filter((b) => b.is_available_for_rent);
  }
  if (filters?.featured) {
    result = result.filter((b) => b.is_featured);
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query)
    );
  }

  return result;
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('books')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
      if (!error && data) {
        return data as Book;
      }
    }
  } catch (err) {
    console.warn('Supabase getBookById failed, falling back to local dataset', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('booknest_custom_books');
      if (stored) {
        const customBooks: Book[] = JSON.parse(stored);
        const match = customBooks.find((b) => b.id === id);
        if (match) return match;
      }
    } catch {}
  }

  const found = INITIAL_BOOKS.find((b) => b.id === id);
  if (found) {
    const category = INITIAL_CATEGORIES.find((c) => c.id === found.category_id);
    return { ...found, category };
  }
  return null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    }
  } catch (err) {
    console.warn('Supabase getCategories failed, falling back to local dataset', err);
  }

  return INITIAL_CATEGORIES;
}

export async function createBook(book: Partial<Book>): Promise<{ data: Book | null; error: any }> {
  const finalBook = book as Book;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('booknest_custom_books');
      const custom: Book[] = stored ? JSON.parse(stored) : [];
      const updated = [finalBook, ...custom.filter((b) => b.id !== finalBook.id)];
      localStorage.setItem('booknest_custom_books', JSON.stringify(updated));
    } catch {}
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('books')
        .insert([book])
        .select('*, category:categories(*)')
        .single();
      if (!error && data) {
        return { data: data as Book, error: null };
      }
      if (error) {
        console.warn('Supabase book insert returned error:', error);
        return { data: finalBook, error };
      }
    }
  } catch (err) {
    console.warn('Supabase createBook failed, returning local fallback', err);
  }
  return { data: finalBook, error: null };
}

export async function uploadBookAsset(file: File, bookSlug: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const fileName = `${bookSlug}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage.from('book-assets').upload(fileName, file, {
        upsert: true,
      });
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('book-assets').getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase uploadBookAsset failed:', err);
  }
  return null;
}

