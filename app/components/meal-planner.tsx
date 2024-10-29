'use client';

// ------------ IMPORTS ------------
import React, { useState, useRef } from 'react';
import { Sun, Moon, ShoppingBag, RefreshCw, Search, Plus, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ------------ TYPES ------------
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  tags: string[];
  instructions?: string[];
}

interface MealComponentProps {
  day: string;
  period: 'midi' | 'soir';
  meal: Recipe | null;
  setWeeklyPlan: React.Dispatch<React.SetStateAction<WeeklyPlan>>;
  recipes: Recipe[];
}

interface WeeklyPlan {
  [key: string]: {
    midi: Recipe | null;
    soir: Recipe | null;
  };
}

type FormData = Omit<Recipe, 'id'>;

// ------------ CATÉGORIES ------------
const CATEGORIES = {
  LEGUMES: "Légumes",
  VIANDES: "Viandes",
  FECULENTS: "Féculents",
  FRAIS: "Produits frais",
  EPICERIE: "Épicerie",
  AUTRES: "Autres"
};

// ------------ RECETTES PAR DÉFAUT ------------
const defaultRecipes: Recipe[] = [
  {
    id: 1,
    name: "Pâtes à la Carbonara",
    ingredients: [
      { name: "Pâtes", quantity: 100, unit: "g", category: CATEGORIES.FECULENTS },
      { name: "Lardons", quantity: 150, unit: "g", category: CATEGORIES.VIANDES },
      { name: "Oeufs", quantity: 2, unit: "pièces", category: CATEGORIES.FRAIS },
    ],
    tags: ['midi', 'soir'],
    instructions: [
      "Faire bouillir l'eau pour les pâtes",
      "Faire revenir les lardons",
      "Cuire les pâtes al dente",
      "Mélanger les œufs battus avec les pâtes et les lardons",
    ]
  },
  {
    id: 2,
    name: "Poulet Rôti",
    ingredients: [
      { name: "Poulet", quantity: 200, unit: "g", category: CATEGORIES.VIANDES },
      { name: "Carottes", quantity: 150, unit: "g", category: CATEGORIES.LEGUMES },
    ],
    tags: ['midi'],
    instructions: [
      "Préchauffer le four à 180°C",
      "Préparer le poulet",
      "Ajouter les carottes autour",
      "Cuire pendant 45 minutes"
    ]
  },
  {
    id: 3,
    name: "Soupe de Légumes",
    ingredients: [
      { name: "Carottes", quantity: 100, unit: "g", category: CATEGORIES.LEGUMES },
      { name: "Poireaux", quantity: 100, unit: "g", category: CATEGORIES.LEGUMES },
      { name: "Pommes de terre", quantity: 100, unit: "g", category: CATEGORIES.FECULENTS },
    ],
    tags: ['soir'],
    instructions: [
      "Éplucher et couper les légumes",
      "Faire revenir les légumes",
      "Ajouter de l'eau",
      "Laisser mijoter 30 minutes"
    ]
  }
];

