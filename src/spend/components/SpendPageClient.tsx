"use client";

import { useState, useEffect, useRef } from "react";
import type { Transaction } from "@/spend/lib/db/transactions";
import type { Category } from "@/spend/lib/db/categories";
import type { Card } from "@/spend/lib/db/cards";

interface Props {
  initialTransactions: Transaction[];
  initialCategories: Category[];
  initialCards: Card[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayHeader(dateString: string): string {
  // Parse the date string as local date (YYYY-MM-DD format)
  const [year, month, day] = dateString.split("-").map(Number);
  const transactionDate = new Date(year, month - 1, day);
  
  // Get today's date in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Set transaction date to midnight in local timezone for comparison
  transactionDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - transactionDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return transactionDate.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    return formatDate(dateString);
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function isDarkColor(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance (perceived brightness)
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is less than 0.5, consider it dark
  return luminance < 0.5;
}

export function SpendPageClient({
  initialTransactions,
  initialCategories,
  initialCards,
}: Props) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Handle clicks outside menu
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInside = menuRef.current?.contains(target) ?? false;
      if (!isInside) {
        setShowMenu(false);
      }
    };

    // Use capture phase to catch events before they reach the menu
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [showMenu]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form states for adding transaction
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    vendor_name: "",
    description: "",
    amount: "",
    category_id: "",
    card_id: "",
  });

  // Form states for editing transaction
  const [editingTransaction, setEditingTransaction] = useState<{
    date: string;
    vendor_name: string;
    description: string;
    amount: string;
    category_id: string;
    card_id: string;
  } | null>(null);

  // Form states for adding category
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#3b82f6", // Default blue
  });

  // Form states for adding card
  const [newCard, setNewCard] = useState({
    name: "",
    type: "credit" as "credit" | "debit",
  });

  const handleAddTransaction = async () => {
    if (
      !newTransaction.vendor_name ||
      !newTransaction.amount ||
      !newTransaction.category_id ||
      !newTransaction.card_id
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/spend/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newTransaction.date,
          vendor_name: newTransaction.vendor_name,
          description: newTransaction.description || null,
          amount: parseFloat(newTransaction.amount),
          category_id: newTransaction.category_id,
          card_id: newTransaction.card_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      // Refresh transactions
      const updatedTransactions = await fetch("/api/spend/transactions").then(
        (r) => r.json()
      );
      setTransactions(updatedTransactions);

      // Reset form
      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        vendor_name: "",
        description: "",
        amount: "",
        category_id: "",
        card_id: "",
      });
      setShowAddTransaction(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setEditingTransaction({
      date: transaction.date,
      vendor_name: transaction.vendor_name,
      description: transaction.description || "",
      amount: transaction.amount.toString(),
      category_id: transaction.category_id,
      card_id: transaction.card_id,
    });
  };

  const handleSaveTransaction = async (id: string) => {
    if (
      !editingTransaction ||
      !editingTransaction.vendor_name ||
      !editingTransaction.amount ||
      !editingTransaction.category_id ||
      !editingTransaction.card_id
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/spend/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          date: editingTransaction.date,
          vendor_name: editingTransaction.vendor_name,
          description: editingTransaction.description || null,
          amount: parseFloat(editingTransaction.amount),
          category_id: editingTransaction.category_id,
          card_id: editingTransaction.card_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      // Refresh transactions
      const updatedTransactions = await fetch("/api/spend/transactions").then(
        (r) => r.json()
      );
      setTransactions(updatedTransactions);

      setEditingTransactionId(null);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction");
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/spend/transactions?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      // Refresh transactions
      const updatedTransactions = await fetch("/api/spend/transactions").then(
        (r) => r.json()
      );
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.color) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/spend/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      // Refresh categories
      const updatedCategories = await fetch("/api/spend/categories").then(
        (r) => r.json()
      );
      setCategories(updatedCategories);

      // Reset form
      setNewCategory({ name: "", color: "#3b82f6" });
      setShowAddCategory(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };

  const handleAddCard = async () => {
    if (!newCard.name) {
      alert("Please fill in the card name");
      return;
    }

    try {
      const response = await fetch("/api/spend/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });

      if (!response.ok) {
        throw new Error("Failed to create card");
      }

      // Refresh cards
      const updatedCards = await fetch("/api/spend/cards").then((r) =>
        r.json()
      );
      setCards(updatedCards);

      // Reset form
      setNewCard({ name: "", type: "credit" });
      setShowAddCard(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Failed to add card");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-zinc-900">Spend</h1>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-zinc-100 rounded"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-zinc-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {showMenu && (
              <div 
                ref={menuRef}
                className="fixed right-4 mt-12 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-[60]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowAddCategory(true);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                >
                  Add Category
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowAddCard(true);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                >
                  Add Card
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {/* Add Transaction Button */}
        <div className="mb-4 flex justify-center">
          {!showAddTransaction ? (
            <button
              onClick={() => setShowAddTransaction(true)}
              className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 font-medium"
            >
              + Add Transaction
            </button>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
              <h2 className="text-lg font-semibold text-zinc-900">
                Add Transaction
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={newTransaction.vendor_name}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        vendor_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="e.g., Amazon"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newTransaction.category_id}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Card *
                  </label>
                  <select
                    value={newTransaction.card_id}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        card_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="">Select a card</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} ({card.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddTransaction}
                  className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddTransaction(false);
                    setNewTransaction({
                      date: new Date().toISOString().split("T")[0],
                      vendor_name: "",
                      description: "",
                      amount: "",
                      category_id: "",
                      card_id: "",
                    });
                  }}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {(() => {
            // Group transactions by date
            const groupedByDate: Record<string, Transaction[]> = {};
            transactions.forEach((transaction) => {
              const dateKey = transaction.date;
              if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
              }
              groupedByDate[dateKey].push(transaction);
            });

            // Sort dates in descending order
            const sortedDates = Object.keys(groupedByDate).sort(
              (a, b) => new Date(b).getTime() - new Date(a).getTime()
            );

            return sortedDates.map((dateKey) => (
              <div key={dateKey} className="space-y-2">
                {/* Day divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 border-t border-zinc-200"></div>
                  <span className="text-sm font-medium text-zinc-500">
                    {formatDayHeader(dateKey)}
                  </span>
                  <div className="flex-1 border-t border-zinc-200"></div>
                </div>

                {/* Transactions for this day */}
                {groupedByDate[dateKey].map((transaction) => {
                  const isEditing = editingTransactionId === transaction.id;
                  const category = categories.find(
                    (c) => c.id === transaction.category_id
                  );
                  const card = cards.find((c) => c.id === transaction.card_id);

                  return (
                    <div
                      key={transaction.id}
                      className="bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors"
                      onClick={() => !isEditing && handleEditTransaction(transaction)}
                    >
                  {isEditing && editingTransaction ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={editingTransaction.date}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                date: e.target.value,
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Vendor Name *
                          </label>
                          <input
                            type="text"
                            value={editingTransaction.vendor_name}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                vendor_name: e.target.value,
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editingTransaction.description}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                description: e.target.value,
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Amount *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editingTransaction.amount}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                amount: e.target.value,
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={editingTransaction.category_id}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                category_id: e.target.value,
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Card *
                          </label>
                          <select
                            value={editingTransaction.card_id}
                            onChange={(e) =>
                              setEditingTransaction({
                                ...editingTransaction,
                                card_id: e.target.value,
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          >
                            {cards.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveTransaction(transaction.id);
                          }}
                          className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteTransaction(transaction.id, e)
                          }
                          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="text-sm font-semibold text-zinc-900">
                            {transaction.vendor_name}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-zinc-600">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div
                        className="text-lg font-semibold flex-shrink-0 px-2 py-1 rounded"
                        style={{
                          backgroundColor: category?.color || "transparent",
                          color: category?.color && isDarkColor(category.color)
                            ? "#ffffff"
                            : "#18181b",
                        }}
                      >
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  )}
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-zinc-200 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Add Category
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="e.g., Rent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Color *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="h-10 w-20 border border-zinc-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory({ name: "", color: "#3b82f6" });
                }}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-zinc-200 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Add Card
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) =>
                    setNewCard({ ...newCard, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="e.g., Chase Sapphire"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Type *
                </label>
                <select
                  value={newCard.type}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      type: e.target.value as "credit" | "debit",
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddCard}
                className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setNewCard({ name: "", type: "credit" });
                }}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

