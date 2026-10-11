import { Order } from '../types';

let audioContextInstance: AudioContext | null = null;

export function getKitchenAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContextInstance) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContextInstance = new AudioCtx();
    }
  }
  if (audioContextInstance && audioContextInstance.state === 'suspended') {
    audioContextInstance.resume().catch(() => {});
  }
  return audioContextInstance;
}

export function playBrassBellChime(): void {
  try {
    const ctx = getKitchenAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t0 = ctx.currentTime;

    // Helper to synthesize a single brass bell strike with realistic physical harmonics
    const triggerBellStrike = (startTime: number, baseFreq: number, intensity: number) => {
      // 1. Clapper strike transient (metallic impact click)
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(baseFreq * 2.1, startTime);
      strikeOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, startTime + 0.03);

      strikeGain.gain.setValueAtTime(0.4 * intensity, startTime);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strikeOsc.start(startTime);
      strikeOsc.stop(startTime + 0.04);

      // 2. Fundamental resonant brass mode (rich tone, long decay)
      const fundOsc = ctx.createOscillator();
      const fundGain = ctx.createGain();
      fundOsc.type = 'sine';
      fundOsc.frequency.setValueAtTime(baseFreq, startTime);

      fundGain.gain.setValueAtTime(0.001, startTime);
      fundGain.gain.linearRampToValueAtTime(0.45 * intensity, startTime + 0.004);
      fundGain.gain.exponentialRampToValueAtTime(0.0008, startTime + 1.4);

      fundOsc.connect(fundGain);
      fundGain.connect(ctx.destination);
      fundOsc.start(startTime);
      fundOsc.stop(startTime + 1.45);

      // 3. Quint harmonic overtone (1.5x fundamental - gives that bell sweetness)
      const quintOsc = ctx.createOscillator();
      const quintGain = ctx.createGain();
      quintOsc.type = 'sine';
      quintOsc.frequency.setValueAtTime(baseFreq * 1.5, startTime);

      quintGain.gain.setValueAtTime(0.001, startTime);
      quintGain.gain.linearRampToValueAtTime(0.28 * intensity, startTime + 0.004);
      quintGain.gain.exponentialRampToValueAtTime(0.0005, startTime + 1.0);

      quintOsc.connect(quintGain);
      quintGain.connect(ctx.destination);
      quintOsc.start(startTime);
      quintOsc.stop(startTime + 1.05);

      // 4. Octave inharmonic mode (2.0x fundamental)
      const octOsc = ctx.createOscillator();
      const octGain = ctx.createGain();
      octOsc.type = 'sine';
      octOsc.frequency.setValueAtTime(baseFreq * 2.0, startTime);

      octGain.gain.setValueAtTime(0.001, startTime);
      octGain.gain.linearRampToValueAtTime(0.2 * intensity, startTime + 0.003);
      octGain.gain.exponentialRampToValueAtTime(0.0005, startTime + 0.7);

      octOsc.connect(octGain);
      octGain.connect(ctx.destination);
      octOsc.start(startTime);
      octOsc.stop(startTime + 0.75);

      // 5. High metallic shimmer overtone (~3.0x fundamental)
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'triangle';
      shimmerOsc.frequency.setValueAtTime(baseFreq * 3.01, startTime);

      shimmerGain.gain.setValueAtTime(0.001, startTime);
      shimmerGain.gain.linearRampToValueAtTime(0.15 * intensity, startTime + 0.003);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0005, startTime + 0.45);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(startTime);
      shimmerOsc.stop(startTime + 0.5);
    };

    // Authentic restaurant desk/counter bell: Double strike "Ding-Ding!"
    // Strike 1: Crisp brass bell at 1760 Hz (A6)
    triggerBellStrike(t0, 1760, 0.9);

    // Strike 2: Bright second chime at t0 + 0.15s (2093 Hz - C7) with long ringing tail
    triggerBellStrike(t0 + 0.15, 2093, 1.0);
  } catch {
    // Ignore audio errors on unsupported environments
  }
}

export function playAutomaticKitchenChime(): void {
  playBrassBellChime();
}

export function testBrassBell(): void {
  playBrassBellChime();
}

