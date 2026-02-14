import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    orderBy,
    limit,
    Timestamp,
    setDoc
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_TRANSACTIONS = "transactions";
const COLLECTION_BUDGETS = "budgets";
const COLLECTION_CATEGORIES = "categories";
const COLLECTION_BUDGET_ITEMS = "budgetItems";

const api = {
    // Transactions
    getTransactions: async (params) => {
        const { month, year } = params || {};
        let q = collection(db, COLLECTION_TRANSACTIONS);

        if (month && year) {
            q = query(q, where("month", "==", parseInt(month)), where("year", "==", parseInt(year)));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    addTransaction: async (data) => {
        // Ensure numeric values
        const docData = {
            ...data,
            amount: parseFloat(data.amount),
            month: new Date(data.date).getMonth() + 1,
            year: new Date(data.date).getFullYear(),
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, COLLECTION_TRANSACTIONS), docData);
        return { id: docRef.id, ...docData };
    },

    // Budgets
    getBudgets: async (params) => {
        const { month, year } = params || {};
        let q = collection(db, COLLECTION_BUDGETS);

        if (month && year) {
            q = query(q, where("month", "==", parseInt(month)), where("year", "==", parseInt(year)));
        }

        const snapshot = await getDocs(q);
        const budgets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch budget items for each budget (simulating JPA join)
        for (let budget of budgets) {
            const itemsQ = query(collection(db, COLLECTION_BUDGET_ITEMS), where("budgetId", "==", budget.id));
            const itemsSnap = await getDocs(itemsQ);
            budget.budgetItems = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        return budgets.length > 0 ? (month && year ? budgets[0] : budgets) : (month && year ? null : []);
    },

    createBudget: async (data) => {
        const docRef = await addDoc(collection(db, COLLECTION_BUDGETS), {
            ...data,
            createdAt: Timestamp.now()
        });
        return { id: docRef.id, ...data, budgetItems: [] };
    },

    // Budget Items
    addBudgetItem: async (data) => {
        const docData = {
            ...data,
            amount: parseFloat(data.amount),
            spent: 0,
            budgetId: data.budget?.id || data.budgetId
        };
        delete docData.budget;
        const docRef = await addDoc(collection(db, COLLECTION_BUDGET_ITEMS), docData);
        return { id: docRef.id, ...docData };
    },

    updateBudgetItem: async (id, data) => {
        const docRef = doc(db, COLLECTION_BUDGET_ITEMS, id);
        const updateData = { ...data };
        if (updateData.amount) updateData.amount = parseFloat(updateData.amount);
        await updateDoc(docRef, updateData);
        return { id, ...updateData };
    },

    deleteBudgetItem: async (id) => {
        const docRef = doc(db, COLLECTION_BUDGET_ITEMS, id);
        await deleteDoc(docRef);
    },

    // Categories
    getCategories: async () => {
        const snapshot = await getDocs(collection(db, COLLECTION_CATEGORIES));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    saveCategory: async (data) => {
        if (data.id) {
            const docRef = doc(db, COLLECTION_CATEGORIES, data.id);
            const updateData = { name: data.name };
            await updateDoc(docRef, updateData);
            return { id: data.id, ...updateData };
        } else {
            const docRef = await addDoc(collection(db, COLLECTION_CATEGORIES), {
                name: data.name,
                createdAt: Timestamp.now()
            });
            return { id: docRef.id, name: data.name };
        }
    },

    deleteCategory: async (id) => {
        const docRef = doc(db, COLLECTION_CATEGORIES, id);
        await deleteDoc(docRef);
    },

    // Bridge for existing code
    get: async (path, config) => {
        if (path === '/budgets') return { data: await api.getBudgets(config?.params) };
        if (path.startsWith('/transactions')) return { data: await api.getTransactions(config?.params) };
        if (path === '/categories') return { data: await api.getCategories() };
        throw new Error(`GET path not implemented: ${path}`);
    },

    post: async (path, data) => {
        if (path === '/transactions') return { data: await api.addTransaction(data) };
        if (path === '/budgets') return { data: await api.createBudget(data) };
        if (path === '/budget-items') return { data: await api.addBudgetItem(data) };
        if (path === '/categories') return { data: await api.saveCategory(data) };
        if (path === '/budgets/copy-previous') {
            // Basic copy logic could be implemented here
            return { data: await api.createBudget(data) };
        }
        throw new Error(`POST path not implemented: ${path}`);
    },

    put: async (path, data) => {
        if (path.startsWith('/budget-items/')) {
            const id = path.split('/').pop();
            return { data: await api.updateBudgetItem(id, data) };
        }
        throw new Error(`PUT path not implemented: ${path}`);
    },

    delete: async (path) => {
        const parts = path.split('/');
        const id = parts.pop();
        const base = parts.join('/');

        if (path.startsWith('/budget-items/')) {
            await api.deleteBudgetItem(id);
            return { data: null };
        }
        if (path.startsWith('/categories/')) {
            await api.deleteCategory(id);
            return { data: null };
        }
        throw new Error(`DELETE path not implemented: ${path}`);
    }
};

export default api;
