import httpx
import asyncio
from typing import List, Dict, Optional
import re

# Map library names to bibliocommons IDs
BIBLIOCOMMONS_SYSTEMS = {
    "vancouver public library": "vpl",
    "vpl": "vpl",
    "richmond public library": "rpl",
    "rpl": "rpl",
    "burnaby public library": "bpl",
    "bpl": "bpl",
    "surrey libraries": "spl",
    "north vancouver district public library": "nvdpl",
    "west vancouver memorial library": "wvml",
    "coquitlam public library": "coqlib",
    "new westminster public library": "nwpl",
    # Add more as needed
}


def match_library_system(name: str) -> Optional[str]:
    """Try to match a library name to a bibliocommons system ID"""
    name_lower = name.lower()

    # Direct matches
    for key, system_id in BIBLIOCOMMONS_SYSTEMS.items():
        if key in name_lower:
            return system_id

    # Check for city-based matches
    if "vancouver" in name_lower and "north" not in name_lower and "west" not in name_lower:
        return "vpl"
    if "richmond" in name_lower:
        return "rpl"
    if "burnaby" in name_lower:
        return "bpl"

    return None


OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
]


async def find_libraries_near(latitude: float, longitude: float, radius_km: float = 10.0) -> List[Dict]:
    """
    Find libraries near a location using OpenStreetMap Overpass API.
    Returns a list of libraries with name, coordinates, and matched bibliocommons system.
    """
    radius_m = int(radius_km * 1000)

    # Overpass QL query to find libraries
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="library"](around:{radius_m},{latitude},{longitude});
      way["amenity"="library"](around:{radius_m},{latitude},{longitude});
      relation["amenity"="library"](around:{radius_m},{latitude},{longitude});
    );
    out center;
    """

    data = None
    async with httpx.AsyncClient(timeout=20.0) as client:
        for endpoint in OVERPASS_ENDPOINTS:
            for attempt in range(2):  # light retry per endpoint
                try:
                    response = await client.post(endpoint, data={"data": query})
                    response.raise_for_status()
                    data = response.json()
                    break
                except Exception as e:
                    print(f"Overpass failed at {endpoint} (try {attempt + 1}): {e}")
                    await asyncio.sleep(0.5 * (attempt + 1))
            if data:
                break

    if not data:
        print("All Overpass endpoints failed")
        return []

    libraries = []
    seen_names = set()  # Avoid duplicates

    for element in data.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name", "")

        if not name or name.lower() in seen_names:
            continue
        seen_names.add(name.lower())

        # Get coordinates (for ways/relations, use center)
        if element["type"] == "node":
            lat = element["lat"]
            lon = element["lon"]
        else:
            center = element.get("center", {})
            lat = center.get("lat")
            lon = center.get("lon")
            if not lat or not lon:
                continue

        # Try to match to a bibliocommons system
        library_system = match_library_system(name)

        # Extract branch name (remove "Vancouver Public Library - " prefix, etc.)
        branch_name = name
        for prefix in ["Vancouver Public Library - ", "Richmond Public Library - ",
                       "Burnaby Public Library - ", "VPL ", "RPL ", "BPL "]:
            if branch_name.startswith(prefix):
                branch_name = branch_name[len(prefix):]
                break

        libraries.append({
            "name": name,
            "branch_name": branch_name,
            "latitude": lat,
            "longitude": lon,
            "library_id": library_system,
            "type": "library",
            "address": tags.get("addr:street", ""),
            "city": tags.get("addr:city", ""),
        })

    print(f"Found {len(libraries)} libraries from OpenStreetMap")
    for lib in libraries:
        print(f"  - {lib['name']} ({lib['library_id'] or 'no system matched'})")

    return libraries


async def main():
    # Test with Vancouver downtown
    libraries = await find_libraries_near(49.2827, -123.1207, 15)
    for lib in libraries:
        print(f"{lib['name']}: {lib['latitude']}, {lib['longitude']} -> {lib['library_id']}")


if __name__ == "__main__":
    asyncio.run(main())
