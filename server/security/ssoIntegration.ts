import { Strategy as SamlStrategy } from 'passport-saml';
import { Strategy as LdapStrategy } from 'passport-ldapauth';
import passport from 'passport';
import { storage } from '../storage';
import { AuditLogger } from './authSecurity';

// SAML Configuration
export interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  cert: string;
  callbackUrl: string;
  identifierFormat?: string;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
  wantAssertionsSigned?: boolean;
  wantAuthnResponseSigned?: boolean;
}

// Active Directory / LDAP Configuration
export interface LDAPConfig {
  url: string;
  baseDN: string;
  username: string;
  password: string;
  searchBase: string;
  searchFilter: string;
  searchAttributes?: string[];
  tlsOptions?: any;
  reconnect?: boolean;
}

// SSO User mapping
export interface SSOUserMapping {
  emailField: string;
  firstNameField: string;
  lastNameField: string;
  roleField?: string;
  departmentField?: string;
  employeeIdField?: string;
  groupField?: string;
}

export class SSOIntegration {
  private static samlConfig: SAMLConfig;
  private static ldapConfig: LDAPConfig;
  private static userMapping: SSOUserMapping;

  // Initialize SAML SSO
  static initializeSAML(config: SAMLConfig, userMapping: SSOUserMapping): void {
    this.samlConfig = config;
    this.userMapping = userMapping;

    const samlStrategy = new SamlStrategy(
      {
        entryPoint: config.entryPoint,
        issuer: config.issuer,
        cert: config.cert,
        callbackUrl: config.callbackUrl,
        identifierFormat:
          config.identifierFormat ||
          'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        signatureAlgorithm: config.signatureAlgorithm || 'sha256',
        digestAlgorithm: config.digestAlgorithm || 'sha256',
        wantAssertionsSigned: config.wantAssertionsSigned ?? true,
        wantAuthnResponseSigned: config.wantAuthnResponseSigned ?? true,
      },
      async (profile: any, done: any) => {
        try {
          const user = await this.processSAMLUser(profile);

          // Log successful SSO authentication
          await AuditLogger.logAuthAttempt(user.id, true, {
            method: 'SAML_SSO',
            provider: 'SAML',
            email: user.email,
            timestamp: new Date().toISOString(),
          });

          done(null, user);
        } catch (error) {
          console.error('SAML authentication error:', error);
          done(error, null);
        }
      }
    );

    passport.use('saml', samlStrategy);
  }

  // Initialize LDAP/Active Directory SSO
  static initializeLDAP(config: LDAPConfig, userMapping: SSOUserMapping): void {
    this.ldapConfig = config;
    this.userMapping = userMapping;

    const ldapStrategy = new LdapStrategy(
      {
        server: {
          url: config.url,
          bindDN: config.username,
          bindCredentials: config.password,
          searchBase: config.searchBase,
          searchFilter: config.searchFilter,
          searchAttributes: config.searchAttributes || [
            'cn',
            'mail',
            'givenName',
            'sn',
            'memberOf',
          ],
          tlsOptions: config.tlsOptions || {},
          reconnect: config.reconnect ?? true,
        },
      },
      async (profile: any, done: any) => {
        try {
          const user = await this.processLDAPUser(profile);

          // Log successful LDAP authentication
          await AuditLogger.logAuthAttempt(user.id, true, {
            method: 'LDAP_SSO',
            provider: 'Active Directory',
            email: user.email,
            timestamp: new Date().toISOString(),
          });

          done(null, user);
        } catch (error) {
          console.error('LDAP authentication error:', error);
          done(error, null);
        }
      }
    );

    passport.use('ldapauth', ldapStrategy);
  }

  // Process SAML user profile
  private static async processSAMLUser(profile: any): Promise<any> {
    const email = profile[this.userMapping.emailField] || profile.nameID;
    const firstName = profile[this.userMapping.firstNameField] || '';
    const lastName = profile[this.userMapping.lastNameField] || '';
    const department = profile[this.userMapping.departmentField] || '';
    const employeeId = profile[this.userMapping.employeeIdField] || '';

    // Map SAML groups/roles to application roles
    const role = this.mapSSORole(
      profile[this.userMapping.roleField] ||
        profile[this.userMapping.groupField]
    );

    // Create or update user
    const user = await storage.upsertUser({
      id: email, // Use email as unique ID for SSO users
      email,
      firstName,
      lastName,
      role,
      department,
      employeeId,
      authMethod: 'SAML_SSO',
      lastLogin: new Date(),
    });

    return user;
  }

