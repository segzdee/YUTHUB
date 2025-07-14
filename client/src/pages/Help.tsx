import { useState } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Video, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Shield,
  Database,
  Settings,
  BarChart3,
  Building
} from "lucide-react";

export default function Help() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const faqItems = [
    {
      id: "1",
      question: "How do I add a new resident to the system?",
      answer: "To add a new resident, go to the Housing section and click 'Add Resident'. Fill in the required information including personal details, support needs, and property assignment. The system will automatically create a resident profile and generate necessary documentation.",
      category: "residents",
      popularity: 5,
    },
    {
      id: "2",
      question: "How do I report a safety incident?",
      answer: "Navigate to the Safeguarding section and click 'Report Incident'. Select the incident type, severity level, and provide a detailed description. The system will automatically notify the appropriate team members and create an incident record for tracking.",
      category: "safeguarding",
      popularity: 4,
    },
    {
      id: "3",
      question: "How do I generate monthly reports?",
      answer: "Go to the Reports section and select the report type you need. Choose your date range and filters, then click 'Generate Report'. Reports can be downloaded in PDF or Excel format and scheduled for automatic generation.",
      category: "reports",
      popularity: 4,
    },
    {
      id: "4",
      question: "How do I manage property occupancy?",
      answer: "Use the Housing section to view all properties and their current occupancy status. You can assign residents to available units, track maintenance requests, and monitor capacity across all properties.",
      category: "housing",
      popularity: 3,
    },
    {
      id: "5",
      question: "How do I create a support plan?",
      answer: "In the Support section, click 'Create Support Plan'. Enter the resident's goals, required support levels, and timeline. The system will help track progress and send reminders for reviews.",
      category: "support",
      popularity: 5,
    },
    {
      id: "6",
      question: "How do I access crisis support?",
      answer: "The Crisis Connect section provides 24/7 emergency contacts and protocols. Click on any emergency contact to initiate a call, or follow the crisis response protocols for different scenarios.",
      category: "crisis",
      popularity: 2,
    },
  ];

  const supportChannels = [
    {
      id: "phone",
      title: "Phone Support",
      description: "Speak directly with our support team",
      icon: Phone,
      availability: "Mon-Fri 9AM-5PM",
      contact: "+44 20 7123 4567",
      responseTime: "Immediate",
    },
    {
      id: "email",
      title: "Email Support",
      description: "Send us your questions via email",
      icon: Mail,
      availability: "24/7",
      contact: "support@yuthub.com",
      responseTime: "Within 24 hours",
    },
    {
      id: "chat",
      title: "Live Chat",
      description: "Chat with our support team",
      icon: MessageCircle,
      availability: "Mon-Fri 9AM-5PM",
      contact: "Available in app",
      responseTime: "Within 5 minutes",
    },
  ];

  const resources = [
    {
      id: "getting-started",
      title: "Getting Started Guide",
      description: "Complete guide to setting up and using YUTHUB",
      icon: BookOpen,
      type: "guide",
      duration: "15 min read",
      category: "basics",
    },
    {
      id: "video-tutorials",
      title: "Video Tutorials",
      description: "Step-by-step video guides for common tasks",
      icon: Video,
      type: "video",
      duration: "5-10 min each",
      category: "tutorials",
    },
    {
      id: "api-documentation",
      title: "API Documentation",
      description: "Technical documentation for developers",
      icon: FileText,
      type: "technical",
      duration: "Technical reference",
      category: "development",
    },
    {
      id: "best-practices",
      title: "Best Practices",
      description: "Recommended workflows and configurations",
      icon: Star,
      type: "guide",
      duration: "10 min read",
      category: "optimization",
    },
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "residents": return Users;
      case "safeguarding": return Shield;
      case "reports": return BarChart3;
      case "housing": return Building;
      case "support": return HelpCircle;
      case "crisis": return AlertCircle;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "residents": return "bg-blue-100 text-blue-800";
      case "safeguarding": return "bg-red-100 text-red-800";
      case "reports": return "bg-green-100 text-green-800";
      case "housing": return "bg-purple-100 text-purple-800";
      case "support": return "bg-yellow-100 text-yellow-800";
      case "crisis": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "guide": return BookOpen;
      case "video": return Video;
      case "technical": return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find answers to your questions and get help with YUTHUB
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-medium">Resident Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {faqItems.filter(item => item.category === "residents").length} articles
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h3 className="font-medium">Safeguarding</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {faqItems.filter(item => item.category === "safeguarding").length} articles
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-4">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-medium">Reports</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {faqItems.filter(item => item.category === "reports").length} articles
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to the most common questions about YUTHUB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQ.map((item) => {
                      const IconComponent = getCategoryIcon(item.category);
                      return (
                        <AccordionItem key={item.id} value={item.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <IconComponent className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{item.question}</span>
                                  <Badge className={getCategoryColor(item.category)}>
                                    {item.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: item.popularity }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">Popular</span>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-4 pl-8">
                              <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportChannels.map((channel) => {
                  const IconComponent = channel.icon;
                  return (
                    <Card key={channel.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{channel.title}</CardTitle>
                            <CardDescription>{channel.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{channel.availability}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{channel.responseTime}</span>
                          </div>
                          <div className="pt-2">
                            <Button className="w-full">
                              Contact {channel.title.split(' ')[0]}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Support Status</CardTitle>
                  <CardDescription>Current system status and service updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">All Systems Operational</div>
                        <div className="text-sm text-gray-600">
                          All services are running normally
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Scheduled Maintenance</div>
                        <div className="text-sm text-gray-600">
                          System maintenance scheduled for Sunday 2AM-4AM GMT
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => {
                  const IconComponent = getTypeIcon(resource.type);
                  return (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription>{resource.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{resource.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{resource.category}</Badge>
                            <Badge variant="outline">{resource.type}</Badge>
                          </div>
                          <div className="pt-2">
                            <Button className="w-full" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Resource
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Commonly accessed resources and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      User Manual
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Training Videos
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Release Notes
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      System Requirements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Get in touch with our support team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Phone Support</div>
                        <div className="text-sm text-gray-600">+44 20 7123 4567</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-gray-600">support@yuthub.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Live Chat</div>
                        <div className="text-sm text-gray-600">Available in application</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                    <CardDescription>When our support team is available</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Monday - Friday</span>
                      <span className="text-sm">9:00 AM - 5:00 PM GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Saturday</span>
                      <span className="text-sm">10:00 AM - 2:00 PM GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Sunday</span>
                      <span className="text-sm">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Emergency Support</span>
                      <span className="text-sm">24/7 Available</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>Can't find what you're looking for? Send us a message</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Contact form would be implemented here</p>
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}