import { queryClient } from "./queryClient";

// Cross-module data integration utilities
export class DataIntegration {
  
  // Invalidate related query keys when data changes
  static invalidateRelatedQueries(entityType: string, entityId?: number) {
    const relatedKeys = this.getRelatedQueryKeys(entityType, entityId);
    relatedKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }

  // Get all related query keys for cross-module updates
  static getRelatedQueryKeys(entityType: string, entityId?: number): string[][] {
    const keys: string[][] = [];

    switch (entityType) {
      case 'resident':
        keys.push(
          ['/api/residents'],
          ['/api/residents/at-risk'],
          ['/api/support-plans'],
          ['/api/progress-tracking'],
          ['/api/incidents'],
          ['/api/dashboard/metrics'],
          ['/api/activities'],
          ['/api/billing-periods'],
          ['/api/invoices']
        );
        if (entityId) {
          keys.push(
            ['/api/residents', entityId],
            ['/api/support-plans', { residentId: entityId }],
            ['/api/progress-tracking', { residentId: entityId }],
            ['/api/billing-periods', { residentId: entityId }]
          );
        }
        break;

      case 'property':
        keys.push(
          ['/api/properties'],
          ['/api/residents'],
          ['/api/incidents'],
          ['/api/maintenance-requests'],
          ['/api/property-rooms'],
          ['/api/dashboard/metrics'],
          ['/api/activities'],
          ['/api/financial-records']
        );
        if (entityId) {
          keys.push(
            ['/api/properties', entityId],
            ['/api/residents', { propertyId: entityId }],
            ['/api/property-rooms', { propertyId: entityId }],
            ['/api/maintenance-requests', { propertyId: entityId }]
          );
        }
        break;

      case 'support-plan':
        keys.push(
          ['/api/support-plans'],
          ['/api/residents'],
          ['/api/progress-tracking'],
          ['/api/activities'],
          ['/api/dashboard/metrics']
        );
        if (entityId) {
          keys.push(['/api/support-plans', entityId]);
        }
        break;

      case 'incident':
        keys.push(
          ['/api/incidents'],
          ['/api/residents'],
          ['/api/properties'],
          ['/api/dashboard/metrics'],
          ['/api/activities'],
          ['/api/residents/at-risk']
        );
        if (entityId) {
          keys.push(['/api/incidents', entityId]);
        }
        break;

      case 'financial-record':
        keys.push(
          ['/api/financial-records'],
          ['/api/dashboard/metrics'],
          ['/api/activities'],
          ['/api/billing/analytics']
        );
        break;

      case 'invoice':
        keys.push(
          ['/api/invoices'],
          ['/api/billing/analytics'],
          ['/api/government-clients'],
          ['/api/residents'],
          ['/api/activities'],
          ['/api/dashboard/metrics']
        );
        break;

      case 'maintenance-request':
        keys.push(
          ['/api/maintenance-requests'],
          ['/api/properties'],
          ['/api/incidents'],
          ['/api/activities'],
          ['/api/dashboard/metrics']
        );
        break;

      case 'staff-member':
        keys.push(
          ['/api/staff-members'],
          ['/api/support-plans'],
          ['/api/incidents'],
          ['/api/activities'],
          ['/api/dashboard/metrics']
        );
        break;

      case 'government-client':
        keys.push(
          ['/api/government-clients'],
          ['/api/invoices'],
          ['/api/billing-periods'],
          ['/api/billing/analytics'],
          ['/api/dashboard/metrics']
        );
        break;

      case 'activity':
        keys.push(
          ['/api/activities'],
          ['/api/dashboard/metrics']
        );
        break;
    }

    return keys;
  }

  // Update dashboard metrics when any related data changes
  static async updateDashboardMetrics() {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
  }

