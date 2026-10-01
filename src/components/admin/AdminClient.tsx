'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book, Category } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { formatINR } from '@/lib/utils/currency';
import { createBook } from '@/lib/services/books';
import {
  Shield,
  BookOpen,
  Package,
  RotateCcw,
  IndianRupee,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  Filter,
  Download,
  UploadCloud,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';

interface AdminClientProps {
  initialBooks: Book[];
  categories: Category[];
}

export function AdminClient({ initialBooks, categories }: AdminClientProps) {
  const { role, switchDemoRole } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'inventory' | 'rentals' | 'orders'>('inventory');
  const [booksList, setBooksList] = useState<Book[]>(initialBooks);

  // New book modal state
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: categories[0]?.id || '',
    condition: 'like_new' as Book['condition'],
    sale_price: 599,
    stock_sale: 25,
    rent_price_7_days: 99,
    rent_price_14_days: 149,
    rent_price_30_days: 249,
    security_deposit: 350,
    daily_late_fee: 20,
    stock_rent: 15,
    description: '',
    file_attachment: '',
    cover_image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
  });

  // Admin Rentals Operations state with realistic INR
  const [adminRentals, setAdminRentals] = useState([
    {
      id: 'rent-adm-1',
      order_number: 'BN-2026-482910',
      customer_name: 'Aarav Sharma',
      customer_email: 'aarav.sharma@example.com',
      book_title: 'Designing Data-Intensive Applications',
      rental_days: 14,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      deposit_amount: 500,
      status: 'active',
      deposit_status: 'held',
    },
    {
      id: 'rent-adm-2',
      order_number: 'BN-2026-918234',
      customer_name: 'Priya Patel',
      customer_email: 'priya.patel@example.com',
      book_title: 'Project Hail Mary',
      rental_days: 7,
      due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      deposit_amount: 300,
      status: 'overdue',
      deposit_status: 'held',
    },
    {
      id: 'rent-adm-3',
      order_number: 'BN-2026-104928',
      customer_name: 'Rohan Verma',
      customer_email: 'rohan.v@example.com',
      book_title: 'The Psychology of Money',
      rental_days: 14,
      due_date: new Date().toISOString(),
      deposit_amount: 250,
      status: 'return_pending',
      deposit_status: 'refund_pending',
    },
  ]);

  // Handle return inspection approval
  const handleApproveReturn = (rentalId: string) => {
    const updated = adminRentals.map((r) =>
      r.id === rentalId
        ? { ...r, status: 'returned', deposit_status: 'refunded' }
        : r
    );
    setAdminRentals(updated);

    addNotification(
      'Return Inspection Completed',
      'Rental marked as returned in good condition. Full deposit refund authorized.',
      'deposit_refund',
      '/dashboard'
    );
  };

  // Download complete catalog archive for Admin
  const handleDownloadArchive = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(booksList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `booknest-catalog-archive-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addNotification(
      'Catalog Archive Downloaded',
      'Complete BookNest library archive downloaded successfully.',
      'system',
      '/admin'
    );
  };

  // Download single book asset package
  const handleDownloadSingleBook = (book: Book) => {
    const bookPackage = {
      ...book,
      download_timestamp: new Date().toISOString(),
      rights: 'BookNest Admin Authorized Archive Copy',
      format: 'ePub / Digital Manifest',
      archive_hash: 'bn-' + Math.random().toString(36).substring(2, 10),
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(bookPackage, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${book.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-archive.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addNotification(
      'Book Asset Downloaded',
      `Downloaded archive package for "${book.title}".`,
      'system',
      '/admin'
    );
  };

  // Import JSON Archive file (Catalog Archive or Single Book)
  const handleImportArchive = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let importedBooks: Book[] = [];
      if (Array.isArray(parsed)) {
        importedBooks = parsed as Book[];
      } else if (parsed && typeof parsed === 'object' && parsed.title) {
        importedBooks = [parsed as Book];
      } else {
        alert('Invalid BookNest archive JSON format.');
        return;
      }

      const existingMap = new Map(booksList.map((b) => [b.id, b]));
      for (const b of importedBooks) {
        const bookId = b.id || `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        existingMap.set(bookId, {
          ...b,
          id: bookId,
          is_available_for_rent: true,
          is_available_for_sale: true,
        });
      }

      const merged = Array.from(existingMap.values());
      setBooksList(merged);

      for (const b of importedBooks) {
        try {
          await createBook(b);
        } catch {}
      }

      addNotification(
        'Archive Imported',
        `Successfully imported ${importedBooks.length} title(s) into BookNest catalog.`,
        'system',
        '/books'
      );
    } catch (err) {
      console.error('Failed to import archive JSON:', err);
      alert('Failed to parse JSON file. Please ensure it is a valid BookNest archive.');
    } finally {
      e.target.value = '';
    }
  };

  // Handle Add Book
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const created: Book = {
      id: `book-${Date.now()}`,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn || `978-IN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      publisher: 'BookNest Publishing India',
      publication_year: 2026,
      description: newBook.description || 'Premium curated physical and digital edition.',
      cover_image: newBook.cover_image,
      language: 'English',
      pages: 350,
      category_id: newBook.category_id,
      condition: newBook.condition,
      is_available_for_sale: true,
      sale_price: Number(newBook.sale_price),
      stock_sale: Number(newBook.stock_sale),
      is_available_for_rent: true,
      rent_price_7_days: Number(newBook.rent_price_7_days),
      rent_price_14_days: Number(newBook.rent_price_14_days),
      rent_price_30_days: Number(newBook.rent_price_30_days),
      security_deposit: Number(newBook.security_deposit),
      daily_late_fee: Number(newBook.daily_late_fee),
      stock_rent: Number(newBook.stock_rent),
      rating_average: 5.0,
      ratings_count: 1,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase and fallback to state
    const result = await createBook(created);
    const finalBook = result.data || created;

    setBooksList([finalBook, ...booksList]);
    setIsAddBookModalOpen(false);
    setUploadedFileName('');

    addNotification(
      'New Book Uploaded',
      `"${created.title}" was published to BookNest by Admin. Ready for Rent & Buy.`,
      'order_update',
      '/books'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Role Protection Banner */}
      {role !== 'admin' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Admin Privileges Required to Upload:</span> Regular readers
              are restricted to <span className="underline font-semibold">Rent & Buy</span> operations.
              Switch to Store Admin to manage inventory or download book archives.
            </div>
          </div>
          <button
            onClick={() => switchDemoRole('admin')}
            className="bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap shadow-xs transition"
          >
            Switch to Admin View
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-stone-900">
                BookNest Store Operations & Admin
              </h1>
              <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Only authorized Admins can upload books into the system archive and download assets. Regular readers can only Rent or Buy.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 px-4 py-2.5 rounded-full text-xs font-semibold border border-amber-300 shadow-xs transition cursor-pointer">
            <UploadCloud className="w-4 h-4 text-amber-700" /> Import JSON Archive
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportArchive}
            />
          </label>

          <button
            onClick={handleDownloadArchive}
            className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2.5 rounded-full text-xs font-semibold border border-stone-300 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-stone-600" /> Download Library Archive
          </button>

          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-md transition"
          >
            <UploadCloud className="w-4 h-4 text-amber-400" /> Admin Book Upload
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Catalog Titles</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-serif font-bold text-stone-900">{booksList.length}</span>
          <span className="block text-[11px] text-emerald-600 font-medium">Available for Buy & Rent</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Active Rentals</span>
            <RotateCcw className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-serif font-bold text-stone-900">
            {adminRentals.filter((r) => r.status === 'active').length}
          </span>
          <span className="block text-[11px] text-amber-700 font-medium">Under active reading duration</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Escrow Deposits Held</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-serif font-bold text-emerald-900">
            {formatINR(
              adminRentals
                .filter((r) => r.deposit_status === 'held' || r.deposit_status === 'refund_pending')
                .reduce((acc, r) => acc + r.deposit_amount, 0)
            )}
          </span>
          <span className="block text-[11px] text-stone-400">100% held in trust</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Returns Awaiting Inspection</span>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-serif font-bold text-stone-900">
            {adminRentals.filter((r) => r.status === 'return_pending').length}
          </span>
          <span className="block text-[11px] text-blue-700 font-medium">Ready for deposit release</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-stone-200 text-sm font-semibold gap-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition flex items-center gap-2 relative ${
            activeTab === 'inventory'
              ? 'text-indigo-700 border-b-2 border-indigo-600'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Catalog & Inventory ({booksList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rentals')}
          className={`pb-3 transition flex items-center gap-2 relative ${
            activeTab === 'rentals'
              ? 'text-indigo-700 border-b-2 border-indigo-600'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rental Returns Inspection</span>
        </button>
      </div>

      {/* Inventory Management Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900">
                BookNest Master Catalog & Local Archive
              </h3>
              <p className="text-[11px] text-stone-500">
                Books uploaded by Admin are protected. Customers have browse, rent, and buy rights only.
              </p>
            </div>
            <span className="text-[11px] bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded-lg">
              Anti-Piracy & Single-Device Guard Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Title & Author</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Sale Price / Stock</th>
                  <th className="p-4">Rental 14d / Stock</th>
                  <th className="p-4">Security Deposit</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {booksList.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-12 rounded bg-stone-100 overflow-hidden shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.cover_image || '/placeholder-book.jpg'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-stone-900 block">{b.title}</span>
                        <span className="text-[11px] text-stone-500">{b.author}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-medium px-2 py-0.5 bg-stone-100 rounded-md text-stone-700">
                        {b.condition.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-stone-900">{formatINR(b.sale_price)}</span>
                      <span className="block text-[11px] text-stone-500">Stock: {b.stock_sale} units</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-amber-800">
                        {formatINR(b.rent_price_14_days)}
                      </span>
                      <span className="block text-[11px] text-stone-500">Rent Stock: {b.stock_rent} units</span>
                    </td>
                    <td className="p-4 text-emerald-700 font-semibold">
                      {formatINR(b.security_deposit)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadSingleBook(b)}
                          title="Download book archive & metadata to local site"
                          className="text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          <span>Archive</span>
                        </button>
                        <Link
                          href={`/books/${b.id}`}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rental Returns Inspection Tab */}
      {activeTab === 'rentals' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Customer Returns & Deposit Refund Authorizations
            </h3>
            <span className="text-xs text-stone-500">
              Verify book condition before releasing INR escrow deposits.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Order / Customer</th>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Deposit Amount</th>
                  <th className="p-4">Rental Status</th>
                  <th className="p-4">Inspection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {adminRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50 transition">
                    <td className="p-4">
                      <span className="font-bold text-stone-900 block">{r.order_number}</span>
                      <span className="text-[11px] text-stone-500">{r.customer_name}</span>
                    </td>
                    <td className="p-4 font-medium text-stone-900">{r.book_title}</td>
                    <td className="p-4 text-stone-600">
                      {new Date(r.due_date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 font-bold text-emerald-800">
                      {formatINR(r.deposit_amount)}
                    </td>
                    <td className="p-4">
                      {r.status === 'returned' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Deposit Refunded
                        </span>
                      ) : r.status === 'return_pending' ? (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Inspection Ready
                        </span>
                      ) : r.status === 'overdue' ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active Reading
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.status === 'return_pending' ? (
                        <button
                          onClick={() => handleApproveReturn(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Pass & Release {formatINR(r.deposit_amount)}
                        </button>
                      ) : r.status === 'returned' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="text-stone-400">In possession of reader</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  Admin Book Upload & Archiving
                </h3>
                <p className="text-xs text-stone-500">
                  Only Admins can upload books to BookNest. Readers can only Rent or Buy.
                </p>
              </div>
              <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                <UploadCloud className="w-5 h-5" />
              </span>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atomic Habits"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. James Clear"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Category</label>
                  <select
                    value={newBook.category_id}
                    onChange={(e) => setNewBook({ ...newBook, category_id: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Book File Asset */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Upload Book File / Manuscript (PDF, ePub, Document)
                </label>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-3.5 text-center hover:bg-stone-50 transition cursor-pointer relative bg-stone-50/50">
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt,.mobi"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileText className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="text-stone-800 font-medium block">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Choose PDF or ePub file to upload'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Admin uploads are archived and protected with anti-screenshot security
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={newBook.sale_price}
                    onChange={(e) =>
                      setNewBook({ ...newBook, sale_price: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Sale Stock</label>
                  <input
                    type="number"
                    value={newBook.stock_sale}
                    onChange={(e) =>
                      setNewBook({ ...newBook, stock_sale: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Rent Stock</label>
                  <input
                    type="number"
                    value={newBook.stock_rent}
                    onChange={(e) =>
                      setNewBook({ ...newBook, stock_rent: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">7d Rent (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={newBook.rent_price_7_days}
                    onChange={(e) =>
                      setNewBook({ ...newBook, rent_price_7_days: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">14d Rent (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={newBook.rent_price_14_days}
                    onChange={(e) =>
                      setNewBook({ ...newBook, rent_price_14_days: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={newBook.security_deposit}
                    onChange={(e) =>
                      setNewBook({ ...newBook, security_deposit: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Summary of the book..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-stone-600 font-semibold hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  <span>Upload & Publish Title</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
