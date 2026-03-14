# Feature Proposal: Add Customer Subscription Date & Monthly Resets

This plan details the addition of a `subscription_date` field for subscribers and an automated system that resets the status of all paid customers to `unpaid` at the start of a new calendar month.

## User Review Required
> [!IMPORTANT]
> **Monthly Reset Logic Confirmation**: 
> The current plan assumes that **ALL** paid customers will automatically change to `unpaid` on the **1st day of every new calendar month**, regardless of their actual subscription date. The `subscription_date` is just recorded for reference and UI display. 
> 
> *Is this correct? Or should a customer ONLY become unpaid exactly 1 month after their specific `subscription_date`? (e.g. Subscribe on Jan 15 -> Unpaid on Feb 15).* We need clarification from the customer before proceeding.

## Proposed Changes

### Database Layer
#### [models.js](src/main/db/models.js)
- Add a new migration to ALTER the `customers` table and add `subscription_date DATE`.
- Create a new settings/metadata table (or use an existing mechanism) to store `last_reset_month` to track when the monthly reset was last executed.
- Add a startup check in `init()`: if the current month is different from `last_reset_month`, execute `UPDATE customers SET status = 'unpaid'` and update the `last_reset_month`.

---
### Repository Layer
#### [customerRepository.js](src/main/db/customerRepository.js)
- Update `addCustomer` to insert the `subscription_date`.
- Update `updateCustomer` to update the `subscription_date`.

---
### UI Layer (Frontend)
#### [index.html](src/renderer/index.html)
- Add a "تاريخ الاشتراك" (Subscription Date) `<input type="date">` to the `#add-customer-modal`.
- Add a "تاريخ الاشتراك" column to the data tables (Dashboard, Customers, and Unpaid views).

#### [customers.js](src/renderer/js/customers.js)
- Update `renderCustomerRows` to display the new `subscription_date` column in the UI table.

#### [renderer.js](src/renderer/renderer.js)
- Update the form submission logic to capture the `subscription_date` value from the input.
- Automatically default the date input to "Today's Date" when opening the generic Add Customer modal.
- Populate the date input correctly when editing a customer.

## Verification Plan

### Automated/Manual Tests
- **Create Customer**: Open the Add Customer modal, ensure the date defaults to today. Save the customer and verify it appears in the table with the correct date.
- **Edit Customer**: Edit an existing customer, change the date, save, and verify it updates.
- **Monthly Reset Trigger**: To test the monthly reset, I will manually modify the `last_reset_month` in the local SQLite database to a previous month, restart the application, and verify that all "paid" customers revert to "unpaid" automatically.
