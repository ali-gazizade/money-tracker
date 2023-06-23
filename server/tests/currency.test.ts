import request from 'supertest';
import app from '../app';
import CurrencyModel, { Currency } from '../models/currency';

describe('Currency API', () => {
  describe('GET /currency/list', () => {
    it('should get all currencies', async () => {
      // From API
      const response = await request(app).get('/currency/list');

      // Count from db
      const activeCurrencyCount = await CurrencyModel.count({ active: true });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(activeCurrencyCount);
    });
  });

  describe('POST /currency/create', () => {
    it('should create a new currency', async () => {
      const newCurrency: Partial<Currency> = { name: 'GBP', isDefault: false };

      const response = await request(app).post('/currency/create').send(newCurrency);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newCurrency.name);
      expect(response.body.isDefault).toBe(newCurrency.isDefault);

      const currency = await CurrencyModel.findById(response.body._id);
      expect(currency).not.toBeNull();
      expect(currency?.name).toBe(newCurrency.name);
      expect(currency?.isDefault).toBe(newCurrency.isDefault);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidCurrency: Partial<Currency> = { isDefault: false };

      const response = await request(app).post('/currency/create').send(invalidCurrency);

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
      expect(response.body.errors[0].msg).toBe('Name is required');
    });

    it('should switch default true to false, if there are 2 defaults', async () => {
      const newCurrency: Partial<Currency> = { name: 'AUD', isDefault: true };

      const response = await request(app).post('/currency/create').send(newCurrency);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newCurrency.name);
      expect(response.body.isDefault).toBe(newCurrency.isDefault);

      // Only 1 default
      const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, active: true });
      expect(defaultCurrenciesCount).toBe(1);
    });

    it('should switch default false to true, if there are no defaults', async () => {
      // Remove all first
      await CurrencyModel.updateMany({}, { active: false, isDefault: false });
      
      const newCurrency: Partial<Currency> = { name: 'CAD', isDefault: false };

      const response = await request(app).post('/currency/create').send(newCurrency);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newCurrency.name);
      expect(response.body.isDefault).toBe(!newCurrency.isDefault);

      // Only 1 default
      const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, active: true });
      expect(defaultCurrenciesCount).toBe(1);

      // Revert remove
      await CurrencyModel.updateMany({}, { active: true });
    });
  });

  describe('PUT /currency/update/:id', () => {
    it('should update a currency', async () => {
      const currency = await CurrencyModel.findOne({ isDefault: false }).exec();

      expect(currency).toBeTruthy();

      const updatedCurrency: Partial<Currency> = { name: 'Test', isDefault: false };

      const id = currency?._id?.toString();

      const response = await request(app).put(`/currency/update/${id}`).send(updatedCurrency);

      expect(response.status).toBe(200);

      const updatedCurrencyInDB = await CurrencyModel.findById(id);
      expect(updatedCurrencyInDB).toBeTruthy();
      expect(updatedCurrencyInDB?.name).toBe(updatedCurrency.name);
      expect(updatedCurrencyInDB?.isDefault).toBe(updatedCurrency.isDefault);

      // Only 1 default
      const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, active: true });
      expect(defaultCurrenciesCount).toBe(1);
    });

    it('should change it to default', async () => {
      const currency = await CurrencyModel.findOne().exec();

      expect(currency).toBeTruthy();

      const updatedCurrency: Partial<Currency> = { isDefault: true };

      const response = await request(app).put(`/currency/update/${currency?._id}`).send(updatedCurrency);

      expect(response.status).toBe(200);

      const updatedCurrencyInDB = await CurrencyModel.findById(currency?._id);
      expect(updatedCurrencyInDB).toBeTruthy();
      expect(updatedCurrencyInDB?.name).toBeTruthy();
      expect(updatedCurrencyInDB?.isDefault).toBe(updatedCurrency.isDefault);

      // Only 1 default
      const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, active: true });
      expect(defaultCurrenciesCount).toBe(1);
    });

    it('should return 404 if currency is not found', async () => {
      const updatedCurrency: Partial<Currency> = { name: 'Test', isDefault: false };

      const response = await request(app).put('/currency/update/inv').send(updatedCurrency);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid ID');
    });

    it('should remove a currency', async () => {
      const currency = await CurrencyModel.findOne({ active: true }).exec();

      expect(currency).toBeTruthy();

      const id = currency?._id?.toString();

      const updatedCurrency: Partial<Currency> = { active: false };

      // API request
      const response = await request(app).put(`/currency/update/${id}`).send(updatedCurrency);

      expect(response.status).toBe(200);

      const updatedCurrencyInDB = await CurrencyModel.findById(id);
      expect(updatedCurrencyInDB).toBeTruthy();
      expect(updatedCurrencyInDB?.active).toBe(false);

      // Only 1 default
      const defaultCurrenciesCount = await CurrencyModel.count({ isDefault: true, active: true });
      expect(defaultCurrenciesCount).toBe(1);
    });
  });
});
