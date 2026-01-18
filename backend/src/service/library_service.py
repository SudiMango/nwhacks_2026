import asyncio
from typing import List, Dict, Optional
from ..util.get_book_status import get_book_status
from ..util.find_libraries import find_libraries_near, match_library_system
import time
import math
import re

# Fallback static library data (used if Overpass API fails)
FALLBACK_LIBRARIES = [
    {
        "id": "1",
        "name": "Vancouver Public Library - Central",
        "library_id": "vpl",
        "latitude": 49.2799,
        "longitude": -123.1156,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["central library", "central", "vancouver public library"],
    },
    {
        "id": "2",
        "name": "UBC Library",
        "library_id": None,  # Not on bibliocommons
        "latitude": 49.2677,
        "longitude": -123.2527,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": [],
    },
    {
        "id": "3",
        "name": "Kitsilano Library",
        "library_id": "vpl",
        "latitude": 49.2656,
        "longitude": -123.1614,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["kitsilano", "kits", "kitsilano branch"],
    },
    {
        "id": "4",
        "name": "Mount Pleasant Library",
        "library_id": "vpl",
        "latitude": 49.2642,
        "longitude": -123.1007,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["mount pleasant", "mt pleasant", "mount pleasant branch"],
    },
    {
        "id": "5",
        "name": "Dunbar Library",
        "library_id": "vpl",
        "latitude": 49.2444,
        "longitude": -123.1858,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["dunbar", "dunbar branch"],
    },
    {
        "id": "6",
        "name": "Kerrisdale Library",
        "library_id": "vpl",
        "latitude": 49.2333,
        "longitude": -123.1558,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["kerrisdale", "kerrisdale branch"],
    },
    {
        "id": "7",
        "name": "Joe Fortes Library",
        "library_id": "vpl",
        "latitude": 49.2859,
        "longitude": -123.1305,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["joe fortes", "joe fortes branch", "west end"],
    },
    {
        "id": "8",
        "name": "Renfrew Library",
        "library_id": "vpl",
        "latitude": 49.2489,
        "longitude": -123.0436,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["renfrew", "renfrew branch"],
    },
    {
        "id": "9",
        "name": "South Hill Library",
        "library_id": "vpl",
        "latitude": 49.2384,
        "longitude": -123.0992,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["south hill", "south hill branch"],
    },
    {
        "id": "10",
        "name": "Terry Salman Library",
        "library_id": "vpl",
        "latitude": 49.2095,
        "longitude": -123.1344,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["terry salman", "terry salman branch", "marpole"],
    },
    {
        "id": "11",
        "name": "Hastings Library",
        "library_id": "vpl",
        "latitude": 49.2812,
        "longitude": -123.0644,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["hastings", "hastings branch"],
    },
    {
        "id": "12",
        "name": "Kensington Library",
        "library_id": "vpl",
        "latitude": 49.2388,
        "longitude": -123.0755,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["kensington", "kensington branch", "cedar cottage"],
    },
    {
        "id": "13",
        "name": "Collingwood Library",
        "library_id": "vpl",
        "latitude": 49.2336,
        "longitude": -123.0336,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["collingwood", "collingwood branch"],
    },
    {
        "id": "14",
        "name": "Firehall Library",
        "library_id": "vpl",
        "latitude": 49.2825,
        "longitude": -123.0988,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["firehall", "firehall branch"],
    },
    {
        "id": "15",
        "name": "Fraserview Library",
        "library_id": "vpl",
        "latitude": 49.2175,
        "longitude": -123.0655,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["fraserview", "fraserview branch"],
    },
    {
        "id": "16",
        "name": "Oakridge Library",
        "library_id": "vpl",
        "latitude": 49.2268,
        "longitude": -123.1167,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["oakridge", "oakridge branch"],
    },
    {
        "id": "17",
        "name": "Riley Park Library",
        "library_id": "vpl",
        "latitude": 49.2439,
        "longitude": -123.1015,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["riley park", "riley park branch", "hillcrest"],
    },
    {
        "id": "18",
        "name": "Strathcona Library",
        "library_id": "vpl",
        "latitude": 49.2757,
        "longitude": -123.0866,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["strathcona", "strathcona branch"],
    },
    {
        "id": "19",
        "name": "West Point Grey Library",
        "library_id": "vpl",
        "latitude": 49.2673,
        "longitude": -123.2027,
        "type": "library",
        "city": "vancouver",
        "region": "greater_vancouver",
        "branch_aliases": ["west point grey", "west point grey branch", "point grey"],
    },
    {
        "id": "r1",
        "name": "Richmond Public Library - Brighouse",
        "library_id": "rpl",
        "latitude": 49.1666,
        "longitude": -123.1336,
        "type": "library",
        "city": "richmond",
        "region": "greater_vancouver",
        "branch_aliases": ["brighouse", "brighouse branch", "richmond brighouse"],
    },
    {
        "id": "r2",
        "name": "Ironwood Library",
        "library_id": "rpl",
        "latitude": 49.1283,
        "longitude": -123.1156,
        "type": "library",
        "city": "richmond",
        "region": "greater_vancouver",
        "branch_aliases": ["ironwood", "ironwood branch"],
    },
    {
        "id": "r3",
        "name": "Steveston Library",
        "library_id": "rpl",
        "latitude": 49.1258,
        "longitude": -123.1822,
        "type": "library",
        "city": "richmond",
        "region": "greater_vancouver",
        "branch_aliases": ["steveston", "steveston branch"],
    },
    {
        "id": "b1",
        "name": "Metrotown Library",
        "library_id": "bpl",
        "latitude": 49.2276,
        "longitude": -123.0025,
        "type": "library",
        "city": "burnaby",
        "region": "greater_vancouver",
        "branch_aliases": ["metrotown", "bob prittie metrotown", "bob prittie"],
    },
    {
        "id": "b2",
        "name": "Tommy Douglas Library",
        "library_id": "bpl",
        "latitude": 49.2482,
        "longitude": -123.0205,
        "type": "library",
        "city": "burnaby",
        "region": "greater_vancouver",
        "branch_aliases": ["tommy douglas", "tommy douglas branch"],
    },
    {
        "id": "b3",
        "name": "McGill Library",
        "library_id": "bpl",
        "latitude": 49.2516,
        "longitude": -122.9847,
        "type": "library",
        "city": "burnaby",
        "region": "greater_vancouver",
        "branch_aliases": ["mcgill", "mcgill branch"],
    },
]


