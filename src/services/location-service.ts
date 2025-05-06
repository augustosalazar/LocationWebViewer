/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Represents the raw data entry from the API.
 */
interface ApiLocationEntry {
  entry_id: string;
  data: {
    email: string;
    latitude: string; // API returns numbers as strings
    longitude: string; // API returns numbers as strings
    timestamp: string; // API returns numbers as strings
  };
}

/**
 * Represents the processed data associated with each location entry including the email and id.
 */
export interface LocationData extends Location {
  id: string;
  email: string;
}

const BASE_URL = "https://unidb.openlab.uninorte.edu.co";
const CONTRACT_KEY = "e83b7ac8-bdad-4bb8-a532-6aaa5fddefa4";
const TABLE = "locations";

async function fetchAllLocations(): Promise<LocationData[]> {
  const url = `${BASE_URL}/${CONTRACT_KEY}/data/${TABLE}/all?format=json`;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) { // Changed from response.status !== 200 to !response.ok for wider error coverage
      throw new Error(`Error fetching locations: ${response.status} ${response.statusText}`);
    }

    const decoded: { data?: ApiLocationEntry[] } = await response.json();
    const rawData = decoded.data || [];

    return rawData.map((record) => ({
      id: record.entry_id,
      email: record.data.email,
      latitude: parseFloat(record.data.latitude),
      longitude: parseFloat(record.data.longitude),
      timestamp: parseInt(record.data.timestamp, 10),
    }));
  } catch (err) {
    console.error("fetchAllLocations error:", err);
    throw err; // Re-throw to be caught by the caller
  }
}

/**
 * Asynchronously retrieves a list of unique email addresses from the data source.
 *
 * @returns A promise that resolves to an array of email strings.
 */
export async function getEmails(): Promise<string[]> {
  const allLocations = await fetchAllLocations();
  const emails = allLocations.map(location => location.email);
  return [...new Set(emails)]; // Return unique emails
}

/**
 * Asynchronously retrieves location data for a specific email.
 *
 * @param email The email for which to retrieve location data.
 * @returns A promise that resolves to an array of LocationData objects.
 */
export async function getLocationsByEmail(email: string): Promise<LocationData[]> {
  const allLocations = await fetchAllLocations();
  return allLocations.filter(location => location.email === email);
}
