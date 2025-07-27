import { db } from '../server/db';
import { governmentClients } from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CouncilData {
  clientName: string;
  clientType: string;
  region: string;
  area: string;
  population: number;
  socialHousingUnits: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  website: string;
  paymentTerms: number;
  defaultRate: number;
  housingOfficer: string;
  partnershipStatus: string;
  joinDate: string | null;
  isActive: boolean;
}

async function populateUKCouncils() {
  try {
    console.log('🏛️  Loading UK Borough Councils data...');

    // Load the JSON data
    const dataPath = path.join(
      __dirname,
      '..',
      'data',
      'uk-borough-councils.json'
    );
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`📊 Found ${jsonData.councils.length} councils to populate`);

    // Clear existing government clients (optional - remove if you want to preserve existing data)
    await db.delete(governmentClients);
    console.log('🗑️  Cleared existing government clients');

    // Insert council data
    for (const council of jsonData.councils) {
      const councilRecord = {
        clientName: council.clientName,
        clientType: council.clientType,
        contactName: council.contactName,
        contactEmail: council.contactEmail,
        contactPhone: council.contactPhone,
        billingAddress: council.billingAddress,
        paymentTerms: council.paymentTerms,
        defaultRate: council.defaultRate.toString(),
        isActive: council.isActive,
      };

      await db.insert(governmentClients).values(councilRecord);
      console.log(`✅ Added: ${council.clientName} (${council.region})`);
    }

    console.log('🎉 Successfully populated UK Borough Councils data!');

    // Display summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`Total Councils: ${jsonData.total_councils}`);
    console.log(
      `Total Population: ${jsonData.summary_statistics.total_population.toLocaleString()}`
    );
    console.log(
      `Total Social Housing Units: ${jsonData.summary_statistics.total_social_housing_units.toLocaleString()}`
    );
    console.log(
      `Average Units per Council: ${jsonData.summary_statistics.average_units_per_council.toLocaleString()}`
    );

    console.log('\n🤝 Partnership Status:');
    console.log(
      `Active Clients: ${jsonData.summary_statistics.partnership_breakdown.active_clients}`
    );
    console.log(
      `Trial Period: ${jsonData.summary_statistics.partnership_breakdown.trial_period}`
    );
    console.log(
      `Prospective Clients: ${jsonData.summary_statistics.partnership_breakdown.prospective_clients}`
    );

    console.log('\n🗺️  Geographic Distribution:');
    Object.entries(jsonData.summary_statistics.geographic_distribution).forEach(
      ([region, count]) => {
        console.log(`${region}: ${count}`);
      }
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating UK councils:', error);
    process.exit(1);
  }
}

// Run the population script
populateUKCouncils();
