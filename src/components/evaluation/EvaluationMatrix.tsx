import React, { useState } from 'react';
import { Skill, SkillCategory } from '../../types/core/skills';
import { CategoryEvaluation } from './CategoryEvaluation';
import { EvaluationSummary } from './EvaluationSummary';
import { useEvaluation } from '../../hooks/useEvaluation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader, BarChart as ChartBar, Activity, Target } from 'lucide-react';
import { Line, Radar } from 'react-chartjs-2';
import './charts/ChartConfig';

interface EvaluationMatrixProps {
  playerId: string;
  skills: Skill[];
  categories: SkillCategory[];
}

export function EvaluationMatrix({ playerId, skills, categories }: EvaluationMatrixProps) {
  const { 
    currentEvaluation,
    previousEvaluation,
    loading, 
    error, 
    updateSkillValue, 
    saveEvaluation,
    calculateOverallRating 
  } = useEvaluation(playerId);

  const [activeTab, setActiveTab] = useState('bewertung');

  if (error?.includes('Failed to fetch')) {
    return <DatabaseConnectionError />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const overallRating = calculateOverallRating(skills, categories);

  const getChartData = () => {
    const skillsByCategory = categories.map(category => ({
      category: category.name,
      skills: skills.filter(s => s.categoryId === category.id),
      avgRating: skills
        .filter(s => s.categoryId === category.id)
        .reduce((sum, skill) => sum + (currentEvaluation[skill.id] || 0), 0) / 
        skills.filter(s => s.categoryId === category.id).length
    }));

    return {
      labels: skillsByCategory.map(c => c.category),
      datasets: [{
        label: 'Durchschnittliche Bewertung',
        data: skillsByCategory.map(c => c.avgRating),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    };
  };

  const getRadarData = () => {
    return {
      labels: skills.map(s => s.name),
      datasets: [{
        label: 'Fähigkeiten',
        data: skills.map(s => currentEvaluation[s.id] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    };
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bewertung">
            <Target className="w-4 h-4 mr-2" />
            Bewertung
          </TabsTrigger>
          <TabsTrigger value="diagramme">
            <ChartBar className="w-4 h-4 mr-2" />
            Diagramme
          </TabsTrigger>
          <TabsTrigger value="entwicklung">
            <Activity className="w-4 h-4 mr-2" />
            Entwicklung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bewertung">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {categories.map(category => (
                <CategoryEvaluation
                  key={category.id}
                  category={category}
                  skills={skills.filter(s => s.categoryId === category.id)}
                  evaluations={currentEvaluation}
                  previousEvaluations={previousEvaluation}
                  onSkillChange={updateSkillValue}
                />
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <EvaluationSummary
                  skills={skills}
                  categories={categories}
                  overallRating={overallRating}
                />

                <button
                  onClick={() => saveEvaluation(skills, categories)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Bewertung speichern
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diagramme">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kategorien-Übersicht</h3>
              <div className="h-[400px]">
                <Line 
                  data={getChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 20,
                        grid: {
                          color: 'rgba(0,0,0,0.1)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fähigkeiten-Profil</h3>
              <div className="h-[400px]">
                <Radar 
                  data={getRadarData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 20,
                        ticks: {
                          stepSize: 5
                        },
                        grid: {
                          color: 'rgba(0,0,0,0.1)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entwicklung">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Entwicklungsverlauf</h3>
            <div className="h-[400px]">
              <Line
                data={{
                  labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
                  datasets: categories.map((category, index) => ({
                    label: category.name,
                    data: [10, 12, 11, 13, 14, 15].map(v => v + index),
                    borderColor: `hsl(${index * 45}, 70%, 50%)`,
                    tension: 0.3
                  }))
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 20,
                      grid: {
                        color: 'rgba(0,0,0,0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}