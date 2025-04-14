import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight, Users, Building2, Calendar, CheckSquare, ChevronRight, Star } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="border-b border-system-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-system-blue-600">
                AnthemHire
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-system-gray-600 hover:text-system-gray-900">Features</a>
              <a href="#how-it-works" className="text-system-gray-600 hover:text-system-gray-900">How it Works</a>
              <a href="#testimonials" className="text-system-gray-600 hover:text-system-gray-900">Testimonials</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth/login")}
              >
                Sign in
              </Button>
              <Button 
                className="bg-system-blue-600 hover:bg-system-blue-700"
                onClick={() => navigate("/auth/register")}
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-system-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-system-gray-800 leading-tight">
                Simplify Your Hiring Process with AI-Powered Assessments
              </h1>
              <p className="mt-4 text-xl text-system-gray-600">
                AnthemHire streamlines your recruitment workflow with skill-based assessments, 
                automated scoring, and intelligent candidate ranking.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <Button 
                  className="bg-system-blue-600 hover:bg-system-blue-700 text-lg h-12 px-6"
                  onClick={() => navigate("/auth/register")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="text-lg h-12 px-6"
                  onClick={() => navigate("/auth/login")}
                >
                  Sign in
                </Button>
              </div>
              <div className="mt-6 flex items-center text-system-gray-500">
                <Check className="text-system-green-500 mr-2 h-5 w-5" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-system-blue-200 rounded-lg transform rotate-3"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80"
                    alt="Interview Management Dashboard"
                    className="rounded-md shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-system-blue-600 text-4xl font-bold">500+</div>
              <div className="mt-2 text-lg text-system-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-system-blue-600 text-4xl font-bold">25,000+</div>
              <div className="mt-2 text-lg text-system-gray-600">Assessments Completed</div>
            </div>
            <div className="text-center">
              <div className="text-system-blue-600 text-4xl font-bold">70%</div>
              <div className="mt-2 text-lg text-system-gray-600">Time Saved</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-system-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-system-gray-800">Powerful Features</h2>
            <p className="mt-4 text-xl text-system-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline your recruitment process from job posting to final hiring decision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-system-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-system-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Job Management</h3>
                <p className="text-system-gray-600">
                  Create and manage job postings with custom fields, templates, and approval workflows.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-system-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-system-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Candidate Assessment</h3>
                <p className="text-system-gray-600">
                  Evaluate technical and soft skills with customizable MCQs, coding challenges, and writing tests.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-system-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-system-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interview Scheduling</h3>
                <p className="text-system-gray-600">
                  Coordinate interviews effortlessly with calendar integration and automatic notifications.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-system-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckSquare className="h-6 w-6 text-system-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Feedback Collection</h3>
                <p className="text-system-gray-600">
                  Gather structured feedback from interviewers with customizable evaluation forms.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-system-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-system-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Candidate Ranking</h3>
                <p className="text-system-gray-600">
                  Automatically rank candidates based on assessment scores and interviewer feedback.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-system-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-system-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                <p className="text-system-gray-600">
                  Set permissions for administrators, HR managers, interviewers, and candidates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-system-gray-800">How It Works</h2>
            <p className="mt-4 text-xl text-system-gray-600 max-w-3xl mx-auto">
              From job posting to offer letter in just a few simple steps.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-system-blue-200"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-system-blue-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-system-blue-600 font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Create Job Postings</h3>
                    <p className="text-system-gray-600">
                      Create detailed job descriptions, set requirements, and publish to your career page or job boards.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
                    alt="Creating job postings"
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse items-center mb-12">
                <div className="md:w-1/2 md:pl-12 mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-system-blue-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-system-blue-600 font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Review Applications</h3>
                    <p className="text-system-gray-600">
                      Screen applications, review resumes, and select candidates for the assessment phase.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pr-12">
                  <img
                    src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
                    alt="Reviewing applications"
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-system-blue-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-system-blue-600 font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Conduct Assessments</h3>
                    <p className="text-system-gray-600">
                      Assign customized assessments to evaluate candidates' technical skills and knowledge.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <img
                    src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80"
                    alt="Conducting assessments"
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 md:pl-12 mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-system-blue-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-system-blue-600 font-bold">4</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Schedule Interviews & Make Decisions</h3>
                    <p className="text-system-gray-600">
                      Coordinate interviews, collect feedback, and use our ranking algorithm to make the best hiring decisions.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pr-12">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                    alt="Scheduling interviews"
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-system-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-system-gray-800">What Our Customers Say</h2>
            <p className="mt-4 text-xl text-system-gray-600 max-w-3xl mx-auto">
              Companies of all sizes trust AnthemHire to streamline their hiring process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-system-yellow-500 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-system-gray-600 mb-4">
                  "AnthemHire has transformed our hiring process. We've reduced our time-to-hire by 60% while making better quality hires."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-system-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-system-blue-600 font-bold">JD</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">HR Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-system-yellow-500 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-system-gray-600 mb-4">
                  "The assessment tools provide deep insights into candidates' capabilities. Our technical interviews are now much more focused and effective."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-system-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-system-blue-600 font-bold">MS</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Michael Smith</h4>
                    <p className="text-sm text-muted-foreground">CTO, StartupInc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-system-yellow-500 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-system-gray-600 mb-4">
                  "The candidate ranking algorithm has been a game-changer. It helps us identify top talent quickly and objectively."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-system-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-system-blue-600 font-bold">SJ</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Talent Acquisition, Enterprise Co.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-system-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Hiring Process?</h2>
          <p className="text-xl text-system-blue-100 max-w-3xl mx-auto mb-8">
            Join hundreds of companies that are making better hiring decisions faster with AnthemHire.
          </p>
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-4 sm:space-y-0">
            <Button 
              className="bg-white text-system-blue-600 hover:bg-system-blue-50 text-lg h-12 px-6"
              onClick={() => navigate("/auth/register")}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white bg-system-blue-700 text-lg h-12 px-6"
            >
              Request Demo
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-system-gray-800 text-system-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">AnthemHire</h3>
              <p className="text-system-gray-400">
                The complete solution for modern recruitment and hiring.
              </p>
            </div>
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-system-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 AnthemHire. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
