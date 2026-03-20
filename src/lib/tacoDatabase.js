/**
 * TACO — Tabela Brasileira de Composição de Alimentos (4ª edição, UNICAMP)
 * Valores por 100g do alimento preparado, salvo indicação contrária.
 * Fonte: NEPA/UNICAMP — https://www.unicamp.br/nepa/taco/
 *
 * Campos: id, name, category, kcal, protein (g), carbs (g), fat (g), aliases[]
 */

export const TACO = [
  // ─── Cereais e derivados ─────────────────────────────────────────────────
  { id: 't001', name: 'Arroz branco, cozido',        category: 'Cereais', kcal: 128, protein: 2.5,  carbs: 28.1, fat: 0.2,  aliases: ['arroz', 'arroz branco'] },
  { id: 't002', name: 'Arroz integral, cozido',      category: 'Cereais', kcal: 124, protein: 2.6,  carbs: 25.8, fat: 1.0,  aliases: ['arroz integral'] },
  { id: 't003', name: 'Macarrão parafuso, cozido',   category: 'Cereais', kcal: 136, protein: 4.4,  carbs: 27.7, fat: 0.9,  aliases: ['macarrao', 'macarrão', 'pasta', 'espaguete', 'parafuso'] },
  { id: 't004', name: 'Pão de forma',                category: 'Cereais', kcal: 265, protein: 8.5,  carbs: 49.4, fat: 3.5,  aliases: ['pao de forma', 'pão de forma', 'pão de sanduiche', 'pao sanduiche'] },
  { id: 't005', name: 'Pão francês',                 category: 'Cereais', kcal: 300, protein: 8.0,  carbs: 58.6, fat: 3.1,  aliases: ['pao frances', 'pão frances', 'cacetinho', 'bisnaguinha'] },
  { id: 't006', name: 'Aveia, flocos',               category: 'Cereais', kcal: 394, protein: 13.9, carbs: 66.6, fat: 8.5,  aliases: ['aveia', 'flocos de aveia', 'granola aveia'] },
  { id: 't007', name: 'Farinha de trigo',            category: 'Cereais', kcal: 360, protein: 9.8,  carbs: 75.1, fat: 1.4,  aliases: ['farinha trigo', 'farinha de trigo'] },
  { id: 't008', name: 'Tapioca (goma de mandioca)',  category: 'Cereais', kcal: 358, protein: 0.2,  carbs: 88.7, fat: 0.0,  aliases: ['tapioca', 'goma', 'goma de mandioca'] },
  { id: 't009', name: 'Cuscuz de milho, cozido',     category: 'Cereais', kcal: 79,  protein: 1.9,  carbs: 17.5, fat: 0.4,  aliases: ['cuscuz', 'cuscus', 'cuscuz milho'] },
  { id: 't010', name: 'Farinha de mandioca, crua',   category: 'Cereais', kcal: 361, protein: 1.6,  carbs: 88.2, fat: 0.3,  aliases: ['farinha de mandioca', 'farinha mandioca', 'farinha'] },
  { id: 't011', name: 'Granola, tradicional',        category: 'Cereais', kcal: 394, protein: 9.8,  carbs: 66.8, fat: 10.8, aliases: ['granola'] },
  { id: 't012', name: 'Biscoito de água e sal',      category: 'Cereais', kcal: 440, protein: 8.7,  carbs: 71.0, fat: 14.2, aliases: ['biscoito agua sal', 'bolacha agua sal', 'biscoito'] },

  // ─── Leguminosas ─────────────────────────────────────────────────────────
  { id: 't020', name: 'Feijão carioca, cozido',      category: 'Leguminosas', kcal: 76,  protein: 4.8,  carbs: 13.6, fat: 0.5, aliases: ['feijao', 'feijão', 'feijao carioca', 'feijão carioca', 'feijão roxo'] },
  { id: 't021', name: 'Feijão preto, cozido',        category: 'Leguminosas', kcal: 77,  protein: 4.5,  carbs: 14.0, fat: 0.5, aliases: ['feijao preto', 'feijão preto'] },
  { id: 't022', name: 'Feijão branco, cozido',       category: 'Leguminosas', kcal: 100, protein: 6.9,  carbs: 17.1, fat: 0.5, aliases: ['feijao branco', 'feijão branco'] },
  { id: 't023', name: 'Grão-de-bico, cozido',        category: 'Leguminosas', kcal: 129, protein: 8.9,  carbs: 21.7, fat: 1.9, aliases: ['grao de bico', 'grão de bico', 'grão-de-bico', 'chickpea'] },
  { id: 't024', name: 'Lentilha, cozida',            category: 'Leguminosas', kcal: 114, protein: 7.6,  carbs: 19.7, fat: 0.5, aliases: ['lentilha'] },
  { id: 't025', name: 'Ervilha, cozida',             category: 'Leguminosas', kcal: 92,  protein: 7.6,  carbs: 14.3, fat: 0.7, aliases: ['ervilha', 'ervilha cozida'] },
  { id: 't026', name: 'Soja, cozida',                category: 'Leguminosas', kcal: 141, protein: 14.4, carbs: 11.5, fat: 5.7, aliases: ['soja', 'soja cozida'] },

  // ─── Carnes e aves ───────────────────────────────────────────────────────
  { id: 't040', name: 'Frango, peito, sem pele, assado',     category: 'Carnes', kcal: 163, protein: 31.4, carbs: 0.0, fat: 3.2,  aliases: ['frango peito', 'peito de frango', 'frango assado', 'peito frango assado', 'frango'] },
  { id: 't041', name: 'Frango, peito, sem pele, cozido',     category: 'Carnes', kcal: 159, protein: 32.0, carbs: 0.0, fat: 2.7,  aliases: ['frango peito cozido', 'peito de frango cozido'] },
  { id: 't042', name: 'Frango, peito, sem pele, grelhado',   category: 'Carnes', kcal: 167, protein: 31.5, carbs: 0.0, fat: 3.8,  aliases: ['frango grelhado', 'peito de frango grelhado'] },
  { id: 't043', name: 'Frango, coxa, sem pele, assada',      category: 'Carnes', kcal: 181, protein: 25.9, carbs: 0.0, fat: 8.1,  aliases: ['coxa de frango', 'frango coxa', 'coxa frango'] },
  { id: 't044', name: 'Frango, sobrecoxa, sem pele, assada', category: 'Carnes', kcal: 199, protein: 24.6, carbs: 0.0, fat: 10.6, aliases: ['sobrecoxa', 'sobrecoxa de frango', 'frango sobrecoxa'] },
  { id: 't045', name: 'Carne bovina, patinho, assado',       category: 'Carnes', kcal: 219, protein: 31.5, carbs: 0.0, fat: 9.9,  aliases: ['patinho', 'carne patinho', 'carne bovina patinho'] },
  { id: 't046', name: 'Carne bovina, alcatra, grelhada',     category: 'Carnes', kcal: 218, protein: 32.5, carbs: 0.0, fat: 9.3,  aliases: ['alcatra', 'carne alcatra'] },
  { id: 't047', name: 'Carne bovina, acém, cozido',          category: 'Carnes', kcal: 187, protein: 29.8, carbs: 0.0, fat: 6.9,  aliases: ['acem', 'açém', 'carne acem', 'carne dura'] },
  { id: 't048', name: 'Carne bovina, contrafilé, grelhado',  category: 'Carnes', kcal: 282, protein: 28.7, carbs: 0.0, fat: 18.0, aliases: ['contrafilee', 'contrafilé', 'carne contrafile'] },
  { id: 't049', name: 'Carne bovina, filé mignon, grelhado', category: 'Carnes', kcal: 219, protein: 34.5, carbs: 0.0, fat: 8.5,  aliases: ['file mignon', 'filé mignon', 'file', 'mignon'] },
  { id: 't050', name: 'Carne bovina, picanha',               category: 'Carnes', kcal: 275, protein: 26.4, carbs: 0.0, fat: 18.2, aliases: ['picanha', 'picanha bovina'] },
  { id: 't051', name: 'Carne bovina moída, refogada',        category: 'Carnes', kcal: 215, protein: 28.3, carbs: 0.0, fat: 10.7, aliases: ['carne moida', 'carne moída', 'carne moída refogada', 'bife moído'] },
  { id: 't052', name: 'Carne suína, lombo, assado',          category: 'Carnes', kcal: 213, protein: 29.0, carbs: 0.0, fat: 10.3, aliases: ['lombo suino', 'lombo de porco', 'lombo suíno', 'carne suina'] },
  { id: 't053', name: 'Linguiça suína, grelhada',            category: 'Carnes', kcal: 295, protein: 19.6, carbs: 1.9, fat: 23.1, aliases: ['linguiça', 'linguica', 'linguica suina', 'salsicha linguica'] },
  { id: 't054', name: 'Tilápia, filé, assado',               category: 'Carnes', kcal: 129, protein: 25.7, carbs: 0.0, fat: 2.8,  aliases: ['tilapia', 'tilápia', 'peixe tilapia', 'file tilapia', 'filé tilápia'] },
  { id: 't055', name: 'Salmão, filé, grelhado',              category: 'Carnes', kcal: 243, protein: 28.0, carbs: 0.0, fat: 14.3, aliases: ['salmao', 'salmão', 'salmão grelhado', 'file de salmao'] },
  { id: 't056', name: 'Atum em água, enlatado',              category: 'Carnes', kcal: 110, protein: 24.1, carbs: 0.0, fat: 0.7,  aliases: ['atum', 'atum em agua', 'atum enlatado', 'atum light'] },
  { id: 't057', name: 'Sardinha, enlatada em óleo',          category: 'Carnes', kcal: 208, protein: 23.4, carbs: 0.0, fat: 12.3, aliases: ['sardinha', 'sardinha enlatada', 'sardinha conserva'] },
  { id: 't058', name: 'Camarão, cozido',                     category: 'Carnes', kcal: 99,  protein: 20.3, carbs: 0.9, fat: 1.3,  aliases: ['camarao', 'camarão', 'camarão cozido'] },
  { id: 't059', name: 'Carne seca, cozida',                  category: 'Carnes', kcal: 246, protein: 41.2, carbs: 0.0, fat: 8.5,  aliases: ['carne seca', 'carne de sol', 'jabá', 'jaba', 'charque'] },
  { id: 't060', name: 'Peito de peru, fatiado',              category: 'Carnes', kcal: 109, protein: 21.9, carbs: 1.3, fat: 1.6,  aliases: ['peru', 'peito de peru', 'presunto peru', 'peito peru'] },

  // ─── Ovos ────────────────────────────────────────────────────────────────
  { id: 't070', name: 'Ovo de galinha, inteiro, cozido', category: 'Ovos', kcal: 146, protein: 13.3, carbs: 0.6, fat: 9.5,  aliases: ['ovo cozido', 'ovo', 'ovo de galinha', 'ovo duro'] },
  { id: 't071', name: 'Ovo de galinha, inteiro, frito',  category: 'Ovos', kcal: 185, protein: 14.0, carbs: 0.0, fat: 14.1, aliases: ['ovo frito', 'ovo na frigideira'] },
  { id: 't072', name: 'Ovo de galinha, inteiro, mexido', category: 'Ovos', kcal: 162, protein: 11.7, carbs: 1.4, fat: 12.0, aliases: ['ovo mexido', 'ovos mexidos'] },
  { id: 't073', name: 'Ovo de galinha, clara, crua',     category: 'Ovos', kcal: 47,  protein: 10.9, carbs: 0.7, fat: 0.0,  aliases: ['clara de ovo', 'clara ovo', 'clara'] },
  { id: 't074', name: 'Ovo de galinha, gema, crua',      category: 'Ovos', kcal: 344, protein: 16.1, carbs: 0.6, fat: 30.6, aliases: ['gema de ovo', 'gema ovo', 'gema'] },

  // ─── Leite e derivados ───────────────────────────────────────────────────
  { id: 't080', name: 'Leite de vaca, integral',       category: 'Laticínios', kcal: 61,  protein: 3.2,  carbs: 4.7, fat: 3.2,  aliases: ['leite', 'leite integral', 'leite de vaca', 'leite vaca'] },
  { id: 't081', name: 'Leite de vaca, desnatado',      category: 'Laticínios', kcal: 35,  protein: 3.5,  carbs: 4.9, fat: 0.1,  aliases: ['leite desnatado', 'leite zero', 'leite magro'] },
  { id: 't082', name: 'Leite de vaca, semi-desnatado', category: 'Laticínios', kcal: 47,  protein: 3.2,  carbs: 4.8, fat: 1.5,  aliases: ['leite semi desnatado', 'leite semi-desnatado'] },
  { id: 't083', name: 'Iogurte natural, integral',     category: 'Laticínios', kcal: 66,  protein: 3.5,  carbs: 4.9, fat: 3.3,  aliases: ['iogurte', 'iogurte natural', 'iogurte integral', 'yogurt'] },
  { id: 't084', name: 'Iogurte natural, desnatado',    category: 'Laticínios', kcal: 43,  protein: 4.3,  carbs: 6.0, fat: 0.1,  aliases: ['iogurte desnatado', 'iogurte light', 'iogurte zero'] },
  { id: 't085', name: 'Queijo minas frescal',          category: 'Laticínios', kcal: 264, protein: 17.4, carbs: 3.2, fat: 20.2, aliases: ['queijo minas', 'minas frescal', 'queijo fresco'] },
  { id: 't086', name: 'Queijo mussarela',              category: 'Laticínios', kcal: 303, protein: 21.4, carbs: 3.1, fat: 22.9, aliases: ['mussarela', 'muçarela', 'muzarela', 'queijo mussarela'] },
  { id: 't087', name: 'Requeijão cremoso',             category: 'Laticínios', kcal: 255, protein: 12.4, carbs: 2.7, fat: 21.8, aliases: ['requeijao', 'requeijão', 'requeijao cremoso'] },
  { id: 't088', name: 'Manteiga, com sal',             category: 'Laticínios', kcal: 726, protein: 0.5,  carbs: 0.0, fat: 81.4, aliases: ['manteiga', 'manteiga com sal', 'manteiga sem sal'] },
  { id: 't089', name: 'Queijo parmesão',               category: 'Laticínios', kcal: 393, protein: 35.7, carbs: 3.3, fat: 26.2, aliases: ['parmesao', 'parmesão', 'queijo parmesao', 'parmigiano'] },
  { id: 't090', name: 'Cream cheese',                  category: 'Laticínios', kcal: 342, protein: 6.4,  carbs: 3.3, fat: 33.8, aliases: ['cream cheese', 'creme cheese', 'cheese cream'] },
  { id: 't091', name: 'Coalhada',                      category: 'Laticínios', kcal: 74,  protein: 4.8,  carbs: 6.2, fat: 3.0,  aliases: ['coalhada', 'coalhada seca'] },

  // ─── Frutas ──────────────────────────────────────────────────────────────
  { id: 't100', name: 'Banana prata',           category: 'Frutas', kcal: 98,  protein: 1.3, carbs: 26.0, fat: 0.1, aliases: ['banana', 'banana prata', 'banana madura'] },
  { id: 't101', name: 'Banana nanica',          category: 'Frutas', kcal: 92,  protein: 1.4, carbs: 23.8, fat: 0.1, aliases: ['banana nanica', 'banana d agua', 'banana dagua'] },
  { id: 't102', name: 'Laranja pêra',           category: 'Frutas', kcal: 47,  protein: 1.0, carbs: 11.5, fat: 0.1, aliases: ['laranja', 'laranja pera', 'laranja comum'] },
  { id: 't103', name: 'Maçã fuji',              category: 'Frutas', kcal: 56,  protein: 0.3, carbs: 15.2, fat: 0.2, aliases: ['maça', 'maçã', 'maca', 'maca fuji', 'apple'] },
  { id: 't104', name: 'Abacate',                category: 'Frutas', kcal: 96,  protein: 1.2, carbs: 6.0,  fat: 8.4, aliases: ['abacate', 'avocado'] },
  { id: 't105', name: 'Mamão papaia',           category: 'Frutas', kcal: 40,  protein: 0.5, carbs: 10.3, fat: 0.1, aliases: ['mamao', 'mamão', 'mamao papaia', 'papaia', 'papaya'] },
  { id: 't106', name: 'Manga comum',            category: 'Frutas', kcal: 66,  protein: 0.6, carbs: 17.3, fat: 0.2, aliases: ['manga', 'manga comum', 'mango'] },
  { id: 't107', name: 'Melancia',               category: 'Frutas', kcal: 33,  protein: 0.7, carbs: 8.1,  fat: 0.2, aliases: ['melancia', 'watermelon'] },
  { id: 't108', name: 'Uva roxa',               category: 'Frutas', kcal: 68,  protein: 0.6, carbs: 17.3, fat: 0.3, aliases: ['uva', 'uva roxa', 'uva verde', 'grape'] },
  { id: 't109', name: 'Morango',                category: 'Frutas', kcal: 34,  protein: 0.9, carbs: 7.7,  fat: 0.3, aliases: ['morango', 'strawberry'] },
  { id: 't110', name: 'Abacaxi',                category: 'Frutas', kcal: 48,  protein: 0.9, carbs: 12.3, fat: 0.1, aliases: ['abacaxi', 'ananas', 'pineapple'] },
  { id: 't111', name: 'Melão',                  category: 'Frutas', kcal: 29,  protein: 0.7, carbs: 7.5,  fat: 0.1, aliases: ['melao', 'melão'] },
  { id: 't112', name: 'Goiaba',                 category: 'Frutas', kcal: 54,  protein: 2.6, carbs: 12.0, fat: 0.4, aliases: ['goiaba', 'guava'] },
  { id: 't113', name: 'Maracujá, polpa',        category: 'Frutas', kcal: 68,  protein: 2.0, carbs: 15.0, fat: 0.5, aliases: ['maracuja', 'maracujá', 'passion fruit'] },
  { id: 't114', name: 'Pêssego',                category: 'Frutas', kcal: 40,  protein: 0.9, carbs: 9.5,  fat: 0.1, aliases: ['pessego', 'pêssego', 'peach'] },
  { id: 't115', name: 'Pera',                   category: 'Frutas', kcal: 54,  protein: 0.4, carbs: 14.7, fat: 0.1, aliases: ['pera', 'pear'] },
  { id: 't116', name: 'Kiwi',                   category: 'Frutas', kcal: 59,  protein: 1.1, carbs: 14.0, fat: 0.5, aliases: ['kiwi'] },
  { id: 't117', name: 'Caju, polpa',            category: 'Frutas', kcal: 40,  protein: 1.0, carbs: 10.0, fat: 0.2, aliases: ['caju'] },
  { id: 't118', name: 'Limão',                  category: 'Frutas', kcal: 38,  protein: 1.2, carbs: 11.2, fat: 0.1, aliases: ['limao', 'limão', 'lemon', 'limao tahiti'] },

  // ─── Verduras e legumes ─────────────────────────────────────────────────
  { id: 't130', name: 'Batata, cozida',         category: 'Verduras', kcal: 52,  protein: 1.2, carbs: 11.9, fat: 0.1, aliases: ['batata', 'batata inglesa', 'batata cozida', 'batata comum'] },
  { id: 't131', name: 'Batata-doce, cozida',    category: 'Verduras', kcal: 77,  protein: 0.6, carbs: 18.4, fat: 0.1, aliases: ['batata doce', 'batata-doce', 'sweet potato'] },
  { id: 't132', name: 'Mandioca, cozida',       category: 'Verduras', kcal: 125, protein: 1.0, carbs: 30.1, fat: 0.3, aliases: ['mandioca', 'aipim', 'macaxeira', 'aipim cozido'] },
  { id: 't133', name: 'Inhame, cozido',         category: 'Verduras', kcal: 53,  protein: 1.2, carbs: 12.4, fat: 0.1, aliases: ['inhame', 'inhame cozido', 'cará'] },
  { id: 't134', name: 'Cenoura, cozida',        category: 'Verduras', kcal: 33,  protein: 0.6, carbs: 7.8,  fat: 0.2, aliases: ['cenoura', 'cenoura cozida', 'carrot'] },
  { id: 't135', name: 'Beterraba, cozida',      category: 'Verduras', kcal: 39,  protein: 1.5, carbs: 8.7,  fat: 0.1, aliases: ['beterraba', 'beterraba cozida', 'beet'] },
  { id: 't136', name: 'Alface, crua',           category: 'Verduras', kcal: 11,  protein: 1.3, carbs: 1.7,  fat: 0.2, aliases: ['alface', 'alface crua', 'lettuce'] },
  { id: 't137', name: 'Tomate, cru',            category: 'Verduras', kcal: 15,  protein: 1.1, carbs: 3.1,  fat: 0.2, aliases: ['tomate', 'tomato'] },
  { id: 't138', name: 'Brócolis, cozido',       category: 'Verduras', kcal: 34,  protein: 3.4, carbs: 3.8,  fat: 0.6, aliases: ['brocolis', 'brócolis', 'broccoli'] },
  { id: 't139', name: 'Abobrinha, cozida',      category: 'Verduras', kcal: 19,  protein: 1.1, carbs: 4.1,  fat: 0.1, aliases: ['abobrinha', 'abobrinha cozida', 'zucchini'] },
  { id: 't140', name: 'Couve, refogada',        category: 'Verduras', kcal: 28,  protein: 2.5, carbs: 3.4,  fat: 0.6, aliases: ['couve', 'couve refogada', 'couve manteiga'] },
  { id: 't141', name: 'Espinafre, cozido',      category: 'Verduras', kcal: 26,  protein: 2.9, carbs: 4.0,  fat: 0.4, aliases: ['espinafre', 'espinafre cozido', 'spinach'] },
  { id: 't142', name: 'Couve-flor, cozida',     category: 'Verduras', kcal: 26,  protein: 2.3, carbs: 4.3,  fat: 0.3, aliases: ['couve-flor', 'couve flor', 'cauliflower'] },
  { id: 't143', name: 'Cebola, crua',           category: 'Verduras', kcal: 34,  protein: 1.1, carbs: 8.0,  fat: 0.1, aliases: ['cebola', 'onion'] },
  { id: 't144', name: 'Pepino, cru',            category: 'Verduras', kcal: 10,  protein: 0.7, carbs: 2.0,  fat: 0.1, aliases: ['pepino', 'cucumber'] },
  { id: 't145', name: 'Quiabo, cozido',         category: 'Verduras', kcal: 25,  protein: 1.8, carbs: 5.2,  fat: 0.2, aliases: ['quiabo', 'quiabo cozido', 'okra'] },
  { id: 't146', name: 'Milho, cozido',          category: 'Verduras', kcal: 86,  protein: 2.8, carbs: 19.0, fat: 1.0, aliases: ['milho', 'milho cozido', 'espiga de milho', 'corn'] },
  { id: 't147', name: 'Berinjela, cozida',      category: 'Verduras', kcal: 21,  protein: 0.8, carbs: 5.1,  fat: 0.1, aliases: ['berinjela', 'eggplant'] },
  { id: 't148', name: 'Chuchu, cozido',         category: 'Verduras', kcal: 18,  protein: 0.7, carbs: 4.3,  fat: 0.1, aliases: ['chuchu', 'chuchu cozido'] },

  // ─── Gorduras e óleos ────────────────────────────────────────────────────
  { id: 't160', name: 'Azeite de oliva',        category: 'Gorduras', kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, aliases: ['azeite', 'azeite de oliva', 'olive oil'] },
  { id: 't161', name: 'Óleo de soja',           category: 'Gorduras', kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, aliases: ['oleo de soja', 'óleo de soja', 'oleo vegetal', 'óleo'] },
  { id: 't162', name: 'Óleo de coco',           category: 'Gorduras', kcal: 892, protein: 0.0, carbs: 0.0, fat: 99.1, aliases: ['oleo de coco', 'óleo de coco', 'coconut oil'] },

  // ─── Outros ──────────────────────────────────────────────────────────────
  { id: 't170', name: 'Pasta de amendoim, integral', category: 'Outros', kcal: 602, protein: 25.3, carbs: 17.3, fat: 51.1, aliases: ['pasta de amendoim', 'amendoim pasta', 'peanut butter', 'creme de amendoim'] },
  { id: 't171', name: 'Amendoim, torrado',            category: 'Outros', kcal: 567, protein: 26.2, carbs: 18.0, fat: 46.6, aliases: ['amendoim', 'amendoim torrado', 'peanut'] },
  { id: 't172', name: 'Mel',                          category: 'Outros', kcal: 309, protein: 0.3,  carbs: 84.0, fat: 0.0,  aliases: ['mel', 'honey'] },
  { id: 't173', name: 'Açúcar refinado',              category: 'Outros', kcal: 387, protein: 0.0,  carbs: 99.6, fat: 0.0,  aliases: ['açúcar', 'acucar', 'açucar', 'sugar'] },
  { id: 't174', name: 'Proteína de soro de leite (whey)', category: 'Suplementos', kcal: 384, protein: 79.0, carbs: 7.0, fat: 4.0, aliases: ['whey', 'whey protein', 'proteina whey', 'suplemento proteico'] },
  { id: 't175', name: 'Castanha-do-pará',             category: 'Outros', kcal: 656, protein: 14.3, carbs: 12.3, fat: 63.5, aliases: ['castanha do para', 'castanha-do-pará', 'castanha do brasil', 'brazil nut'] },
  { id: 't176', name: 'Castanha de caju',             category: 'Outros', kcal: 570, protein: 17.0, carbs: 27.8, fat: 45.7, aliases: ['castanha de caju', 'caju torrado', 'cashew'] },
  { id: 't177', name: 'Nozes',                        category: 'Outros', kcal: 620, protein: 14.3, carbs: 13.7, fat: 58.7, aliases: ['noz', 'nozes', 'walnut'] },

  // ─── Bebidas ─────────────────────────────────────────────────────────────
  { id: 't190', name: 'Suco de laranja, natural',  category: 'Bebidas', kcal: 47, protein: 0.7, carbs: 10.5, fat: 0.2, aliases: ['suco de laranja', 'suco laranja', 'orange juice'] },
  { id: 't191', name: 'Suco de acerola, natural',  category: 'Bebidas', kcal: 37, protein: 0.5, carbs: 9.0,  fat: 0.3, aliases: ['suco de acerola', 'suco acerola', 'acerola'] },
  { id: 't192', name: 'Café, infusão',             category: 'Bebidas', kcal: 2,  protein: 0.3, carbs: 0.0,  fat: 0.0, aliases: ['cafe', 'café', 'coffee', 'cafe preto'] },
  { id: 't193', name: 'Chá preto, infusão',        category: 'Bebidas', kcal: 1,  protein: 0.1, carbs: 0.2,  fat: 0.0, aliases: ['cha', 'chá', 'cha preto', 'tea', 'chá preto'] },

  // ─── Preparações típicas ─────────────────────────────────────────────────
  { id: 't200', name: 'Feijoada',                  category: 'Preparados', kcal: 107, protein: 7.5, carbs: 9.4,  fat: 4.3, aliases: ['feijoada'] },
  { id: 't201', name: 'Arroz com feijão',          category: 'Preparados', kcal: 92,  protein: 4.3, carbs: 18.2, fat: 0.9, aliases: ['arroz com feijao', 'arroz e feijão', 'arroz feijao'] },
  { id: 't202', name: 'Vitamina de banana com leite', category: 'Preparados', kcal: 75, protein: 2.7, carbs: 15.2, fat: 0.9, aliases: ['vitamina de banana', 'vitamina banana', 'shake banana leite'] },
  { id: 't203', name: 'Frango xadrez',             category: 'Preparados', kcal: 121, protein: 14.5, carbs: 6.2, fat: 4.1, aliases: ['frango xadrez', 'frango com legumes'] },
  { id: 't204', name: 'Omelete simples',           category: 'Preparados', kcal: 155, protein: 11.0, carbs: 1.5, fat: 11.8, aliases: ['omelete', 'omelette', 'omelete simples'] },
];

export default TACO;
