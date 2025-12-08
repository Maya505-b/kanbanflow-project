// Test minimal pour vérifier que Jest fonctionne
describe('Setup Test', () => {
  test('Jest should work correctly', () => {
    expect(true).toBe(true);
  });

  test('Simple math test', () => {
    expect(1 + 1).toBe(2);
    expect(10 * 2).toBe(20);
  });
});
