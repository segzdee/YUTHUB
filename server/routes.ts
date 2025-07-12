import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPropertySchema, 
  insertResidentSchema, 
  insertSupportPlanSchema, 
  insertIncidentSchema,
  insertActivitySchema,
  insertFinancialRecordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Properties routes
  app.get('/api/properties', isAuthenticated, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        activityType: 'property_created',
        title: 'New property added',
        description: `Property "${property.name}" has been added to the system`,
        entityId: property.id,
        entityType: 'property',
      });
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(400).json({ message: "Failed to create property" });
    }
  });

  app.get('/api/properties/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Residents routes
  app.get('/api/residents', isAuthenticated, async (req, res) => {
    try {
      const residents = await storage.getResidents();
      res.json(residents);
    } catch (error) {
      console.error("Error fetching residents:", error);
      res.status(500).json({ message: "Failed to fetch residents" });
    }
  });

  app.post('/api/residents', isAuthenticated, async (req, res) => {
    try {
      const residentData = insertResidentSchema.parse(req.body);
      const resident = await storage.createResident(residentData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        activityType: 'placement',
        title: 'New resident placement',
        description: `${resident.firstName} ${resident.lastName} has been placed in the system`,
        entityId: resident.id,
        entityType: 'resident',
      });
      
      res.status(201).json(resident);
    } catch (error) {
      console.error("Error creating resident:", error);
      res.status(400).json({ message: "Failed to create resident" });
    }
  });

  app.get('/api/residents/at-risk', isAuthenticated, async (req, res) => {
    try {
      const riskyResidents = await storage.getRiskyResidents();
      res.json(riskyResidents);
    } catch (error) {
      console.error("Error fetching risky residents:", error);
      res.status(500).json({ message: "Failed to fetch risky residents" });
    }
  });

  // Support Plans routes
  app.get('/api/support-plans', isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getSupportPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching support plans:", error);
      res.status(500).json({ message: "Failed to fetch support plans" });
    }
  });

  app.post('/api/support-plans', isAuthenticated, async (req, res) => {
    try {
      const planData = insertSupportPlanSchema.parse(req.body);
      const plan = await storage.createSupportPlan(planData);
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        activityType: 'support_plan',
        title: 'Support plan created',
        description: 'New support plan has been created',
        entityId: plan.id,
        entityType: 'support_plan',
      });
      
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating support plan:", error);
      res.status(400).json({ message: "Failed to create support plan" });
    }
  });

  // Incidents routes
  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.post('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident({
        ...incidentData,
        reportedBy: req.user.claims.sub,
      });
      
      // Log activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        activityType: 'incident',
        title: 'Incident reported',
        description: `${incident.title} - ${incident.severity} severity`,
        entityId: incident.id,
        entityType: 'incident',
      });
      
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(400).json({ message: "Failed to create incident" });
    }
  });

  app.get('/api/incidents/active', isAuthenticated, async (req, res) => {
    try {
      const activeIncidents = await storage.getActiveIncidents();
      res.json(activeIncidents);
    } catch (error) {
      console.error("Error fetching active incidents:", error);
      res.status(500).json({ message: "Failed to fetch active incidents" });
    }
  });

  // Activities routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Financial records routes
  app.get('/api/financial-records', isAuthenticated, async (req, res) => {
    try {
      const records = await storage.getFinancialRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching financial records:", error);
      res.status(500).json({ message: "Failed to fetch financial records" });
    }
  });

  app.post('/api/financial-records', isAuthenticated, async (req, res) => {
    try {
      const recordData = insertFinancialRecordSchema.parse(req.body);
      const record = await storage.createFinancialRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating financial record:", error);
      res.status(400).json({ message: "Failed to create financial record" });
    }
  });

  // Crisis Connect endpoint
  app.post('/api/crisis-connect', isAuthenticated, async (req, res) => {
    try {
      const { type, message, location } = req.body;
      
      // Create high-severity incident for crisis situations
      const incident = await storage.createIncident({
        title: 'Crisis Connect Alert',
        description: message || 'Crisis situation reported via Crisis Connect',
        incidentType: 'safety',
        severity: 'critical',
        status: 'open',
        reportedBy: req.user.claims.sub,
        propertyId: location ? parseInt(location) : undefined,
      });

      // Log crisis activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        activityType: 'crisis',
        title: 'Crisis Connect activated',
        description: `Crisis response initiated: ${type}`,
        entityId: incident.id,
        entityType: 'incident',
      });

      res.json({ 
        success: true, 
        incidentId: incident.id,
        message: 'Crisis response initiated successfully' 
      });
    } catch (error) {
      console.error("Error handling crisis connect:", error);
      res.status(500).json({ message: "Failed to handle crisis connect" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