// ------------ COMPOSANT REPAS ------------
const MealComponent = ({ day, period, meal, setWeeklyPlan, recipes }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      setLocalSearchQuery("");
    }
  }, [isOpen]);

  const getFilteredRecipes = (period, query) => {
    return recipes.filter(recipe => 
      recipe.tags.includes(period) && 
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div className="flex items-center gap-2">
        {period === 'midi' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span>{meal?.name || 'Pas de repas'}</span>
      </div>
      <div className="flex gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 bg-white shadow-lg border"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher..."
                className="w-full p-2 border rounded mb-2"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {getFilteredRecipes(period, localSearchQuery).map(recipe => (
              <DropdownMenuItem
                key={recipe.id}
                onClick={() => {
                  setWeeklyPlan(prev => ({
                    ...prev,
                    [day]: { ...prev[day], [period]: recipe }
                  }));
                  setLocalSearchQuery("");
                  setIsOpen(false);
                }}
                className="cursor-pointer hover:bg-slate-100"
              >
                {recipe.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {meal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setWeeklyPlan(prev => ({
                ...prev,
                [day]: { ...prev[day], [period]: null }
              }));
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ------------ COMPOSANT PRINCIPAL ------------
const MealPlanner = () => {
  // États
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    lundi: { midi: null, soir: null },
    mardi: { midi: null, soir: null },
    mercredi: { midi: null, soir: null },
    jeudi: { midi: null, soir: null },
    vendredi: { midi: null, soir: null },
    samedi: { midi: null, soir: null },
    dimanche: { midi: null, soir: null }
  });
  const [recipes, setRecipes] = useState<Recipe[]>(defaultRecipes);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
    tags: [],
    instructions: []
  });

  // Fonction pour formater les unités
const formatUnit = (quantity: number, unit: string): string => {
  if (unit === 'pièces' || unit === 'pièce') {
    return quantity > 1 ? 'pièces' : 'pièce';
  }
  return unit;
};
  
  // Chargement initial des données
  React.useEffect(() => {
    const loadData = () => {
      try {
        const savedRecipes = localStorage.getItem('recipes');
        if (savedRecipes) {
          setRecipes(JSON.parse(savedRecipes));
        }

        const savedPlan = localStorage.getItem('weeklyPlan');
        if (savedPlan) {
          setWeeklyPlan(JSON.parse(savedPlan));
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données:', e);
      }
      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      loadData();
    }
  }, []);

  // Sauvegarde des données
  React.useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem('recipes', JSON.stringify(recipes));
        localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des données:', e);
      }
    };

    if (!isLoading && typeof window !== 'undefined') {
      saveData();
    }
  }, [recipes, weeklyPlan, isLoading]);

  const generateWeeklyPlan = () => {
    const newPlan = {};
    Object.keys(weeklyPlan).forEach(day => {
      const midiRecipes = recipes.filter(r => r.tags.includes('midi'));
      const soirRecipes = recipes.filter(r => r.tags.includes('soir'));
      
      newPlan[day] = {
        midi: midiRecipes.length > 0 ? midiRecipes[Math.floor(Math.random() * midiRecipes.length)] : null,
        soir: soirRecipes.length > 0 ? soirRecipes[Math.floor(Math.random() * soirRecipes.length)] : null
      };
    });
    setWeeklyPlan(newPlan);
  };

  const calculateGroceryList = () => {
    const groceries = {};
    Object.values(weeklyPlan).forEach(day => {
      [day.midi, day.soir].forEach(meal => {
        if (!meal) return;
        meal.ingredients.forEach(ingredient => {
          const key = `${ingredient.name}_${ingredient.unit}`;
          if (groceries[key]) {
            groceries[key].quantity += ingredient.quantity;
          } else {
            groceries[key] = { 
              ...ingredient,
              category: ingredient.category || CATEGORIES.AUTRES 
            };
          }
        });
      });
    });
    
    const groupedGroceries = Object.values(groceries).reduce((acc, ingredient) => {
      const category = ingredient.category || CATEGORIES.AUTRES;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ingredient);
      return acc;
    }, {});

    return groupedGroceries;
  };

  const exportPlanningAndGroceries = () => {
    const groceriesByCategory = calculateGroceryList();
    
    const createLine = (char, length) => char.repeat(length) + '\n';
    const tableLine = () => createLine('-', 100);
  
    let exportText = "PLANNING DE LA SEMAINE\n";
    exportText += createLine('=', 100) + '\n';
    
    exportText += '| JOUR       | MIDI                                      | SOIR                                      |\n';
    exportText += tableLine();
    
    Object.entries(weeklyPlan).forEach(([day, meals]) => {
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      const midiName = (meals.midi?.name || 'Pas de repas').padEnd(40);
      const soirName = (meals.soir?.name || 'Pas de repas').padEnd(40);
      
      exportText += `| ${capitalizedDay.padEnd(10)} | ${midiName} | ${soirName} |\n`;
      exportText += tableLine();
    });
    
    exportText += "\nLISTE DE COURSES\n";
    exportText += createLine('=', 50) + '\n';
    
    Object.entries(groceriesByCategory).forEach(([category, ingredients]) => {
      exportText += `\n${category}\n`;
      exportText += createLine('-', category.length) + '\n';
      
      const sortedIngredients = ingredients.sort((a, b) => a.name.localeCompare(b.name));
      const midPoint = Math.ceil(sortedIngredients.length / 2);
      const firstColumn = sortedIngredients.slice(0, midPoint);
      const secondColumn = sortedIngredients.slice(midPoint);
      
      const maxLength = Math.max(firstColumn.length, secondColumn.length);
      for (let i = 0; i < maxLength; i++) {
        let line = '';
        
        if (firstColumn[i]) {
          line += `□ ${firstColumn[i].name}: ${firstColumn[i].quantity} ${formatUnit(firstColumn[i].quantity, firstColumn[i].unit)}`.padEnd(50);
        } else {
          line += ''.padEnd(50);
        }
        
        if (secondColumn[i]) {
          line += `□ ${secondColumn[i].name}: ${secondColumn[i].quantity} ${formatUnit(secondColumn[i].quantity, secondColumn[i].unit)}`;
        }
        
        exportText += line + '\n';
      }
    });

    exportText += '\n\nNotes:\n';
    exportText += createLine('-', 50);
    exportText += '\n\n\n\n';

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    link.download = `planning-courses-${date}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    if (formData.name.trim() === "") {
      alert("Le nom de la recette est obligatoire");
      return;
    }
    if (formData.tags.length === 0) {
      alert("Sélectionnez au moins un moment de repas (midi et/ou soir)");
      return;
    }
    if (formData.ingredients.some(i => i.name.trim() === "")) {
      alert("Tous les ingrédients doivent avoir un nom");
      return;
    }

    if (editingRecipe) {
      setRecipes(recipes.map(r => 
        r.id === editingRecipe.id ? { ...formData, id: editingRecipe.id } : r
      ));
      setWeeklyPlan(prev => {
        const newPlan = { ...prev };
        Object.keys(newPlan).forEach(day => {
          if (newPlan[day].midi?.id === editingRecipe.id) {
            newPlan[day].midi = { ...formData, id: editingRecipe.id };
          }
          if (newPlan[day].soir?.id === editingRecipe.id) {
            newPlan[day].soir = { ...formData, id: editingRecipe.id };
          }
        });
        return newPlan;
      });
    } else {
      const newId = Math.max(0, ...recipes.map(r => r.id)) + 1;
      setRecipes([...recipes, { ...formData, id: newId }]);
    }

    setShowEditDialog(false);
    setEditingRecipe(null);
    setFormData({
      name: "",
      ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
      tags: [],
      instructions: []
    });
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      ingredients: [...recipe.ingredients],
      tags: [...recipe.tags],
      instructions: [...(recipe.instructions || [])]
    });
    setShowEditDialog(true);
  };

  const handleDeleteRecipe = (recipeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return;
    }

    setRecipes(recipes.filter(r => r.id !== recipeId));
    setWeeklyPlan(prev => {
      const newPlan = { ...prev };
      Object.keys(newPlan).forEach(day => {
        if (newPlan[day].midi?.id === recipeId) {
          newPlan[day].midi = null;
        }
        if (newPlan[day].soir?.id === recipeId) {
          newPlan[day].soir = null;
        }
      });
      return newPlan;
    });
  };
  
  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Planning de la semaine
              <div className="flex gap-2">
                <Button onClick={generateWeeklyPlan} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Générer
                </Button>
                <Button 
                  onClick={exportPlanningAndGroceries} 
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(weeklyPlan).map(([day, meals]) => (
              <div key={day} className="mb-4">
                <h3 className="font-bold mb-2 capitalize">{day}</h3>
                <div className="space-y-2">
                  <MealComponent 
                    day={day} 
                    period="midi" 
                    meal={meals.midi}
                    setWeeklyPlan={setWeeklyPlan}
                    recipes={recipes}
                  />
                  <MealComponent 
                    day={day} 
                    period="soir" 
                    meal={meals.soir}
                    setWeeklyPlan={setWeeklyPlan}
                    recipes={recipes}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Liste de courses */}
        <Card>
          <CardHeader>
            <CardTitle>
              <ShoppingBag className="w-5 h-5 inline-block mr-2" />
              Liste de courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(calculateGroceryList()).map(([category, ingredients]) => (
              <div key={category} className="mb-4">
                <h3 className="font-bold mb-2">{category}</h3>
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="mb-1 pl-4">
                    {ingredient.name}: {ingredient.quantity} {formatUnit(ingredient.quantity, ingredient.unit)}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
	  
{/* Liste des préparations */}
<Card className="col-span-1 md:col-span-2 mt-4">
  <CardHeader>
    <CardTitle>
      Préparations de la semaine
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      {/* Créer un Set des recettes uniques du planning */}
      {Array.from(
        new Set(
          Object.values(weeklyPlan)
            .flatMap(day => [day.midi, day.soir])
            .filter(meal => meal && meal.instructions && meal.instructions.length > 0)
            .map(meal => meal.id)
        )
      ).map(recipeId => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe || !recipe.instructions) return null;

        return (
          <div key={recipe.id} className="border rounded-lg p-4">
            <h3 className="font-bold mb-4">{recipe.name}</h3>
            <ol className="list-decimal pl-5">
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="mb-1">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  </CardContent>
</Card>

      {/* Section Recettes */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Ingrédients
            <Button onClick={() => {
              setEditingRecipe(null);
              setFormData({
                name: "",
                ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
                tags: [],
                instructions: []
              });
              setShowEditDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle recette
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recipes.map(recipe => (
              <Card key={recipe.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    {recipe.name}
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(recipe)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-2">
                    Servi : {recipe.tags.join(' et ')}
                  </div>
                  
                  {/* Ingrédients */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ingrédients :</h4>
                    {recipe.ingredients.map((ingredient, idx) => (
                      <div key={idx} className="text-sm">
                        {ingredient.name}: {ingredient.quantity} {formatUnit(ingredient.quantity, ingredient.unit)}
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Préparation :</h4>
                      <ol className="list-decimal pl-5 text-sm">
                        {recipe.instructions.map((instruction, idx) => (
                          <li key={idx} className="mb-1">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour édition/création de recette */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? 'Modifier la recette' : 'Nouvelle recette'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              placeholder="Nom de la recette"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.tags.includes('midi')}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      tags: checked 
                        ? [...prev.tags.filter(t => t !== 'midi'), 'midi']
                        : prev.tags.filter(t => t !== 'midi')
                    }));
                  }}
                />
                <span>Midi</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.tags.includes('soir')}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      tags: checked 
                        ? [...prev.tags.filter(t => t !== 'soir'), 'soir']
                        : prev.tags.filter(t => t !== 'soir')
                    }));
                  }}
                />
                <span>Soir</span>
              </label>
            </div>

            {/* Ingrédients */}
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingrédient"
                    className="flex-1 p-2 border rounded"
                    value={ingredient.name}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].name = e.target.value;
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Quantité"
                    className="w-24 p-2 border rounded"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].quantity = Number(e.target.value);
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  />
                  <select
                    className="w-24 p-2 border rounded"
                    value={ingredient.unit}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].unit = e.target.value;
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="pièces">pièces</option>
                  </select>
                  <select
                    className="w-32 p-2 border rounded"
                    value={ingredient.category}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].category = e.target.value;
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  >
                    {Object.values(CATEGORIES).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  ingredients: [...prev.ingredients, { name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }]
                }));
              }}
            >
              Ajouter un ingrédient
            </Button>

            {/* Instructions */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Instructions de préparation</h3>
              <div className="space-y-2">
                {(formData.instructions || []).map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="py-2 px-3 bg-gray-100 rounded-l">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Étape ${index + 1}`}
                      className="flex-1 p-2 border rounded-r"
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...(formData.instructions || [])];
                        newInstructions[index] = e.target.value;
                        setFormData(prev => ({ ...prev, instructions: newInstructions }));
                      }}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const newInstructions = formData.instructions?.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, instructions: newInstructions }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      instructions: [...(prev.instructions || []), '']
                    }));
                  }}
                >
                  Ajouter une étape
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingRecipe(null);
                  setFormData({
                    name: "",
                    ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
                    tags: [],
                    instructions: []
                  });
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleSubmit}>
                {editingRecipe ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanner;