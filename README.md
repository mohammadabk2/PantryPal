# PantryPal
**An AI-Powered Smart Kitchen Management and Grocery Price Optimization System**
Final Year Software Engineering Project Proposal  
Project Team: Two Software Engineering Students  
Project Duration: Approximately 30 Weeks  
Project Type: Full-Stack Web Application with Artificial Intelligence and Data Integration  
 

## 1. Abstract
PantryPal is an intelligent kitchen management and grocery optimization application designed to help households manage food inventory, reduce food waste, plan meals, and make cost-effective grocery purchasing decisions.
Many households struggle to track the products they already own, remember expiration dates, decide what to cook, and compare grocery prices across different supermarkets. These challenges often lead to unnecessary purchases, food waste, and increased household expenses.
PantryPal aims to address these problems by combining smart inventory management, AI-powered recipe recommendations, personalized weekly meal planning, automatic shopping list generation, and supermarket price comparison within a single application.
The system will use machine learning to improve recipe recommendations based on user preferences, an LLM-powered chatbot for context-aware kitchen assistance, and grocery product and pricing data collected through authorized retailer APIs where available or permitted scraping and published data sources otherwise.
The final product will provide an integrated experience connecting household inventory, meal planning, and grocery shopping decisions.

## 2. Problem Statement
Households face several challenges in everyday food management:

1. Poor inventory visibility: People often forget which products they already have at home, resulting in duplicate purchases.
2. Food waste: Products expire before being consumed because users do not track their expiration dates.
3. Meal planning difficulties: Deciding what to cook every day requires time and effort, especially when trying to use existing ingredients.
4. Unnecessary grocery spending: Consumers may purchase products without comparing prices and promotions across supermarkets.
5. Disconnected solutions: Existing tools often focus on recipes, shopping lists, or price comparison separately rather than connecting these activities.
The main problem is the lack of a unified system that helps users make intelligent decisions about what to cook, what to buy, and where to buy it.

## 3. Proposed Solution
PantryPal will provide a centralized platform that supports the complete household food management process.
Users will register their available food products, track quantities and expiration dates, receive personalized recipe recommendations, and create weekly meal plans.
Based on the selected meals and existing inventory, the application will automatically identify missing ingredients and generate an optimized shopping list.
The system will then compare available grocery prices and promotions across supported Israeli supermarket branches to help users identify cost-effective purchasing options.
The application will also provide personalized waste-and-buying coaching based on recorded household activity, insights into estimated savings and food waste, and gamified progress indicators.

## 4. Project Objectives
The main objectives of PantryPal are:

- Develop an intuitive application for managing household food inventory.
- Reduce food waste through expiration tracking and ingredient-aware recommendations.
- Provide personalized recipe recommendations using machine learning and AI.
- Generate weekly meal plans based on household preferences and available ingredients.
- Automatically create shopping lists containing only missing or insufficient ingredients.
- Integrate supermarket product, pricing, and promotion data from supported Israeli retailers, preferring authorized APIs when available and permitted scraping otherwise.
- Develop an algorithm for comparing the total cost of grocery shopping baskets.
- Help users make better purchasing decisions while considering cost, quantities, and potential waste.
- Offer an LLM chatbot, a personalized waste-and-buying coach, and gamified savings and waste tracking.
- Evaluate the system's usability, recommendation quality, and price comparison accuracy.

## 5. Main System Features

### 5.1 Smart Pantry Inventory Management
Users will be able to manage their household food inventory by adding, editing, and removing products.
Each product may include:

- Product name and category
- Quantity and measurement unit
- Purchase date
- Estimated or manually entered expiration date
- Storage location, such as refrigerator, freezer, or pantry
The application will support manual entry and receipt scanning using Optical Character Recognition (OCR).
OCR results will be reviewed and corrected by the user when necessary.

### 5.2 Expiration Date Tracking
PantryPal will identify products approaching their expiration dates and display reminders.
The system will prioritize these products when recommending recipes, encouraging users to consume available food before it expires.
Expiration dates will be based on user-provided information or clearly identified estimates rather than guaranteed predictions of food safety.

### 5.3 AI-Powered Recipe Recommendation
The recommendation system will suggest recipes based on:

- Available ingredients
- Ingredients approaching expiration
- User preferences and dietary restrictions
- Previous recipe ratings and feedback
- Missing ingredient quantities
A rule-based recommendation engine will provide a reliable baseline.
Machine learning techniques, such as content-based ranking or a lightweight classification model, will personalize recommendation rankings over time.
An LLM-powered chatbot will let users ask questions about their pantry, request recipe variations, explore ingredient substitutions, and receive natural-language cooking instructions. Where authorized, the chatbot will use relevant structured household data supplied by PantryPal rather than assume an external LLM knows the user's inventory or purchasing history.
Generated recipes will be checked against structured ingredient and dietary constraints where possible.

