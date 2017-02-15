# Checkout
Checkout is a bespoke software system for managing items within the LCC Prototyping Lab.

## Data Structure

### Items
An item has a barcode in specified format AAA 00 / AAAA 00, items have notes and a value field, and a full transaction history.

#### Item Taxonomy: Groups
Items can be grouped to better sort through types of similar item, and also enforce an overridable limit on how many may be issued per user.

#### Item Taxonomy: Departments
Items are organised into departments to identify their location, fiscal ownership when working across departments.

### Users
A user has a barcode in the specified format 123400000000, users have a name, email and permission field, staff have permission above regular users to log in to the system.

#### User Taxonomy: Courses
Users are organised into courses, courses help identify which course a user is from, and who the key contact (course leader) is.

## Key features
- At present you can issue, return or reserve items for a user, unless:
 - The item is reserved to another user.
 - The item is marked lost or broken.
 - The loan would cause the user to exceed the permitted number of items for that items group limit.
- An email can be generated to remind a user to return items they currently have on loan.
- Items can be audited highlighting items which have been put back without returning them, or that are marked lost.
- Reports can be generated on:
 - Audits:
  - Scanned items
  - Unscanned (expected) - i.e. items that aren't on loan or lost, enables you to focus on what you are looking for.
 - All item statuses:
  - New
  - Available
  - On Loan
  - Broken
  - Lost
  - Reserved
  - All items loaned to a users of a specific course (email can be generated to key contact).
 - Label printing to user's local printer
 - Mass item generation
 - Daily live stats.

## Future plans
- Remove dependency on user/item barcode formatting
- Ad-hoc items (items without a barcode and unserialised items)
- Password protection on login / pin number?