export function unlockKitchenAudio(): void {
  if (typeof window === 'undefined') return;
  getKitchenAudioContext();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

export type KitchenTTSLanguage = 'am-ET' | 'en-US';

export function getKitchenTTSLanguage(): KitchenTTSLanguage {
  if (typeof window === 'undefined') return 'am-ET';
  const saved = localStorage.getItem('timecafe_tts_lang');
  if (saved === 'en-US' || saved === 'am-ET') return saved;
  return 'am-ET'; // Default to Amharic!
}

export function setKitchenTTSLanguage(lang: KitchenTTSLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('timecafe_tts_lang', lang);
  }
}

// Amharic Numbers Map for natural spoken Ethiopian phrasing
const AMHARIC_NUMBERS: Record<number, string> = {
  1: 'አንድ',
  2: 'ሁለት',
  3: 'ሦስት',
  4: 'አራት',
  5: 'አምስት',
  6: 'ስድስት',
  7: 'ሰባት',
  8: 'ስምንት',
  9: 'ዘጠኝ',
  10: 'አስር',
  11: 'አስራ አንድ',
  12: 'አስራ ሁለት',
  15: 'አስራ አምስት',
  20: 'ሃያ',
};

// Amharic Food Dictionary mapping English catalog names to natural Ethiopian kitchen terms
const AMHARIC_FOOD_MAP: Record<string, string> = {
  // Burgers
  'Time Special Burger': 'ታይም ስፔሻል በርገር',
  'Special Burger': 'ስፔሻል በርገር',
  'Classic Cheese Burger': 'ቺዝ በርገር',
  'Cheese Burger': 'ቺዝ በርገር',
  'Double Beef Burger': 'ደብል ቢፍ በርገር',
  'Crispy Chicken Burger': 'ክሪስፒ ዶሮ በርገር',
  'Chicken Burger': 'ዶሮ በርገር',
  'Veggie Delight Burger': 'የአትክልት በርገር',
  'Mushroom Swiss Burger': 'እንጉዳይ በርገር',

  // Pizzas
  'Time Special Pizza': 'ታይም ስፔሻል ፒዛ',
  'Meat Lovers Pizza': 'የስጋ ፒዛ',
  'Pepperoni Feast Pizza': 'ፔፐሮኒ ፒዛ',
  'Margherita Pizza': 'ማርጋሪታ ፒዛ',
  'Vegetarian Garden Pizza': 'የአትክልት ፒዛ',
  'Chicken Supreme Pizza': 'የዶሮ ፒዛ',
  'BBQ Chicken Pizza': 'ባርቢኪው ዶሮ ፒዛ',
  'Four Cheese Pizza': 'አራት ቺዝ ፒዛ',
  'Tuna & Onion Pizza': 'የዓሳ ፒዛ',

  // Pastas
  'Pasta Bolognese': 'ፓስታ ቦሎኔዝ',
  'Spaghetti Carbonara': 'ስፓጌቲ ካርቦናራ',
  'Penne Arrabiata': 'ፔኔ አራቢያታ',
  'Lasagna al Forno': 'ላዛኛ',

  // Sides & Cakes
  'French Fries': 'ቺፕስ',
  'Crispy Fries': 'ቺፕስ',
  'Chocolate Fudge Cake': 'ቸኮሌት ኬክ',
  'Strawberry Cheesecake': 'ስትሮቤሪ ኬክ',
  'Tiramisu Delight': 'ቲራሚሱ',

  // Hot Drinks
  Espresso: 'ኤስፕሬሶ',
  Macchiato: 'ማኪያቶ',
  Cappuccino: 'ካፑቺኖ',
  'Cafe Latte': 'ካፌ ላቴ',
  'Special Ethiopian Coffee': 'የሀበሻ ቡና',
  'Spiced Tea': 'ቅመም ሻይ',
  'Green Tea': 'ግሪን ቲ',
  'Hot Chocolate': 'ትኩስ ቸኮሌት',

  // Cold Drinks & Juices
  'Fresh Avocado Juice': 'አቮካዶ ጁስ',
  'Mango Juice': 'ማንጎ ጁስ',
  'Mixed Fruit Juice': 'ስፕሪስ ጁስ',
  'Papaya Juice': 'ፓፓያ ጁስ',
  Water: 'የታሸገ ውሃ',
  'Mineral Water': 'አምቦ ውሃ',
  'Coca Cola': 'ኮካ ኮላ',
  Coke: 'ኮካ ኮላ',
  Sprite: 'ስፕራይት',
  Fanta: 'ፋንታ',
};

