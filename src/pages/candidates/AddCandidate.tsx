import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { candidateService } from "@/services/candidateService";
import { authService } from "@/services/authService";

interface CandidateFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
}

const AddCandidate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CandidateFormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "Email, first name, and last name are required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // First create a user with auth service
      const { user } = await authService.createUserWithEmail({
        email: formData.email,
        password: Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10), // Generate random password
        role: "candidate"
      });
      
      if (!user?.id) {
        throw new Error("Failed to create user account");
      }
      
      // Then create the profile for this user
      const candidate = await candidateService.createCandidate({
        id: user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        headline: formData.headline,
        bio: formData.bio
      });
      
      toast({
        title: "Success",
        description: "Candidate has been added successfully.",
      });
      
      // Navigate to the candidate details page
      navigate(`/candidates/${candidate.id}`);
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Error",
        description: "Failed to add candidate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => navigate("/candidates")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Add Candidate</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer, Product Manager"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Brief description about the candidate"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/candidates")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-system-blue-600 hover:bg-system-blue-700"
              >
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Add Candidate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCandidate; 