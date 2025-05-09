
/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

/**
 * Represents the raw data entry from a location table (e.g., locations_user@example.com).
 */
interface ApiLocationRecord {
  entry_id: string;
  data: {
    email: string; // Assuming email is still present in location records
    latitude: string;
    longitude: string;
    timestamp: string;
  };
}

/**
 * Represents the processed data associated with each location entry including the email and id.
 */
export interface LocationData extends Location {
  id: string;
  email: string;
}

/**
 * Represents the raw data entry from the USER table.
 */
interface ApiUserRecord {
  entry_id: string;
  data: {
    email: string;
    // Other user-specific fields could go here if they exist in the USER table
  };
}

/**
 * Represents processed user data.
 */
export interface UserData {
  id: string;
  email: string;
}

const BASE_URL = "https://unidb.openlab.uninorte.edu.co";
const CONTRACT_KEY = "e83b7ac8-bdad-4bb8-a532-6aaa5fddefa4";

/**
 * Asynchronously retrieves a list of users from the USER table.
 *
 * @returns A promise that resolves to an array of UserData objects.
 */
export async function getUsers(): Promise<UserData[]> {
  const url = `${BASE_URL}/${CONTRACT_KEY}/data/USER/all?format=json`;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Error fetching users: ${response.status} ${response.statusText}`);
    }

    const decoded: { data?: ApiUserRecord[] } = await response.json();
    const rawData = decoded.data || [];

    return rawData.map((record) => ({
      id: record.entry_id,
      email: record.data.email,
    }));
  } catch (err) {
    console.error("getUsers error:", err);
    throw err; // Re-throw to be caught by the caller
  }
}

/**
 * Asynchronously retrieves location data for a specific email.
 * Locations are fetched from a table named 'locations_<email>'.
 *
 * @param email The email for which to retrieve location data.
 * @returns A promise that resolves to an array of LocationData objects.
 */
export async function getLocationsByEmail(email: string): Promise<LocationData[]> {
  const tableName = `locations_${email}`;
  const url = `${BASE_URL}/${CONTRACT_KEY}/data/${tableName}/all?format=json`;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Table ${tableName} not found for email ${email}. Returning empty array.`);
        return []; // Gracefully handle table not found
      }
      throw new Error(`Error fetching locations for ${email} from ${tableName}: ${response.status} ${response.statusText}`);
    }

    const decoded: { data?: ApiLocationRecord[] } = await response.json();
    const rawData = decoded.data || [];

    return rawData.map((record) => ({
      id: record.entry_id,
      email: record.data.email, // Assuming email is still present in the location record itself
      latitude: parseFloat(record.data.latitude),
      longitude: parseFloat(record.data.longitude),
      timestamp: parseInt(record.data.timestamp, 10),
    }));
  } catch (err) {
    console.error(`getLocationsByEmail error for ${email} from ${tableName}:`, err);
    throw err; // Re-throw to be caught by the caller
  }
}