### 5.4 Personalized Weekly Meal Planning
Users will be able to create weekly meal plans according to household size, food preferences, available ingredients, and an optional grocery budget.
The system will recommend meals that reuse existing ingredients and reduce unnecessary purchases.
The plan will use available or estimated retailer prices to prioritize meals that fit the selected budget; price-based plans will clearly indicate data limitations.
Users will also be able to modify the suggested plan manually.

### 5.5 Automatic Smart Shopping Lists
After selecting recipes or creating a weekly meal plan, PantryPal will calculate the required ingredients.
The system will compare these requirements with the household inventory and automatically generate a shopping list containing missing quantities.
For example, if a recipe requires four eggs and the user already has two, the application will add only the missing quantity.
Where supermarket package sizes differ from the required quantities, the system will account for purchasable package units. Shopping lists will be generated from the selected meal plan and adjusted to exclude ingredients already available in sufficient quantities.

### 5.6 Supermarket Price Comparison
PantryPal will follow an **API-first data collection strategy**: when a supermarket offers an accessible, authorized API for relevant product and price information, the system will use it instead of scraping. If no suitable API is available, PantryPal may use permitted scraping or published price-transparency files.
The current project includes a scraper component described as working with **Rami Levy (רמי לוי)** and **Shufersal (שופרסל)** and returning structured **JSON** with food product details, prices, and source attribution. This is a description of the reported component, not a claim of an official retailer API.
**Initial retailer scope:** Rami Levy and Shufersal; Wolt and Haat are potential future sources only if reliable, authorized access is available.
Regardless of the collection method, the system will normalize catalog and pricing information into a consistent JSON-based representation for product matching, price comparisons, meal-plan budgeting, and personalized shopping recommendations.
Data collection must respect applicable terms, permissions, technical restrictions, and law. The system will retain source identifiers, relevant branch or online channel, and retrieval timestamps where available.
The system will process retailer data containing product prices, branch information, and promotional offers.
Its capabilities will include:

- Product matching using barcodes and standardized product information
- Price comparison across supported supermarket branches
- Price-per-unit comparison
- Promotion identification and interpretation
- Shopping basket cost calculation
- Display of price data timestamps and applicable store branches
Prices and promotions may differ between physical branches and online shopping platforms.
Online price comparison will only be supported for retailers where reliable, appropriately accessible online pricing data is available.

### 5.7 Grocery Basket Optimization
The application will calculate and compare the estimated total cost of a shopping basket across supported supermarkets.
The optimization algorithm will consider:

- Product prices
- Required quantities and package sizes
- Applicable promotions
- Product availability in the imported catalog
- User-selected shopping constraints
The system may recommend the lowest-cost single-store basket or compare alternatives.
For the initial version, the comparison will focus on published product prices and eligible promotions. Delivery fees, live stock availability, and online checkout prices will only be included when reliable data is available.

### 5.8 Store Redirection
After comparing shopping options, users will be able to open the selected retailer's website or supported store page.
PantryPal will maintain its own shopping list, which users can view or copy when purchasing products.
Automatic transfer of an entire shopping basket into an external retailer's checkout system is outside the guaranteed scope of the project and would require an officially supported integration.

### 5.9 Savings, Food Waste, and Gamification Dashboard
The application will provide a dashboard with **gamification elements** (progress indicators, goals, or achievements) to encourage engagement, presenting useful household statistics, such as:

- Number of products approaching expiration
- Products marked as consumed or discarded
- Estimated value of discarded products
- Estimated savings from comparing shopping baskets
- Frequently purchased products
- Recipe recommendation feedback
- Products that repeatedly run out or spoil, and trends in household savings and waste
Savings and waste calculations will be presented as estimates based on recorded user activity and available price information.

### 5.10 Personalized Waste and Buying Coach
The coach will use the household's recorded inventory, consumption, purchases, and discarded items to detect patterns such as repeated overbuying, frequently wasted foods, and products that tend to run out. It will provide personalized, actionable suggestions to reduce waste and unnecessary spending. Unlike a standalone general-purpose AI chatbot, these recommendations rely on PantryPal's user-specific records and calculations.

