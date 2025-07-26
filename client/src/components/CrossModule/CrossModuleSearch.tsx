import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Building, Calendar, DollarSign, FileText, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  module: string;
  route: string;
  relevance: number;
  metadata?: any;
}

export default function CrossModuleSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch data from all modules
  const { data: residents = [] } = useQuery({ 
    queryKey: ['/api/residents'],
    queryFn: () => apiRequest('/api/residents'),
  });
  const { data: properties = [] } = useQuery({ 
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('/api/properties'),
  });
  const { data: supportPlans = [] } = useQuery({ 
    queryKey: ['/api/support-plans'],
    queryFn: () => apiRequest('/api/support-plans'),
  });
  const { data: incidents = [] } = useQuery({ 
    queryKey: ['/api/incidents'],
    queryFn: () => apiRequest('/api/incidents'),
  });
  const { data: financialRecords = [] } = useQuery({ 
    queryKey: ['/api/financial-records'],
    queryFn: () => apiRequest('/api/financial-records'),
  });
  const { data: invoices = [] } = useQuery({ 
    queryKey: ['/api/invoices'],
    queryFn: () => apiRequest('/api/invoices'),
  });

  // Combined search results from all modules
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search residents
    residents.forEach(resident => {
      const fullName = `${resident.firstName} ${resident.lastName}`;
      const relevance = calculateRelevance(fullName, term) + 
        calculateRelevance(resident.email || '', term) +
        calculateRelevance(resident.phone || '', term);
      
      if (relevance > 0) {
        results.push({
          id: `resident-${resident.id}`,
          type: 'resident',
          title: fullName,
          description: `${resident.email} • ${resident.phone}`,
          module: 'Housing',
          route: '/housing',
          relevance,
          metadata: { age: resident.age, riskLevel: resident.riskLevel }
        });
      }
    });

    // Search properties
    properties.forEach(property => {
      const relevance = calculateRelevance(property.name, term) + 
        calculateRelevance(property.address, term) +
        calculateRelevance(property.type, term);
      
      if (relevance > 0) {
        results.push({
          id: `property-${property.id}`,
          type: 'property',
          title: property.name,
          description: `${property.address} • ${property.type}`,
          module: 'Housing',
          route: '/housing',
          relevance,
          metadata: { capacity: property.capacity, occupancy: property.occupancy }
        });
      }
    });

    // Search support plans
    supportPlans.forEach(plan => {
      const resident = residents.find(r => r.id === plan.residentId);
      const residentName = resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown';
      const relevance = calculateRelevance(plan.goals, term) + 
        calculateRelevance(residentName, term);
      
      if (relevance > 0) {
        results.push({
          id: `support-plan-${plan.id}`,
          type: 'support-plan',
          title: `Support Plan - ${residentName}`,
          description: plan.goals.substring(0, 100) + '...',
          module: 'Support',
          route: '/support',
          relevance,
          metadata: { status: plan.status, keyWorker: plan.keyWorkerId }
        });
      }
    });

    // Search incidents
    incidents.forEach(incident => {
      const relevance = calculateRelevance(incident.title, term) + 
        calculateRelevance(incident.description, term) +
        calculateRelevance(incident.type, term);
      
      if (relevance > 0) {
        results.push({
          id: `incident-${incident.id}`,
          type: 'incident',
          title: incident.title,
          description: incident.description.substring(0, 100) + '...',
          module: 'Safeguarding',
          route: '/safeguarding',
          relevance,
          metadata: { severity: incident.severity, status: incident.status }
        });
      }
    });

    // Search financial records
    financialRecords.forEach(record => {
      const relevance = calculateRelevance(record.description, term) + 
        calculateRelevance(record.category, term);
      
      if (relevance > 0) {
        results.push({
          id: `financial-${record.id}`,
          type: 'financial',
          title: record.description,
          description: `${record.type} • ${record.category} • £${record.amount}`,
          module: 'Financials',
          route: '/financials',
          relevance,
          metadata: { amount: record.amount, type: record.type }
        });
      }
    });

    // Search invoices
    invoices.forEach(invoice => {
      const relevance = calculateRelevance(invoice.invoiceNumber, term) + 
        calculateRelevance(invoice.description || '', term);
      
      if (relevance > 0) {
        results.push({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: `Invoice ${invoice.invoiceNumber}`,
          description: `${invoice.description || 'Invoice'} • £${invoice.totalAmount}`,
          module: 'Billing',
          route: '/billing',
          relevance,
          metadata: { amount: invoice.totalAmount, status: invoice.status }
        });
      }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }, [searchTerm, residents, properties, supportPlans, incidents, financialRecords, invoices]);

  // Calculate relevance score
  function calculateRelevance(text: string, term: string): number {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    
    if (lowerText === lowerTerm) return 10;
    if (lowerText.startsWith(lowerTerm)) return 8;
    if (lowerText.includes(lowerTerm)) return 5;
    
    // Check for partial matches
    const words = lowerTerm.split(' ');
    let score = 0;
    words.forEach(word => {
      if (lowerText.includes(word)) score += 2;
    });
    
    return score;
  }

  // Get icon for result type
  function getResultIcon(type: string) {
    switch (type) {
      case 'resident': return User;
      case 'property': return Building;
      case 'support-plan': return FileText;
      case 'incident': return AlertTriangle;
      case 'financial': return DollarSign;
      case 'invoice': return Calendar;
      default: return FileText;
    }
  }

  // Get color for result type
  function getResultColor(type: string) {
    switch (type) {
      case 'resident': return 'bg-blue-100 text-blue-800';
      case 'property': return 'bg-green-100 text-green-800';
      case 'support-plan': return 'bg-purple-100 text-purple-800';
      case 'incident': return 'bg-red-100 text-red-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'invoice': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleNavigate = (route: string) => {
    setIsOpen(false);
    setSearchTerm('');
    window.location.href = route;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search across all modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 w-full"
        />
      </div>

      {isOpen && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <div
                    key={result.id}
                    className="block p-3 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                    onClick={() => handleNavigate(result.route)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {result.title}
                          </span>
                          <Badge className={getResultColor(result.type)}>
                            {result.module}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {result.description}
                        </p>
                        {result.metadata && (
                          <div className="flex gap-2 mt-1">
                            {Object.entries(result.metadata).slice(0, 2).map(([key, value]) => (
                              <span key={key} className="text-xs text-gray-500">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close search */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}