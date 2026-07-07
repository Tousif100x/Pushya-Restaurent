export const restaurantDetails = {
  name: "Pushya Pizza & Sandwich Planet",
  slogan: "Taste Jo Dil Ko Bhaye",
  phone: "9098382993",
  secondaryPhone: "9111221940",
  whatsapp: "9098382993",
  address: "Shri Krishna Paradise, Near, Rau Cir, Rau, Indore",
  latitude: 22.6378,
  longitude: 75.8073,
  mapLink: "https://maps.google.com/?q=Pushya+Pizza+and+Sandwich+Planet+Rau",
  openingTime: "10:00 AM",
  closingTime: "10:00 PM",
  deliveryRadiusKm: 4,
  baseDeliveryCharge: 20,
  distanceSlabs: [
    { maxKm: 2, charge: 20 },
    { maxKm: 4, charge: 40 }
  ],
  estimatedPrepTime: "25-30 mins"
};

export const services = [
  {
    id: "birthday-party",
    title: "Birthday Party",
    description: "Celebrate your special day with our premium catering and space.",
    icon: "Cake",
  },
  {
    id: "kitty-party",
    title: "Kitty Party",
    description: "Elegant arrangements for your memorable kitty parties.",
    icon: "Users",
  },
  {
    id: "farewell-party",
    title: "Farewell Party",
    description: "Bid adieu with great food and ambiance.",
    icon: "HandHeart",
  },
  {
    id: "grih-pravesh",
    title: "Grih Pravesh",
    description: "Auspicious beginnings with our authentic catering.",
    icon: "Home",
  },
  {
    id: "tiffin-facility",
    title: "Tiffin Facility",
    description: "₹100 - 2 sabzi, dal, chawal, 6 roti, salad, achar. (₹10 per extra roti)",
    icon: "Utensils",
  },
  {
    id: "bulk-orders",
    title: "All Types of Party Orders",
    description: "Custom bulk orders accepted for any event.",
    icon: "PartyPopper",
  }
];

export const offers = [
  {
    id: "sunday-combo",
    title: "Sunday Special Combo",
    price: 199,
    description: "Pizza, Sandwich, French Fries, Veg fried Momos, Cold Drink (Free)",
    note: "Available Only on Sunday (Parcel Charge: ₹20 Extra)",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "chinese-combo",
    title: "Chinese Combo",
    price: 149,
    description: "Noodles, Manchurian, Momos, Chutney, Free Idli, Cold Drink (Free)",
    note: "Available on Saturday & Sunday (Parcel Charge: ₹10 Extra)",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "bhojan-thali",
    title: "Unlimited Bhojan Thali",
    price: 99,
    description: "Unlimited Home Style Meal (On the shop delivery 120)",
    color: "bg-orange-500",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
  }
];

export const signatureItems = [
  "pushya-special-pizza",
  "pushya-special-sandwich",
  "kulhad-pizza",
  "chocolate-kunafa",
  "classic-kunafa",
  "jhol-momos",
  "cheese-dosa",
  "cheese-corn-appe"
];