## 6. System Architecture
PantryPal will use a modular architecture consisting of the following components.
**Frontend Application**
A responsive Progressive Web Application (PWA) developed using React and TypeScript.
The frontend will provide inventory management, recipe recommendations, meal planning, shopping lists, price comparison, and analytics.
**Backend API**
A backend service developed using Python and FastAPI or an equivalent framework.
The backend will manage application logic, authentication, data synchronization, recipe recommendation services, grocery price processing, and basket optimization.
**Database**
A relational database such as PostgreSQL will store user accounts, inventory data, recipes, meal plans, shopping lists, product mappings, retailer information, prices, and promotions.
IndexedDB may be used for local caching and limited offline functionality.
**AI and Recommendation Module**
This module will combine rule-based filtering, machine learning ranking, and optional LLM integration.
**Grocery Data Integration Module**
This module will prioritize accessible, authorized retailer APIs and otherwise use permitted scrapers or published files. It will ingest and validate product and price data (including JSON output from the reported Rami Levy and Shufersal scraper), normalize records, identify promotions, and update the application's price database.
**Basket Optimization Module**
This module will match shopping list items with supermarket products and calculate comparable basket costs.
The architecture will separate inventory and recipe functionality from external retailer integrations so that temporary data-source failures do not prevent users from managing their kitchens.

## 7. Technologies and Tools

| Component | Proposed Technology |
| --- | --- |
| Frontend | React, TypeScript |
| Application Type | Progressive Web App (PWA) |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Offline Storage | IndexedDB |
| Machine Learning | Python, scikit-learn |
| LLM Integration | LLM API through backend |
| Receipt OCR | Tesseract.js or OCR service |
| Grocery Data Processing | Authorized retailer APIs where available; permitted scraping, Python, JSON/XML parsing |
| Authentication | Secure session or token-based authentication |
| Deployment | Render or equivalent cloud platform |
| Version Control | Git and GitHub |
| Testing | Pytest, Vitest, Playwright |
The final technology selection may be adjusted following the initial technical feasibility study.

## 8. Artificial Intelligence and Algorithmic Components
PantryPal will include three main intelligent components.

### 8.1 Personalized Recipe Ranking
A hybrid recommendation approach will combine ingredient availability, expiration priority, and user preferences.
A machine learning model will use user feedback to improve the ranking of recommended recipes.

### 8.2 Ingredient and Product Matching
The system will normalize ingredient names, product descriptions, package sizes, and units.
Exact barcode matching will be preferred when available.
For ingredients without direct barcode matches, the system may use text similarity and category-based matching, with safeguards against comparing non-equivalent products.

### 8.3 Grocery Basket Optimization
The basket optimization algorithm will calculate total purchasing costs while considering product quantities, package sizes, and applicable promotions.
A baseline algorithm will compare the cost of purchasing the complete basket from each supported store.
More advanced optimization, such as comparing split purchases across multiple stores, may be explored if time permits.

## 9. Project Scope and Feasibility

**Core Deliverables**
The project will prioritize:

1. Smart inventory management
2. Receipt OCR with manual correction
3. Expiration tracking
4. Personalized recipe recommendations
5. Weekly meal planning
6. Automatic shopping list generation
7. API-first grocery product, price, and promotion integration for selected Israeli retailers
8. Shopping basket comparison and optimization
9. Savings, food waste, and gamification dashboard
10. LLM chatbot and personalized waste-and-buying coach

**Optional Extensions**
Depending on development progress and external data availability:

- Additional supermarket chains
- Verified online grocery price comparison
- More advanced promotion optimization
- Multi-store basket optimization
- Shared household accounts
- Additional personalization features
Direct retailer checkout integration and payment processing are not included in the core scope.

## 10. Division of Responsibilities
The project will be developed by two Software Engineering students with separate primary responsibilities and shared integration tasks.

**Student 1 — Smart Kitchen and AI**
Responsible for:

- Inventory management
- Receipt OCR
- Expiration tracking
- Recipe database and recommendation logic
- Machine learning personalization
- LLM chatbot integration
- Personalized waste-and-buying coaching
- Weekly meal planning
- Evaluation of recommendation quality

**Student 2 — Grocery Intelligence and Optimization**
Responsible for:

- Researching Israeli grocery pricing data sources
- Retailer API assessment, permitted scraper integration, and data processing
- Product normalization and matching
- Promotion interpretation
- Price comparison services
- Shopping basket optimization
- Store redirection
- Evaluation of pricing and basket calculation accuracy

**Shared Responsibilities**
Both students will collaborate on:

- Requirements analysis
- System architecture
- Database and API design
- Frontend development
- Integration testing
- Security and privacy
- Deployment
- Documentation
- Final presentation

## 11. Development Methodology and Timeline
The project will follow an iterative development methodology over approximately 30 weeks.

