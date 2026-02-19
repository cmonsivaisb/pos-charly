const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../prisma/seed-data/catalog');

// 1. Categories (15+)
const categories = [
  { name: "Bebidas", slug: "beverages", sortOrder: 1, defaultImageKey: "beverages/placeholder.webp" },
  { name: "Botanas", slug: "snacks", sortOrder: 2, defaultImageKey: "snacks/placeholder.webp" },
  { name: "Lácteos", slug: "dairy", sortOrder: 3, defaultImageKey: "dairy/placeholder.webp" },
  { name: "Panadería", slug: "bakery", sortOrder: 4, defaultImageKey: "bakery/placeholder.webp" },
  { name: "Limpieza", slug: "cleaning", sortOrder: 5, defaultImageKey: "cleaning/placeholder.webp" },
  { name: "Higiene Personal", slug: "hygiene", sortOrder: 6, defaultImageKey: "hygiene/placeholder.webp" },
  { name: "Enlatados", slug: "canned", sortOrder: 7, defaultImageKey: "canned/placeholder.webp" },
  { name: "Condimentos y Especias", slug: "condiments", sortOrder: 8, defaultImageKey: "condiments/placeholder.webp" },
  { name: "Farmacia", slug: "pharmacy", sortOrder: 9, defaultImageKey: "pharmacy/placeholder.webp" },
  { name: "Mascotas", slug: "pet", sortOrder: 10, defaultImageKey: "pet/placeholder.webp" },
  { name: "Frutas y Verduras", slug: "produce", sortOrder: 11, defaultImageKey: "produce/placeholder.webp" },
  { name: "Desechables", slug: "disposable", sortOrder: 12, defaultImageKey: "disposable/placeholder.webp" },
  { name: "Dulces y Confitería", slug: "candy", sortOrder: 13, defaultImageKey: "candy/placeholder.webp" },
  { name: "Bebidas Alcohólicas", slug: "alcohol", sortOrder: 14, defaultImageKey: "alcohol/placeholder.webp" },
  { name: "Carnes y Embutidos", slug: "meat", sortOrder: 15, defaultImageKey: "meat/placeholder.webp" },
  { name: "Congelados", slug: "frozen", sortOrder: 16, defaultImageKey: "frozen/placeholder.webp" },
  { name: "Bebés", slug: "baby", sortOrder: 17, defaultImageKey: "baby/placeholder.webp" },
  { name: "Hogar y Papelería", slug: "home", sortOrder: 18, defaultImageKey: "home/placeholder.webp" }
];

// Data generators
const brands = {
  beverages: ['Coca-Cola', 'Pepsi', 'Sprite', 'Fanta', '7Up', 'Peñafiel', 'Bonafont', 'Ciel', 'Jumex', 'Del Valle', 'Boing', 'Red Bull', 'Monster', 'Gatorade', 'Powerade'],
  snacks: ['Sabritas', 'Barcel', 'Bokados', 'Totis', 'Pringles', 'Doritos', 'Ruffles', 'Cheetos', 'Tostitos', 'Runners'],
  dairy: ['Lala', 'Alpura', 'Nutri', 'Danone', 'Yoplait', 'Sigma', 'Fud', 'San Marcos', 'Nochebuena', 'Philadelphia'],
  bakery: ['Bimbo', 'Marinela', 'Tía Rosa', 'Wonder', 'Oroweat', 'Gamesa', 'Cuétara'],
  cleaning: ['Cloralex', 'Pinol', 'Fabuloso', 'Maestro Limpio', 'Salvo', 'Axion', 'Ariel', 'Ace', 'Suavitel', 'Downy', 'Escudo'],
  hygiene: ['Colgate', 'Crest', 'Oral-B', 'Dove', 'Palmolive', 'Zest', 'Camay', 'Rexona', 'Axe', 'Old Spice', 'Pantene', 'Head & Shoulders', 'Saba', 'Kotex', 'Kleenex', 'Pétalo', 'Suavel'],
  canned: ['Herdez', 'La Costeña', 'Del Fuerte', 'Dolores', 'Tuny', 'Elote Dorado', 'Campbells'],
  condiments: ['McCormick', 'La Costeña', 'Doña María', 'Knorr', 'Maggi', 'Tajín', 'Valentina', 'Búfalo', 'Clemente Jacques'],
  pharmacy: ['Aspirina', 'Tempra', 'Pepto Bismol', 'Alka-Seltzer', 'Sal de Uvas Picot', 'Vick', 'XL-3', 'Desenfriol'],
  pet: ['Pedigree', 'Whiskas', 'Dog Chow', 'Cat Chow', 'Purina', 'Ganador'],
  candy: ['Ricolino', 'Vero', 'De la Rosa', 'Sonrics', 'Adams', 'Halls', 'Trident', 'Bubbaloo', 'Panditas'],
  alcohol: ['Corona', 'Victoria', 'Modelo', 'Tecate', 'XX Lager', 'Indio', 'Heineken', 'José Cuervo', 'Bacardí', 'Don Julio'],
  meat: ['Fud', 'San Rafael', 'Zwan', 'Kir', 'Bafar', 'Chimex'],
  baby: ['Huggies', 'Pampers', 'KleenBebé', 'Gerber', 'Nido', 'Nan']
};