// Amharic Ingredient Translation
const AMHARIC_INGREDIENTS: Record<string, string> = {
  Onion: 'ሽንኩርት',
  Tomato: 'ቲማቲም',
  Pickles: 'ፒክልስ',
  Lettuce: 'ሰላጣ',
  Mayo: 'ማዮኔዝ',
  Mayonnaise: 'ማዮኔዝ',
  Mustard: 'ሰናፍጭ',
  Cheese: 'ቺዝ',
  'Extra Cheese': 'ተጨማሪ ቺዝ',
  'Beef Patty': 'ስጋ',
  Egg: 'እንቁላል',
  Bacon: 'ቤከን',
  Jalapeno: 'ቃሪያ',
  Olives: 'ወይራ ፍሬ',
  Mushrooms: 'እንጉዳይ',
  'Garlic Sauce': 'ነጭ ሽንኩርት ሶስ',
};

export function formatOrderForAmharicSpeech(order: Order): string {
  const itemsText = order.items
    .map((item) => {
      const qtyAmharic = AMHARIC_NUMBERS[item.quantity] || `${item.quantity}`;
      const foodNameAmharic =
        AMHARIC_FOOD_MAP[item.name] ||
        AMHARIC_FOOD_MAP[item.name.trim()] ||
        item.name;

      let itemDesc = `${qtyAmharic} ${foodNameAmharic}`;

      if (item.customization) {
        if (item.customization.removedIngredients.length > 0) {
          const removedAm = item.customization.removedIngredients
            .map((ing) => AMHARIC_INGREDIENTS[ing] || ing)
            .join(' እና ');
          itemDesc += `፣ ያለ ${removedAm}`;
        }
        if (item.customization.selectedAdditions.length > 0) {
          const addedAm = item.customization.selectedAdditions
            .map((add) => AMHARIC_INGREDIENTS[add.name] || add.name)
            .join(' እና ');
          itemDesc += `፣ ከተጨማሪ ${addedAm}`;
        }
      }
      return itemDesc;
    })
    .join('። ቀጣይ ምግብ፦ ');

  // Per user instructions: ONLY say "New order" and the ordered items in Amharic. Strictly omits customer names.
  return `አዲስ ትዕዛዝ ደርሷል! ${itemsText}። እባክዎ በፍጥነት ያዘጋጁ።`;
}

export function formatOrderForEnglishSpeech(order: Order): string {
  const itemsDescription = order.items
    .map((item) => {
      let desc = `${item.quantity} ${item.name}`;
      if (item.customization) {
        if (item.customization.removedIngredients.length > 0) {
          desc += `, without ${item.customization.removedIngredients.join(', ')}`;
        }
        if (item.customization.selectedAdditions.length > 0) {
          desc += `, with extra ${item.customization.selectedAdditions.map((a) => a.name).join(', ')}`;
        }
      }
      return desc;
    })
    .join('. Next item: ');

  return `New order! ${itemsDescription}. Please prepare promptly.`;
}

export function speakKitchenOrder(
  order: Order,
  options?: { rate?: number; pitch?: number; lang?: KitchenTTSLanguage }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Resume synthesis if browser suspended it
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const activeLang = options?.lang || getKitchenTTSLanguage();

  const textToRead =
    activeLang === 'am-ET'
      ? formatOrderForAmharicSpeech(order)
      : formatOrderForEnglishSpeech(order);

  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = options?.rate ?? (activeLang === 'am-ET' ? 0.92 : 0.95);
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.lang = activeLang;

  // Attempt to select specific voice if available
  const voices = window.speechSynthesis.getVoices();
  if (activeLang === 'am-ET') {
    const amharicVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('am') ||
        v.lang.toLowerCase().includes('et') ||
        v.name.toLowerCase().includes('amharic') ||
        v.name.toLowerCase().includes('ethiopia')
    );
    if (amharicVoice) {
      utterance.voice = amharicVoice;
    }
  }

  // Handle browser freeze by calling resume right before speak
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

// Backward compatibility alias: always delegates to kitchen-only speech without customer names
export const speakOrder = speakKitchenOrder;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