def normalize_branch_name(name: str) -> str:
    """Normalize a branch name for comparison"""
    # Lowercase, remove extra spaces
    name = name.lower().strip()
    name = re.sub(r'\s+', ' ', name)
    # Remove common suffixes like "Branch Library", "Branch", "Library"
    name = re.sub(r'\s*(branch\s+library|branch|library)\s*$', '', name)
    return name.strip()


def branch_matches(library: Dict, available_locations: List[str]) -> bool:
    """Check if any available location matches this library branch"""
    if not available_locations:
        return False

    normalized_available = [normalize_branch_name(loc) for loc in available_locations]

    # Get different name variations to check
    names_to_check = []

    # Full library name
    names_to_check.append(library["name"])

    # Branch name (extracted from full name)
    if "branch_name" in library:
        names_to_check.append(library["branch_name"])

    # Static aliases if available
    for alias in library.get("branch_aliases", []):
        names_to_check.append(alias)

    # Check each name variation
    for name in names_to_check:
        normalized_name = normalize_branch_name(name)
        if not normalized_name:
            continue

        # Direct match
        if normalized_name in normalized_available:
            print(f"  [MATCH] {library['name']} matched: '{normalized_name}' in available list")
            return True

        # Partial match (one contains the other)
        for avail in normalized_available:
            if avail and (avail in normalized_name or normalized_name in avail):
                print(f"  [MATCH] {library['name']} matched: '{normalized_name}' <-> '{avail}'")
                return True

    return False


def clean_isbn(isbn: str) -> str:
    """Remove dashes and spaces from ISBN"""
    return re.sub(r'[-\s]', '', isbn)


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


async def get_nearby_libraries(latitude: float, longitude: float, max_distance_km: float = 15.0) -> List[Dict]:
    """Get libraries within max_distance_km using OpenStreetMap data"""
    print(f"Searching for libraries near ({latitude}, {longitude}) within {max_distance_km}km")

    # Try to get libraries from OpenStreetMap
    try:
        libraries = await find_libraries_near(latitude, longitude, max_distance_km)
    except Exception as e:
        print(f"Error fetching from OpenStreetMap, using fallback: {e}")
        libraries = []

    # If no libraries found, use fallback static data
    if not libraries:
        print("No libraries from OSM, using fallback data")
        libraries = []
        for lib in FALLBACK_LIBRARIES:
            distance = calculate_distance(
                latitude, longitude,
                lib["latitude"], lib["longitude"]
            )
            if distance <= max_distance_km:
                lib_copy = lib.copy()
                lib_copy["distance_km"] = round(distance, 2)
                lib_copy["branch_name"] = lib["name"].split(" - ")[-1] if " - " in lib["name"] else lib["name"]
                libraries.append(lib_copy)

    # Calculate distances for OSM results
    nearby = []
    for lib in libraries:
        if "distance_km" not in lib:
            distance = calculate_distance(
                latitude, longitude,
                lib["latitude"], lib["longitude"]
            )
            lib["distance_km"] = round(distance, 2)

        # Generate a unique ID if not present
        if "id" not in lib:
            lib["id"] = f"osm_{lib['latitude']}_{lib['longitude']}"

        nearby.append(lib)
        print(f"  + {lib['name']}: {lib['distance_km']}km ({lib.get('library_id') or 'no system'})")

    print(f"Found {len(nearby)} libraries")

    # Sort by distance
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby


