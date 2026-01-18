import asyncio
from playwright.async_api import async_playwright
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
    library_id = library_id.lower()

    search_url = (
        f"https://{library_id}.bibliocommons.com/v2/search"
        f"?query={isbn}&searchType=smart"
    )

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # ISBN → record ID
        await page.goto(search_url)
        await page.wait_for_selector('a[href*="/v2/record/S"]', timeout=10000)

        href = await page.locator(
            'a[href*="/v2/record/S"]'
        ).first.get_attribute("href")

        record_id = href.split("/")[-1]

        # Record page
        record_url = f"https://{library_id}.bibliocommons.com/v2/record/{record_id}"
        await page.goto(record_url)

        # Summary availability
        await page.wait_for_selector("div.cp-circulation-info", timeout=10000)
        summary_html = await page.locator(
            "div.cp-circulation-info"
        ).inner_html()

        summary = parse_summary(summary_html)

        # Trigger lazy-loaded availability table
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1500)

        toggle = page.locator(
            'button:has-text("Check availability"), button:has-text("Availability")'
        )
        if await toggle.count() > 0:
            await toggle.first.click()
            await page.wait_for_timeout(1500)

        await page.wait_for_selector(
            "div.cp-item-availability-table",
            state="attached",
            timeout=8000
        )

        table_html = await page.locator(
            "div.cp-item-availability-table"
        ).inner_html()

        await browser.close()

    available_locations = parse_available_locations(table_html)

    return {
        "library": library_id.upper(),
        "isbn": isbn,
        "record_id": record_id,
        "is_available": len(available_locations) > 0,
        "available_locations": available_locations,
        "holds": summary["holds"],
        "copies": summary["copies"],
        "on_order": summary["on_order"],
    }


# ----------------------------
# Runner
# ----------------------------

async def main():
    result = await get_book_status(
        library_id="vpl",
        isbn="9780358434733"
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
