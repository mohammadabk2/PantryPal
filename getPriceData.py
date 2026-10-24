from il_supermarket_scarper import ScarpingTask, ScraperFactory
import gzip
import os
import xml.etree.ElementTree as ET

# Initialize scraper task with disk output configuration
scraper = ScarpingTask(
    enabled_scrapers=[
        ScraperFactory.RAMI_LEVY.name,
        ScraperFactory.SHUFERSAL.name
    ],
)

# Structural container tags that are required to keep the XML hierarchy intact
CONTAINER_TAGS = {
    'root',
    'Items',
    'Item',
    'Prices',
    'Store',
    'ChainId',
    'SubChainId',
    'StoreId'
}

"""
This function cleans an XML file by removing all tags except those specified in the whitelist.
It also ensures that the structural container tags are preserved to maintain the XML hierarchy.
Arguments:
- file_path: Path to the XML or GZ file to be cleaned.
- tags_to_keep: A set of tag names that should be retained in the cleaned XML.
returns:
- None. The function modifies the file in place and prints the number of removed elements.
"""
def clean_xml_file_whitelist(file_path,tags_to_keep=None):
    """Parses an XML/GZ file and removes everything EXCEPT whitelisted tags and containers."""
    try:
        is_gzipped = file_path.endswith('.gz')
        open_func = gzip.open if is_gzipped else open
        
        # Parse XML
        with open_func(file_path, 'rb') as f:
            tree = ET.parse(f)
            root = tree.getroot()

        removed_count = 0

        # Recursive function to filter children
        def filter_elements(parent):
            nonlocal removed_count
            for child in list(parent):
                tag_name = child.tag.split('}')[-1]
                
                # If it's a container tag, keep it and traverse deeper inside it
                if tag_name in CONTAINER_TAGS:
                    filter_elements(child)
                # If it's a tag we explicitly want to keep, leave it alone
                elif tag_name in TAGS_TO_KEEP:
                    continue
                # Otherwise, remove it
                else:
                    parent.remove(child)
                    removed_count += 1

        filter_elements(root)

        # Save the cleaned XML back
        with open_func(file_path, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)

        print(f"Cleaned {os.path.basename(file_path)} (Whitelist mode): Stripped {removed_count} unwanted elements.")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        
# Define ONLY the tags you want to keep
TAGS_TO_KEEP = {
    'ItemCode',
    'ItemName',
    'ItemPrice',
    'UnitOfMeasure',
    'Quantity',
    # Add any other specific tags you want to retain
}

def test():
    print("Starting download...")
    scraper.start(limit=5)
    scraper.join()
    print("Done! files are in dumps")
    clean_xml_file_whitelist(file_path='dumps/RamiLevy/Price7290058140886-001-001-20261024-070003.xml',tags_to_keep=TAGS_TO_KEEP)
    # clean_xml_file_whitelist(file_path='dumps/Shufersal/Promo7290027600007-000-878-20261020-020000.xml',tags_to_keep=TAGS_TO_KEEP)
test()