| Phase | Weeks | Main Deliverables |
| --- | --- | --- |
| Requirements and research | 1–3 | Requirements, feasibility analysis, initial data-source verification |
| System design | 4–6 | Architecture, database schema, API design, UI prototypes |
| Core inventory development | 7–10 | Inventory management, OCR prototype, expiration tracking |
| AI and meal planning | 11–15 | Recipe engine, ML baseline, weekly meal planning |
| Grocery data integration | 11–16 | Retailer import pipeline, product matching, promotions |
| Shopping and optimization | 17–20 | Smart shopping lists, basket cost comparison |
| Full system integration | 21–24 | Connected end-to-end user workflow |
| Testing and evaluation | 25–27 | Functional testing, usability testing, algorithm evaluation |
| Final delivery | 28–30 | Deployment, documentation, report, demonstration |
Some phases will run in parallel because the project is being developed by two students.

## 12. Testing and Evaluation
The project will be evaluated using technical and user-centered metrics.
**Functional Testing**
Verify that inventory management, meal planning, shopping list generation, and price comparison operate correctly.
**Recipe Recommendation Evaluation**
Measure recommendation relevance using metrics such as Precision@K and user feedback ratings.
**Product Matching Evaluation**
Measure the accuracy of matching ingredients and shopping list entries to supermarket catalog products.
**Price Comparison Evaluation**
Compare calculated basket totals against independently checked source records for selected products, branches, and promotions.
**Performance Testing**
Measure API response times, data import processing time, and shopping basket calculation performance.
**Usability Testing**
Conduct a small user study to evaluate ease of use, clarity, and satisfaction. A questionnaire such as the System Usability Scale (SUS) may be used.
**Food Waste and Savings Evaluation**
Measure estimated reductions in avoidable purchases and food waste through controlled scenarios or a limited user trial.
The project will distinguish between measured outcomes and estimates.

## 13. Expected Challenges and Risks

| Challenge | Proposed Mitigation |
| --- | --- |
| Inconsistent grocery data formats | Build modular parsers and validation rules |
| Missing online grocery price data | Prioritize verified physical-store pricing |
| Incorrect product matching | Use barcode matching and confidence thresholds |
| Complex promotion conditions | Support a defined set of promotion types and flag unsupported rules |
| OCR recognition errors | Provide manual correction |
| Limited user feedback for ML | Start with a rule-based baseline and use gradual personalization |
| LLM inaccuracies | Validate generated ingredient lists and constraints |
| Changing retailer data sources | Add monitoring, import logs, and fallback behavior |
| Development time constraints | Prioritize an achievable MVP and defer optional integrations |

## 14. Privacy and Security
PantryPal will follow privacy-by-design principles.
The application will collect only the data required for its functionality, protect user accounts, and use secure communication between the frontend and backend.
Sensitive user information will not be included in external LLM requests unless necessary and appropriately disclosed.
Users will be informed when external AI services are used.
The application will also support reasonable data deletion and account management functionality.

## 15. Expected Results
By the end of the project, the team expects to deliver:

- A working responsive PantryPal application
- A functional household inventory management system
- A personalized recipe recommendation engine
- A weekly meal planning module
- Automatic ingredient-based shopping lists
- A grocery price and promotion processing pipeline
- A supermarket shopping basket comparison algorithm
- A household savings, food waste, and gamification dashboard
- An LLM chatbot and personalized waste-and-buying coach
- Technical documentation and an evaluation report
The final system will demonstrate how artificial intelligence, household inventory data, and supermarket pricing information can be combined to support more efficient food management and purchasing decisions.

## 16. Innovation and Contribution
PantryPal's main innovation is the integration of kitchen management, personalized meal planning, and grocery price optimization into one intelligent workflow.
Rather than treating grocery shopping and cooking as independent tasks, the system connects them.
For example, when a user selects a weekly meal plan, PantryPal can identify the ingredients already available, calculate missing quantities, compare supermarket prices, and recommend purchasing options.
The system can also prioritize ingredients approaching expiration, reducing the risk that cost-saving promotions lead to unnecessary overbuying.
This combination provides both an engineering challenge and a practical consumer-oriented solution.

## 17. Conclusion
PantryPal aims to transform everyday household food management into a more intelligent, organized, and cost-effective process.
By combining inventory tracking, AI-based recipe recommendations, personalized meal planning, and grocery price comparison, the application will help users reduce unnecessary purchases, make better use of available ingredients, and make more informed shopping decisions.
The project offers meaningful technical challenges in full-stack development, machine learning, data integration, product matching, and optimization.
Its modular design and carefully defined scope make it suitable for a two-student final-year Software Engineering project, while allowing opportunities for future expansion.

