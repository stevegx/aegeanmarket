export interface Subcategory {
  label: string
  query: string
}

// Sub-groupings derived from real product names in the catalog, keyed by
// the uppercased top-level category returned from the DB (Product.category).
export const CATEGORY_TAXONOMY: Record<string, Subcategory[]> = {
  WINES: [
    { label: 'Red', query: 'Red' },
    { label: 'White', query: 'White' },
    { label: 'Rosé', query: 'Rose' },
    { label: 'Sparkling', query: 'Αφρωδ' },
    { label: 'Retsina', query: 'Ρετσιν' },
  ],
  SPIRITS: [
    { label: 'Whisky', query: 'Whisk' },
    { label: 'Vodka', query: 'Vodka' },
    { label: 'Gin', query: 'Gin' },
  ],
  BEVERAGES: [
    { label: 'Ouzo', query: 'Ouzo' },
    { label: 'Tsipouro', query: 'Tsipouro' },
    { label: 'Rum', query: 'Rum' },
    { label: 'Tequila', query: 'Tequila' },
    { label: 'Liqueur', query: 'Liqueur' },
    { label: 'Cognac', query: 'Κονιακ' },
    { label: 'Champagne & Sparkling', query: 'Σαμπανια' },
    { label: 'Mastiha', query: 'Μαστιχ' },
  ],
  BEERS: [
    { label: 'Lager', query: 'Lager' },
    { label: 'IPA', query: 'IPA' },
    { label: 'Pilsner', query: 'Pilsner' },
    { label: 'Ale', query: 'Ale' },
    { label: 'Stout', query: 'Stout' },
    { label: 'Wheat', query: 'Weiss' },
  ],
}
