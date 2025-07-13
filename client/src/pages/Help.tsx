import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, MessageCircle, Book, Phone, Mail, Video, FileText } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Help() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      question: "How do I add a new resident to the system?",
      answer: "Navigate to the Resident Intake form from the dashboard Quick Actions, or go to Support Services > Residents > Add Resident. Fill in the required information and submit the form."
    },
    {
      question: "What should I do in a crisis situation?",
      answer: "Use the Crisis Connect feature immediately. Go to Crisis Connect in the sidebar, select the crisis type, provide location details, and initiate the emergency response system."
    },
    {
      question: "How do I generate financial reports?",
      answer: "Go to Financials > Reports tab. Select the type of report you need (Monthly, Budget vs Actual, etc.) and click Generate Report. Reports can be exported as PDF or Excel."
    },
    {
      question: "How do I track a resident's progress?",
      answer: "Use the Independence Pathway section to view and update progress tracking. You can also use the Progress Tracking form to record new achievements and milestones."
    },
    {
      question: "What are the different user roles and permissions?",
      answer: "There are four main roles: Administrator (full access), Manager (most features), Support Worker (day-to-day operations), and Viewer (read-only access)."
    }
  ];

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "24/7",
      action: "Start Chat"
    },
    {
      title: "Phone Support",
      description: "Speak directly with a support specialist",
      icon: Phone,
      availability: "Mon-Fri 8am-6pm",
      action: "Call Now"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions via email",
      icon: Mail,
      availability: "Response within 24hrs",
      action: "Send Email"
    },
    {
      title: "Video Training",
      description: "Watch step-by-step video tutorials",
      icon: Video,
      availability: "Available anytime",
      action: "Watch Videos"
    }
  ];

  const resources = [
    {
      title: "User Guide",
      description: "Comprehensive guide covering all features",
      type: "PDF",
      size: "2.3 MB"
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      type: "Web",
      size: "Online"
    },
    {
      title: "Training Materials",
      description: "Staff training presentations and materials",
      type: "ZIP",
      size: "15.2 MB"
    },
    {
      title: "Policy Templates",
      description: "Sample policies and procedures",
      type: "DOCX",
      size: "1.8 MB"
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground mt-2">
              Get help, find resources, and contact support
            </p>
          </div>

          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Search FAQ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search frequently asked questions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQ.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {supportChannels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <Card key={channel.title}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {channel.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {channel.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{channel.availability}</Badge>
                          <Button>{channel.action}</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Status</span>
                      <Badge variant="default" className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <Badge variant="default" className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Backup Services</span>
                      <Badge variant="default" className="bg-green-600">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crisis Connect</span>
                      <Badge variant="default" className="bg-green-600">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Documentation & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {resources.map((resource) => (
                      <div key={resource.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{resource.title}</h3>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{resource.type}</Badge>
                          <span className="text-sm text-muted-foreground">{resource.size}</span>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-sm bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <p className="text-sm">Complete your profile setup in Settings</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <p className="text-sm">Add your first property using the Property Registration form</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <p className="text-sm">Register residents using the Resident Intake form</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <p className="text-sm">Explore the dashboard and familiarize yourself with the navigation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="your.email@example.com" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="Brief description of your issue" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea placeholder="Provide detailed information about your issue or question..." className="min-h-[120px]" />
                    </div>
                    
                    <Button className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Emergency</span>
                      <span className="text-sm font-mono">+44 800 123 4567</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crisis Support</span>
                      <span className="text-sm font-mono">+44 800 765 4321</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">General Support</span>
                      <span className="text-sm font-mono">support@yuthub.com</span>
                    </div>
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