async def check_book_availability(library_id: str, isbn: str) -> Optional[Dict]:
    """Check book availability at a library using bibliocommons"""
    try:
        # Clean ISBN before searching
        cleaned_isbn = clean_isbn(isbn)
        print(f"Checking availability for ISBN {cleaned_isbn} at {library_id}")
        status = await get_book_status(library_id, cleaned_isbn)
        print(f"Got status for {library_id}: {status}")
        return status
    except Exception as e:
        print(f"Error checking availability for {library_id} with ISBN {isbn}: {e}")
        return None


class LibraryService:
    async def find_book_at_libraries(
        self, isbn: str, latitude: float, longitude: float, max_distance_km: float = 12.5
    ) -> List[Dict]:
        """
        Find nearby libraries and check book availability

        Args:
            isbn: Book ISBN
            latitude: User's latitude
            longitude: User's longitude
            max_distance_km: Maximum distance to search (default: 20km)

        Returns:
            List of libraries with availability information
        """
        # Clean the ISBN
        cleaned_isbn = clean_isbn(isbn)
        print(f"Finding libraries for ISBN: {cleaned_isbn} near ({latitude}, {longitude})")

        # Get nearby libraries (now async - uses OpenStreetMap)
        nearby_libraries = await get_nearby_libraries(latitude, longitude, max_distance_km)
        print(f"Found {len(nearby_libraries)} nearby libraries")

        # Group libraries by bibliocommons library_id to avoid duplicate checks
        library_groups: Dict[str, List[Dict]] = {}
        for lib in nearby_libraries:
            if lib["library_id"]:
                if lib["library_id"] not in library_groups:
                    library_groups[lib["library_id"]] = []
                library_groups[lib["library_id"]].append(lib)

        print(f"Checking {len(library_groups)} library systems: {list(library_groups.keys())}")

        # Check availability for each unique bibliocommons library system in parallel
        availability_tasks = {
            library_id: asyncio.create_task(
                asyncio.wait_for(check_book_availability(library_id, cleaned_isbn), timeout=8.0)
            )
            for library_id in library_groups.keys()
        }

        # Wait for all availability checks concurrently
        availability_results: Dict[str, Optional[Dict]] = {}
        done, pending = await asyncio.wait(availability_tasks.values())
        for task in pending:
            task.cancel()

        for library_id, task in availability_tasks.items():
            if task in done:
                try:
                    availability_results[library_id] = task.result()
                except Exception as e:
                    print(f"Failed to get availability for {library_id}: {e}")
                    availability_results[library_id] = None
            else:
                availability_results[library_id] = None

        # Build results for each branch
        results = []
        for library_id, libraries in library_groups.items():
            availability = availability_results.get(library_id)

            for library in libraries:
                result = {
                    "id": library.get("id", f"lib_{library['latitude']}_{library['longitude']}"),
                    "name": library["name"],
                    "latitude": library["latitude"],
                    "longitude": library["longitude"],
                    "type": library.get("type", "library"),
                    "city": library.get("city", ""),
                    "distance_km": library["distance_km"],
                    "library_system": library_id.upper(),
                }

                if availability:
                    # Use the new branch_matches function for accurate matching
                    is_available_here = branch_matches(library, availability["available_locations"])

                    result.update({
                        "is_available": availability["is_available"],
                        "available_locations": availability["available_locations"],
                        "holds": availability["holds"],
                        "copies": availability["copies"],
                        "on_order": availability["on_order"],
                        "status_text": availability.get("status_text", ""),
                        "available_at_this_branch": is_available_here,
                    })
                else:
                    result.update({
                        "is_available": False,
                        "available_locations": [],
                        "holds": 0,
                        "copies": 0,
                        "on_order": 0,
                        "status_text": "Could not check availability",
                        "available_at_this_branch": False,
                        "error": True,
                    })

                results.append(result)

        # Add libraries without bibliocommons (bookstores, etc.) - no availability check
        for lib in nearby_libraries:
            if not lib.get("library_id"):
                results.append({
                    "id": lib.get("id", f"lib_{lib['latitude']}_{lib['longitude']}"),
                    "name": lib["name"],
                    "latitude": lib["latitude"],
                    "longitude": lib["longitude"],
                    "type": lib.get("type", "library"),
                    "city": lib.get("city", ""),
                    "distance_km": lib["distance_km"],
                    "library_system": None,
                    "is_available": None,  # Unknown - can't check this library
                    "available_locations": [],
                    "holds": 0,
                    "copies": 0,
                    "on_order": 0,
                    "status_text": "Not a tracked library system",
                    "available_at_this_branch": None,
                })

        # Sort by: available at this branch first, then by distance
        results.sort(key=lambda x: (
            0 if x.get("available_at_this_branch") else 1,
            x["distance_km"]
        ))

        print(f"Returning {len(results)} results")
        return results
