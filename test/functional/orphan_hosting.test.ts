describe('Controllers: Orphan Hosting', () => {
  describe('Create a new orphan hosting', () => {
    test('should successfully create a new orphan hosting', async () => {
      const newOrphanHosting = {
        name: 'name_hosting',
        latitude: -10.660795923446559,
        longitude: -14.784882579454477,
        about: 'about_hosting',
        instructions: 'instructions_hosting',
        opening_hours: 'available_time_hosting',
        open_on_weekends: false,
      };

      const response = await global.testRequest
        .post('/orphan_hosting')
        .send(newOrphanHosting);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(newOrphanHosting);
    });
  });
});
