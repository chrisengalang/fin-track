import { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Plus, X, Receipt, Wallet, Tags } from 'lucide-react';
import api from '../services/api';

function Transactions({ selectedMonth }) {
    const [transactions, setTransactions] = useState([]);
    const [budgetItems, setBudgetItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        budgetItem: { id: '' },
        category: { id: '' },
        user: { id: 1 }
    });

    // Filter and Sort State
    const [filterText, setFilterText] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBudgetItem, setFilterBudgetItem] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    useEffect(() => {
        if (selectedMonth) {
            fetchTransactions();
            fetchBudgetItems();
            fetchCategories();
            updateDefaultDate();
        }
    }, [selectedMonth]);

    const updateDefaultDate = () => {
        const today = new Date();
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();

        let newDate = new Date(year, month, 1);
        if (today.getFullYear() === year && today.getMonth() === month) {
            newDate = today;
        }

        // Adjust for timezone to get YYYY-MM-DD
        const offset = newDate.getTimezoneOffset();
        const dateStr = new Date(newDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];

        setFormData(prev => ({ ...prev, date: dateStr }));
    }

    const fetchTransactions = async () => {
        try {
            const month = selectedMonth.getMonth() + 1;
            const year = selectedMonth.getFullYear();
            const res = await api.get('/transactions', { params: { month, year } });
            setTransactions(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchBudgetItems = async () => {
        try {
            const month = selectedMonth.getMonth() + 1;
            const year = selectedMonth.getFullYear();
            const res = await api.get('/budgets', { params: { month, year } });
            if (res.data && res.data.budgetItems) {
                setBudgetItems(res.data.budgetItems);
            } else {
                setBudgetItems([]);
            }
        } catch (error) {
            console.error("Error fetching budget items:", error);
            setBudgetItems([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) { console.error(error); }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions', formData);
            fetchTransactions();
            setFormData(prev => ({ ...prev, description: '', amount: '' }));
        } catch (error) { console.error(error); }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = [...transactions].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested objects
        if (sortConfig.key === 'category') aValue = a.category?.name || '';
        if (sortConfig.key === 'budgetItem') aValue = b.budgetItem?.name || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredTransactions = sortedTransactions.filter(t => {
        const matchesText = t.description.toLowerCase().includes(filterText.toLowerCase());
        const matchesCategory = !filterCategory || t.category?.id?.toString() === filterCategory;
        const matchesBudgetItem = !filterBudgetItem || t.budgetItem?.id?.toString() === filterBudgetItem;
        return matchesText && matchesCategory && matchesBudgetItem;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Transactions
                    </h2>
                    <p className="text-sm lg:text-base text-[var(--text-secondary)] mt-1 font-medium">Detailed history of all your recorded financial activities.</p>
                </div>
            </header>

            <section className="enterprise-card p-6 lg:p-8 bg-[var(--bg-secondary)]">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Record Transaction</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
                        <input
                            type="text" placeholder="What did you buy?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="enterprise-input" required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Amount</label>
                        <input
                            type="number" placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            className="enterprise-input" required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="enterprise-input" required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Budget Item</label>
                        <select
                            value={formData.budgetItem.id}
                            onChange={e => setFormData({ ...formData, budgetItem: { id: e.target.value } })}
                            className="enterprise-input appearance-none" required
                        >
                            <option value="">Select Item</option>
                            {budgetItems.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Category</label>
                        <select
                            value={formData.category.id}
                            onChange={e => setFormData({ ...formData, category: { id: e.target.value } })}
                            className="enterprise-input appearance-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="enterprise-button-primary w-full">
                        Save
                    </button>
                </form>
            </section>

            <section className="enterprise-card bg-[var(--bg-secondary)] overflow-hidden">
                <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex flex-wrap gap-6 items-center">
                    <div className="relative flex-1 min-w-[300px]">
                        <input
                            type="text"
                            placeholder="Filter by description..."
                            value={filterText}
                            onChange={e => setFilterText(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-12 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                            <Search size={18} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            value={filterBudgetItem}
                            onChange={e => setFilterBudgetItem(e.target.value)}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] outline-none"
                        >
                            <option value="">All Items</option>
                            {budgetItems.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => { setFilterText(''); setFilterCategory(''); setFilterBudgetItem(''); }}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                                <th className="p-6 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('date')}>
                                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-6 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('description')}>
                                    Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-6 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('budgetItem')}>
                                    Budget Item {sortConfig.key === 'budgetItem' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-6 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('category')}>
                                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-6 text-right text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('amount')}>
                                    Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-[var(--bg-primary)] transition-colors group">
                                    <td className="p-6 text-sm text-[var(--text-secondary)] font-medium">{t.date}</td>
                                    <td className="p-6 text-sm font-bold text-[var(--text-primary)]">{t.description}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-slate-500/10 text-slate-500 rounded-full text-xs font-black uppercase tracking-tighter">
                                            {t.budgetItem?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black uppercase tracking-tighter">
                                            {t.category?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="text-sm font-black text-rose-500">-${t.amount?.toFixed(2)}</span>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-[var(--text-secondary)] italic">
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Transactions;
