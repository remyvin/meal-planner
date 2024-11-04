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
} as const;

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
      "Mélanger les œufs battus avec les pâtes et les lardons"
    ]
  },
  // ... autres recettes par défaut
];

// ------------ COMPOSANT REPAS ------------
const MealComponent = ({ day, period, meal, setWeeklyPlan, recipes }: MealComponentProps) => {
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
    <div className="meal-card flex items-center justify-between p-3 animate-slide-in">
      <div className="flex items-center gap-3">
        {period === 'midi' ? (
          <div className="meal-period-midi">
            <Sun className="w-4 h-4" />
          </div>
        ) : (
          <div className="meal-period-soir">
            <Moon className="w-4 h-4" />
          </div>
        )}
        <span className="font-medium text-gray-800">{meal?.name || 'Pas de repas'}</span>
      </div>
      <div className="flex gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="button-hover bg-white hover:bg-gray-50"
            >
              <Search className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 bg-white shadow-lg border animate-scale-in"
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
                className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
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
            className="button-danger button-hover"
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
  
  const exportData = () => {
  const data = {
    recipes: recipes,
    weeklyPlan: weeklyPlan,
    version: "1.0" // Pour gérer les futures versions
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `meal-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      
      // Vérifier que le fichier est valide
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        localStorage.setItem('recipes', JSON.stringify(data.recipes));
      }
      
      if (data.weeklyPlan) {
        setWeeklyPlan(data.weeklyPlan);
        localStorage.setItem('weeklyPlan', JSON.stringify(data.weeklyPlan));
      }

      alert('Import réussi !');
    } catch (error) {
      alert('Erreur lors de l\'import du fichier');
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
};

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

  // Génération du planning
  const generateWeeklyPlan = () => {
    const newPlan = { ...weeklyPlan };
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

  // Calcul de la liste de courses
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
  
  
  // Export du planning et de la liste de courses
  const exportPlanningAndGroceries = () => {
    const groceriesByCategory = calculateGroceryList();
    
    const createLine = (char: string, length: number): string => char.repeat(length) + '\n';
    const tableLine = (): string => createLine('-', 100);

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


// Après exportPlanningAndGroceries et avant le rendu...

  // Gestion des recettes
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

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      ingredients: [...recipe.ingredients],
      tags: [...recipe.tags],
      instructions: [...(recipe.instructions || [])]
    });
    setShowEditDialog(true);
  };

  const handleDeleteRecipe = (recipeId: number) => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="p-4 max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planning */}
        <Card className="card-hover bg-white">
          <CardHeader className="bg-gray-50 rounded-t-lg border-b">
            <CardTitle className="flex justify-between items-center">
              <span className="text-gray-800">Planning de la semaine</span>
              <div className="flex gap-2">
                <Button 
                  onClick={generateWeeklyPlan} 
                  variant="outline"
                  className="button-hover bg-blue-50 hover:bg-blue-100 text-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Générer
                </Button>
                <Button 
                  onClick={exportPlanningAndGroceries} 
                  variant="outline"
                  className="button-hover bg-green-50 hover:bg-green-100 text-green-700"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardTitle>
			<div className="flex gap-2">
  <Button 
    onClick={exportData}
    variant="outline"
    className="bg-blue-50 hover:bg-blue-100 text-blue-700"
  >
    Sauvegarder les données
  </Button>

  <label>
    <input
      type="file"
      accept=".json"
      onChange={importData}
      style={{ display: 'none' }}
    />
    <Button 
      variant="outline"
      className="bg-green-50 hover:bg-green-100 text-green-700"
      onClick={() => document.querySelector('input[type="file"]')?.click()}
    >
      Restaurer les données
    </Button>
  </label>
</div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {Object.entries(weeklyPlan).map(([day, meals], index) => (
              <div 
                key={day} 
                className="animate-slide-in bg-white rounded-lg p-4 shadow-sm"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <h3 className="font-bold mb-3 capitalize text-gray-800 border-b pb-2">{day}</h3>
                <div className="space-y-3">
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
        <Card className="card-hover bg-white">
          <CardHeader className="bg-gray-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center text-gray-800">
              <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
              Liste de courses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {Object.entries(calculateGroceryList()).map(([category, ingredients], index) => (
                <div 
                  key={category} 
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <h3 className="font-bold mb-3 text-gray-800 bg-gray-50 p-2 rounded">
                    {category}
                  </h3>
                  <div className="space-y-2 pl-4">
                    {ingredients.map((ingredient, idx) => (
                      <div 
                        key={idx} 
                        className="text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                      >
                        {ingredient.name}: {ingredient.quantity} {formatUnit(ingredient.quantity, ingredient.unit)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liste des préparations */}
        <Card className="col-span-1 md:col-span-2 mt-4 card-hover bg-white">
          <CardHeader className="bg-gray-50 rounded-t-lg border-b">
            <CardTitle className="text-gray-800">
              Préparations de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              {Array.from(
                new Set(
                  Object.values(weeklyPlan)
                    .flatMap(day => [day.midi, day.soir])
                    .filter(meal => meal && meal.instructions && meal.instructions.length > 0)
                    .map(meal => meal.id)
                )
              ).map((recipeId, index) => {
                const recipe = recipes.find(r => r.id === recipeId);
                if (!recipe || !recipe.instructions) return null;

                return (
                  <div 
                    key={recipe.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-300 animate-fade-in"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <h3 className="font-bold mb-4 text-gray-800">{recipe.name}</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      {recipe.instructions.map((instruction, idx) => (
                        <li 
                          key={idx} 
                          className="text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                        >
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
      </div>
	  
	  {/* Section Recettes */}
      <Card className="mt-4 card-hover bg-white">
        <CardHeader className="bg-gray-50 rounded-t-lg border-b">
          <CardTitle className="flex justify-between items-center">
            <span className="text-gray-800">Recettes</span>
            <Button 
              onClick={() => {
                setEditingRecipe(null);
                setFormData({
                  name: "",
                  ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
                  tags: [],
                  instructions: []
                });
                setShowEditDialog(true);
              }}
              className="button-hover bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle recette
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recipes.map((recipe, index) => (
              <Card 
                key={recipe.id} 
                className="recipe-card"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span className="text-gray-800">{recipe.name}</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(recipe)}
                        className="button-hover text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="button-hover text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm mb-3 bg-blue-50 text-blue-700 p-2 rounded">
                    Servi : {recipe.tags.join(' et ')}
                  </div>
                  
                  {/* Ingrédients */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-800 border-b pb-1">Ingrédients :</h4>
                    <div className="space-y-1">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="text-sm text-gray-600 hover:bg-gray-50 p-1 rounded transition-colors duration-200">
                          {ingredient.name}: {ingredient.quantity} {formatUnit(ingredient.quantity, ingredient.unit)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800 border-b pb-1">Préparation :</h4>
                      <ol className="list-decimal pl-5 text-sm space-y-1">
                        {recipe.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-gray-600 hover:bg-gray-50 p-1 rounded transition-colors duration-200">
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
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto bg-white animate-scale-in">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {editingRecipe ? 'Modifier la recette' : 'Nouvelle recette'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <input
              type="text"
              placeholder="Nom de la recette"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="flex gap-6">
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors duration-200">
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
                <span className="text-gray-700">Midi</span>
              </label>
              <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors duration-200">
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
                <span className="text-gray-700">Soir</span>
              </label>
            </div>

            {/* Ingrédients */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Ingrédients</h3>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1.5fr,auto] gap-2 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Ingrédient"
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index].quantity = Number(e.target.value);
                      setFormData({ ...formData, ingredients: newIngredients });
                    }}
                  />
                  <select
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                    className="button-hover text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    ingredients: [
                      ...prev.ingredients, 
                      { name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }
                    ]
                  }));
                }}
                className="w-full button-hover bg-gray-50 hover:bg-gray-100"
              >
                Ajouter un ingrédient
              </Button>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Instructions de préparation</h3>
              <div className="space-y-2">
                {(formData.instructions || []).map((instruction, index) => (
                  <div key={index} className="flex gap-2 animate-fade-in">
                    <span className="py-2 px-3 bg-gray-100 rounded-l text-gray-600">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Étape ${index + 1}`}
                      className="flex-1 p-2 border rounded-r focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                      className="button-hover text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  className="w-full button-hover bg-gray-50 hover:bg-gray-100"
                >
                  Ajouter une étape
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
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
                className="button-hover bg-gray-50 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit}
                className="button-hover bg-blue-600 hover:bg-blue-700 text-white"
              >
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