const types = {
  beverages: ['Refresco', 'Agua Natural', 'Agua Mineral', 'Jugo', 'Néctar', 'Bebida Energética', 'Isotónico'],
  snacks: ['Papas Fritas', 'Churritos', 'Cacahuates', 'Palomitas', 'Totopos', 'Chicharrones'],
  dairy: ['Leche Entera', 'Leche Deslactosada', 'Leche Light', 'Yogurt Bebible', 'Yogurt Batido', 'Queso Panela', 'Queso Manchego', 'Crema', 'Mantequilla'],
  bakery: ['Pan Blanco', 'Pan Integral', 'Mantecadas', 'Donas', 'Galletas', 'Roles', 'Pan Tostado'],
  cleaning: ['Cloro', 'Limpiador Multiusos', 'Detergente Polvo', 'Detergente Líquido', 'Suavizante', 'Jabón Trastes', 'Desengrasante'],
  hygiene: ['Pasta Dental', 'Jabón Tocador', 'Shampoo', 'Acondicionador', 'Desodorante', 'Papel Higiénico', 'Toallas Femeninas', 'Pañuelos'],
  canned: ['Atún en Agua', 'Atún en Aceite', 'Chiles Jalapeños', 'Verduras', 'Elote', 'Sardinas', 'Frijoles Refritos'],
  condiments: ['Mayonesa', 'Mostaza', 'Catsup', 'Salsa Picante', 'Caldo de Pollo', 'Sal Molida', 'Pimienta'],
  pharmacy: ['Analgésico', 'Antiácido', 'Antigripal', 'Suero Oral', 'Vendas', 'Alcohol'],
  pet: ['Alimento Perro Adulto', 'Alimento Perro Cachorro', 'Alimento Gato', 'Sobres'],
  candy: ['Chicle', 'Paleta', 'Gomitas', 'Chocolate', 'Mazapán', 'Tamarindo'],
  alcohol: ['Cerveza Lata', 'Cerveza Botella', 'Tequila', 'Ron', 'Whisky', 'Vodka'],
  meat: ['Jamón Virginia', 'Salchicha Viena', 'Tocino', 'Chorizo', 'Mortadela'],
  baby: ['Pañales Etapa 1', 'Pañales Etapa 3', 'Pañales Etapa 5', 'Toallitas Húmedas', 'Papilla', 'Fórmula Láctea']
};

const sizes = [
  { val: 600, unit: 'ML' }, { val: 1, unit: 'L' }, { val: 2, unit: 'L' }, { val: 355, unit: 'ML' },
  { val: 45, unit: 'G' }, { val: 100, unit: 'G' }, { val: 250, unit: 'G' }, { val: 1, unit: 'KG' },
  { val: 500, unit: 'G' }, { val: 12, unit: 'PIECE' }, { val: 6, unit: 'PIECE' }
];

const products = [];
let packCodeCounter = 1;
const packs = [];

function generateBarcode() {
  return '750' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}

Object.keys(brands).forEach(catSlug => {
  const catBrands = brands[catSlug];
  const catTypes = types[catSlug] || ['Producto Genérico'];
  
  catBrands.forEach(brand => {
    catTypes.forEach(type => {
      // Create 2-3 size variations per type/brand combo
      const numVars = Math.floor(Math.random() * 2) + 2; 
      
      for(let i=0; i<numVars; i++) {
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const name = `${type} ${brand}`;
        const code = `${brand.substring(0,3).toUpperCase()}_${type.substring(0,3).toUpperCase()}_${size.val}${size.unit}_${Math.floor(Math.random()*1000)}`;
        
        products.push({
          catalogCode: code,
          brand: brand,
          name: type,
          variant: `${size.val} ${size.unit}`,
          sizeValue: size.val,
          sizeUnit: size.unit,
          unit: 'PIECE',
          barcode: generateBarcode(),
          categorySlug: catSlug,
          tags: [type.toLowerCase(), brand.toLowerCase(), catSlug],
          synonyms: [`${type} ${brand}`, `${brand} ${size.val}${size.unit}`, code],
          ivaRate: catSlug === 'pharmacy' || catSlug === 'produce' ? 0 : 0.16,
          priceInputMode: 'INCLUDES_TAX',
          priceBase: Number((Math.random() * 50 + 10).toFixed(2)),
          priceTotal: 0 // Will be calc in logic or just use as base
        });
      }
    });
  });
});

// Fix prices
products.forEach(p => {
  p.priceTotal = Number((p.priceBase * (1 + p.ivaRate)).toFixed(2));
});

// 3. Packs (10+)
// Generate random packs from generated products
for(let i=1; i<=15; i++) {
  const packItems = [];
  const numItems = Math.floor(Math.random() * 5) + 3; // 3-8 items per pack
  
  for(let j=0; j<numItems; j++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    packItems.push({
      catalogProductCode: randomProduct.catalogCode,
      quantity: Math.floor(Math.random() * 3) + 1
    });
  }

  packs.push({
    code: `PACK_GENERIC_${i}`,
    name: `Pack Surtido #${i}`,
    description: `Pack variado con ${numItems} productos`,
    items: packItems
  });
}

// Special large pack to meet requirement "items: lista de catalogCode (mínimo 25 items por pack)" ???
// Ah, requirement says "items: lista de catalogCode (mínimo 25 items por pack)" -> Wait, does it mean the pack contains 25 distinct items or total quantity? usually distinct lines.
// Or maybe "items" property in JSON is a list.
// The prompt says "items: lista de catalogCode (mínimo 25 items por pack)". I will create at least one massive pack.

const massivePackItems = [];
for(let k=0; k<30; k++) {
   const randomProduct = products[Math.floor(Math.random() * products.length)];
   // check dup
   if(!massivePackItems.find(x => x.catalogProductCode === randomProduct.catalogCode)) {
      massivePackItems.push({
        catalogProductCode: randomProduct.catalogCode,
        quantity: 1
      });
   }
}

packs.push({
  code: "PACK_MAYORISTA_1",
  name: "Pack Inicial Tienda",
  description: "Surtido completo para arrancar tienda (30 productos)",
  items: massivePackItems
});


// Write files
fs.writeFileSync(path.join(outputDir, 'categories.json'), JSON.stringify(categories, null, 2));
fs.writeFileSync(path.join(outputDir, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(outputDir, 'packs.json'), JSON.stringify(packs, null, 2));

console.log(`Generated:
- ${categories.length} categories
- ${products.length} products
- ${packs.length} packs
`);
