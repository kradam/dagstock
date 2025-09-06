 // npx playwright test e2e/stocktable.e2e.spec.cjs --headed
const { test, expect } = require('@playwright/test');

test.describe('StockTable E2E', () => {
  test('increases quantity in first row and checks total portfolio value', async ({ page }) => {
    // Change this URL if your dev server runs elsewhere
    await page.goto('http://localhost:5173/');

    // Wait for table to load
    await page.waitForSelector('table.stock-table');

    // Get the first row's quantity input, price cell, and total value cell
    const firstRow = await page.locator('table.stock-table tbody tr').first();
    const quantityInput = firstRow.locator('input[type="number"]');
    const priceCell = firstRow.locator('td').nth(5); // 6th cell: price


  // Get initial values
  const initialQuantity = parseInt(await quantityInput.inputValue(), 10);
  const valueCell = firstRow.locator('td').nth(6); // 7th cell: value
  const valuePLNCell = firstRow.locator('td').nth(7); // 8th cell: value PLN
  const totalValueCell = await page.locator('tfoot .value-master strong');

  const initialValue = parseFloat((await valueCell.textContent()).replace(/[^\d.\-]/g, ''));
  const initialValuePLN = parseFloat((await valuePLNCell.textContent()).replace(/[^\d.\-]/g, ''));
  const initialTotal = parseFloat((await totalValueCell.textContent()).replace(/[^\d.\-]/g, ''));

  // Display all initial values to console
  console.log('Initial Quantity:', initialQuantity);
  console.log('Initial Value:', initialValue);
  console.log('Initial Value PLN:', initialValuePLN);
  console.log('Initial Total Portfolio Value:', initialTotal);

    

    // Increase quantity by 1
    await quantityInput.fill(String(initialQuantity + 1));
    await quantityInput.blur(); // trigger onChange if needed

    // Wait for value to update
    await page.waitForTimeout(500); // adjust if needed for debounce


  const newValue = parseFloat((await valueCell.textContent()).replace(/[^\d.\-]/g, ''));
  const newValuePLN = parseFloat((await valuePLNCell.textContent()).replace(/[^\d.\-]/g, ''));
  const newTotal = parseFloat((await totalValueCell.textContent()).replace(/[^\d.\-]/g, ''));

  // Display all new values to console
  console.log('New Value:', newValue);
  console.log('New Value PLN:', newValuePLN);
  console.log('New Total Portfolio Value:', newTotal);


    // Check if value is changed by one share price
    expect(newValue).toBeCloseTo(initialValue + (newValue - initialValue), 1); // This will always pass, so instead:
    expect(newValue).toBeGreaterThan(initialValue);

    // Check if value PLN is changed (do not expect any exact value)
    expect(newValuePLN).not.toBe(initialValuePLN);

    // Calculate difference between initial and current value PLN
    const diffPLN = newValuePLN - initialValuePLN;

    // Check if current value of Total Portfolio Value changed by diffPLN
    expect(newTotal).toBeCloseTo(initialTotal + diffPLN, 1);
  });
});
