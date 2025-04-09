
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Timer, FileText, CheckCircle, Plus } from "lucide-react";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "mcq" | "coding" | "text";
  durationMinutes: number;
  questionCount: number;
  passingScore: number;
  createdAt: Date;
  lastUpdated: Date;
  completionCount: number;
  status: "active" | "draft" | "archived";
}

const mockAssessments: Assessment[] = [
  {
    id: "1",
    title: "Frontend Developer Technical Assessment",
    description: "Test frontend development skills including React, JavaScript, and CSS.",
    type: "coding",
    durationMinutes: 60,
    questionCount: 5,
    passingScore: 70,
    createdAt: addDays(new Date(), -30),
    lastUpdated: addDays(new Date(), -5),
    completionCount: 28,
    status: "active",
  },
  {
    id: "2",
    title: "Product Management Knowledge Test",
    description: "Evaluate product management methodology and skills.",
    type: "mcq",
    durationMinutes: 45,
    questionCount: 25,
    passingScore: 75,
    createdAt: addDays(new Date(), -60),
    lastUpdated: addDays(new Date(), -15),
    completionCount: 42,
    status: "active",
  },
  {
    id: "3",
    title: "UX Design Challenge",
    description: "Assess UX design thinking and problem-solving abilities.",
    type: "text",
    durationMinutes: 90,
    questionCount: 3,
    passingScore: 80,
    createdAt: addDays(new Date(), -45),
    lastUpdated: addDays(new Date(), -2),
    completionCount: 17,
    status: "active",
  },
  {
    id: "4",
    title: "Backend Development Assessment",
    description: "Test backend skills including API design, database knowledge, and system architecture.",
    type: "coding",
    durationMinutes: 75,
    questionCount: 4,
    passingScore: 65,
    createdAt: addDays(new Date(), -20),
    lastUpdated: addDays(new Date(), -20),
    completionCount: 15,
    status: "active",
  },
  {
    id: "5",
    title: "Marketing Strategy Case Study",
    description: "Evaluate marketing strategy formulation and analytical skills.",
    type: "text",
    durationMinutes: 120,
    questionCount: 2,
    passingScore: 70,
    createdAt: addDays(new Date(), -15),
    lastUpdated: addDays(new Date(), -5),
    completionCount: 8,
    status: "draft",
  },
];

const getAssessmentTypeStyles = (type: "mcq" | "coding" | "text") => {
  switch (type) {
    case "mcq":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "coding":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "text":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const getAssessmentTypeLabel = (type: "mcq" | "coding" | "text") => {
  switch (type) {
    case "mcq":
      return "Multiple Choice";
    case "coding":
      return "Coding Challenge";
    case "text":
      return "Written Response";
    default:
      return type;
  }
};

const getStatusStyles = (status: "active" | "draft" | "archived") => {
  switch (status) {
    case "active":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "draft":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    case "archived":
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const Assessments: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">
            Create and manage candidate assessment tests
          </p>
        </div>
        <Button className="bg-system-blue-600 hover:bg-system-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Create Assessment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Assessments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input placeholder="Search assessments..." className="pl-8 w-full" />
                <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/assessments/${assessment.id}`)}
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-medium text-lg">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {assessment.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={getAssessmentTypeStyles(assessment.type)}
                    >
                      {getAssessmentTypeLabel(assessment.type)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getStatusStyles(assessment.status)}
                    >
                      {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-1.5" />
                    {assessment.durationMinutes} minutes
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1.5" />
                    {assessment.questionCount} questions
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    {assessment.passingScore}% passing score
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 mr-1.5"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                    </svg>
                    {assessment.completionCount} completions
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Created {format(assessment.createdAt, "MMM d, yyyy")} • 
                  Last updated {format(assessment.lastUpdated, "MMM d, yyyy")}
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assessments/${assessment.id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assessments/${assessment.id}/results`);
                    }}
                  >
                    View Results
                  </Button>
                  {assessment.status === "active" && (
                    <Button
                      size="sm"
                      className="text-xs h-8 bg-system-blue-500 hover:bg-system-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Send assessment
                      }}
                    >
                      Send to Candidates
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assessments;