  // Cross-module notifications for real-time updates
  static notifyModules(entityType: string, action: string, entityId?: number) {
    const event = new CustomEvent('dataIntegrationUpdate', {
      detail: { entityType, action, entityId, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }

  // Get related entities for a specific entity
  static getRelatedEntities(entityType: string, entityId: number) {
    const related: { [key: string]: any } = {};
    
    switch (entityType) {
      case 'resident':
        related.supportPlans = queryClient.getQueryData(['/api/support-plans'])?.filter(
          (plan: any) => plan.residentId === entityId
        );
        related.progressTracking = queryClient.getQueryData(['/api/progress-tracking'])?.filter(
          (progress: any) => progress.residentId === entityId
        );
        related.incidents = queryClient.getQueryData(['/api/incidents'])?.filter(
          (incident: any) => incident.residentId === entityId
        );
        related.billingPeriods = queryClient.getQueryData(['/api/billing-periods'])?.filter(
          (period: any) => period.residentId === entityId
        );
        break;

      case 'property':
        related.residents = queryClient.getQueryData(['/api/residents'])?.filter(
          (resident: any) => resident.propertyId === entityId
        );
        related.incidents = queryClient.getQueryData(['/api/incidents'])?.filter(
          (incident: any) => incident.propertyId === entityId
        );
        related.maintenanceRequests = queryClient.getQueryData(['/api/maintenance-requests'])?.filter(
          (request: any) => request.propertyId === entityId
        );
        related.rooms = queryClient.getQueryData(['/api/property-rooms'])?.filter(
          (room: any) => room.propertyId === entityId
        );
        break;

      case 'support-plan':
        const supportPlan = queryClient.getQueryData(['/api/support-plans'])?.find(
          (plan: any) => plan.id === entityId
        );
        if (supportPlan) {
          related.resident = queryClient.getQueryData(['/api/residents'])?.find(
            (resident: any) => resident.id === supportPlan.residentId
          );
          related.progressTracking = queryClient.getQueryData(['/api/progress-tracking'])?.filter(
            (progress: any) => progress.residentId === supportPlan.residentId
          );
        }
        break;
    }

    return related;
  }

  // Calculate cross-module metrics
  static calculateCrossModuleMetrics() {
    const residents = queryClient.getQueryData(['/api/residents']) || [];
    const properties = queryClient.getQueryData(['/api/properties']) || [];
    const incidents = queryClient.getQueryData(['/api/incidents']) || [];
    const supportPlans = queryClient.getQueryData(['/api/support-plans']) || [];
    const invoices = queryClient.getQueryData(['/api/invoices']) || [];
    const financialRecords = queryClient.getQueryData(['/api/financial-records']) || [];

    return {
      // Cross-module occupancy metrics
      occupancyRate: properties.length > 0 ? 
        (residents.length / properties.reduce((sum: number, p: any) => sum + p.capacity, 0)) * 100 : 0,
      
      // Cross-module risk assessment
      highRiskResidents: residents.filter((r: any) => r.riskLevel === 'high').length,
      
      // Cross-module incident rate
      incidentRate: residents.length > 0 ? incidents.length / residents.length : 0,
      
      // Cross-module support effectiveness
      activeSupportPlans: supportPlans.filter((sp: any) => sp.status === 'active').length,
      
      // Cross-module financial health
      monthlyRevenue: financialRecords
        .filter((fr: any) => fr.type === 'income' && 
          new Date(fr.date).getMonth() === new Date().getMonth())
        .reduce((sum: number, fr: any) => sum + fr.amount, 0),
      
      // Cross-module billing efficiency
      pendingInvoices: invoices.filter((inv: any) => inv.status === 'pending').length,
      
      // Cross-module outcomes
      independenceProgressAverage: residents.length > 0 ?
        residents.reduce((sum: number, r: any) => sum + r.independenceLevel, 0) / residents.length : 0
    };
  }
}

// Hook for cross-module data integration
export function useCrossModuleIntegration() {
  return {
    invalidateRelated: DataIntegration.invalidateRelatedQueries,
    notifyModules: DataIntegration.notifyModules,
    updateDashboard: DataIntegration.updateDashboardMetrics,
    getRelatedEntities: DataIntegration.getRelatedEntities,
    calculateMetrics: DataIntegration.calculateCrossModuleMetrics
  };
}