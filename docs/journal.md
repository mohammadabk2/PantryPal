# journal to documnet progress for this project

## 13-10-26
**Who** Mohammad, Raneen

- Had a meeting to workshop ideas with the project supervisor to workshop ideas
- Chose the main features to focus on

## 20-10-26
**Who:** Raneen

- Initialized the frontend project with React + TypeScript using 
- Set up the folder structure and a basic home page; app runs locally

**Problems / decisions**
- Chose TypeScript over plain JavaScript: the app passes a lot of structured data
  (inventory items, recipes, prices) between screens and the API, and type checking
  catches mismatches early instead of at runtime. It also makes the code easier for
  both of us to work on in parallel.

## 25-10-26
**Who:** Mohammad

- Added price data collection for [Shufersal, Rami Levy]
- Parser reads the [XML] files and saves products, prices and promotions to json dict
- Collected prices for all products cleans the data to include only food items

**Problems / decisions**
- Each chain uses a different file format → wrote a separate parser per chain behind a shared interface, so adding a new chain doesn't change the rest of the code


## 29-10-26
**Who** Mohammad, Raneen

- Had a meeting to with the project supervisor to discuss next steps


## 1-11-26
**who** Raneen

- Implemented barcode scanning: the user scans a product with the camera

**Problems / decisions**
- missing

## 5-11-26
**Who:** Mohammad

- Cleaned up the project file structure
- Added translation support with i18next (react-i18next): English and Arabic for now, Hebrew will be added later

**Problems / decisions**
- Chose i18next (with react-i18next) for translations because:
  - It's the most widely used translation library for Reac.
  - Texts are kept in separate JSON files per language, so adding Hebrew means adding a new file
  - It can tell whether the current language is right-to-left (`i18next.dir()`), which we need for Arabic and Hebrew

## 8-11-26
**Who** Mohammad, Raneen

- Did market research into compotetors
- Created this Journal

## 12-11-26
**Who** Mohammad, Raneen

- Created and Merged pull requests into main
 - the frontend setup
 - Journal
 - Price Collection

## 13-11-26 - 15-11-26
**Who** Mohammad

- Cleaned project directory
- added docker for database
- Created the users, tags, weights and restrictions tables and Endpoints
- Adds basic front-end support for testing
- added Hebrew support

## 26-11-26
**Who:** raneen

- Added the `pantry_items` model with user ownership, item name, decimal quantity, unit, optional expiration date, and optional barcode
- Added an initial Alembic migration for the database schema and applied it to the local test database
- Added authenticated API endpoints to add, list, partially update, and delete pantry items
- Limited pantry item queries and changes to the logged-in user
- Adding an item with the same user, name, unit, and expiration date increases the existing quantity
- Added a basic pantry page to the frontend for listing, adding, editing, and deleting items; translated it into English, Hebrew, and Arabic

**Testing / decisions**
- Mohammad reviewed my work and assigned me the next tasks
- Verified registration, login, pantry CRUD, decimal quantities, and quantity merging through the API
- Verified a second user cannot see, update, or delete another user's pantry item
- Ran the frontend build and lint successfully

