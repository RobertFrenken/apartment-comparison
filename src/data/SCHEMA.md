# Apartment Data Schema

Each apartment object in `apartments.json` follows this structure.

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (typically the FF listing number) |
| `name` | string | Short display name for the listing |
| `platform` | string | Source platform (e.g. "FurnishedFinder") |
| `listing_id` | string | Platform-specific listing ID |
| `url` | string | Direct link to listing (may require login) |
| `added_date` | string | ISO date when added to tracker |
| `status` | string | "active", "contacted", "rejected", etc. |
| `photos_url` | string\|null | URL or local path to listing photos |
| `notes` | string | Free-text notes, red flags, highlights |

## Sections

### `financials`
| Field | Type | Description |
|-------|------|-------------|
| `monthly_rent` | number | Base monthly rent in USD |
| `utilities_included` | boolean | Whether all utilities are included |
| `est_monthly_utilities` | number | Estimated monthly utilities if not included |
| `security_deposit` | number | Security deposit amount |
| `application_fee` | number | Application fee (0 if none) |
| `cleaning_fee` | number | One-time cleaning fee |

### `space`
| Field | Type | Description |
|-------|------|-------------|
| `sqft` | number | Total square footage |
| `bedrooms` | number | Number of bedrooms |
| `bedroom_details` | string[] | Bed type per room (e.g. "King Bed") |
| `bathrooms` | number | Number of bathrooms |
| `bathroom_details` | string[] | Bath type per room |
| `parking` | string | Parking description |
| `outdoor_space` | string\|null | Yard, patio, etc. |
| `pool` | boolean | Has pool access |

### `appliances`
| Field | Type | Description |
|-------|------|-------------|
| `dishwasher` | boolean | Has dishwasher |
| `microwave` | boolean | Has microwave |
| `fridge` | boolean | Has fridge |
| `stovetop` | boolean | Has stovetop/oven |
| `washer_dryer` | string\|false | "In-unit", "Shared", or false |
| `fireplace` | boolean | Has fireplace |
| `water_softener` | boolean | Has water softener/RO |

### `amenities`
| Field | Type | Description |
|-------|------|-------------|
| `ac` | string\|false | A/C type ("Central", "Window Unit") or false |
| `heating` | boolean | Has heating |
| `internet` | string\|null\|false | "Included", null (unknown), or false |
| `tv` | string\|boolean | TV description or boolean |
| `storage` | boolean\|null | Has storage space |
| `wheelchair_accessible` | boolean\|null | Wheelchair accessible |
| `near_transit` | boolean\|null | Near public transit |
| `community_amenities` | string[] | Community features (Pool, Tennis, etc.) |

### `rules`
| Field | Type | Description |
|-------|------|-------------|
| `pets_allowed` | boolean | Pets allowed |
| `smoking` | boolean | Smoking allowed |
| `max_occupancy` | number\|null | Max occupants |
| `max_vehicles` | number\|null | Max vehicles |

### `location`
| Field | Type | Description |
|-------|------|-------------|
| `city` | string | City name |
| `state` | string | State code |
| `zip` | string | ZIP code |
| `neighborhood` | string | Neighborhood description |
| `lat` | number\|null | Latitude |
| `lng` | number\|null | Longitude |
| `dist_llnl_miles` | number | Driving distance to LLNL (miles) |
| `drive_time_llnl_min` | number | Drive time to LLNL (minutes) |
| `nearest_grocery` | object[] | `{name, address, dist_miles}` |
| `nearest_hospital` | object\|null | `{name, dist_miles}` |

### `lease`
| Field | Type | Description |
|-------|------|-------------|
| `contract_type` | string | Lease type description |
| `min_stay_days` | number | Minimum stay in days |
| `available_from` | string | ISO date of availability start |
| `available_until` | string | ISO date of availability end |

### `landlord`
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Landlord display name |
| `location` | string | Landlord location |
| `tenure_months` | number | Months on platform |
| `verifications` | string[] | Verification types |
| `reviews` | number | Review count |

### `remote_work`
| Field | Type | Description |
|-------|------|-------------|
| `wifi_included` | boolean\|null | WiFi included in rent |
| `quiet_environment` | boolean | Quiet neighborhood |
| `dedicated_workspace` | boolean | Has desk/workspace |
| `score` | number | 1-5 self-assessed remote work score |

### `commute`
| Field | Type | Description |
|-------|------|-------------|
| `one_way_miles` | number | One-way commute to LLNL |
| `est_monthly_gas` | number | Estimated monthly gas cost |
| `methods` | string[] | Available commute methods |

## Conventions

- Boolean fields: `true`/`false`
- Unknown values: `null`
- String-or-boolean fields (like `internet`): `null` = unknown, `false` = not available, string = description
- Gas estimate formula: `one_way_miles * 2 * 22 workdays * $0.21/mile`
