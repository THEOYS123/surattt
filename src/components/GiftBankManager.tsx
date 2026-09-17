import React from 'react';
import { Gift, Plus, Trash2, CreditCard } from 'lucide-react';
import { BankAccount } from '../types';

interface GiftBankManagerProps {
  bankAccounts: BankAccount[];
  onChange: (accounts: BankAccount[]) => void;
}

const POPULAR_BANKS = [
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'Bank Syariah Indonesia (BSI)',
  'CIMB Niaga',
  'Bank Jago',
  'DANA',
  'GoPay',
  'OVO',
  'ShopeePay'
];

export const GiftBankManager: React.FC<GiftBankManagerProps> = ({
  bankAccounts,
  onChange
}) => {
  const handleAddAccount = () => {
    onChange([
      ...bankAccounts,
      { bankName: 'BCA', accountNumber: '', accountHolder: '' }
    ]);
  };

  const handleUpdateAccount = (index: number, field: keyof BankAccount, value: string) => {
    const updated = [...bankAccounts];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveAccount = (index: number) => {
    const updated = bankAccounts.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-stone-200" id="gift-bank-manager">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Amplop Digital & Rekening Hadiah (Opsional)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Tamu dapat mengirimkan tanda kasih / kado pernikahan langsung ke nomor rekening atau e-wallet Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddAccount}
          className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Rekening</span>
        </button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center bg-stone-50">
          <p className="text-xs text-stone-500">
            Belum ada rekening/e-wallet yang ditambahkan. Klik &quot;Tambah Rekening&quot; jika ingin mengaktifkan amplop digital.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bankAccounts.map((acc, idx) => (
            <div key={idx} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                  Bank / E-Wallet
                </label>
                <input
                  list={`banks-list-${idx}`}
                  type="text"
                  placeholder="Pilih atau ketik nama bank"
                  value={acc.bankName}
                  onChange={(e) => handleUpdateAccount(idx, 'bankName', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <datalist id={`banks-list-${idx}`}>
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                  Nomor Rekening / No HP
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={acc.accountNumber}
                  onChange={(e) => handleUpdateAccount(idx, 'accountNumber', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                  Atas Nama (Penerima)
                </label>
                <input
                  type="text"
                  placeholder="Nama Pemilik"
                  value={acc.accountHolder}
                  onChange={(e) => handleUpdateAccount(idx, 'accountHolder', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveAccount(idx)}
                  className="w-8 h-8 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  title="Hapus rekening ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
