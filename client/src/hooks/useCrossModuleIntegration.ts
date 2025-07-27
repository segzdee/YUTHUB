import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  Resident,
  Property,
  SupportPlan,
  Incident,
  FinancialRecord,
  Invoice,
} from '@shared/schema';

export function useCrossModuleIntegration() {
  // Fetch data from all modules
  const { data: residents = [] } = useQuery<Resident[]>({
    queryKey: ['/api/residents'],
  });
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  const { data: supportPlans = [] } = useQuery<SupportPlan[]>({
    queryKey: ['/api/support-plans'],
  });
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ['/api/incidents'],
  });
  const { data: financialRecords = [] } = useQuery<FinancialRecord[]>({
    queryKey: ['/api/financial-records'],
  });
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  // Calculate cross-module metrics
  const calculateMetrics = useMemo(() => {
    return () => {
      const totalOccupancy = properties.reduce(
        (sum, prop) => sum + (prop.occupancy || 0),
        0
      );
      const totalCapacity = properties.reduce(
        (sum, prop) => sum + (prop.capacity || 0),
        0
      );
      const occupancyRate =
        totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

      const activeSupportPlans = supportPlans.filter(
        plan => plan.status === 'active'
      ).length;
      const highRiskResidents = residents.filter(
        resident => resident.riskLevel === 'high'
      ).length;
      const activeIncidents = incidents.filter(
        incident => incident.status === 'open'
      ).length;
      const pendingMaintenance = incidents.filter(
        incident =>
          incident.type === 'maintenance' && incident.status === 'pending'
      ).length;

      const totalRevenue = financialRecords.reduce(
        (sum, record) => sum + (record.amount || 0),
        0
      );
      const pendingInvoices = invoices.filter(
        invoice => invoice.status === 'pending'
      ).length;
      const overdueInvoices = invoices.filter(
        invoice => invoice.status === 'overdue'
      ).length;

      return {
        occupancyRate,
        activeSupportPlans,
        highRiskResidents,
        activeIncidents,
        pendingMaintenance,
        totalRevenue,
        pendingInvoices,
        overdueInvoices,
        totalProperties: properties.length,
        totalResidents: residents.length,
      };
    };
  }, [
    residents,
    properties,
    supportPlans,
    incidents,
    financialRecords,
    invoices,
  ]);

  return {
    residents,
    properties,
    supportPlans,
    incidents,
    financialRecords,
    invoices,
    calculateMetrics,
  };
}
