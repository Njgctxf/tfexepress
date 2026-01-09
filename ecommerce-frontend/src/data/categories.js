import {
  LayoutGrid,
  Smartphone,
  Shirt,
  Laptop,
  Watch,
  Headphones,
  Gamepad2,
  Tv,
  ChefHat,
} from "lucide-react";

const categories = [
  {
    name: "Tout",
    value: "all",
    icon: LayoutGrid,
  },
  {
    name: "Téléphones",
    value: "Téléphones",
    icon: Smartphone,
  },
  {
    name: "Vêtements",
    value: "Vêtements",
    icon: Shirt,
  },
  {
    name: "Ordinateurs",
    value: "Ordinateurs",
    icon: Laptop,
  },
  {
    name: "Montres",
    value: "Montres",
    icon: Watch,
  },
  {
    name: "Audio",
    value: "Audio",
    icon: Headphones,
  },
  {
    name: "Gaming",
    value: "Gaming",
    icon: Gamepad2,
  },
  {
    name: "Electronique",
    value: "Electronique",
    icon: Tv,
  },
  {
    name: "Cuisine",
    value: "Cuisine",
    icon: ChefHat,
  },
];

export default categories;
