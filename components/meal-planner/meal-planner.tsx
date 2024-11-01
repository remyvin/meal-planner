'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, ShoppingBag, RefreshCw, Search, Plus, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

// Types
type DayOfWeek = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';
type MealTime = 'midi' | 'soir';

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
  tags: MealTime[];
  instructions?: string[];
}

interface DayMeals {
  midi: Recipe | null;
  soir: Recipe | null;
}

interface WeeklyPlan {
  [key: string]: DayMeals;
}

interface MealComponentProps {
  day: DayOfWeek;
  period: MealTime;
  meal: Recipe | null;
  setWeeklyPlan: React.Dispatch<React.SetStateAction<WeeklyPlan>>;
  recipes: Recipe[];
}

type FormData = Omit<Recipe, 'id'>;

// Constants
const CATEGORIES = {
  LEGUMES: "Légumes",
  VIANDES: "Viandes",
  FECULENTS: "Féculents",
  FRAIS: "Produits frais",
  EPICERIE: "Épicerie",
  AUTRES: "Autres"
} as const;

const DAYS: DayOfWeek[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// MealComponent
const MealComponent: React.FC<MealComponentProps> = ({ day, period, meal, setWeeklyPlan, recipes }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      setLocalSearchQuery("");
    }
  }, [isOpen]);

  const getFilteredRecipes = (period: MealTime, query: string): Recipe[] => {
    return recipes.filter(recipe => 
      recipe.tags.includes(period) && 
      recipe.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSelectMeal = async (recipe: Recipe) => {
    try {
      await fetch('/api/weekly-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          [period === 'midi' ? 'midiId' : 'soirId']: recipe.id
        }),
      });

      setWeeklyPlan(prev => ({
        ...prev,
        [day]: { ...prev[day], [period]: recipe }
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du planning:', error);
    }
    setLocalSearchQuery("");
    setIsOpen(false);
  };
  
   const handleRemoveMeal = async () => {
    try {
      const response = await fetch('/api/weekly-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          midiId: period === 'midi' ? null : weeklyPlan[day].midi?.id,
          soirId: period === 'soir' ? null : weeklyPlan[day].soir?.id,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setWeeklyPlan(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [period]: null
        }
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du repas:', error);
      alert('Erreur lors de la suppression du repas');
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded bg-white">
      <div className="flex items-center gap-2">
        {period === 'midi' ? 
          <Sun className="w-4 h-4 text-yellow-500" /> : 
          <Moon className="w-4 h-4 text-blue-500" />
        }
        <span className="text-gray-800">{meal?.name || 'Pas de repas'}</span>
      </div>
      <div className="flex gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-gray-100 border-gray-300"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          {/* ... reste du dropdown ... */}
        </DropdownMenu>

        {meal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveMeal}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};


// Main Component
export default function MealPlanner() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { midi: null, soir: null }
    }), {} as WeeklyPlan)
  );
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
    tags: [],
    instructions: []
  });

  // Formatage des unités
  const formatUnit = (quantity: number, unit: string): string => {
    if (unit === 'pièces' || unit === 'pièce') {
      return quantity > 1 ? 'pièces' : 'pièce';
    }
    return unit;
  };

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les recettes
        const recipesResponse = await fetch('/api/recipes');
        const recipesData = await recipesResponse.json();
        setRecipes(recipesData);

        // Charger le planning
        const planResponse = await fetch('/api/weekly-plan');
        const planData = await planResponse.json();
        
        // Convertir planData en format WeeklyPlan
        const formattedPlan = DAYS.reduce((acc, day) => {
          const dayPlan = planData.find((p: any) => p.day === day) || { midi: null, soir: null };
          acc[day] = {
            midi: dayPlan.midi || null,
            soir: dayPlan.soir || null
          };
          return acc;
        }, {} as WeeklyPlan);

        setWeeklyPlan(formattedPlan);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Génération du planning
 const generateWeeklyPlan = async () => {
  try {
    const newPlan = { ...weeklyPlan };
    
    // Générer le nouveau planning
    for (const day of DAYS) {
      const midiRecipes = recipes.filter(r => r.tags.includes('midi'));
      const soirRecipes = recipes.filter(r => r.tags.includes('soir'));
      
      newPlan[day] = {
        midi: midiRecipes.length > 0 ? midiRecipes[Math.floor(Math.random() * midiRecipes.length)] : null,
        soir: soirRecipes.length > 0 ? soirRecipes[Math.floor(Math.random() * soirRecipes.length)] : null
      };

      // Mettre à jour dans la base de données
      await fetch('/api/weekly-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          midiId: newPlan[day].midi?.id || null,
          soirId: newPlan[day].soir?.id || null,
        }),
      });
    }

    // Mettre à jour l'état local
    setWeeklyPlan(newPlan);
  } catch (error) {
    console.error('Erreur lors de la génération du planning:', error);
    alert('Erreur lors de la génération du planning');
  }
};

  // Calcul de la liste de courses
  const calculateGroceryList = (): { [category: string]: Ingredient[] } => {
    const groceries: { [key: string]: Ingredient } = {};
    
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
    }, {} as { [category: string]: Ingredient[] });

    return groupedGroceries;
  };

  // Export du planning et de la liste de courses
  const exportPlanningAndGroceries = (): void => {
    const groceriesByCategory = calculateGroceryList();
    
    const createLine = (char: string, length: number): string => char.repeat(length) + '\n';
    const tableLine = (): string => createLine('-', 100);

    let exportText = "PLANNING DE LA SEMAINE\n";
    exportText += createLine('=', 100) + '\n';
    
    exportText += '| JOUR       | MIDI                                      | SOIR                                      |\n';
    exportText += tableLine();
    
    DAYS.forEach(day => {
      const meals = weeklyPlan[day];
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

  // Gestion des recettes
  const handleSubmit = async (): Promise<void> => {
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
	
// Suite de handleSubmit...
    try {
      if (editingRecipe) {
        // Mise à jour d'une recette existante
        const response = await fetch(`/api/recipes/${editingRecipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const updatedRecipe = await response.json();
        setRecipes(recipes.map(r => r.id === editingRecipe.id ? updatedRecipe : r));
        
        // Mise à jour du planning si la recette est utilisée
        setWeeklyPlan(prev => {
          const newPlan = { ...prev };
          DAYS.forEach((day) => {
            if (newPlan[day].midi?.id === editingRecipe.id) {
              newPlan[day].midi = updatedRecipe;
            }
            if (newPlan[day].soir?.id === editingRecipe.id) {
              newPlan[day].soir = updatedRecipe;
            }
          });
          return newPlan;
        });
      } else {
        // Création d'une nouvelle recette
        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const newRecipe = await response.json();
        setRecipes([...recipes, newRecipe]);
      }

      setShowEditModal(false);
      setEditingRecipe(null);
      setFormData({
        name: "",
        ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
        tags: [],
        instructions: []
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la recette:', error);
      alert('Erreur lors de la sauvegarde de la recette');
    }
  };

  const handleEdit = (recipe: Recipe): void => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      ingredients: [...recipe.ingredients],
      tags: [...recipe.tags],
      instructions: [...(recipe.instructions || [])]
    });
    setShowEditModal(true);
  };

  const handleDeleteRecipe = async (recipeId: number): Promise<void> => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return;
    }

    try {
      await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      setRecipes(recipes.filter(r => r.id !== recipeId));
      
      // Mise à jour du planning si la recette est utilisée
      setWeeklyPlan(prev => {
        const newPlan = { ...prev };
        DAYS.forEach((day) => {
          if (newPlan[day].midi?.id === recipeId) {
            newPlan[day].midi = null;
          }
          if (newPlan[day].soir?.id === recipeId) {
            newPlan[day].soir = null;
          }
        });
        return newPlan;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error);
      alert('Erreur lors de la suppression de la recette');
    }
  };
  
  // Loading screen
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
        {/* === Planning === */}
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
            {DAYS.map((day) => (
              <div key={day} className="mb-4">
                <h3 className="font-bold mb-2 capitalize">{day}</h3>
                <div className="space-y-2">
                  <MealComponent 
                    day={day}
                    period="midi" 
                    meal={weeklyPlan[day].midi}
                    setWeeklyPlan={setWeeklyPlan}
                    recipes={recipes}
                  />
                  <MealComponent 
                    day={day}
                    period="soir" 
                    meal={weeklyPlan[day].soir}
                    setWeeklyPlan={setWeeklyPlan}
                    recipes={recipes}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* === Liste de courses === */}
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

      {/* === Section Recettes === */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Recettes
            <Button onClick={() => {
              setEditingRecipe(null);
              setFormData({
                name: "",
                ingredients: [{ name: "", quantity: 0, unit: "g", category: CATEGORIES.AUTRES }],
                tags: [],
                instructions: []
              });
              setShowEditModal(true);
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
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ingrédients :</h4>
                    {recipe.ingredients.map((ingredient, idx) => (
                      <div key={idx} className="text-sm">
                        {ingredient.name}: {ingredient.quantity} {formatUnit(ingredient.quantity, ingredient.unit)}
                      </div>
                    ))}
                  </div>

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

      {/* Modal pour édition/création de recette */}
      <Modal open={showEditModal} onOpenChange={setShowEditModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingRecipe ? 'Modifier la recette' : 'Nouvelle recette'}
            </ModalTitle>
          </ModalHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              {/* Nom de la recette */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nom de la recette"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Checkboxes pour midi/soir */}
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

              {/* Liste des ingrédients */}
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1.5fr,auto] gap-2">
                    <input
                      type="text"
                      placeholder="Ingrédient"
                      className="p-2 border rounded"
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
                      className="p-2 border rounded"
                      value={ingredient.quantity}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients];
                        newIngredients[index].quantity = Number(e.target.value);
                        setFormData({ ...formData, ingredients: newIngredients });
                      }}
                    />
                    <select
                      className="p-2 border rounded"
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
                      className="p-2 border rounded"
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
                  className="w-full"
                >
                  Ajouter un ingrédient
                </Button>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h3 className="font-medium">Instructions de préparation</h3>
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
                    className="w-full"
                  >
                    Ajouter une étape
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
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
        </ModalContent>
      </Modal>
    </div>
  );
}						  