export const menuCategories = [
  {
    id: "pizza",
    name: "Pizza Menu",
    description: "Hand-tossed crusts baked to perfection with fresh toppings and premium cheese.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "onion-pizza", name: "Onion Pizza", price: 79, isVeg: true },
      { id: "italian-pizza", name: "Italian Pizza", price: 99, isVeg: true },
      { id: "corn-capsicum-pizza", name: "Corn Capsicum Pizza", price: 119, isVeg: true },
      { id: "veg-spicy-pizza", name: "Veg Spicy Pizza", price: 119, isVeg: true },
      { id: "cheese-corn-pizza", name: "Cheese Corn Pizza", price: 119, isVeg: true },
      { id: "paneer-pizza", name: "Paneer Pizza", price: 119, isVeg: true },
      { id: "exotic-pizza", name: "Exotic Pizza", price: 139, isVeg: true },
      { id: "margherita-pizza", name: "Margherita Pizza", price: 139, isVeg: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop" },
      { id: "kulhad-pizza", name: "Kulhad Pizza", price: 149, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop" },
      { id: "double-burst-pizza", name: "Double Burst Pizza", price: 169, isVeg: true },
      { id: "pushya-special-pizza", name: "Pushya Special Pizza", price: 169, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop" },
    ]
  },
  {
    id: "sandwich",
    name: "Sandwich Menu",
    description: "Grilled and layered with the finest ingredients for a perfect bite every time.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "veg-non-back-sandwich", name: "Vegetable Non-Back Sandwich", price: 69, isVeg: true },
      { id: "mayo-sandwich", name: "Mayo Sandwich", price: 79, isVeg: true },
      { id: "veg-sandwich", name: "Vegetable Sandwich", price: 79, isVeg: true },
      { id: "mumbai-sandwich", name: "Mumbai Sandwich", price: 79, isVeg: true },
      { id: "jain-sandwich", name: "Jain Sandwich (No Onion, No Garlic)", price: 79, isVeg: true },
      { id: "cheese-aalu-sandwich", name: "Cheese Aalu Sandwich", price: 89, isVeg: true },
      { id: "cheese-chatni-sandwich", name: "Cheese Chatni Sandwich", price: 99, isVeg: true },
      { id: "paneer-sandwich", name: "Paneer Sandwich", price: 99, isVeg: true },
      { id: "cheese-corn-sandwich", name: "Cheese Corn Sandwich", price: 105, isVeg: true },
      { id: "pushya-special-sandwich", name: "Pushya Special Sandwich", price: 129, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop" },
      { id: "jumbo-sandwich", name: "Jumbo Sandwich", price: 169, isVeg: true },
    ]
  },
  {
    id: "burger",
    name: "Burger Menu",
    description: "Juicy patties, fresh veggies, and our secret sauces packed in soft toasted buns.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "aalu-tikki-burger", name: "Aalu Tikki Burger", price: 69, isVeg: true },
      { id: "veg-burger", name: "Veg Burger", price: 69, isVeg: true },
      { id: "garlic-veg-burger", name: "Garlic Veg Burger", price: 79, isVeg: true },
      { id: "cheese-burger", name: "Cheese Burger", price: 89, isVeg: true },
      { id: "double-cheese-burger", name: "Double Cheese Burger", price: 89, isVeg: true },
    ]
  },
  {
    id: "momos",
    name: "Momos Menu",
    description: "Authentic dumplings steamed or fried, served with our signature spicy dip.",
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "veg-momos", name: "Veg Momos (Steamed/Fried)", price: 59, isVeg: true },
      { id: "paneer-momos", name: "Paneer Momos (Steamed/Fried)", price: 69, isVeg: true },
      { id: "cheese-corn-momos", name: "Cheese Corn Momos (Steamed/Fried)", price: 69, isVeg: true },
      { id: "tandoori-momos", name: "Tandoori Momos", price: 89, isVeg: true },
      { id: "afghani-momos", name: "Afghani Momos", price: 109, isVeg: true },
      { id: "kurkure-momos", name: "Kurkure Momos", price: 109, isVeg: true },
      { id: "jhol-momos", name: "Jhol Momos", price: 129, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=800&auto=format&fit=crop" },
    ]
  },
  {
    id: "chinese",
    name: "Chinese Menu",
    description: "Wok-tossed delicacies featuring bold flavors and fresh aromatic ingredients.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "noodles", name: "Noodles", price: 59, isVeg: true },
      { id: "hakka-noodles", name: "Hakka Noodles", price: 99, isVeg: true, image: "https://images.unsplash.com/photo-1612929633738-8fe01f7c7769?q=80&w=800&auto=format&fit=crop" },
      { id: "garlic-noodles", name: "Garlic Noodles", price: 79, isVeg: true },
      { id: "dry-manchurian", name: "Dry Manchurian", price: 79, isVeg: true },
      { id: "manchurian-gravy", name: "Manchurian Gravy", price: 79, isVeg: true },
      { id: "noodles-with-manchurian", name: "Noodles with Manchurian", price: 99, isVeg: true },
      { id: "spring-roll", name: "Spring Roll", price: 99, isVeg: true },
      { id: "fried-rice", name: "Fried Rice", price: 99, isVeg: true },
      { id: "chilli-paneer", name: "Chilli Paneer", price: 139, isVeg: true },
      { id: "white-sauce-pasta", name: "White Sauce Pasta", price: 159, isVeg: true },
      { id: "red-sauce-pasta", name: "Red Sauce Pasta", price: 129, isVeg: true },
    ]
  },
  {
    id: "french-fries",
    name: "French Fries",
    description: "Crispy, golden fries seasoned to absolute perfection.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "salty-french-fries", name: "Salty French Fries", price: 69, isVeg: true },
      { id: "peri-peri-french-fries", name: "Peri Peri French Fries", price: 79, isVeg: true },
      { id: "cheese-french-fries", name: "Cheese French Fries", price: 99, isVeg: true },
      { id: "spicy-hot-french-fries", name: "Spicy & Hot French Fries", price: 119, isVeg: true },
    ]
  },
  {
    id: "corn",
    name: "Corn Menu",
    description: "Sweet and savory corn specialties.",
    image: "/images/corn.png",
    items: [
      { id: "crispy-corn", name: "Crispy Corn", price: 119, isVeg: true },
      { id: "boil-corn", name: "Boil Corn", price: 99, isVeg: true },
      { id: "chaat-corn", name: "Chaat Corn", price: 119, isVeg: true },
    ]
  },
  {
    id: "indian",
    name: "Indian Menu",
    description: "Traditional comfort food prepared with authentic spices.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "aalu-paratha", name: "Aalu Paratha", price: 55, isVeg: true },
      { id: "paneer-paratha", name: "Paneer Paratha", price: 55, isVeg: true },
      { id: "gobhi-paratha", name: "Gobhi Paratha", price: 55, isVeg: true },
      { id: "mix-veg-paratha", name: "Mix Veg Paratha", price: 65, isVeg: true },
      { id: "onion-paratha", name: "Onion Paratha", price: 45, isVeg: true },
      { id: "cheese-paratha", name: "Cheese Paratha", price: 75, isVeg: true },
      { id: "chhole-chawal", name: "Chhole Chawal", price: 55, isVeg: true },
      { id: "rajma-chawal", name: "Rajma Chawal", price: 55, isVeg: true },
      { id: "kadhi-chawal", name: "Kadhi Chawal", price: 55, isVeg: true },
      { id: "veg-biryani", name: "Veg Biryani", price: 59, isVeg: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop" },
      { id: "butter-khichdi", name: "Butter Khichdi", price: 79, isVeg: true },
    ]
  },
  {
    id: "south-indian",
    name: "South Indian",
    description: "Crispy dosas and soft idlis served with flavorful sambar and chutneys.",
    image: "/images/south_indian.png",
    items: [
      { id: "idli-sambar", name: "Idli Sambar", price: 45, isVeg: true },
      { id: "vada-sambar", name: "Vada Sambar", price: 45, isVeg: true },
      { id: "plain-dosa", name: "Plain Dosa", price: 65, isVeg: true },
      { id: "masala-dosa", name: "Masala Dosa", price: 75, isVeg: true },
      { id: "paneer-dosa", name: "Paneer Dosa", price: 95, isVeg: true },
      { id: "cheese-dosa", name: "Cheese Dosa (Chef's Special)", price: 109, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop" },
      { id: "uttapam", name: "Uttapam", price: 54, isVeg: true },
      { id: "mix-veg-uttapam", name: "Mix Veg Uttapam", price: 85, isVeg: true },
      { id: "fried-idli", name: "Fried Idli", price: 75, isVeg: true },
      { id: "appe", name: "Appe", price: 75, isVeg: true },
      { id: "mix-veg-appe", name: "Mix Veg Appe", price: 95, isVeg: true },
      { id: "cheese-corn-appe", name: "Cheese Corn Appe (Chef's Special)", price: 115, isVeg: true, isSignature: true },
    ]
  },
  {
    id: "hot-specials",
    name: "Hot Specials",
    description: "Quick, hot bites full of flavor.",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop",
    items: [
      { id: "chhole-bhature", name: "Chhole Bhature", price: 69, isVeg: true },
      { id: "pav-bhaji", name: "Pav Bhaji", price: 69, isVeg: true },
      { id: "vada-pav", name: "Vada Pav", price: 35, isVeg: true },
      { id: "hot-dog", name: "Hot Dog", price: 59, isVeg: true },
      { id: "dahi-shole", name: "Dahi Shole", price: 79, isVeg: true },
    ]
  },
  {
    id: "delights",
    name: "Pushya Delights",
    description: "Premium desserts and sweet treats to complete your meal.",
    image: "/images/kunafa.png",
    items: [
      { id: "classic-kunafa", name: "Classic Kunafa", price: 249, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1601267597143-02f5d94723cd?q=80&w=800&auto=format&fit=crop" },
      { id: "chocolate-kunafa", name: "Chocolate Kunafa", price: 279, isVeg: true, isSignature: true, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop" },
      { id: "kunafa-bites", name: "Kunafa Bites (Mini Kunafa Rolls with Pistachio)", price: 199, isVeg: true },
      { id: "swadisht-bhojan-thali", name: "Swadisht Bhojan Thali", price: 99, isVeg: true },
    ]
  }
];
