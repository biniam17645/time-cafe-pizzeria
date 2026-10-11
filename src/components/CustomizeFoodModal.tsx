import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  Ban,
  Sparkles,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { MenuItem, ExtraTopping, CartItemCustomization } from '../types';
import { TimeCafeLogo } from './TimeCafeLogo';

interface CustomizeFoodModalProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, size: 'Standard' | 'Large', customization: CartItemCustomization) => void;
  onClose: () => void;
}

export const CustomizeFoodModal: React.FC<CustomizeFoodModalProps> = ({
  item,
  onAddToCart,
  onClose,
}) => {
  const [selectedSize, setSelectedSize] = useState<'Standard' | 'Large'>('Standard');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedAdditions, setSelectedAdditions] = useState<ExtraTopping[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  const basePrice =
    selectedSize === 'Large' && item.priceLarge ? item.priceLarge : item.price;

  const additionsPrice = selectedAdditions.reduce((sum, add) => sum + add.price, 0);
  const totalItemPrice = basePrice + additionsPrice;

  const toggleRemoveIngredient = (ing: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const toggleAddition = (topping: ExtraTopping) => {
    setSelectedAdditions((prev) =>
      prev.some((t) => t.name === topping.name)
        ? prev.filter((t) => t.name !== topping.name)
        : [...prev, topping]
    );
  };

  const handleConfirm = () => {
    onAddToCart(item, selectedSize, {
      selectedAdditions,
      removedIngredients,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header with Item Banner */}
        <div className="relative h-44 sm:h-52 shrink-0 bg-slate-950">
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 flex items-center justify-center transition cursor-pointer shadow-lg border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TimeCafeLogo size={28} />
                {item.tag && (
                  <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.tag}
                  </span>
                )}
                <span className="text-xs text-slate-300 font-semibold capitalize">{item.category.replace('_', ' ')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{item.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{item.desc}</p>
            </div>
          </div>
        </div>

        {/* Customization Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Size Choice (for pizzas) */}
          {item.hasSizes && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Select Size Portion
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSize('Standard')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedSize === 'Standard'
                      ? 'bg-orange-500/15 border-orange-500 text-white ring-2 ring-orange-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold text-sm">Regular Portion</span>
                  <span className="text-xs text-orange-400 font-extrabold">{item.price} ETB</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSize('Large')}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    selectedSize === 'Large'
                      ? 'bg-orange-500/15 border-orange-500 text-white ring-2 ring-orange-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block font-bold text-sm">Large Portion</span>
                  <span className="text-xs text-orange-400 font-extrabold">
                    {item.priceLarge || item.price + 130} ETB
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Standard Ingredients Customization (Remove / Keep) */}
          {item.availableIngredients && item.availableIngredients.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  2. Customize Standard Ingredients
                </label>
                <span className="text-[11px] text-slate-500">Tap to exclude any ingredient</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.availableIngredients.map((ing) => {
                  const isExcluded = removedIngredients.includes(ing);
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => toggleRemoveIngredient(ing)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        isExcluded
                          ? 'bg-rose-950/20 border-rose-900/40 text-rose-400 line-through'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{ing}</span>
                      {isExcluded ? (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                          Excluded
                        </span>
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Additions / Toppings (+ETB) */}
          {item.extraToppings && item.extraToppings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  3. Extra Toppings &amp; Add-ons
                </label>
                <span className="text-[11px] text-orange-400 font-semibold">Optional upgrades</span>
              </div>

              <div className="space-y-2">
                {item.extraToppings.map((top) => {
                  const isChecked = selectedAdditions.some((a) => a.name === top.name);
                  return (
                    <button
                      key={top.name}
                      type="button"
                      onClick={() => toggleAddition(top)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs transition cursor-pointer ${
                        isChecked
                          ? 'bg-orange-500/15 border-orange-500 text-white shadow-sm ring-1 ring-orange-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="font-semibold">{top.name}</span>
                      </div>
                      <span className="font-bold text-orange-400">+{top.price} ETB</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Preparation Instructions */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              4. Special Instructions for Chef
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, lightly baked, cut in 8 slices, no cutlery..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Footer with Total Price & Add Button */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 shrink-0 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Customized Price</span>
            <span className="text-xl font-black text-orange-500">
              {totalItemPrice} <span className="text-xs font-normal text-slate-400">ETB</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/25 transition flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Order Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
