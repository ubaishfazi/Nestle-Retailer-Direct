# Product Selection Feature Implementation

## Summary
Implemented a new "Product Selection" question type for surveys that allows administrators to create questions with radio button options for selecting products from the Nestle system.

## Changes Made

### 1. Database Models
- **File**: `database/migrations/2026_04_29_000001_create_survey_questions_table.php`
  - Added `product_selection` to `question_type` enum
- **File**: `database/migrations/2026_04_30_214251_add_product_selection_to_surveys.php`
  - New migration (no schema changes needed - uses existing `options` JSON field)

### 2. Product Seeder
- **File**: `database/seeders/ProductSeeder.php`
  - Seed data contains 5 Nestlé products:
    - Nestlé Milo 180ml
    - Nestlé KitKat 45g
    - Nestlé Nestomolt 400g
    - Maggi 70g
    - Nescafe Classic 100g

### 3. Survey Controller
- **File**: `app/Http/Controllers/SurveyController.php`
  - Updated validation rules to include `product_selection` and `product_id`
  - Store method: Save `product_ids` in `options` field for product_selection questions
  - Update method: Handle product_ids in options for updates
  - SubmitResponse method: Accept `product_id` in answers and store in `answer_value`
  - ShowSurvey method: Load product data for product_selection questions

### 4. Survey Model
- **File**: `app/Models/SurveyQuestion.php`
  - No changes needed - already has `options` JSON field

### 5. Survey Answer Model
- **File**: `app/Models/SurveyAnswer.php`
  - No changes needed - already has `answer_value` array field

### 6. Admin Survey Create Page
- **File**: `resources/js/pages/admin/surveys/create.tsx`
  - Added `product_selection` to question type enum
  - Added product selection UI with checkboxes for multi-select
  - Fetches products from API
  - Saves `product_ids` array in question options

### 7. Admin Survey Edit Page
- **File**: `resources/js/pages/admin/surveys/edit.tsx`
  - Added `product_selection` to question type enum
  - Added product selection UI with checkboxes
  - Pre-selects existing products when editing

### 8. Retailer Survey Answer Page
- **File**: `resources/js/pages/retailer/survey/answer.tsx`
  - Added `product_selection` to question type enum
  - Added `products` array to Question interface
  - Implemented radio button UI for product selection
  - Shows product name and price for each option
  - Submits `product_id` for product_selection questions

## Question Types Supported

1. **text** - Short text input
2. **textarea** - Long text input
3. **product_suggestion** - Text input for suggesting products
4. **product_selection** - Radio buttons for selecting from existing products

## How It Works

### Admin Creates Survey
1. Admin selects "Product Selection (Radio Buttons)" as question type
2. Admin chooses products from the product list (checkboxes)
3. Selected product IDs are stored in the question's `options` field as JSON

### Retailer Answers Survey
1. Retailer sees radio buttons for each selected product
2. Each option shows product name and price
3. Retailer selects one product
4. The selected product_id is stored in `answer_value` field

### Admin Views Responses
1. Admin can see which product was selected
2. Product information is displayed in survey responses

## Data Flow

**Storage**:
- Question options: `survey_questions.options` JSON field stores `{product_ids: [1, 5, 8]}`
- Answer value: `survey_answers.answer_value` JSON field stores `{product_id: 5}`

**API**:
- POST `/survey/{id}/submit` accepts `product_id` in answers
- GET `/survey/{id}` returns product data for product_selection questions

## UI/UX Features

- Clean radio button design with product cards
- Hover states for better interactivity
- Visual feedback for selected product
- Product prices displayed in brand color (#00447C)
- Multi-select checkbox grid for admin product selection
- Shows count of selected products
- Warning when no products selected

## Testing

- All migrations run successfully
- Type checking passes (no errors in new code)
- Build succeeds
- Pre-existing lint/type errors are unrelated to new changes

## Security Considerations

- Validates `product_id` exists in products table
- Uses Laravel's validation system
- Checks question type before processing product_id
- CSRF protection included

## Future Enhancements

- Could add product images in radio button options
- Could add product search/filter for admin selection
- Could allow selecting multiple products (checkboxes vs radio)
- Could add stock level display for each product
