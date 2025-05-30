# Manual Testing Guide - Appointment Date Fixes

This guide outlines the steps to verify that the appointment date bug has been fixed in the production environment.

## Issue Background

Previously, appointments created for a specific date (e.g., June 18th) would incorrectly appear on the next day (June 19th) after page refresh. This issue was caused by inconsistent timezone handling in date storage and retrieval.

## Testing Prerequisites

- Access to the Pet-A-Vet application with appropriate user permissions
- At least one pet registered in the system
- Ability to create, view, and filter appointments

## Test Procedure

### Test Case 1: Creating a New Appointment

1. Login to the Pet-A-Vet application
2. Navigate to the Appointments section
3. Click "Create New Appointment"
4. Select today's date
5. Select a time (e.g., 2:30 PM)
6. Select a pet
7. Select a service type
8. Add notes (optional)
9. Click "Save" or "Create Appointment"
10. Verify that the appointment appears in the appointments list with the correct date and time
11. **Critical Step**: Refresh the page
12. Verify that the appointment still appears on the correct date (today) after refresh

### Test Case 2: Creating an Appointment for a Future Date

1. Login to the Pet-A-Vet application
2. Navigate to the Appointments section
3. Click "Create New Appointment"
4. Select a future date (e.g., next Monday)
5. Select a time (e.g., 10:00 AM)
6. Complete the rest of the appointment details
7. Save the appointment
8. Verify the appointment appears on the selected future date
9. **Critical Step**: Refresh the page
10. Filter to the future date you selected
11. Verify that the appointment still appears on the correct future date after refresh

### Test Case 3: Filtering Appointments by Date

1. Login to the Pet-A-Vet application
2. Navigate to the Appointments section
3. Create multiple appointments for different dates
4. Use the date filter to select a specific date
5. Verify only appointments for that specific date are shown
6. Change the date filter to a different date
7. Verify the appointment list updates correctly
8. **Critical Step**: Refresh the page with the filter applied
9. Verify the filter and results are maintained correctly

### Test Case 4: Updating an Existing Appointment

1. Login to the Pet-A-Vet application
2. Navigate to the Appointments section
3. Find an existing appointment
4. Click "Edit" or the equivalent action
5. Change the appointment date to a different date
6. Save the changes
7. Verify the appointment appears on the new date
8. **Critical Step**: Refresh the page
9. Filter to the new date
10. Verify the appointment appears on the correct new date after refresh

### Test Case 5: Month Boundary Test

This test is specifically for the date shift bug.

1. Login to the Pet-A-Vet application
2. Navigate to the Appointments section
3. Create a new appointment for the last day of the current month
4. Save the appointment
5. Verify the appointment appears on the last day of the month
6. **Critical Step**: Refresh the page
7. Verify the appointment still appears on the last day of the current month, not the first day of the next month

## Expected Results

- All appointments should appear on the exact date they were booked for
- After page refresh, appointments should remain on their originally booked date
- Filtering by date should show all appointments for that specific date
- No date shifting should occur, especially at month boundaries

## Reporting Issues

If any of the tests fail, please report the following information:

1. The specific test case that failed
2. The expected behavior vs. actual behavior
3. Any error messages displayed
4. The browser and device used for testing
5. Screenshots of the issue if possible

## Special Note About Timezones

The fix implemented uses local timezone components for consistent date handling. This means that regardless of your timezone, appointments will be displayed on the date they were intended for in your local timezone.
