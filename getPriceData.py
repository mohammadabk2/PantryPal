import glob
import gzip
import os
import re
import urllib.request
import xml.etree.ElementTree as ET
from urllib.error import URLError

from il_supermarket_scarper import FileTypesFilters, ScarpingTask, ScraperFactory

from constants import (
    CONTAINER_TAGS,
    NON_FOOD_KEYWORDS,
    SHUFERSAL_URL,
    TAGS_TO_KEEP_RAMI_LEVI,
    TaGS_TO_KEEP_SHUFERSAL,
)

# Magic Values
dump_dir = "dumps/Shufersal"


# Initialize scraper task with disk output configuration
scraper = ScarpingTask(
    enabled_scrapers=[ScraperFactory.RAMI_LEVY.name],
    files_types=[FileTypesFilters.PRICE_FULL_FILE.name],
)


def download_shufersal_price_file():
    """Directly fetches, decompresses, and saves a Shufersal price file as an XML."""
    os.makedirs(dump_dir, exist_ok=True)
    print("Fetching Shufersal direct price file list...")

    url = SHUFERSAL_URL
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urllib.request.urlopen(req) as response:
            html_content = response.read().decode("utf-8")

        # Extract Azure Blob price links specifically (ignoring promos)
        pattern = r'href="(https://pricesprodpublic\.blob\.core\.windows\.net/price/Price[^"]+\.gz[^"]*)"'
        price_links = re.findall(pattern, html_content)

        if not price_links:
            print("No Shufersal price links found.")
            return None

        target_url = price_links[0].replace("&amp;", "&")

        # Determine filename and change extension from .gz to .xml
        filename = target_url.split("/")[-1].split("?")[0]
        filename = filename.removesuffix(".gz")  # Strip '.gz'
        if not filename.endswith(".xml"):
            filename += ".xml"  # Ensure it ends with '.xml'

        output_path = os.path.join(dump_dir, filename)

        print(
            f"Downloading and decompressing Shufersal price file to XML: {filename}..."
        )

        # Fetch the gzipped file content from Azure and decompress it on the fly
        with urllib.request.urlopen(target_url) as gz_response:
            compressed_data = gz_response.read()
            xml_data = gzip.decompress(compressed_data)

        # Write out the clean, uncompressed XML file
        with open(output_path, "wb") as f_out:
            f_out.write(xml_data)

        print(f"Successfully saved XML to {output_path}")
        return output_path

    except (URLError, OSError, UnicodeError, EOFError) as e:
        print(f"Error downloading Shufersal price file: {e}")
        return None


def get_latest_file(directory, prefix):
    """Dynamically finds the latest downloaded file starting with a specific prefix."""
    search_path = os.path.join(directory, f"{prefix}*")
    files = glob.glob(search_path)
    if not files:
        return None
    # Return the most recently modified file matching the pattern
    return max(files, key=os.path.getmtime)


def clean_xml_file_whitelist(file_path, tags_to_keep):
    """Parses an XML file and removes everything EXCEPT whitelisted tags and containers.
        Args:
    - file_path: Path to the XML or GZ file to be cleaned.
    - tags_to_keep: A set of tag names that should be retained in the cleaned XML.
    returns:
    - None. The function modifies the file in place and prints the number of removed elements."""
    try:
        is_gzipped = file_path.endswith(".gz")
        open_func = gzip.open if is_gzipped else open

        # Parse XML
        with open_func(file_path, "rb") as f:
            tree = ET.parse(f)
            root = tree.getroot()

        removed_count = 0

        # Recursive function to filter children
        def filter_elements(parent):
            nonlocal removed_count
            for child in list(parent):
                tag_name = child.tag.split("}")[-1]

                # If it's a container tag, keep it and traverse deeper inside it
                if tag_name in CONTAINER_TAGS:
                    filter_elements(child)
                # If it's a tag we explicitly want to keep, leave it alone
                elif tag_name in tags_to_keep:
                    continue
                # Otherwise, remove it
                else:
                    parent.remove(child)
                    removed_count += 1

        filter_elements(root)

        # Save the cleaned XML back
        with open_func(file_path, "wb") as f:
            tree.write(f, encoding="utf-8", xml_declaration=True)

        print(
            f"Cleaned {os.path.basename(file_path)} (Whitelist mode): Stripped {removed_count} unwanted elements."
        )

    except (OSError, ET.ParseError) as e:
        print(f"Error processing {file_path}: {e}")


_NON_FOOD_RE = re.compile("|".join(re.escape(k) for k in NON_FOOD_KEYWORDS))


def remove_non_food_items(file_path):
    """Removes <Item> elements whose ItemName matches a non-food keyword.

    Args:
    - file_path: Path to the XML or GZ price file. Modified in place.
    returns:
    - None. Prints the number of removed items.
    """
    try:
        is_gzipped = file_path.endswith(".gz")
        open_func = gzip.open if is_gzipped else open

        with open_func(file_path, "rb") as f:
            tree = ET.parse(f)
            root = tree.getroot()

        removed_count = 0
        total_count = 0

        for items_parent in root.iter():
            if items_parent.tag.split("}")[-1] != "Items":
                continue
            for item in list(items_parent):
                if item.tag.split("}")[-1] != "Item":
                    continue
                total_count += 1

                name = ""
                for child in item:
                    if child.tag.split("}")[-1] == "ItemName":
                        name = child.text or ""
                        break

                if _NON_FOOD_RE.search(name):
                    items_parent.remove(item)
                    removed_count += 1

        with open_func(file_path, "wb") as f:
            tree.write(f, encoding="utf-8", xml_declaration=True)

        print(
            f"Filtered {os.path.basename(file_path)}: removed {removed_count} "
            f"non-food items out of {total_count}."
        )

    except (OSError, ET.ParseError) as e:
        print(f"Error processing {file_path}: {e}")


def get_rami_levi_data():
    print("Starting download...")
    scraper.start(limit=1)
    scraper.join()
    print("Done! files are in dumps")
    print("Procesing files for rami levi...")
    # filepath_rami_levi = get_latest_file("dumps/RamiLevy", "Price")
    filepath_rami_levi = get_latest_file("dumps/RamiLevy", "PriceFull")
    clean_xml_file_whitelist(
        file_path=filepath_rami_levi, tags_to_keep=TAGS_TO_KEEP_RAMI_LEVI
    )
    remove_non_food_items(filepath_rami_levi)


def get_shufersal_data():
    print("Starting download...")
    download_shufersal_price_file()
    print("Done! files are in dumps")
    print("Procesing files for shufersal...")
    filepath_shufersal = get_latest_file(dump_dir, "Price")
    clean_xml_file_whitelist(
        file_path=filepath_shufersal, tags_to_keep=TaGS_TO_KEEP_SHUFERSAL
    )
    remove_non_food_items(filepath_shufersal)


if __name__ == "__main__":
    get_rami_levi_data()
    get_shufersal_data()