  // Process LDAP user profile
  private static async processLDAPUser(profile: any): Promise<any> {
    const email = profile[this.userMapping.emailField] || profile.mail;
    const firstName =
      profile[this.userMapping.firstNameField] || profile.givenName;
    const lastName = profile[this.userMapping.lastNameField] || profile.sn;
    const department = profile[this.userMapping.departmentField] || '';
    const employeeId = profile[this.userMapping.employeeIdField] || profile.cn;

    // Map LDAP groups to application roles
    const groups = profile.memberOf || [];
    const role = this.mapLDAPGroups(groups);

    // Create or update user
    const user = await storage.upsertUser({
      id: email, // Use email as unique ID for SSO users
      email,
      firstName,
      lastName,
      role,
      department,
      employeeId,
      authMethod: 'LDAP_SSO',
      lastLogin: new Date(),
    });

    return user;
  }

  // Map SSO role to application role
  private static mapSSORole(ssoRole: string): string {
    const roleMappings: { [key: string]: string } = {
      YUTHUB_ADMIN: 'admin',
      YUTHUB_MANAGER: 'manager',
      YUTHUB_SUPERVISOR: 'supervisor',
      YUTHUB_HOUSING_OFFICER: 'housing_officer',
      YUTHUB_SUPPORT_COORDINATOR: 'support_coordinator',
      YUTHUB_FINANCE_OFFICER: 'finance_officer',
      YUTHUB_SAFEGUARDING_OFFICER: 'safeguarding_officer',
      YUTHUB_MAINTENANCE_STAFF: 'maintenance_staff',
      YUTHUB_STAFF: 'staff',
      YUTHUB_READONLY: 'readonly',
    };

    return roleMappings[ssoRole] || 'staff';
  }

  // Map LDAP groups to application role
  private static mapLDAPGroups(groups: string[]): string {
    const groupMappings: { [key: string]: string } = {
      'CN=YUTHUB_Admins,OU=Groups,DC=company,DC=com': 'admin',
      'CN=YUTHUB_Managers,OU=Groups,DC=company,DC=com': 'manager',
      'CN=YUTHUB_Supervisors,OU=Groups,DC=company,DC=com': 'supervisor',
      'CN=YUTHUB_Housing,OU=Groups,DC=company,DC=com': 'housing_officer',
      'CN=YUTHUB_Support,OU=Groups,DC=company,DC=com': 'support_coordinator',
      'CN=YUTHUB_Finance,OU=Groups,DC=company,DC=com': 'finance_officer',
      'CN=YUTHUB_Safeguarding,OU=Groups,DC=company,DC=com':
        'safeguarding_officer',
      'CN=YUTHUB_Maintenance,OU=Groups,DC=company,DC=com': 'maintenance_staff',
      'CN=YUTHUB_Staff,OU=Groups,DC=company,DC=com': 'staff',
      'CN=YUTHUB_Readonly,OU=Groups,DC=company,DC=com': 'readonly',
    };

    // Find the highest privilege group
    for (const group of groups) {
      if (groupMappings[group]) {
        return groupMappings[group];
      }
    }

    return 'staff'; // Default role
  }

  // Get SSO metadata (for SAML)
  static getSAMLMetadata(): string {
    const samlStrategy = passport._strategy('saml') as any;
    return samlStrategy.generateServiceProviderMetadata();
  }

  // Test LDAP connection
  static async testLDAPConnection(): Promise<boolean> {
    try {
      const ldap = require('ldapjs');
      const client = ldap.createClient({
        url: this.ldapConfig.url,
        tlsOptions: this.ldapConfig.tlsOptions || {},
      });

      return new Promise((resolve, reject) => {
        client.bind(
          this.ldapConfig.username,
          this.ldapConfig.password,
          (err: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
            client.unbind();
          }
        );
      });
    } catch (error) {
      console.error('LDAP connection test failed:', error);
      return false;
    }
  }

  // Sync users from LDAP
  static async syncUsersFromLDAP(): Promise<void> {
    try {
      const ldap = require('ldapjs');
      const client = ldap.createClient({
        url: this.ldapConfig.url,
        tlsOptions: this.ldapConfig.tlsOptions || {},
      });

      client.bind(
        this.ldapConfig.username,
        this.ldapConfig.password,
        (err: any) => {
          if (err) {
            console.error('LDAP bind error:', err);
            return;
          }

          const opts = {
            filter: this.ldapConfig.searchFilter,
            scope: 'sub',
            attributes: this.ldapConfig.searchAttributes || [
              'cn',
              'mail',
              'givenName',
              'sn',
              'memberOf',
            ],
          };

          client.search(
            this.ldapConfig.searchBase,
            opts,
            (err: any, res: any) => {
              if (err) {
                console.error('LDAP search error:', err);
                return;
              }

              res.on('searchEntry', async (entry: any) => {
                try {
                  const user = await this.processLDAPUser(entry.object);
                  console.log('Synced user:', user.email);
                } catch (error) {
                  console.error('Error syncing user:', error);
                }
              });

              res.on('end', () => {
                console.log('LDAP user sync completed');
                client.unbind();
              });
            }
          );
        }
      );
    } catch (error) {
      console.error('LDAP sync error:', error);
    }
  }
}
