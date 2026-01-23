const heroSlots = {
  Téléphones: {
    main: [
      {
        badge: "Nouveau",
        title: "iPhone 17 Pro Max",
        desc: "Puissance extrême. Design premium.",
        image:
          "https://images.unsplash.com/photo-1695048133142-1a2043614d8c",
        bg: "bg-yellow-400",
        productId: 1,
      },
      {
        badge: "Best Seller",
        title: "Galaxy S25 Ultra",
        desc: "Photo et performance ultime.",
        image:
          "https://images.unsplash.com/photo-1606813902914-3c5c4e9c0d92",
        bg: "bg-purple-500",
        productId: 2,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "MacBook Pro M4",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        bg: "bg-black",
        productId: 3,
      },
      {
        badge: "Hot",
        title: "iPad Pro 2025",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
        bg: "bg-gray-900",
        productId: 4,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "Galaxy Buds Pro",
        status: "Prix import Chine",
        image:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
        bg: "bg-red-600",
        productId: 5,
      },
      {
        badge: "Promo",
        title: "Apple Watch Ultra",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7",
        bg: "bg-green-600",
        productId: 6,
      },
    ],
  },
  Vêtements: {
    main: [
      {
        badge: "Nouveau",
        title: "Nike Air Max 270",
        desc: "Confort et style ultime.",
        image:
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
        bg: "bg-blue-500",
        productId: 7,
      },
      {
        badge: "Best Seller",
        title: "Adidas Ultraboost",
        desc: "Performance et élégance.",
        image:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772",
        bg: "bg-green-500",
        productId: 8,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "Levi's Jeans",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d",
        bg: "bg-indigo-600",
        productId: 9,
      },
      {
        badge: "Hot",
        title: "H&M T-Shirt",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        bg: "bg-pink-500",
        productId: 11,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "Zara Jacket",
        status: "Prix réduit",
        image:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5",
        bg: "bg-orange-500",
        productId: 12,
      },
      {
        badge: "Promo",
        title: "Puma Sneakers",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
        bg: "bg-teal-500",
        productId: 13,
      },
    ],
  },
  Ordinateurs: {
    main: [
      {
        badge: "Nouveau",
        title: "MacBook Pro M4",
        desc: "Puissance et portabilité.",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        bg: "bg-gray-800",
        productId: 14,
      },
      {
        badge: "Best Seller",
        title: "Dell XPS 13",
        desc: "Ultrabook premium.",
        image:
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
        bg: "bg-blue-600",
        productId: 15,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "iPad Pro 2025",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
        bg: "bg-black",
        productId: 16,
      },
      {
        badge: "Hot",
        title: "Surface Pro 9",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1587614295999-6c1a3c6e3e2a",
        bg: "bg-gray-700",
        productId: 17,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "HP Pavilion",
        status: "Prix import",
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        bg: "bg-red-500",
        productId: 18,
      },
      {
        badge: "Promo",
        title: "Lenovo ThinkPad",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
        bg: "bg-green-600",
        productId: 19,
      },
    ],
  },
  Montres: {
    main: [
      {
        badge: "Nouveau",
        title: "Apple Watch Ultra",
        desc: "Aventure et fitness.",
        image:
          "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7",
        bg: "bg-orange-500",
        productId: 20,
      },
      {
        badge: "Best Seller",
        title: "Samsung Galaxy Watch",
        desc: "Connectivité ultime.",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        bg: "bg-purple-600",
        productId: 21,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "Garmin Fenix",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
        bg: "bg-green-700",
        productId: 22,
      },
      {
        badge: "Hot",
        title: "Fitbit Versa",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6",
        bg: "bg-blue-500",
        productId: 23,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "Rolex Submariner",
        status: "Prix exclusif",
        image:
          "https://images.unsplash.com/photo-1547996160-81dfa63595aa",
        bg: "bg-yellow-600",
        productId: 24,
      },
      {
        badge: "Promo",
        title: "Casio G-Shock",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
        bg: "bg-red-600",
        productId: 25,
      },
    ],
  },
  Audio: {
    main: [
      {
        badge: "Nouveau",
        title: "Sony WH-1000XM6",
        desc: "Audio immersif sans fil.",
        image:
          "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
        bg: "bg-black",
        productId: 26,
      },
      {
        badge: "Best Seller",
        title: "Bose QuietComfort",
        desc: "Confort et qualité sonore.",
        image:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
        bg: "bg-gray-800",
        productId: 27,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "AirPods Pro",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1606220945770-b5b6c2c9b5f1",
        bg: "bg-white",
        productId: 28,
      },
      {
        badge: "Hot",
        title: "JBL Go 3",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
        bg: "bg-blue-600",
        productId: 29,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "Marshall Major III",
        status: "Prix réduit",
        image:
          "https://images.unsplash.com/photo-1484704849700-f032a568e944",
        bg: "bg-brown-600",
        productId: 30,
      },
      {
        badge: "Promo",
        title: "Sennheiser HD 250BT",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1583394838336-acd977736f90",
        bg: "bg-green-600",
        productId: 31,
      },
    ],
  },
  Gaming: {
    main: [
      {
        badge: "Nouveau",
        title: "PlayStation 5",
        desc: "Jeu next-gen ultime.",
        image:
          "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
        bg: "bg-blue-700",
        productId: 32,
      },
      {
        badge: "Best Seller",
        title: "Xbox Series X",
        desc: "Performance et exclusivités.",
        image:
          "https://images.unsplash.com/photo-1621259182978-fbf93132d53d",
        bg: "bg-green-600",
        productId: 33,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "Nintendo Switch OLED",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96",
        bg: "bg-red-500",
        productId: 34,
      },
      {
        badge: "Hot",
        title: "Razer Keyboard",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
        bg: "bg-black",
        productId: 35,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "Logitech Mouse",
        status: "Prix gaming",
        image:
          "https://images.unsplash.com/photo-1527814050087-3793815479db",
        bg: "bg-gray-600",
        productId: 36,
      },
      {
        badge: "Promo",
        title: "Corsair Headset",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1599669454699-248893623440",
        bg: "bg-purple-600",
        productId: 37,
      },
    ],
  },
  Electronique: {
    main: [
      {
        badge: "Nouveau",
        title: "iPad Pro 2025",
        desc: "Créativité et productivité.",
        image:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
        bg: "bg-gray-900",
        productId: 38,
      },
      {
        badge: "Best Seller",
        title: "Kindle Paperwhite",
        desc: "Lecture immersive.",
        image:
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
        bg: "bg-white",
        productId: 39,
      },
    ],
    rightTop: [
      {
        badge: "Nouveau",
        title: "Echo Dot",
        status: "Disponible",
        image:
          "https://images.unsplash.com/photo-1543512214-318c7553f230",
        bg: "bg-black",
        productId: 40,
      },
      {
        badge: "Hot",
        title: "Ring Doorbell",
        status: "Stock limité",
        image:
          "https://images.unsplash.com/photo-1557804506-669a67965ba0",
        bg: "bg-blue-500",
        productId: 41,
      },
    ],
    rightBottom: [
      {
        badge: "Deal",
        title: "GoPro Hero 10",
        status: "Prix action",
        image:
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
        bg: "bg-red-600",
        productId: 42,
      },
      {
        badge: "Promo",
        title: "DJI Drone",
        status: "Offre spéciale",
        image:
          "https://images.unsplash.com/photo-1473968512647-3e447244af8f",
        bg: "bg-green-600",
        productId: 43,
      },
    ],
  },
};

export default heroSlots;
