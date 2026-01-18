import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup

AVAILABLE_STATUSES = {
    "AVAILABLE",
    "IN",
    "RETURNED TODAY",
}

# ----------------------------
# Parsers
# ----------------------------

def parse_summary(html: str):
    soup = BeautifulSoup(html, "html.parser")

    def extract_int(selector):
        el = soup.select_one(selector)
        return int(el.get_text(strip=True)) if el else 0

    status_el = soup.select_one(".cp-availability-status")
    status_text = status_el.get_text(strip=True) if status_el else ""

    return {
        "status_text": status_text,
        "copies": extract_int(".total-copies-count .circulation-count"),
        "on_order": extract_int(".on-order-count .circulation-count"),
        "holds": extract_int(".on-hold-count .circulation-count"),
    }


def parse_available_locations(html: str):
    soup = BeautifulSoup(html, "html.parser")

    table = soup.select_one("table.cp-table")
    if not table:
        return []

    rows = table.select("tbody tr.cp-table-row")
    locations = []

    for row in rows:
        cells = row.select("td.cp-table-cell")
        if len(cells) < 4:
            continue

        def clean(cell):
            for label in cell.select("span.table-cell__label"):
                label.decompose()
            return cell.get_text(strip=True)

        location = clean(cells[0])
        status = clean(cells[3]).upper()

        if status in AVAILABLE_STATUSES:
            locations.append(location)

    # Deduplicate while preserving order
    seen = set()
    return [l for l in locations if not (l in seen or seen.add(l))]


# ----------------------------
# Main pipeline
# ----------------------------

async def get_book_status(library_id: str, isbn: str):
    """
    Get book availability status from bibliocommons.
    Returns quickly if book not found (within 3-4 seconds).
    """
    library_id = library_id.lower()

    search_url = (
        f"https://{library_id}.bibliocommons.com/v2/search"
        f"?query={isbn}&searchType=smart"
    )

    print(f"[{library_id.upper()}] Searching for ISBN {isbn}")

    browser = None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Go to search page
            await page.goto(search_url, wait_until="domcontentloaded")

            # Race: wait for either results OR no-results indicator
            # This makes "not found" fail fast instead of waiting for timeout
            try:
                result_selector = 'a[href*="/v2/record/S"]'
                no_result_selectors = [
                    'text="did not match"',
                    'text="No results"',
                    'text="0 results"',
                    '.search-no-results',
                    '[data-testid="searchNoResults"]'
                ]

                # Wait for page to settle a bit
                await page.wait_for_timeout(1000)

                # Check for no results first (fast path)
                for selector in no_result_selectors:
                    try:
                        if await page.locator(selector).count() > 0:
                            print(f"[{library_id.upper()}] No results found for ISBN {isbn}")
                            await browser.close()
                            return {
                                "library": library_id.upper(),
                                "isbn": isbn,
                                "record_id": None,
                                "is_available": False,
                                "available_locations": [],
                                "holds": 0,
                                "copies": 0,
                                "on_order": 0,
                                "status_text": "Not in catalog",
                                "not_found": True,
                            }
                    except:
                        pass

                # Check for results
                result_link = page.locator(result_selector)

                # Short timeout - if results exist, they should appear quickly
                await result_link.first.wait_for(timeout=5000)

                href = await result_link.first.get_attribute("href")
                if not href:
                    raise Exception("No href found")

            except PlaywrightTimeout:
                print(f"[{library_id.upper()}] Timeout waiting for search results - book likely not in catalog")
                await browser.close()
                return {
                    "library": library_id.upper(),
                    "isbn": isbn,
                    "record_id": None,
                    "is_available": False,
                    "available_locations": [],
                    "holds": 0,
                    "copies": 0,
                    "on_order": 0,
                    "status_text": "Not in catalog",
                    "not_found": True,
                }

            record_id = href.split("/")[-1]
            print(f"[{library_id.upper()}] Found record: {record_id}")

            # Record page
            record_url = f"https://{library_id}.bibliocommons.com/v2/record/{record_id}"
            await page.goto(record_url, wait_until="domcontentloaded")

            # Summary availability
            try:
                await page.wait_for_selector("div.cp-circulation-info", timeout=8000)
                summary_html = await page.locator("div.cp-circulation-info").inner_html()
                summary = parse_summary(summary_html)
            except PlaywrightTimeout:
                print(f"[{library_id.upper()}] Timeout getting circulation info")
                summary = {"status_text": "", "copies": 0, "on_order": 0, "holds": 0}

            # Trigger lazy-loaded availability table
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(1000)

            toggle = page.locator(
                'button:has-text("Check availability"), button:has-text("Availability")'
            )
            if await toggle.count() > 0:
                await toggle.first.click()
                await page.wait_for_timeout(1000)

            # Get availability table
            available_locations = []
            try:
                await page.wait_for_selector(
                    "div.cp-item-availability-table",
                    state="attached",
                    timeout=5000
                )
                table_html = await page.locator("div.cp-item-availability-table").inner_html()
                available_locations = parse_available_locations(table_html)
            except PlaywrightTimeout:
                print(f"[{library_id.upper()}] Timeout getting availability table")

            await browser.close()

            result = {
                "library": library_id.upper(),
                "isbn": isbn,
                "record_id": record_id,
                "is_available": len(available_locations) > 0 or summary["copies"] > 0,
                "available_locations": available_locations,
                "holds": summary["holds"],
                "copies": summary["copies"],
                "on_order": summary["on_order"],
                "status_text": summary.get("status_text", ""),
            }
            print(f"[{library_id.upper()}] Result: {result['copies']} copies, {len(available_locations)} available locations")
            return result

    except Exception as e:
        print(f"[{library_id.upper()}] Error: {e}")
        if browser:
            try:
                await browser.close()
            except:
                pass
        raise


# ----------------------------
# Runner
# ----------------------------

async def main():
    result = await get_book_status(
        library_id="vpl",
        isbn="9780747532743"  # Harry Potter
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
