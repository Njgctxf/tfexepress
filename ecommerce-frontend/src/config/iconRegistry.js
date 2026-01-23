import {
    // Tech & Electronics
    Smartphone, Tablet, Laptop, Camera, Headphones, Speaker, Tv, Printer, Watch, Monitor,
    Mouse, Keyboard, HardDrive, Cpu, Server, Wifi, Battery, Calculator, Radio,
    Gamepad2, Joystick, Gamepad,

    // Fashion & Accessories
    Shirt, Footprints, Gem, Glasses, Briefcase, Umbrella, Watch as WatchIcon, Scissors,
    Crown, Scale, Tag, ShoppingBag, ShoppingCart, User, Ticket, CreditCard,

    // Home & Living
    Home, Armchair, Bed, Lamp, Flower2, Hammer, Wrench, Utensils, ChefHat,
    Bath, ShowerHead, Thermometer, Sofa, DoorOpen, Refrigerator, Fan,

    // Beauty & Health
    Sparkles, SprayCan, Heart, Pill, Palette, Stethoscope, Activity, Smile,
    Sun, Moon, Feather, Eye,

    // Sports & Hobbies
    Bike, Dumbbell, Tent, Trophy, Map, Compass, Anchor, Plane, Car, Bus, Train,
    Music, Clapperboard, Book, GraduationCap, Brush, Image, Camera as CameraIcon,

    // Food & Drink
    Coffee, Apple, Pizza, Sandwich, Cake, Wine, Beer, Croissant, Carrot, Fish,
    GlassWater, Wheat,

    // Kids & Baby
    Baby, Puzzle, ToyBrick, Rocket, Ghost, PartyPopper, Gift,

    // Nature & Animals
    Leaf, TreeDeciduous, TreePine, Mountain, Cloud, CloudRain, Zap,
    PawPrint, Fish as FishIcon, Bird, Cat, Dog, Rabbit,

    // Office & School
    Briefcase as BriefcaseIcon, Calculator as CalculatorIcon, Paperclip,
    Folder, FileText, Pen, Highlighter, Globe, Bookmark, Archive,

    // Misc / UI
    Grid, Search, Bell, Clock, Calendar, Check, X, Menu, Settings, Trash,
    Flag, Shield, Lock, Unlock, Key, Percent
} from "lucide-react";

export const iconMap = {
    // Electronics
    Smartphone, Tablet, Laptop, Monitor, Tv, Headphones, Speaker, Camera, Watch,
    Printer, Mouse, Keyboard, HardDrive, Server, Wifi, Battery, Radio, Gamepad2, Joystick,

    // Fashion
    Shirt, Footprints, Gem, Glasses, Briefcase, Umbrella, Crown, Scissors, ShoppingBag, CreditCard, Tag,

    // Home
    Home, Armchair, Bed, Sofa, Lamp, DoorOpen, Refrigerator, Fan, Bath, ShowerHead,
    Hammer, Wrench, Utensils, ChefHat, Coffee, Wine, Beer, Cake, Pizza, Sandwich, Apple, Carrot, Wheat,

    // Beauty & Health
    Sparkles, SprayCan, Palette, Heart, Pill, Stethoscope, Activity, Smile, Sun, Moon, Eye, Feather,

    // Sports & Travel
    Dumbbell, Bike, Tent, Map, Compass, Plane, Car, Bus, Train, Anchor, Trophy, Flag,

    // Art & Education
    Book, GraduationCap, Pen, Highlighter, Music, Clapperboard, Image, Brush,

    // Kids
    Baby, Puzzle, ToyBrick, Rocket, Ghost, PartyPopper, Gift,

    // Animals & Nature
    PawPrint, Cat, Dog, Rabbit, Bird, Fish, Leaf, TreeDeciduous, Mountain, Cloud, Zap, CloudRain,

    // Office
    Folder, FileText, Paperclip, Calculator, Archive, Globe, Bookmark,

    // UI Defaults
    Grid, Search, Bell, Clock, Calendar, Shield, Lock, Key, Settings, Percent, Check
};

export const iconList = Object.keys(iconMap);

// Mapping French keywords to Icon Keys for easier search
export const iconTags = {
    Smartphone: "telephone mobile portable iphone android",
    Tablet: "tablette ipad",
    Laptop: "ordinateur pc macbook portable",
    Monitor: "ecran moniteur tv",
    Tv: "television tele ecran",
    Headphones: "casque ecouteur audio musique",
    Speaker: "enceinte son bluetooth",
    Camera: "photo camera video",
    Watch: "montre heure connectee",
    Printer: "imprimante papier",
    Gamepad2: "jeu video manette console gaming",

    Shirt: "vetement t-shirt mode habit",
    Footprints: "chaussure basket pied mode",
    Gem: "bijou diamant luxe accessoire",
    Glasses: "lunette soleil vue",
    Briefcase: "sac travail bureau",
    Umbrella: "parapluie pluie",
    ShoppingBag: "sac courses shopping",

    Home: "maison accueil batiment",
    Armchair: "fauteuil canape salon meuble",
    Bed: "lit chambre dormir meuble",
    Sofa: "canape salon",
    Lamp: "lampe lumiere eclairage",
    Hammer: "outil bricolage marteau",
    Wrench: "outil cle reparation mecanique",
    Utensils: "couverts cuisine manger restaurant",
    ChefHat: "cuisine chef toques repas",
    Coffee: "cafe boisson tasse",
    Apple: "pomme fruit nourriture",

    Sparkles: "beaute eclat propre",
    SprayCan: "parfum spray beaute",
    Palette: "maquillage peinture couleur art",
    Heart: "sante coeur amour vie",
    Pill: "sante medicament pharmacie",

    Dumbbell: "sport musculation salle",
    Bike: "velo velo sport",
    Tent: "camping vacances nature",
    Car: "voiture auto vehicule",
    Plane: "avion voyage transport",

    Book: "livre lecture ecole",
    Music: "musique note son",

    Baby: "bebe enfant jouet",
    Gift: "cadeau fete anniversaire",

    PawPrint: "animal chien chat",
    Leaf: "nature plante eco",
    Zap: "energie eclair flash promo",
    Percent: "promo reduction solde",
    Grid: "categorie defaut menu"
};
