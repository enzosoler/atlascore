/**
 * TACO — Brazilian Food Composition Table (4th edition, UNICAMP)
 * Values per 100 g of prepared food unless noted otherwise.
 * Source: NEPA/UNICAMP — https://www.unicamp.br/nepa/taco/
 *
 * Fields: id, name, category, kcal, protein (g), carbs (g), fat (g), aliases[]
 */

export const TACO = [
  // ─── Grains and grain products ───────────────────────────────────────────
  { id: 't001', name: 'White rice, cooked',        category: 'Grains', kcal: 128, protein: 2.5,  carbs: 28.1, fat: 0.2,  aliases: ['white rice cooked', 'white rice'] },
  { id: 't002', name: 'Brown rice, cooked',      category: 'Grains', kcal: 124, protein: 2.6,  carbs: 25.8, fat: 1.0,  aliases: ['brown rice cooked', 'brown rice'] },
  { id: 't003', name: 'Rotini pasta, cooked',   category: 'Grains', kcal: 136, protein: 4.4,  carbs: 27.7, fat: 0.9,  aliases: ['rotini pasta cooked', 'rotini pasta'] },
  { id: 't004', name: 'Sliced bread',                category: 'Grains', kcal: 265, protein: 8.5,  carbs: 49.4, fat: 3.5,  aliases: ['sliced bread'] },
  { id: 't005', name: 'French roll',                 category: 'Grains', kcal: 300, protein: 8.0,  carbs: 58.6, fat: 3.1,  aliases: ['french roll', 'pao frances', 'pão francês', 'french bread'] },
  { id: 't006', name: 'Rolled oats',               category: 'Grains', kcal: 394, protein: 13.9, carbs: 66.6, fat: 8.5,  aliases: ['rolled oats'] },
  { id: 't007', name: 'Wheat flour',            category: 'Grains', kcal: 360, protein: 9.8,  carbs: 75.1, fat: 1.4,  aliases: ['wheat flour'] },
  { id: 't008', name: 'Tapioca (cassava starch)',  category: 'Grains', kcal: 358, protein: 0.2,  carbs: 88.7, fat: 0.0,  aliases: ['tapioca cassava starch', 'tapioca'] },
  { id: 't009', name: 'Corn couscous, cooked',     category: 'Grains', kcal: 79,  protein: 1.9,  carbs: 17.5, fat: 0.4,  aliases: ['corn couscous cooked', 'corn couscous'] },
  { id: 't010', name: 'Cassava flour, raw',   category: 'Grains', kcal: 361, protein: 1.6,  carbs: 88.2, fat: 0.3,  aliases: ['cassava flour raw', 'cassava flour'] },
  { id: 't011', name: 'Traditional granola',        category: 'Grains', kcal: 394, protein: 9.8,  carbs: 66.8, fat: 10.8, aliases: ['traditional granola'] },
  { id: 't012', name: 'Water cracker',      category: 'Grains', kcal: 440, protein: 8.7,  carbs: 71.0, fat: 14.2, aliases: ['water cracker'] },
  { id: 't013', name: 'Cheese bread (pão de queijo)', category: 'Grains', kcal: 363, protein: 5.2, carbs: 42.1, fat: 18.5, aliases: ['pao de queijo', 'pão de queijo', 'cheese bread', 'pao de queijo frozen'] },

  // ─── Legumes ─────────────────────────────────────────────────────────────
  { id: 't020', name: 'Carioca beans, cooked',      category: 'Legumes', kcal: 76,  protein: 4.8,  carbs: 13.6, fat: 0.5, aliases: ['carioca beans cooked', 'carioca beans'] },
  { id: 't021', name: 'Black beans, cooked',        category: 'Legumes', kcal: 77,  protein: 4.5,  carbs: 14.0, fat: 0.5, aliases: ['black beans cooked', 'black beans'] },
  { id: 't022', name: 'White beans, cooked',       category: 'Legumes', kcal: 100, protein: 6.9,  carbs: 17.1, fat: 0.5, aliases: ['white beans cooked', 'white beans'] },
  { id: 't023', name: 'Chickpeas, cooked',        category: 'Legumes', kcal: 129, protein: 8.9,  carbs: 21.7, fat: 1.9, aliases: ['chickpeas cooked', 'chickpeas'] },
  { id: 't024', name: 'Lentils, cooked',            category: 'Legumes', kcal: 114, protein: 7.6,  carbs: 19.7, fat: 0.5, aliases: ['lentils cooked', 'lentils'] },
  { id: 't025', name: 'Peas, cooked',             category: 'Legumes', kcal: 92,  protein: 7.6,  carbs: 14.3, fat: 0.7, aliases: ['peas cooked', 'peas'] },
  { id: 't026', name: 'Soybeans, cooked',                category: 'Legumes', kcal: 141, protein: 14.4, carbs: 11.5, fat: 5.7, aliases: ['soybeans cooked', 'soybeans'] },

  // ─── Proteins ────────────────────────────────────────────────────────────
  { id: 't040', name: 'Chicken breast, skinless, roasted',     category: 'Proteins', kcal: 163, protein: 31.4, carbs: 0.0, fat: 3.2,  aliases: ['chicken breast skinless roasted', 'chicken breast'] },
  { id: 't041', name: 'Chicken breast, skinless, cooked',     category: 'Proteins', kcal: 159, protein: 32.0, carbs: 0.0, fat: 2.7,  aliases: ['chicken breast skinless cooked', 'chicken breast'] },
  { id: 't042', name: 'Chicken breast, skinless, grilled',   category: 'Proteins', kcal: 167, protein: 31.5, carbs: 0.0, fat: 3.8,  aliases: ['chicken breast skinless grilled', 'chicken breast'] },
  { id: 't043', name: 'Chicken drumstick, skinless, roasted',      category: 'Proteins', kcal: 181, protein: 25.9, carbs: 0.0, fat: 8.1,  aliases: ['chicken drumstick skinless roasted', 'chicken drumstick'] },
  { id: 't044', name: 'Chicken thigh, skinless, roasted', category: 'Proteins', kcal: 199, protein: 24.6, carbs: 0.0, fat: 10.6, aliases: ['chicken thigh skinless roasted', 'chicken thigh'] },
  { id: 't045', name: 'Lean beef round, roasted',       category: 'Proteins', kcal: 219, protein: 31.5, carbs: 0.0, fat: 9.9,  aliases: ['lean beef round roasted', 'lean beef round'] },
  { id: 't046', name: 'Top sirloin, grilled',     category: 'Proteins', kcal: 218, protein: 32.5, carbs: 0.0, fat: 9.3,  aliases: ['top sirloin grilled', 'top sirloin'] },
  { id: 't047', name: 'Beef chuck, cooked',          category: 'Proteins', kcal: 187, protein: 29.8, carbs: 0.0, fat: 6.9,  aliases: ['beef chuck cooked', 'beef chuck'] },
  { id: 't048', name: 'Strip steak, grilled',  category: 'Proteins', kcal: 282, protein: 28.7, carbs: 0.0, fat: 18.0, aliases: ['strip steak grilled', 'strip steak'] },
  { id: 't049', name: 'Filet mignon, grilled', category: 'Proteins', kcal: 219, protein: 34.5, carbs: 0.0, fat: 8.5,  aliases: ['filet mignon grilled', 'filet mignon'] },
  { id: 't050', name: 'Rump cap',               category: 'Proteins', kcal: 275, protein: 26.4, carbs: 0.0, fat: 18.2, aliases: ['rump cap'] },
  { id: 't051', name: 'Ground beef, sauteed',        category: 'Proteins', kcal: 215, protein: 28.3, carbs: 0.0, fat: 10.7, aliases: ['ground beef sauteed', 'ground beef'] },
  { id: 't052', name: 'Pork loin, roasted',          category: 'Proteins', kcal: 213, protein: 29.0, carbs: 0.0, fat: 10.3, aliases: ['pork loin roasted', 'pork loin'] },
  { id: 't053', name: 'Pork sausage, grilled',            category: 'Proteins', kcal: 295, protein: 19.6, carbs: 1.9, fat: 23.1, aliases: ['pork sausage grilled', 'pork sausage'] },
  { id: 't054', name: 'Tilapia fillet, roasted',               category: 'Proteins', kcal: 129, protein: 25.7, carbs: 0.0, fat: 2.8,  aliases: ['tilapia fillet roasted', 'tilapia fillet'] },
  { id: 't055', name: 'Salmon fillet, grilled',              category: 'Proteins', kcal: 243, protein: 28.0, carbs: 0.0, fat: 14.3, aliases: ['salmon fillet grilled', 'salmon fillet'] },
  { id: 't056', name: 'Canned tuna in water',              category: 'Proteins', kcal: 110, protein: 24.1, carbs: 0.0, fat: 0.7,  aliases: ['canned tuna in water'] },
  { id: 't057', name: 'Canned sardines in oil',          category: 'Proteins', kcal: 208, protein: 23.4, carbs: 0.0, fat: 12.3, aliases: ['canned sardines in oil'] },
  { id: 't058', name: 'Shrimp, cooked',                     category: 'Proteins', kcal: 99,  protein: 20.3, carbs: 0.9, fat: 1.3,  aliases: ['shrimp cooked', 'shrimp'] },
  { id: 't059', name: 'Cured beef, cooked',                  category: 'Proteins', kcal: 246, protein: 41.2, carbs: 0.0, fat: 8.5,  aliases: ['cured beef cooked', 'cured beef'] },
  { id: 't060', name: 'Sliced turkey breast',              category: 'Proteins', kcal: 109, protein: 21.9, carbs: 1.3, fat: 1.6,  aliases: ['sliced turkey breast'] },

  // ─── Eggs ────────────────────────────────────────────────────────────────
  { id: 't070', name: 'Whole egg, cooked', category: 'Eggs', kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5,  aliases: ['whole egg cooked', 'whole egg'] },
  { id: 't071', name: 'Whole egg, fried',  category: 'Eggs', kcal: 185, protein: 14.0, carbs: 0.0, fat: 14.1, aliases: ['whole egg fried', 'whole egg'] },
  { id: 't072', name: 'Whole egg, scrambled', category: 'Eggs', kcal: 162, protein: 11.7, carbs: 1.4, fat: 12.0, aliases: ['whole egg scrambled', 'whole egg'] },
  { id: 't073', name: 'Egg white, raw',     category: 'Eggs', kcal: 47,  protein: 10.9, carbs: 0.7, fat: 0.0,  aliases: ['egg white raw', 'egg white'] },
  { id: 't074', name: 'Egg yolk, raw',      category: 'Eggs', kcal: 344, protein: 16.1, carbs: 0.6, fat: 30.6, aliases: ['egg yolk raw', 'egg yolk'] },

  // ─── Dairy ───────────────────────────────────────────────────────────────
  { id: 't080', name: 'Whole milk',       category: 'Dairy', kcal: 61,  protein: 3.2,  carbs: 4.7, fat: 3.2,  aliases: ['whole milk'] },
  { id: 't081', name: 'Skim milk',      category: 'Dairy', kcal: 35,  protein: 3.5,  carbs: 4.9, fat: 0.1,  aliases: ['skim milk'] },
  { id: 't082', name: 'Semi-skim milk', category: 'Dairy', kcal: 47,  protein: 3.2,  carbs: 4.8, fat: 1.5,  aliases: ['semi skim milk'] },
  { id: 't083', name: 'Whole plain yogurt',     category: 'Dairy', kcal: 66,  protein: 3.5,  carbs: 4.9, fat: 3.3,  aliases: ['whole plain yogurt'] },
  { id: 't084', name: 'Skim plain yogurt',    category: 'Dairy', kcal: 43,  protein: 4.3,  carbs: 6.0, fat: 0.1,  aliases: ['skim plain yogurt'] },
  { id: 't085', name: 'Fresh Minas cheese',          category: 'Dairy', kcal: 264, protein: 17.4, carbs: 3.2, fat: 20.2, aliases: ['fresh minas cheese'] },
  { id: 't086', name: 'Mozzarella cheese',              category: 'Dairy', kcal: 303, protein: 21.4, carbs: 3.1, fat: 22.9, aliases: ['mozzarella cheese'] },
  { id: 't087', name: 'Brazilian cream cheese',             category: 'Dairy', kcal: 255, protein: 12.4, carbs: 2.7, fat: 21.8, aliases: ['brazilian cream cheese'] },
  { id: 't088', name: 'Salted butter',             category: 'Dairy', kcal: 726, protein: 0.5,  carbs: 0.0, fat: 81.4, aliases: ['salted butter'] },
  { id: 't089', name: 'Parmesan cheese',               category: 'Dairy', kcal: 393, protein: 35.7, carbs: 3.3, fat: 26.2, aliases: ['parmesan cheese'] },
  { id: 't090', name: 'Cream cheese',                  category: 'Dairy', kcal: 342, protein: 6.4,  carbs: 3.3, fat: 33.8, aliases: ['cream cheese'] },
  { id: 't091', name: 'Cultured yogurt',                      category: 'Dairy', kcal: 74,  protein: 4.8,  carbs: 6.2, fat: 3.0,  aliases: ['cultured yogurt'] },

  // ─── Fruits ──────────────────────────────────────────────────────────────
  { id: 't100', name: 'Silver banana',           category: 'Fruits', kcal: 98,  protein: 1.3, carbs: 26.0, fat: 0.1, aliases: ['silver banana'] },
  { id: 't101', name: 'Cavendish banana',          category: 'Fruits', kcal: 92,  protein: 1.4, carbs: 23.8, fat: 0.1, aliases: ['cavendish banana'] },
  { id: 't102', name: 'Pera orange',           category: 'Fruits', kcal: 47,  protein: 1.0, carbs: 11.5, fat: 0.1, aliases: ['pera orange'] },
  { id: 't103', name: 'Fuji apple',              category: 'Fruits', kcal: 56,  protein: 0.3, carbs: 15.2, fat: 0.2, aliases: ['fuji apple'] },
  { id: 't104', name: 'Avocado',                category: 'Fruits', kcal: 96,  protein: 1.2, carbs: 6.0,  fat: 8.4, aliases: ['avocado'] },
  { id: 't105', name: 'Papaya',           category: 'Fruits', kcal: 40,  protein: 0.5, carbs: 10.3, fat: 0.1, aliases: ['papaya'] },
  { id: 't106', name: 'Mango',            category: 'Fruits', kcal: 66,  protein: 0.6, carbs: 17.3, fat: 0.2, aliases: ['mango'] },
  { id: 't107', name: 'Watermelon',               category: 'Fruits', kcal: 33,  protein: 0.7, carbs: 8.1,  fat: 0.2, aliases: ['watermelon'] },
  { id: 't108', name: 'Red grapes',               category: 'Fruits', kcal: 68,  protein: 0.6, carbs: 17.3, fat: 0.3, aliases: ['red grapes'] },
  { id: 't109', name: 'Strawberries',                category: 'Fruits', kcal: 34,  protein: 0.9, carbs: 7.7,  fat: 0.3, aliases: ['strawberries'] },
  { id: 't110', name: 'Pineapple',                category: 'Fruits', kcal: 48,  protein: 0.9, carbs: 12.3, fat: 0.1, aliases: ['pineapple'] },
  { id: 't111', name: 'Melon',                  category: 'Fruits', kcal: 29,  protein: 0.7, carbs: 7.5,  fat: 0.1, aliases: ['melon'] },
  { id: 't112', name: 'Guava',                 category: 'Fruits', kcal: 54,  protein: 2.6, carbs: 12.0, fat: 0.4, aliases: ['guava'] },
  { id: 't113', name: 'Passion fruit pulp',        category: 'Fruits', kcal: 68,  protein: 2.0, carbs: 15.0, fat: 0.5, aliases: ['passion fruit pulp'] },
  { id: 't114', name: 'Peach',                category: 'Fruits', kcal: 40,  protein: 0.9, carbs: 9.5,  fat: 0.1, aliases: ['peach'] },
  { id: 't115', name: 'Pear',                   category: 'Fruits', kcal: 54,  protein: 0.4, carbs: 14.7, fat: 0.1, aliases: ['pear'] },
  { id: 't116', name: 'Kiwi',                   category: 'Fruits', kcal: 59,  protein: 1.1, carbs: 14.0, fat: 0.5, aliases: ['kiwi'] },
  { id: 't117', name: 'Cashew fruit pulp',            category: 'Fruits', kcal: 40,  protein: 1.0, carbs: 10.0, fat: 0.2, aliases: ['cashew fruit pulp'] },
  { id: 't118', name: 'Lime',                  category: 'Fruits', kcal: 38,  protein: 1.2, carbs: 11.2, fat: 0.1, aliases: ['lime'] },

  // ─── Vegetables ──────────────────────────────────────────────────────────
  { id: 't130', name: 'Potato, cooked',         category: 'Vegetables', kcal: 52,  protein: 1.2, carbs: 11.9, fat: 0.1, aliases: ['potato cooked', 'potato'] },
  { id: 't131', name: 'Sweet potato, cooked',    category: 'Vegetables', kcal: 77,  protein: 0.6, carbs: 18.4, fat: 0.1, aliases: ['sweet potato cooked', 'sweet potato'] },
  { id: 't132', name: 'Cassava, cooked',       category: 'Vegetables', kcal: 125, protein: 1.0, carbs: 30.1, fat: 0.3, aliases: ['cassava cooked', 'cassava'] },
  { id: 't133', name: 'Yam, cooked',         category: 'Vegetables', kcal: 53,  protein: 1.2, carbs: 12.4, fat: 0.1, aliases: ['yam cooked', 'yam'] },
  { id: 't134', name: 'Carrot, cooked',        category: 'Vegetables', kcal: 33,  protein: 0.6, carbs: 7.8,  fat: 0.2, aliases: ['carrot cooked', 'carrot'] },
  { id: 't135', name: 'Beetroot, cooked',      category: 'Vegetables', kcal: 39,  protein: 1.5, carbs: 8.7,  fat: 0.1, aliases: ['beetroot cooked', 'beetroot'] },
  { id: 't136', name: 'Lettuce, raw',           category: 'Vegetables', kcal: 11,  protein: 1.3, carbs: 1.7,  fat: 0.2, aliases: ['lettuce raw', 'lettuce'] },
  { id: 't137', name: 'Tomato, raw',            category: 'Vegetables', kcal: 15,  protein: 1.1, carbs: 3.1,  fat: 0.2, aliases: ['tomato raw', 'tomato'] },
  { id: 't138', name: 'Broccoli, cooked',       category: 'Vegetables', kcal: 34,  protein: 3.4, carbs: 3.8,  fat: 0.6, aliases: ['broccoli cooked', 'broccoli'] },
  { id: 't139', name: 'Zucchini, cooked',      category: 'Vegetables', kcal: 19,  protein: 1.1, carbs: 4.1,  fat: 0.1, aliases: ['zucchini cooked', 'zucchini'] },
  { id: 't140', name: 'Collard greens, sauteed',        category: 'Vegetables', kcal: 28,  protein: 2.5, carbs: 3.4,  fat: 0.6, aliases: ['collard greens sauteed', 'collard greens'] },
  { id: 't141', name: 'Spinach, cooked',      category: 'Vegetables', kcal: 26,  protein: 2.9, carbs: 4.0,  fat: 0.4, aliases: ['spinach cooked', 'spinach'] },
  { id: 't142', name: 'Cauliflower, cooked',     category: 'Vegetables', kcal: 26,  protein: 2.3, carbs: 4.3,  fat: 0.3, aliases: ['cauliflower cooked', 'cauliflower'] },
  { id: 't143', name: 'Onion, raw',           category: 'Vegetables', kcal: 34,  protein: 1.1, carbs: 8.0,  fat: 0.1, aliases: ['onion raw', 'onion'] },
  { id: 't144', name: 'Cucumber, raw',            category: 'Vegetables', kcal: 10,  protein: 0.7, carbs: 2.0,  fat: 0.1, aliases: ['cucumber raw', 'cucumber'] },
  { id: 't145', name: 'Okra, cooked',         category: 'Vegetables', kcal: 25,  protein: 1.8, carbs: 5.2,  fat: 0.2, aliases: ['okra cooked', 'okra'] },
  { id: 't146', name: 'Corn, cooked',          category: 'Vegetables', kcal: 86,  protein: 2.8, carbs: 19.0, fat: 1.0, aliases: ['corn cooked', 'corn'] },
  { id: 't147', name: 'Eggplant, cooked',      category: 'Vegetables', kcal: 21,  protein: 0.8, carbs: 5.1,  fat: 0.1, aliases: ['eggplant cooked', 'eggplant'] },
  { id: 't148', name: 'Chayote, cooked',         category: 'Vegetables', kcal: 18,  protein: 0.7, carbs: 4.3,  fat: 0.1, aliases: ['chayote cooked', 'chayote'] },

  // ─── Fats and oils ───────────────────────────────────────────────────────
  { id: 't160', name: 'Olive oil',        category: 'Fats', kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, aliases: ['olive oil'] },
  { id: 't161', name: 'Soybean oil',           category: 'Fats', kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, aliases: ['soybean oil'] },
  { id: 't162', name: 'Coconut oil',           category: 'Fats', kcal: 892, protein: 0.0, carbs: 0.0, fat: 99.1, aliases: ['coconut oil'] },

  // ─── Other foods ─────────────────────────────────────────────────────────
  { id: 't170', name: 'Natural peanut butter', category: 'Other', kcal: 602, protein: 25.3, carbs: 17.3, fat: 51.1, aliases: ['natural peanut butter'] },
  { id: 't171', name: 'Roasted peanuts',            category: 'Other', kcal: 567, protein: 26.2, carbs: 18.0, fat: 46.6, aliases: ['roasted peanuts'] },
  { id: 't172', name: 'Honey',                          category: 'Other', kcal: 309, protein: 0.3,  carbs: 84.0, fat: 0.0,  aliases: ['honey'] },
  { id: 't173', name: 'Refined sugar',              category: 'Other', kcal: 387, protein: 0.0,  carbs: 99.6, fat: 0.0,  aliases: ['refined sugar'] },
  { id: 't174', name: 'Whey protein', category: 'Supplements', kcal: 384, protein: 79.0, carbs: 7.0, fat: 4.0, aliases: ['whey protein'] },
  { id: 't175', name: 'Brazil nuts',             category: 'Other', kcal: 656, protein: 14.3, carbs: 12.3, fat: 63.5, aliases: ['brazil nuts'] },
  { id: 't176', name: 'Cashews',             category: 'Other', kcal: 570, protein: 17.0, carbs: 27.8, fat: 45.7, aliases: ['cashews'] },
  { id: 't177', name: 'Walnuts',                        category: 'Other', kcal: 620, protein: 14.3, carbs: 13.7, fat: 58.7, aliases: ['walnuts'] },

  // ─── Drinks ──────────────────────────────────────────────────────────────
  { id: 't190', name: 'Fresh orange juice',  category: 'Drinks', kcal: 47, protein: 0.7, carbs: 10.5, fat: 0.2, aliases: ['fresh orange juice'] },
  { id: 't191', name: 'Fresh acerola juice',  category: 'Drinks', kcal: 37, protein: 0.5, carbs: 9.0,  fat: 0.3, aliases: ['fresh acerola juice'] },
  { id: 't192', name: 'Brewed coffee',             category: 'Drinks', kcal: 2,  protein: 0.3, carbs: 0.0,  fat: 0.0, aliases: ['brewed coffee'] },
  { id: 't193', name: 'Brewed black tea',        category: 'Drinks', kcal: 1,  protein: 0.1, carbs: 0.2,  fat: 0.0, aliases: ['brewed black tea'] },

  // ─── Prepared meals ──────────────────────────────────────────────────────
  { id: 't200', name: 'Brazilian black bean stew',                  category: 'Prepared Meals', kcal: 107, protein: 7.5, carbs: 9.4,  fat: 4.3, aliases: ['brazilian black bean stew'] },
  { id: 't201', name: 'Rice and beans',          category: 'Prepared Meals', kcal: 92,  protein: 4.3, carbs: 18.2, fat: 0.9, aliases: ['rice and beans'] },
  { id: 't202', name: 'Banana milk smoothie', category: 'Prepared Meals', kcal: 75, protein: 2.7, carbs: 15.2, fat: 0.9, aliases: ['banana milk smoothie'] },
  { id: 't203', name: 'Chicken stir-fry',             category: 'Prepared Meals', kcal: 121, protein: 14.5, carbs: 6.2, fat: 4.1, aliases: ['chicken stir fry'] },
  { id: 't204', name: 'Plain omelet',           category: 'Prepared Meals', kcal: 155, protein: 11.0, carbs: 1.5, fat: 11.8, aliases: ['plain omelet'] },
];

export default TACO;
